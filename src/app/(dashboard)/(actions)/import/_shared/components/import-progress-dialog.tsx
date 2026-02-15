'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  Pause,
  Play,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import type { ImportProgress } from '../types';
import { cn } from '@/lib/utils';

interface ImportProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: ImportProgress;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onClose: () => void;
  entityLabel: string;
}

export function ImportProgressDialog({
  open,
  onOpenChange,
  progress,
  onPause,
  onResume,
  onCancel,
  onClose,
  entityLabel,
}: ImportProgressDialogProps) {
  const progressPercentage =
    progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0;

  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'cancelled':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'paused':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed':
        return <CheckCircle2 className="w-8 h-8 text-green-600" />;
      case 'failed':
        return <XCircle className="w-8 h-8 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="w-8 h-8 text-yellow-600" />;
      case 'paused':
        return <Pause className="w-8 h-8 text-orange-600" />;
      default:
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'idle':
        return 'Aguardando...';
      case 'validating':
        return 'Validando dados...';
      case 'validated':
        return 'Dados validados';
      case 'importing':
        return 'Importando...';
      case 'paused':
        return 'Pausado';
      case 'completed':
        return 'Importação concluída!';
      case 'failed':
        return 'Falha na importação';
      case 'cancelled':
        return 'Importação cancelada';
    }
  };

  const isProcessing =
    progress.status === 'importing' || progress.status === 'validating';
  const canClose = !isProcessing;

  return (
    <Dialog open={open} onOpenChange={canClose ? onOpenChange : undefined}>
      <DialogContent
        className="sm:max-w-lg"
        onPointerDownOutside={e => !canClose && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Importando {entityLabel}</DialogTitle>
          <DialogDescription>
            Acompanhe o progresso da importação em tempo real
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status icon and text */}
          <div className="flex flex-col items-center justify-center gap-3">
            {getStatusIcon()}
            <span className={cn('text-lg font-medium', getStatusColor())}>
              {getStatusText()}
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Batch {progress.currentBatch} de {progress.totalBatches}
              </span>
              <span>
                {progress.processed} de {progress.total}
              </span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-600">
                {progress.successful}
              </div>
              <div className="text-xs text-muted-foreground">Sucesso</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-red-600">
                {progress.failed}
              </div>
              <div className="text-xs text-muted-foreground">Erros</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-muted-foreground">
                {progress.total - progress.processed}
              </div>
              <div className="text-xs text-muted-foreground">Restantes</div>
            </div>
          </div>

          {/* Error list */}
          {progress.errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                <AlertCircle className="w-4 h-4" />
                Erros ({progress.errors.length})
              </div>
              <ScrollArea className="h-32 rounded-md border p-2">
                <div className="space-y-1">
                  {progress.errors.map((error, index) => (
                    <div
                      key={index}
                      className="text-xs p-2 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                    >
                      <span className="font-medium">Linha {error.row}:</span>{' '}
                      {error.message}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Time info */}
          {progress.startedAt && (
            <div className="text-xs text-center text-muted-foreground">
              Iniciado em{' '}
              {new Date(progress.startedAt).toLocaleTimeString('pt-BR')}
              {progress.completedAt && (
                <>
                  {' '}
                  • Concluído em{' '}
                  {new Date(progress.completedAt).toLocaleTimeString('pt-BR')}
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {isProcessing && (
            <>
              {progress.status === 'paused' ? (
                <Button variant="outline" onClick={onResume}>
                  <Play className="w-4 h-4 mr-1" />
                  Continuar
                </Button>
              ) : (
                <Button variant="outline" onClick={onPause}>
                  <Pause className="w-4 h-4 mr-1" />
                  Pausar
                </Button>
              )}
              <Button variant="destructive" onClick={onCancel}>
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
            </>
          )}
          {canClose && <Button onClick={onClose}>Fechar</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
