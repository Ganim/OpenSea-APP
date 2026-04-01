/**
 * OpenSea OS - OKR Utils (HR)
 */

import type {
  ObjectiveLevel,
  ObjectiveStatus,
  KeyResultStatus,
  KeyResultType,
  CheckInConfidence,
} from '@/types/hr';

// ============================================================================
// OBJECTIVE LEVEL
// ============================================================================

export function getObjectiveLevelLabel(level: ObjectiveLevel): string {
  const labels: Record<ObjectiveLevel, string> = {
    COMPANY: 'Empresa',
    DEPARTMENT: 'Departamento',
    TEAM: 'Equipe',
    INDIVIDUAL: 'Individual',
  };
  return labels[level] ?? level;
}

export function getObjectiveLevelColor(level: ObjectiveLevel): string {
  const colors: Record<ObjectiveLevel, string> = {
    COMPANY: 'violet',
    DEPARTMENT: 'sky',
    TEAM: 'teal',
    INDIVIDUAL: 'emerald',
  };
  return colors[level] ?? 'slate';
}

export function getObjectiveLevelBadgeClass(level: ObjectiveLevel): string {
  const classes: Record<ObjectiveLevel, string> = {
    COMPANY: 'border-violet-500 text-violet-700 dark:text-violet-300',
    DEPARTMENT: 'border-sky-500 text-sky-700 dark:text-sky-300',
    TEAM: 'border-teal-500 text-teal-700 dark:text-teal-300',
    INDIVIDUAL: 'border-emerald-500 text-emerald-700 dark:text-emerald-300',
  };
  return (
    classes[level] ?? 'border-slate-500 text-slate-700 dark:text-slate-300'
  );
}

// ============================================================================
// OBJECTIVE STATUS
// ============================================================================

export function getObjectiveStatusLabel(status: ObjectiveStatus): string {
  const labels: Record<ObjectiveStatus, string> = {
    DRAFT: 'Rascunho',
    ACTIVE: 'Ativo',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
  };
  return labels[status] ?? status;
}

export function getObjectiveStatusColor(status: ObjectiveStatus): string {
  const colors: Record<ObjectiveStatus, string> = {
    DRAFT: 'slate',
    ACTIVE: 'emerald',
    COMPLETED: 'sky',
    CANCELLED: 'rose',
  };
  return colors[status] ?? 'slate';
}

export function getObjectiveStatusBadgeClass(status: ObjectiveStatus): string {
  const classes: Record<ObjectiveStatus, string> = {
    DRAFT: 'border-slate-500 text-slate-700 dark:text-slate-300',
    ACTIVE: 'border-emerald-500 text-emerald-700 dark:text-emerald-300',
    COMPLETED: 'border-sky-500 text-sky-700 dark:text-sky-300',
    CANCELLED: 'border-rose-500 text-rose-700 dark:text-rose-300',
  };
  return (
    classes[status] ?? 'border-slate-500 text-slate-700 dark:text-slate-300'
  );
}

// ============================================================================
// KEY RESULT STATUS
// ============================================================================

export function getKeyResultStatusLabel(status: KeyResultStatus): string {
  const labels: Record<KeyResultStatus, string> = {
    ON_TRACK: 'No Caminho',
    AT_RISK: 'Em Risco',
    BEHIND: 'Atrasado',
    COMPLETED: 'Concluído',
  };
  return labels[status] ?? status;
}

export function getKeyResultStatusColor(status: KeyResultStatus): string {
  const colors: Record<KeyResultStatus, string> = {
    ON_TRACK: 'emerald',
    AT_RISK: 'amber',
    BEHIND: 'rose',
    COMPLETED: 'sky',
  };
  return colors[status] ?? 'slate';
}

export function getKeyResultStatusBadgeClass(status: KeyResultStatus): string {
  const classes: Record<KeyResultStatus, string> = {
    ON_TRACK: 'border-emerald-500 text-emerald-700 dark:text-emerald-300',
    AT_RISK: 'border-amber-500 text-amber-700 dark:text-amber-300',
    BEHIND: 'border-rose-500 text-rose-700 dark:text-rose-300',
    COMPLETED: 'border-sky-500 text-sky-700 dark:text-sky-300',
  };
  return (
    classes[status] ?? 'border-slate-500 text-slate-700 dark:text-slate-300'
  );
}

// ============================================================================
// KEY RESULT TYPE
// ============================================================================

export function getKeyResultTypeLabel(type: KeyResultType): string {
  const labels: Record<KeyResultType, string> = {
    NUMERIC: 'Numérico',
    PERCENTAGE: 'Percentual',
    CURRENCY: 'Monetário',
    BINARY: 'Binário',
  };
  return labels[type] ?? type;
}

// ============================================================================
// CHECK-IN CONFIDENCE
// ============================================================================

export function getConfidenceLabel(confidence: CheckInConfidence): string {
  const labels: Record<CheckInConfidence, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
  };
  return labels[confidence] ?? confidence;
}

export function getConfidenceColor(confidence: CheckInConfidence): string {
  const colors: Record<CheckInConfidence, string> = {
    LOW: 'rose',
    MEDIUM: 'amber',
    HIGH: 'emerald',
  };
  return colors[confidence] ?? 'slate';
}

export function getConfidenceBadgeClass(confidence: CheckInConfidence): string {
  const classes: Record<CheckInConfidence, string> = {
    LOW: 'border-rose-500 text-rose-700 dark:text-rose-300',
    MEDIUM: 'border-amber-500 text-amber-700 dark:text-amber-300',
    HIGH: 'border-emerald-500 text-emerald-700 dark:text-emerald-300',
  };
  return (
    classes[confidence] ?? 'border-slate-500 text-slate-700 dark:text-slate-300'
  );
}

// ============================================================================
// PROGRESS
// ============================================================================

export function getProgressColor(progress: number): string {
  if (progress >= 70) return 'emerald';
  if (progress >= 40) return 'amber';
  return 'rose';
}

export function getProgressBarClass(progress: number): string {
  if (progress >= 70) return 'bg-emerald-500';
  if (progress >= 40) return 'bg-amber-500';
  return 'bg-rose-500';
}

// ============================================================================
// PERIOD
// ============================================================================

export function formatPeriodLabel(period: string): string {
  // Expected format: Q1_2026, Q2_2026, etc.
  const match = period.match(/^Q(\d)_(\d{4})$/);
  if (match) {
    return `${match[1]}T ${match[2]}`;
  }
  return period;
}

// ============================================================================
// DATE
// ============================================================================

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
