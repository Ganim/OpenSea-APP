/**
 * Warning Escalation Helpers (HR)
 *
 * Modela a escala disciplinar progressiva prevista pela CLT (Art. 482) e pela
 * jurisprudência trabalhista brasileira:
 *
 *   Verbal -> Escrita -> Suspensão -> Aviso de Desligamento (justa causa)
 *
 * O objetivo é permitir que o painel de advertências exiba ao gestor:
 *   - O passo atual da escala em que o funcionário se encontra
 *   - A próxima medida disciplinar recomendada caso reincida
 *   - Uma "pontuação de severidade" agregada considerando histórico e recência
 *
 * Importante: a recomendação de escalada NÃO é decisão automática — apenas
 * sugere o próximo passo ao RH. A aplicação efetiva de uma nova advertência
 * exige confirmação por PIN (`VerifyActionPinModal`) por se tratar de evento
 * com efeitos jurídicos previstos na CLT.
 */

import type { EmployeeWarning, WarningType } from '@/types/hr';

/**
 * Ordem oficial da escala disciplinar progressiva. A posição na ordem
 * representa a gravidade crescente do passo.
 */
export const WARNING_ESCALATION_ORDER: readonly WarningType[] = [
  'VERBAL',
  'WRITTEN',
  'SUSPENSION',
  'TERMINATION_WARNING',
] as const;

/**
 * Peso atribuído a cada tipo de advertência ao calcular a pontuação de
 * severidade do histórico do funcionário. Os valores foram calibrados para
 * refletir a gravidade jurídica/operacional relativa de cada medida.
 */
const WARNING_TYPE_WEIGHT: Record<WarningType, number> = {
  VERBAL: 1,
  WRITTEN: 3,
  SUSPENSION: 6,
  TERMINATION_WARNING: 10,
};

/**
 * Janela considerada "recente" para fins de pontuação. Advertências ocorridas
 * dentro dessa janela recebem peso integral; mais antigas decaem linearmente.
 *
 * 365 dias é o critério mais usado no mercado brasileiro de RH para
 * avaliação de reincidência (referencial: Convenia, Sólides, BambooHR).
 */
const RECENCY_WINDOW_DAYS = 365;

/**
 * Devolve o próximo tipo de advertência na escala, ou `null` se já estiver no
 * topo (TERMINATION_WARNING — próximo passo seria a rescisão por justa causa).
 */
export function getNextWarningType(
  currentType: WarningType
): WarningType | null {
  const currentIndex = WARNING_ESCALATION_ORDER.indexOf(currentType);
  if (currentIndex === -1) return null;
  const nextIndex = currentIndex + 1;
  if (nextIndex >= WARNING_ESCALATION_ORDER.length) return null;
  return WARNING_ESCALATION_ORDER[nextIndex];
}

/**
 * Devolve uma orientação textual em português formal sobre a próxima medida
 * disciplinar caso o funcionário reincida. Mensagens calibradas com base na
 * jurisprudência trabalhista (escala progressiva) e na CLT Art. 482.
 */
export function getEscalationHint(currentType: WarningType): string {
  switch (currentType) {
    case 'VERBAL':
      return 'Próxima infração levará a Advertência Escrita formal, com registro no prontuário do colaborador.';
    case 'WRITTEN':
      return 'Próxima infração poderá levar à Suspensão de 1 a 3 dias, sem prejuízo de novas medidas.';
    case 'SUSPENSION':
      return 'Próxima infração pode caracterizar Aviso de Desligamento, encaminhando o caso para análise de rescisão por justa causa.';
    case 'TERMINATION_WARNING':
      return 'Reincidência justifica avaliar Rescisão por Justa Causa nos termos do Art. 482 da CLT. Acione o jurídico antes de efetivar.';
    default:
      return 'Avalie a aplicação da próxima medida disciplinar conforme o histórico do colaborador.';
  }
}

/**
 * Rótulo curto para o passo na escala — usado dentro do stepper visual.
 */
export function getEscalationStepLabel(type: WarningType): string {
  switch (type) {
    case 'VERBAL':
      return 'Verbal';
    case 'WRITTEN':
      return 'Escrita';
    case 'SUSPENSION':
      return 'Suspensão';
    case 'TERMINATION_WARNING':
      return 'Aviso de Desligamento';
    default:
      return type;
  }
}

/**
 * Rótulo longo / descritivo para uso em tooltips e descrições do passo.
 */
export function getEscalationStepDescription(type: WarningType): string {
  switch (type) {
    case 'VERBAL':
      return 'Conversa formal de orientação, sem registro disciplinar ostensivo.';
    case 'WRITTEN':
      return 'Documento formal assinado pelo colaborador e arquivado no prontuário.';
    case 'SUSPENSION':
      return 'Afastamento sem remuneração por 1 a 30 dias, conforme gravidade.';
    case 'TERMINATION_WARNING':
      return 'Notificação prévia de possibilidade de rescisão por justa causa.';
    default:
      return '';
  }
}

/**
 * Calcula um índice numérico da posição do tipo na escala (0 a N-1).
 * Útil para componentes que precisam destacar passos anteriores/posteriores.
 */
export function getEscalationStepIndex(type: WarningType): number {
  return WARNING_ESCALATION_ORDER.indexOf(type);
}

/**
 * Calcula a "pontuação de severidade" do histórico do colaborador.
 *
 * Fórmula: somatório do peso de cada advertência multiplicado por um fator de
 * recência linear (1.0 quando ocorrida hoje, 0.0 quando completou a janela
 * de RECENCY_WINDOW_DAYS). Advertências revogadas são ignoradas.
 *
 * Quanto maior o score, mais sólido é o lastro disciplinar — e mais fundamentada
 * é uma eventual rescisão por justa causa.
 */
export function calculateSeverityScore(warnings: EmployeeWarning[]): number {
  const now = Date.now();
  return warnings.reduce((accumulatedScore, warning) => {
    if (warning.status === 'REVOKED') return accumulatedScore;
    const baseWeight = WARNING_TYPE_WEIGHT[warning.type] ?? 0;
    const incidentTime = new Date(warning.incidentDate).getTime();
    const ageDays = Math.max(
      0,
      Math.floor((now - incidentTime) / (1000 * 60 * 60 * 24))
    );
    const recencyFactor = Math.max(0, 1 - ageDays / RECENCY_WINDOW_DAYS);
    return accumulatedScore + baseWeight * recencyFactor;
  }, 0);
}

/**
 * Determina o passo mais grave já alcançado pelo funcionário no histórico
 * recente (considerando apenas advertências ATIVAS — revogadas não contam).
 * Retorna `null` se o histórico estiver vazio.
 */
export function getHighestEscalationReached(
  warnings: EmployeeWarning[]
): WarningType | null {
  const activeTypes = warnings
    .filter(warning => warning.status !== 'REVOKED')
    .map(warning => warning.type);
  if (activeTypes.length === 0) return null;
  return activeTypes.reduce<WarningType>((highest, candidate) => {
    return getEscalationStepIndex(candidate) > getEscalationStepIndex(highest)
      ? candidate
      : highest;
  }, activeTypes[0]);
}
