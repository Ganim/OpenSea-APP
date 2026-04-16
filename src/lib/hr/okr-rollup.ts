/**
 * OKR Rollup Helper (HR)
 * Calcula progresso agregado de OKRs em hierarquia árvore (Company → Team → Individual)
 * inspirado em 15Five / Lattice / Workboard.
 */

import type {
  OKRObjective,
  OKRKeyResult,
  ObjectiveStatus,
  KeyResultStatus,
} from '@/types/hr';

// ============================================================================
// TIPOS
// ============================================================================

export type OkrHealthStatus =
  | 'ON_TRACK'
  | 'AT_RISK'
  | 'OFF_TRACK'
  | 'COMPLETED'
  | 'NOT_STARTED';

export interface OkrTreeNode {
  objective: OKRObjective;
  children: OkrTreeNode[];
  rollupProgress: number;
  health: OkrHealthStatus;
  daysToDeadline: number | null;
  expectedProgress: number | null;
}

// ============================================================================
// HIERARQUIA
// ============================================================================

/**
 * Constrói árvore de OKRs com base em parentId. Roots são objetivos sem parent
 * (geralmente Company OKRs). Ordena filhos por nível e título.
 */
export function buildOkrTree(objectives: OKRObjective[]): OkrTreeNode[] {
  const nodeById = new Map<string, OkrTreeNode>();

  for (const objective of objectives) {
    nodeById.set(objective.id, {
      objective,
      children: [],
      rollupProgress: 0,
      health: 'NOT_STARTED',
      daysToDeadline: null,
      expectedProgress: null,
    });
  }

  const roots: OkrTreeNode[] = [];

  for (const node of nodeById.values()) {
    const parentId = node.objective.parentId;
    if (parentId && nodeById.has(parentId)) {
      nodeById.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Ordena filhos: Company > Department > Team > Individual e depois título
  const levelOrder: Record<string, number> = {
    COMPANY: 0,
    DEPARTMENT: 1,
    TEAM: 2,
    INDIVIDUAL: 3,
  };

  function sortChildren(node: OkrTreeNode) {
    node.children.sort((a, b) => {
      const levelDiff =
        (levelOrder[a.objective.level] ?? 99) -
        (levelOrder[b.objective.level] ?? 99);
      if (levelDiff !== 0) return levelDiff;
      return a.objective.title.localeCompare(b.objective.title, 'pt-BR');
    });
    for (const child of node.children) sortChildren(child);
  }

  for (const root of roots) sortChildren(root);
  roots.sort((a, b) => {
    const levelDiff =
      (levelOrder[a.objective.level] ?? 99) -
      (levelOrder[b.objective.level] ?? 99);
    if (levelDiff !== 0) return levelDiff;
    return a.objective.title.localeCompare(b.objective.title, 'pt-BR');
  });

  // Calcula rollup, health e deadline em pós-ordem
  for (const root of roots) computeNodeMetrics(root);

  return roots;
}

// ============================================================================
// PROGRESSO ROLLUP
// ============================================================================

/**
 * Progresso próprio do OKR (média ponderada dos seus key results).
 * Se não tiver KRs e não tiver filhos, usa o campo `progress` do objective.
 */
export function calculateOwnProgress(objective: OKRObjective): number {
  const keyResults = objective.keyResults ?? [];
  if (keyResults.length === 0) {
    return clampPercent(objective.progress ?? 0);
  }

  return calculateWeightedKrProgress(keyResults);
}

export function calculateWeightedKrProgress(
  keyResults: OKRKeyResult[]
): number {
  if (keyResults.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const keyResult of keyResults) {
    const weight = keyResult.weight ?? 1;
    const progress = clampPercent(keyResult.progressPercentage ?? 0);
    weightedSum += progress * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

/**
 * Calcula o progresso rollup recursivamente: média ponderada dos filhos.
 * Se for folha, usa o próprio progresso. Folhas têm peso 1; pais herdam soma
 * dos pesos dos KRs ou 1 quando não têm KRs.
 */
export function calculateRollupProgress(
  objective: OKRObjective,
  allObjectives: OKRObjective[]
): number {
  const directChildren = allObjectives.filter(
    candidate => candidate.parentId === objective.id
  );

  if (directChildren.length === 0) {
    return calculateOwnProgress(objective);
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (const child of directChildren) {
    const childProgress = calculateRollupProgress(child, allObjectives);
    const childWeight = aggregateWeight(child);
    weightedSum += childProgress * childWeight;
    totalWeight += childWeight;
  }

  if (totalWeight === 0) return calculateOwnProgress(objective);
  return Math.round(weightedSum / totalWeight);
}

function aggregateWeight(objective: OKRObjective): number {
  const keyResults = objective.keyResults ?? [];
  if (keyResults.length === 0) return 1;
  return keyResults.reduce((sum, kr) => sum + (kr.weight ?? 1), 0);
}

// ============================================================================
// HEALTH STATUS
// ============================================================================

/**
 * Calcula o status de saúde do OKR comparando o progresso real com o esperado
 * pelo tempo decorrido (linear) — padrão 15Five/Lattice.
 *
 * Regras:
 * - Se status COMPLETED ou progress >= 100, retorna COMPLETED.
 * - Se ainda não iniciou (progress 0 e período não começou), retorna NOT_STARTED.
 * - Diff = progresso real - progresso esperado (% do tempo decorrido).
 *   - diff >= -10 → ON_TRACK
 *   - -25 <= diff < -10 → AT_RISK
 *   - diff < -25 → OFF_TRACK
 */
export function getOKRStatus(
  progress: number,
  daysToDeadline: number,
  totalDays: number,
  objectiveStatus?: ObjectiveStatus
): OkrHealthStatus {
  if (objectiveStatus === 'COMPLETED' || progress >= 100) return 'COMPLETED';
  if (objectiveStatus === 'CANCELLED') return 'OFF_TRACK';
  if (totalDays <= 0) {
    return progress >= 100 ? 'COMPLETED' : 'OFF_TRACK';
  }

  const elapsedDays = totalDays - daysToDeadline;
  if (elapsedDays <= 0) {
    return progress > 0 ? 'ON_TRACK' : 'NOT_STARTED';
  }

  const expectedProgress = Math.min(100, (elapsedDays / totalDays) * 100);
  const diff = progress - expectedProgress;

  if (diff >= -10) return 'ON_TRACK';
  if (diff >= -25) return 'AT_RISK';
  return 'OFF_TRACK';
}

// ============================================================================
// KEY RESULT STATUS HELPERS
// ============================================================================

export function deriveKeyResultStatus(
  keyResult: OKRKeyResult,
  daysToDeadline: number,
  totalDays: number
): KeyResultStatus {
  const health = getOKRStatus(
    keyResult.progressPercentage ?? 0,
    daysToDeadline,
    totalDays
  );
  if (health === 'COMPLETED') return 'COMPLETED';
  if (health === 'AT_RISK') return 'AT_RISK';
  if (health === 'OFF_TRACK') return 'BEHIND';
  return 'ON_TRACK';
}

// ============================================================================
// DATAS
// ============================================================================

export function calculateDaysToDeadline(endDate: string): number {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function calculateTotalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function calculateExpectedProgress(
  startDate: string,
  endDate: string
): number {
  const totalDays = calculateTotalDays(startDate, endDate);
  const daysToDeadline = calculateDaysToDeadline(endDate);
  const elapsedDays = totalDays - daysToDeadline;
  if (elapsedDays <= 0) return 0;
  return Math.min(100, Math.round((elapsedDays / totalDays) * 100));
}

// ============================================================================
// FILTROS
// ============================================================================

/**
 * Filtra árvore mantendo nós que (1) batem o predicado OU (2) possuem algum
 * descendente que bate. Útil para busca + filtros de owner/level/period sem
 * quebrar visualização hierárquica.
 */
export function filterOkrTree(
  nodes: OkrTreeNode[],
  predicate: (node: OkrTreeNode) => boolean
): OkrTreeNode[] {
  const result: OkrTreeNode[] = [];
  for (const node of nodes) {
    const filteredChildren = filterOkrTree(node.children, predicate);
    if (predicate(node) || filteredChildren.length > 0) {
      result.push({ ...node, children: filteredChildren });
    }
  }
  return result;
}

export function flattenOkrTree(nodes: OkrTreeNode[]): OkrTreeNode[] {
  const flat: OkrTreeNode[] = [];
  for (const node of nodes) {
    flat.push(node);
    flat.push(...flattenOkrTree(node.children));
  }
  return flat;
}

// ============================================================================
// INTERNALS
// ============================================================================

function computeNodeMetrics(node: OkrTreeNode): void {
  for (const child of node.children) computeNodeMetrics(child);

  const allUnderNode = collectObjectivesFromNode(node);
  node.rollupProgress = calculateRollupProgress(node.objective, allUnderNode);
  node.daysToDeadline = node.objective.endDate
    ? calculateDaysToDeadline(node.objective.endDate)
    : null;
  node.expectedProgress =
    node.objective.startDate && node.objective.endDate
      ? calculateExpectedProgress(
          node.objective.startDate,
          node.objective.endDate
        )
      : null;

  const totalDays =
    node.objective.startDate && node.objective.endDate
      ? calculateTotalDays(node.objective.startDate, node.objective.endDate)
      : 0;

  node.health = getOKRStatus(
    node.rollupProgress,
    node.daysToDeadline ?? 0,
    totalDays,
    node.objective.status
  );
}

function collectObjectivesFromNode(node: OkrTreeNode): OKRObjective[] {
  const out: OKRObjective[] = [node.objective];
  for (const child of node.children) {
    out.push(...collectObjectivesFromNode(child));
  }
  return out;
}

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

// ============================================================================
// LABELS / COLORS PT-BR
// ============================================================================

export function getHealthLabel(health: OkrHealthStatus): string {
  const labels: Record<OkrHealthStatus, string> = {
    ON_TRACK: 'No caminho',
    AT_RISK: 'Em risco',
    OFF_TRACK: 'Fora do caminho',
    COMPLETED: 'Concluído',
    NOT_STARTED: 'Não iniciado',
  };
  return labels[health];
}

export function getHealthColor(health: OkrHealthStatus): string {
  const colors: Record<OkrHealthStatus, string> = {
    ON_TRACK: 'emerald',
    AT_RISK: 'amber',
    OFF_TRACK: 'rose',
    COMPLETED: 'teal',
    NOT_STARTED: 'slate',
  };
  return colors[health];
}

export function getHealthBadgeClass(health: OkrHealthStatus): string {
  const classes: Record<OkrHealthStatus, string> = {
    ON_TRACK: 'border-emerald-500 text-emerald-700 dark:text-emerald-300',
    AT_RISK: 'border-amber-500 text-amber-700 dark:text-amber-300',
    OFF_TRACK: 'border-rose-500 text-rose-700 dark:text-rose-300',
    COMPLETED: 'border-teal-500 text-teal-700 dark:text-teal-300',
    NOT_STARTED: 'border-slate-500 text-slate-700 dark:text-slate-300',
  };
  return classes[health];
}

export function getHealthBarClass(health: OkrHealthStatus): string {
  const classes: Record<OkrHealthStatus, string> = {
    ON_TRACK: 'bg-emerald-500',
    AT_RISK: 'bg-amber-500',
    OFF_TRACK: 'bg-rose-500',
    COMPLETED: 'bg-teal-500',
    NOT_STARTED: 'bg-slate-400',
  };
  return classes[health];
}
