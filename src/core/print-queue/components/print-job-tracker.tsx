'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  Loader2,
  Printer,
  RefreshCw,
  X,
  XCircle,
} from 'lucide-react';
import { usePrintJobTracker } from '../hooks/use-print-job-tracker';
import type { PrintJobStatus } from '@/types/sales';

const STATUS_CONFIG: Record<
  PrintJobStatus,
  { icon: React.ElementType; label: string; color: string }
> = {
  CREATED: {
    icon: Loader2,
    label: 'Na fila...',
    color: 'text-muted-foreground',
  },
  QUEUED: {
    icon: Loader2,
    label: 'Na fila...',
    color: 'text-muted-foreground',
  },
  PRINTING: {
    icon: Printer,
    label: 'Imprimindo...',
    color: 'text-blue-500',
  },
  SUCCESS: {
    icon: CheckCircle,
    label: 'Concluido',
    color: 'text-green-500',
  },
  FAILED: { icon: XCircle, label: 'Erro', color: 'text-rose-500' },
  CANCELLED: { icon: X, label: 'Cancelado', color: 'text-gray-400' },
};

export function PrintJobTracker() {
  const { activeJobs, cancelJob, retryJob, removeJob } = usePrintJobTracker();

  if (activeJobs.length === 0) return null;

  return (
    <div className="space-y-2">
      {activeJobs.map(job => {
        const config = STATUS_CONFIG[job.status];
        const Icon = config.icon;
        const isActive =
          job.status === 'CREATED' ||
          job.status === 'QUEUED' ||
          job.status === 'PRINTING';
        const isFailed = job.status === 'FAILED';

        return (
          <div
            key={job.jobId}
            className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-800/60"
          >
            <Icon
              className={cn(
                'w-4 h-4 shrink-0',
                config.color,
                isActive && 'animate-spin'
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{job.printerName}</p>
              <p className={cn('text-xs', config.color)}>
                {config.label}
                {job.copies > 1 && ` · ${job.copies} copias`}
                {job.error && ` · ${job.error}`}
              </p>
            </div>
            {isActive && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => cancelJob(job.jobId)}
              >
                Cancelar
              </Button>
            )}
            {isFailed && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => retryJob(job.jobId)}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Tentar novamente
              </Button>
            )}
            {!isActive && !isFailed && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => removeJob(job.jobId)}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
