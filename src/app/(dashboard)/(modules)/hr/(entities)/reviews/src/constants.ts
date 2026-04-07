import type {
  ReviewCycleType,
  ReviewCycleStatus,
  PerformanceReviewStatus,
} from '@/types/hr';

export const REVIEW_CYCLE_TYPE_LABELS: Record<ReviewCycleType, string> = {
  ANNUAL: 'Anual',
  SEMI_ANNUAL: 'Semestral',
  QUARTERLY: 'Trimestral',
  PROBATION: 'Experiência',
  CUSTOM: 'Personalizado',
};

export const REVIEW_CYCLE_STATUS_LABELS: Record<ReviewCycleStatus, string> = {
  DRAFT: 'Rascunho',
  OPEN: 'Aberto',
  IN_REVIEW: 'Em Avaliação',
  CALIBRATION: 'Calibração',
  CLOSED: 'Fechado',
};

export const PERFORMANCE_REVIEW_STATUS_LABELS: Record<
  PerformanceReviewStatus,
  string
> = {
  PENDING: 'Pendente',
  SELF_ASSESSMENT: 'Autoavaliação',
  MANAGER_REVIEW: 'Avaliação do Gestor',
  COMPLETED: 'Concluída',
};

export const SCORE_LABELS: Record<number, string> = {
  1: 'Insuficiente',
  2: 'Regular',
  3: 'Bom',
  4: 'Muito Bom',
  5: 'Excelente',
};

export const REVIEW_CYCLE_TYPE_COLORS: Record<
  ReviewCycleType,
  { gradient: string; bg: string; text: string }
> = {
  ANNUAL: {
    gradient: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-500/8',
    text: 'text-violet-700 dark:text-violet-300',
  },
  SEMI_ANNUAL: {
    gradient: 'from-sky-500 to-sky-600',
    bg: 'bg-sky-50 dark:bg-sky-500/8',
    text: 'text-sky-700 dark:text-sky-300',
  },
  QUARTERLY: {
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-500/8',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  PROBATION: {
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-500/8',
    text: 'text-amber-700 dark:text-amber-300',
  },
  CUSTOM: {
    gradient: 'from-slate-500 to-slate-600',
    bg: 'bg-slate-50 dark:bg-slate-500/8',
    text: 'text-slate-700 dark:text-slate-300',
  },
};

export const REVIEW_CYCLE_STATUS_COLORS: Record<
  ReviewCycleStatus,
  { bg: string; text: string }
> = {
  DRAFT: {
    bg: 'bg-slate-50 dark:bg-slate-500/8',
    text: 'text-slate-700 dark:text-slate-300',
  },
  OPEN: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/8',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  IN_REVIEW: {
    bg: 'bg-sky-50 dark:bg-sky-500/8',
    text: 'text-sky-700 dark:text-sky-300',
  },
  CALIBRATION: {
    bg: 'bg-violet-50 dark:bg-violet-500/8',
    text: 'text-violet-700 dark:text-violet-300',
  },
  CLOSED: {
    bg: 'bg-rose-50 dark:bg-rose-500/8',
    text: 'text-rose-700 dark:text-rose-300',
  },
};

export const PERFORMANCE_REVIEW_STATUS_COLORS: Record<
  PerformanceReviewStatus,
  { bg: string; text: string; dot: string }
> = {
  PENDING: {
    bg: 'bg-slate-50 dark:bg-slate-500/8',
    text: 'text-slate-700 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  SELF_ASSESSMENT: {
    bg: 'bg-sky-50 dark:bg-sky-500/8',
    text: 'text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  MANAGER_REVIEW: {
    bg: 'bg-violet-50 dark:bg-violet-500/8',
    text: 'text-violet-700 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
  COMPLETED: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/8',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
};

export const REVIEW_CYCLE_TYPE_OPTIONS = Object.entries(
  REVIEW_CYCLE_TYPE_LABELS
).map(([value, label]) => ({ value, label }));

export const REVIEW_CYCLE_STATUS_OPTIONS = Object.entries(
  REVIEW_CYCLE_STATUS_LABELS
).map(([value, label]) => ({ value, label }));

export const PERFORMANCE_REVIEW_STATUS_OPTIONS = Object.entries(
  PERFORMANCE_REVIEW_STATUS_LABELS
).map(([value, label]) => ({ value, label }));
