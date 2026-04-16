/**
 * OpenSea OS - MedicalExamTimeline
 *
 * Timeline vertical para o histórico de exames médicos ocupacionais
 * de um funcionário. Renderiza:
 *   - Card de destaque com o próximo exame previsto;
 *   - Lista vertical com pontos coloridos por tipo de exame;
 *   - Cards expansíveis com restrições, observações e anexo.
 *
 * O componente é apresentacional: recebe os exames já carregados e
 * o resultado de `calculateNextExam` via props. Estados de loading e
 * vazio são internos para reaproveitamento.
 */

'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CalendarPlus,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock,
  Download,
  FileText,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserRound,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  calculateNextExam,
  sortExamsDescByExamDate,
  type NextExamPlan,
  type NextExamStatus,
} from '@/lib/hr/calculate-next-exam';
import {
  formatDate,
  getExamResultLabel,
  getExamTypeLabel,
} from '@/app/(dashboard)/(modules)/hr/(entities)/medical-exams/src/utils/medical-exams.utils';
import type {
  MedicalExam,
  MedicalExamResult,
  MedicalExamType,
} from '@/types/hr';

/* ===========================================
   PROPS
   =========================================== */

export interface MedicalExamTimelineProps {
  /** Lista de exames do funcionário, em qualquer ordem. */
  exams: MedicalExam[];
  /**
   * Plano de próximo exame. Se omitido, o componente calcula
   * automaticamente com `calculateNextExam(exams)`.
   */
  nextExamPlan?: NextExamPlan;
  /** Mostra o estado de carregamento (skeletons). */
  isLoading?: boolean;
  /** Permite agendar novo exame. Se ausente, o botão CTA não aparece. */
  onScheduleExam?: () => void;
  /** Permite excluir um exame. Se ausente, a ação não é renderizada. */
  onDeleteExam?: (exam: MedicalExam) => void;
  /** Classe CSS extra para o container raiz. */
  className?: string;
}

/* ===========================================
   COLOR / ICON MAPS
   =========================================== */

interface ExamTypeStyle {
  /** Background do dot da timeline. */
  dotBg: string;
  /** Cor do texto/ícone do dot. */
  dotIconColor: string;
  /** Background do chip/badge. */
  chipBg: string;
  /** Cor de texto do chip/badge. */
  chipText: string;
  /** Cor da linha vertical do conector. */
  connectorColor: string;
}

const EXAM_TYPE_STYLES: Record<MedicalExamType, ExamTypeStyle> = {
  ADMISSIONAL: {
    dotBg: 'bg-violet-500',
    dotIconColor: 'text-white',
    chipBg: 'bg-violet-50 dark:bg-violet-500/10',
    chipText: 'text-violet-700 dark:text-violet-300',
    connectorColor: 'bg-violet-200 dark:bg-violet-500/20',
  },
  PERIODICO: {
    dotBg: 'bg-sky-500',
    dotIconColor: 'text-white',
    chipBg: 'bg-sky-50 dark:bg-sky-500/10',
    chipText: 'text-sky-700 dark:text-sky-300',
    connectorColor: 'bg-sky-200 dark:bg-sky-500/20',
  },
  RETORNO: {
    dotBg: 'bg-amber-500',
    dotIconColor: 'text-white',
    chipBg: 'bg-amber-50 dark:bg-amber-500/10',
    chipText: 'text-amber-700 dark:text-amber-300',
    connectorColor: 'bg-amber-200 dark:bg-amber-500/20',
  },
  MUDANCA_FUNCAO: {
    dotBg: 'bg-teal-500',
    dotIconColor: 'text-white',
    chipBg: 'bg-teal-50 dark:bg-teal-500/10',
    chipText: 'text-teal-700 dark:text-teal-300',
    connectorColor: 'bg-teal-200 dark:bg-teal-500/20',
  },
  DEMISSIONAL: {
    dotBg: 'bg-rose-500',
    dotIconColor: 'text-white',
    chipBg: 'bg-rose-50 dark:bg-rose-500/10',
    chipText: 'text-rose-700 dark:text-rose-300',
    connectorColor: 'bg-rose-200 dark:bg-rose-500/20',
  },
};

interface ExamResultStyle {
  chipBg: string;
  chipText: string;
}

const EXAM_RESULT_STYLES: Record<MedicalExamResult, ExamResultStyle> = {
  APTO: {
    chipBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    chipText: 'text-emerald-700 dark:text-emerald-300',
  },
  INAPTO: {
    chipBg: 'bg-rose-50 dark:bg-rose-500/10',
    chipText: 'text-rose-700 dark:text-rose-300',
  },
  APTO_COM_RESTRICOES: {
    chipBg: 'bg-amber-50 dark:bg-amber-500/10',
    chipText: 'text-amber-700 dark:text-amber-300',
  },
};

/* ===========================================
   NEXT EXAM CARD
   =========================================== */

interface NextExamCardProps {
  plan: NextExamPlan;
  onScheduleExam?: () => void;
}

function describeNextExamStatus(status: NextExamStatus, days: number | null) {
  if (status === 'OVERDUE' && days !== null) {
    const daysOverdue = Math.abs(days);
    return {
      label: 'Vencido',
      sublabel: `há ${daysOverdue} dia${daysOverdue !== 1 ? 's' : ''}`,
    };
  }
  if (status === 'DUE_SOON' && days !== null) {
    if (days === 0) return { label: 'Vence hoje', sublabel: '' };
    return {
      label: `Em ${days} dia${days !== 1 ? 's' : ''}`,
      sublabel: '',
    };
  }
  if (status === 'SCHEDULED' && days !== null) {
    return {
      label: `Em ${days} dias`,
      sublabel: '',
    };
  }
  return {
    label: 'Sem previsão',
    sublabel: 'cadastre um exame inicial para projetar o próximo',
  };
}

function NextExamCard({ plan, onScheduleExam }: NextExamCardProps) {
  const isOverdue = plan.status === 'OVERDUE';
  const isDueSoon = plan.status === 'DUE_SOON';
  const isUnknown = plan.status === 'UNKNOWN';

  const headlineDescriptor = describeNextExamStatus(
    plan.status,
    plan.daysUntilNextExam
  );

  const containerClass = cn(
    'relative overflow-hidden border p-5 sm:p-6',
    isOverdue &&
      'bg-gradient-to-br from-rose-500 via-rose-500/95 to-rose-600 text-white border-rose-400',
    isDueSoon &&
      'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white border-amber-300',
    !isOverdue &&
      !isDueSoon &&
      'bg-gradient-to-br from-violet-500 via-violet-500 to-indigo-600 text-white border-violet-400'
  );

  const Icon = isOverdue ? AlertTriangle : isDueSoon ? Clock : ShieldCheck;

  return (
    <Card data-testid="next-exam-card" className={containerClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-white/80">
              Próximo exame periódico
            </p>
            {plan.nextExamDate && !isUnknown ? (
              <p className="mt-1 text-2xl font-semibold leading-tight">
                {formatDate(plan.nextExamDate.toISOString())}
              </p>
            ) : (
              <p className="mt-1 text-2xl font-semibold leading-tight">
                Sem previsão
              </p>
            )}
            <p className="mt-1 text-sm text-white/90">
              {isOverdue ? (
                <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide">
                  <CircleAlert className="h-4 w-4" />
                  VENCIDO {headlineDescriptor.sublabel}
                </span>
              ) : (
                <>
                  <span className="font-medium">
                    {headlineDescriptor.label}
                  </span>
                  {headlineDescriptor.sublabel && (
                    <span className="ml-1 text-white/80">
                      {headlineDescriptor.sublabel}
                    </span>
                  )}
                </>
              )}
            </p>
            {plan.baseExam && (
              <p className="mt-2 text-xs text-white/75">
                Baseado em {getExamTypeLabel(plan.baseExam.type).toLowerCase()}{' '}
                de {formatDate(plan.baseExam.examDate)}
              </p>
            )}
          </div>
        </div>
        {onScheduleExam && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-9 px-3 gap-2 bg-white/95 text-slate-900 hover:bg-white"
            onClick={onScheduleExam}
            data-testid="next-exam-schedule-button"
          >
            <CalendarPlus className="h-4 w-4" />
            Agendar
          </Button>
        )}
      </div>
    </Card>
  );
}

/* ===========================================
   TIMELINE ITEM
   =========================================== */

interface TimelineItemProps {
  exam: MedicalExam;
  isFirst: boolean;
  isLast: boolean;
  onDeleteExam?: (exam: MedicalExam) => void;
}

function TimelineItem({ exam, isFirst, isLast, onDeleteExam }: TimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const typeStyle = EXAM_TYPE_STYLES[exam.type];
  const resultStyle = EXAM_RESULT_STYLES[exam.result];

  const hasExpandableContent = useMemo(() => {
    return Boolean(
      exam.restrictions?.trim() ||
        exam.observations?.trim() ||
        exam.documentUrl ||
        exam.clinicName ||
        exam.physicianName
    );
  }, [exam]);

  return (
    <div
      className="relative flex gap-4"
      data-testid={`exam-item-${exam.id}`}
    >
      {/* Coluna do dot + conector */}
      <div className="relative flex flex-col items-center pt-1">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-background shadow-sm shrink-0',
            typeStyle.dotBg
          )}
        >
          <Stethoscope className={cn('h-4 w-4', typeStyle.dotIconColor)} />
        </div>
        {!isLast && (
          <div
            className={cn(
              'absolute top-10 bottom-0 w-0.5 -translate-x-1/2 left-1/2',
              typeStyle.connectorColor
            )}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Card lateral */}
      <Card className="mb-6 flex-1 overflow-hidden border bg-white dark:bg-slate-800/60 p-0">
        <button
          type="button"
          onClick={() => hasExpandableContent && setIsExpanded(value => !value)}
          className={cn(
            'w-full text-left flex items-start justify-between gap-3 px-4 py-3',
            hasExpandableContent && 'hover:bg-muted/40 cursor-pointer'
          )}
          aria-expanded={isExpanded}
          aria-disabled={!hasExpandableContent}
        >
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  typeStyle.chipBg,
                  typeStyle.chipText
                )}
              >
                {getExamTypeLabel(exam.type)}
                {isFirst && (
                  <Badge
                    variant="outline"
                    className="ml-1 h-4 border-current bg-transparent px-1 py-0 text-[10px] font-normal"
                  >
                    Mais recente
                  </Badge>
                )}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  resultStyle.chipBg,
                  resultStyle.chipText
                )}
              >
                {getExamResultLabel(exam.result)}
              </span>
              {exam.expirationDate && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Validade {formatDate(exam.expirationDate)}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-foreground">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(exam.examDate)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <UserRound className="h-3.5 w-3.5" />
                Dr(a). {exam.doctorName}
                {exam.doctorCrm ? ` · CRM ${exam.doctorCrm}` : ''}
              </span>
            </div>
          </div>
          {hasExpandableContent &&
            (isExpanded ? (
              <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            ))}
        </button>

        {isExpanded && hasExpandableContent && (
          <div className="border-t border-border bg-muted/20 px-4 py-3 text-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {exam.clinicName && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Clínica
                  </p>
                  <p className="mt-0.5 text-foreground">{exam.clinicName}</p>
                </div>
              )}
              {exam.physicianName && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Médico responsável
                  </p>
                  <p className="mt-0.5 text-foreground">
                    {exam.physicianName}
                    {exam.physicianCRM ? ` · CRM ${exam.physicianCRM}` : ''}
                  </p>
                </div>
              )}
            </div>

            {exam.result === 'APTO_COM_RESTRICOES' && exam.restrictions && (
              <div className="mt-3 rounded-md bg-amber-50 dark:bg-amber-500/10 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Restrições
                </p>
                <p className="mt-1 whitespace-pre-line text-amber-900 dark:text-amber-100">
                  {exam.restrictions}
                </p>
              </div>
            )}

            {exam.observations && (
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Observações
                </p>
                <p className="mt-1 whitespace-pre-line text-foreground">
                  {exam.observations}
                </p>
              </div>
            )}

            {(exam.documentUrl || onDeleteExam) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {exam.documentUrl && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 gap-2"
                  >
                    <a
                      href={exam.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      data-testid={`exam-attachment-${exam.id}`}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar anexo
                    </a>
                  </Button>
                )}
                {onDeleteExam && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    onClick={() => onDeleteExam(exam)}
                    data-testid={`exam-delete-${exam.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ===========================================
   EMPTY STATE
   =========================================== */

interface EmptyStateProps {
  onScheduleExam?: () => void;
}

function EmptyState({ onScheduleExam }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 border-dashed bg-white/40 dark:bg-white/5 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
        <FileText className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">
          Nenhum exame registrado
        </p>
        <p className="text-sm text-muted-foreground">
          Os exames médicos ocupacionais (PCMSO) deste funcionário aparecerão
          aqui em ordem cronológica.
        </p>
      </div>
      {onScheduleExam && (
        <Button
          type="button"
          size="sm"
          className="mt-2 gap-2"
          onClick={onScheduleExam}
          data-testid="empty-state-schedule-button"
        >
          <CalendarPlus className="h-4 w-4" />
          Agendar primeiro exame
        </Button>
      )}
    </Card>
  );
}

/* ===========================================
   LOADING STATE
   =========================================== */

function LoadingState() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="space-y-6">
        {[0, 1, 2].map(index => (
          <div key={index} className="flex gap-4">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <Skeleton className="h-24 flex-1 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===========================================
   ROOT COMPONENT
   =========================================== */

export function MedicalExamTimeline({
  exams,
  nextExamPlan,
  isLoading,
  onScheduleExam,
  onDeleteExam,
  className,
}: MedicalExamTimelineProps) {
  const orderedExams = useMemo(
    () => sortExamsDescByExamDate(exams),
    [exams]
  );

  const computedPlan = useMemo<NextExamPlan>(() => {
    if (nextExamPlan) return nextExamPlan;
    return calculateNextExam({ exams });
  }, [exams, nextExamPlan]);

  if (isLoading) {
    return (
      <div
        data-testid="medical-exams-timeline"
        className={cn('flex flex-col gap-4', className)}
      >
        <LoadingState />
      </div>
    );
  }

  if (orderedExams.length === 0) {
    return (
      <div
        data-testid="medical-exams-timeline"
        className={cn('flex flex-col gap-4', className)}
      >
        <EmptyState onScheduleExam={onScheduleExam} />
      </div>
    );
  }

  return (
    <div
      data-testid="medical-exams-timeline"
      className={cn('flex flex-col gap-6', className)}
    >
      <NextExamCard plan={computedPlan} onScheduleExam={onScheduleExam} />

      <div className="relative">
        {orderedExams.map((exam, index) => (
          <TimelineItem
            key={exam.id}
            exam={exam}
            isFirst={index === 0}
            isLast={index === orderedExams.length - 1}
            onDeleteExam={onDeleteExam}
          />
        ))}
      </div>
    </div>
  );
}
