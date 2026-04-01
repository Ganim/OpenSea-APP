import type {
  JobPostingStatus,
  JobPostingType,
  CandidateSource,
  ApplicationStatus,
  InterviewStageType,
  InterviewStatus,
  InterviewRecommendation,
} from '@/types/hr';

// =============================================================================
// Job Posting Status
// =============================================================================

export const JOB_POSTING_STATUS_LABELS: Record<JobPostingStatus, string> = {
  DRAFT: 'Rascunho',
  OPEN: 'Aberta',
  CLOSED: 'Encerrada',
  FILLED: 'Preenchida',
};

export const JOB_POSTING_STATUS_COLORS: Record<
  JobPostingStatus,
  { bg: string; text: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  DRAFT: {
    bg: 'bg-slate-50 dark:bg-slate-500/8',
    text: 'text-slate-700 dark:text-slate-300',
    variant: 'secondary',
  },
  OPEN: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/8',
    text: 'text-emerald-700 dark:text-emerald-300',
    variant: 'default',
  },
  CLOSED: {
    bg: 'bg-amber-50 dark:bg-amber-500/8',
    text: 'text-amber-700 dark:text-amber-300',
    variant: 'outline',
  },
  FILLED: {
    bg: 'bg-sky-50 dark:bg-sky-500/8',
    text: 'text-sky-700 dark:text-sky-300',
    variant: 'outline',
  },
};

export const JOB_POSTING_STATUS_OPTIONS = Object.entries(
  JOB_POSTING_STATUS_LABELS
).map(([value, label]) => ({ value, label }));

// =============================================================================
// Job Posting Type
// =============================================================================

export const JOB_POSTING_TYPE_LABELS: Record<JobPostingType, string> = {
  FULL_TIME: 'Integral',
  PART_TIME: 'Meio Período',
  INTERN: 'Estágio',
  TEMPORARY: 'Temporário',
};

export const JOB_POSTING_TYPE_OPTIONS = Object.entries(
  JOB_POSTING_TYPE_LABELS
).map(([value, label]) => ({ value, label }));

// =============================================================================
// Candidate Source
// =============================================================================

export const CANDIDATE_SOURCE_LABELS: Record<CandidateSource, string> = {
  WEBSITE: 'Site',
  LINKEDIN: 'LinkedIn',
  REFERRAL: 'Indicação',
  AGENCY: 'Agência',
  OTHER: 'Outro',
};

export const CANDIDATE_SOURCE_OPTIONS = Object.entries(
  CANDIDATE_SOURCE_LABELS
).map(([value, label]) => ({ value, label }));

// =============================================================================
// Application Status
// =============================================================================

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Candidatou-se',
  SCREENING: 'Triagem',
  INTERVIEW: 'Entrevista',
  ASSESSMENT: 'Avaliação',
  OFFER: 'Proposta',
  HIRED: 'Contratado',
  REJECTED: 'Rejeitado',
  WITHDRAWN: 'Desistiu',
};

export const APPLICATION_STATUS_COLORS: Record<
  ApplicationStatus,
  { bg: string; text: string }
> = {
  APPLIED: {
    bg: 'bg-slate-50 dark:bg-slate-500/8',
    text: 'text-slate-700 dark:text-slate-300',
  },
  SCREENING: {
    bg: 'bg-sky-50 dark:bg-sky-500/8',
    text: 'text-sky-700 dark:text-sky-300',
  },
  INTERVIEW: {
    bg: 'bg-violet-50 dark:bg-violet-500/8',
    text: 'text-violet-700 dark:text-violet-300',
  },
  ASSESSMENT: {
    bg: 'bg-amber-50 dark:bg-amber-500/8',
    text: 'text-amber-700 dark:text-amber-300',
  },
  OFFER: {
    bg: 'bg-teal-50 dark:bg-teal-500/8',
    text: 'text-teal-700 dark:text-teal-300',
  },
  HIRED: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/8',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  REJECTED: {
    bg: 'bg-rose-50 dark:bg-rose-500/8',
    text: 'text-rose-700 dark:text-rose-300',
  },
  WITHDRAWN: {
    bg: 'bg-slate-50 dark:bg-slate-500/8',
    text: 'text-slate-700 dark:text-slate-300',
  },
};

export const APPLICATION_STATUS_OPTIONS = Object.entries(
  APPLICATION_STATUS_LABELS
).map(([value, label]) => ({ value, label }));

/** Pipeline order for visual display */
export const APPLICATION_PIPELINE_STAGES: ApplicationStatus[] = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'ASSESSMENT',
  'OFFER',
  'HIRED',
];

// =============================================================================
// Interview Stage Type
// =============================================================================

export const INTERVIEW_STAGE_TYPE_LABELS: Record<InterviewStageType, string> = {
  SCREENING: 'Triagem',
  TECHNICAL: 'Técnica',
  BEHAVIORAL: 'Comportamental',
  CULTURE_FIT: 'Fit Cultural',
  FINAL: 'Final',
};

export const INTERVIEW_STAGE_TYPE_OPTIONS = Object.entries(
  INTERVIEW_STAGE_TYPE_LABELS
).map(([value, label]) => ({ value, label }));

// =============================================================================
// Interview Status
// =============================================================================

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  SCHEDULED: 'Agendada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'Não Compareceu',
};

export const INTERVIEW_STATUS_COLORS: Record<
  InterviewStatus,
  { bg: string; text: string }
> = {
  SCHEDULED: {
    bg: 'bg-sky-50 dark:bg-sky-500/8',
    text: 'text-sky-700 dark:text-sky-300',
  },
  COMPLETED: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/8',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  CANCELLED: {
    bg: 'bg-rose-50 dark:bg-rose-500/8',
    text: 'text-rose-700 dark:text-rose-300',
  },
  NO_SHOW: {
    bg: 'bg-amber-50 dark:bg-amber-500/8',
    text: 'text-amber-700 dark:text-amber-300',
  },
};

// =============================================================================
// Interview Recommendation
// =============================================================================

export const INTERVIEW_RECOMMENDATION_LABELS: Record<
  InterviewRecommendation,
  string
> = {
  ADVANCE: 'Avançar',
  HOLD: 'Aguardar',
  REJECT: 'Rejeitar',
};

export const INTERVIEW_RECOMMENDATION_COLORS: Record<
  InterviewRecommendation,
  { bg: string; text: string }
> = {
  ADVANCE: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/8',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  HOLD: {
    bg: 'bg-amber-50 dark:bg-amber-500/8',
    text: 'text-amber-700 dark:text-amber-300',
  },
  REJECT: {
    bg: 'bg-rose-50 dark:bg-rose-500/8',
    text: 'text-rose-700 dark:text-rose-300',
  },
};

// =============================================================================
// Helpers
// =============================================================================

export function formatSalaryRange(
  min?: number | null,
  max?: number | null
): string {
  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `A partir de ${fmt(min)}`;
  if (max) return `Até ${fmt(max)}`;
  return 'Não informado';
}
