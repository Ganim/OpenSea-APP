import type {
  SurveyType,
  SurveyStatus,
  SurveyQuestionType,
  SurveyQuestionCategory,
} from '@/types/hr';

// ============================================================================
// SURVEY TYPE
// ============================================================================

export const SURVEY_TYPE_LABELS: Record<SurveyType, string> = {
  ENGAGEMENT: 'Engajamento',
  SATISFACTION: 'Satisfação',
  PULSE: 'Pulso',
  EXIT: 'Desligamento',
  CUSTOM: 'Personalizada',
};

export const SURVEY_TYPE_COLORS: Record<
  SurveyType,
  { gradient: string; bg: string; text: string }
> = {
  ENGAGEMENT: {
    gradient: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-500/8',
    text: 'text-violet-700 dark:text-violet-300',
  },
  SATISFACTION: {
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-500/8',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  PULSE: {
    gradient: 'from-sky-500 to-sky-600',
    bg: 'bg-sky-50 dark:bg-sky-500/8',
    text: 'text-sky-700 dark:text-sky-300',
  },
  EXIT: {
    gradient: 'from-rose-500 to-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-500/8',
    text: 'text-rose-700 dark:text-rose-300',
  },
  CUSTOM: {
    gradient: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-500/8',
    text: 'text-teal-700 dark:text-teal-300',
  },
};

export const SURVEY_TYPE_OPTIONS = Object.entries(SURVEY_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

// ============================================================================
// SURVEY STATUS
// ============================================================================

export const SURVEY_STATUS_LABELS: Record<SurveyStatus, string> = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Ativa',
  CLOSED: 'Encerrada',
  ARCHIVED: 'Arquivada',
};

export const SURVEY_STATUS_COLORS: Record<
  SurveyStatus,
  { bg: string; text: string }
> = {
  DRAFT: {
    bg: 'bg-slate-100 dark:bg-slate-500/8',
    text: 'text-slate-700 dark:text-slate-300',
  },
  ACTIVE: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/8',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  CLOSED: {
    bg: 'bg-rose-50 dark:bg-rose-500/8',
    text: 'text-rose-700 dark:text-rose-300',
  },
  ARCHIVED: {
    bg: 'bg-amber-50 dark:bg-amber-500/8',
    text: 'text-amber-700 dark:text-amber-300',
  },
};

export const SURVEY_STATUS_OPTIONS = Object.entries(SURVEY_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

// ============================================================================
// QUESTION TYPE
// ============================================================================

export const QUESTION_TYPE_LABELS: Record<SurveyQuestionType, string> = {
  RATING_1_5: 'Avaliação 1-5',
  RATING_1_10: 'Avaliação 1-10',
  YES_NO: 'Sim/Não',
  TEXT: 'Texto Livre',
  MULTIPLE_CHOICE: 'Múltipla Escolha',
  NPS: 'NPS (0-10)',
};

export const QUESTION_TYPE_OPTIONS = Object.entries(QUESTION_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

// ============================================================================
// QUESTION CATEGORY
// ============================================================================

export const QUESTION_CATEGORY_LABELS: Record<SurveyQuestionCategory, string> =
  {
    ENGAGEMENT: 'Engajamento',
    LEADERSHIP: 'Liderança',
    CULTURE: 'Cultura',
    WORK_LIFE: 'Qualidade de Vida',
    GROWTH: 'Crescimento',
    COMPENSATION: 'Remuneração',
    CUSTOM: 'Personalizada',
  };

export const QUESTION_CATEGORY_OPTIONS = Object.entries(
  QUESTION_CATEGORY_LABELS
).map(([value, label]) => ({ value, label }));
