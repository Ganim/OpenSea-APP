'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { useEscalationTimeline } from '@/hooks/finance/use-escalations';
import { cn } from '@/lib/utils';
import type {
  EscalationTimelineStep,
  EscalationTimelineStepStatus,
} from '@/types/finance';
import { TIMELINE_STATUS_LABELS } from '@/types/finance';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Mail,
  MessageCircle,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// HELPERS
// ============================================================================

function getChannelIcon(channel: string) {
  switch (channel) {
    case 'E-mail':
      return Mail;
    case 'WhatsApp':
      return MessageCircle;
    case 'Nota Interna':
      return FileText;
    case 'Alerta do Sistema':
      return Bell;
    default:
      return Bell;
  }
}

function getStatusDotClasses(status: EscalationTimelineStepStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-500 ring-emerald-500/20';
    case 'FAILED':
      return 'bg-rose-500 ring-rose-500/20';
    case 'PENDING':
      return 'bg-amber-500 ring-amber-500/20';
    case 'SCHEDULED':
      return 'bg-slate-400 dark:bg-slate-500 ring-slate-400/20 dark:ring-slate-500/20';
  }
}

function getStatusBadgeClasses(status: EscalationTimelineStepStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20';
    case 'FAILED':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300 border-rose-200 dark:border-rose-500/20';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/8 dark:text-amber-300 border-amber-200 dark:border-amber-500/20';
    case 'SCHEDULED':
      return 'bg-slate-50 text-slate-600 dark:bg-slate-500/8 dark:text-slate-400 border-slate-200 dark:border-slate-500/20';
  }
}

function getStatusIcon(status: EscalationTimelineStepStatus) {
  switch (status) {
    case 'COMPLETED':
      return CheckCircle2;
    case 'FAILED':
      return XCircle;
    case 'PENDING':
      return Clock;
    case 'SCHEDULED':
      return Clock;
  }
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateShort(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

// ============================================================================
// TIMELINE STEP COMPONENT
// ============================================================================

function TimelineStep({
  step,
  isLast,
  isCurrent,
}: {
  step: EscalationTimelineStep;
  isLast: boolean;
  isCurrent: boolean;
}) {
  const ChannelIcon = getChannelIcon(step.channel);
  const StatusIcon = getStatusIcon(step.status);
  const isFuture = step.status === 'SCHEDULED';

  return (
    <div className="relative flex gap-4">
      {/* Vertical line + dot */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4',
            getStatusDotClasses(step.status),
            isCurrent && 'ring-8'
          )}
        >
          <StatusIcon className="h-4 w-4 text-white" />
        </div>
        {!isLast && (
          <div
            className={cn(
              'w-0.5 flex-1 min-h-8',
              isFuture
                ? 'border-l-2 border-dashed border-slate-300 dark:border-slate-600'
                : 'bg-slate-200 dark:bg-slate-700'
            )}
          />
        )}
      </div>

      {/* Content card */}
      <div
        className={cn(
          'flex-1 mb-6 rounded-lg border p-4 transition-colors',
          isCurrent
            ? 'border-primary/30 bg-primary/5 dark:bg-primary/5'
            : isFuture
              ? 'border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
              : 'border-border bg-white dark:bg-slate-800/60'
        )}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md',
                isFuture
                  ? 'bg-slate-100 dark:bg-slate-700/50'
                  : 'bg-slate-100 dark:bg-slate-700'
              )}
            >
              <ChannelIcon
                className={cn(
                  'h-4 w-4',
                  isFuture
                    ? 'text-slate-400 dark:text-slate-500'
                    : 'text-slate-600 dark:text-slate-300'
                )}
              />
            </div>
            <div>
              <p
                className={cn(
                  'text-sm font-medium',
                  isFuture && 'text-muted-foreground'
                )}
              >
                {step.channel}
              </p>
              <p className="text-xs text-muted-foreground">
                Etapa {step.stepNumber}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn('text-xs', getStatusBadgeClasses(step.status))}
          >
            {TIMELINE_STATUS_LABELS[step.status]}
          </Badge>
        </div>

        <p
          className={cn(
            'mt-2.5 text-sm',
            isFuture ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          {step.description}
        </p>

        {/* Date info */}
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {step.executedDate && (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Executado: {formatDate(step.executedDate)}
            </span>
          )}
          {step.scheduledDate && !step.executedDate && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {step.status === 'SCHEDULED' ? 'Previsão' : 'Programado'}:{' '}
              {formatDateShort(step.scheduledDate)}
            </span>
          )}
        </div>

        {/* Message preview */}
        {step.messagePreview && (
          <div
            className={cn(
              'mt-2.5 rounded-md border px-3 py-2 text-xs',
              isFuture
                ? 'border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-muted-foreground'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'
            )}
          >
            <span className="font-medium text-muted-foreground">
              Mensagem:{' '}
            </span>
            {step.messagePreview}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface EscalationTimelineProps {
  entryId: string;
  isOverdue: boolean;
}

export function EscalationTimeline({
  entryId,
  isOverdue,
}: EscalationTimelineProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { data, isLoading } = useEscalationTimeline(entryId, isOverdue);

  // Don't render if not overdue or no data
  if (!isOverdue) return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Régua de Cobranca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-4">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data || data.steps.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer select-none hover:bg-muted/50 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Régua de Cobranca
                <Badge variant="secondary" className="ml-1">
                  {data.currentStep}/{data.totalSteps}
                </Badge>
              </CardTitle>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Progress summary */}
            <div className="mb-5 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {
                  data.steps.filter(
                    (s: EscalationTimelineStep) => s.status === 'COMPLETED'
                  ).length
                }{' '}
                concluído(s)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                {
                  data.steps.filter(
                    (s: EscalationTimelineStep) => s.status === 'FAILED'
                  ).length
                }{' '}
                falha(s)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {
                  data.steps.filter(
                    (s: EscalationTimelineStep) => s.status === 'PENDING'
                  ).length
                }{' '}
                pendente(s)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                {
                  data.steps.filter(
                    (s: EscalationTimelineStep) => s.status === 'SCHEDULED'
                  ).length
                }{' '}
                agendado(s)
              </span>
            </div>

            {/* Timeline */}
            <div className="relative">
              {data.steps.map((step: EscalationTimelineStep, index: number) => (
                <TimelineStep
                  key={step.stepNumber}
                  step={step}
                  isLast={index === data.steps.length - 1}
                  isCurrent={step.stepNumber === data.currentStep}
                />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
