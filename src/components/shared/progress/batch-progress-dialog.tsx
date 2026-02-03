/**
 * Batch Progress Dialog Component (Generic)
 * Dialog de progresso para operações em lote
 * Componente 100% genérico que funciona com qualquer entidade
 */

'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react';

type OperationStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled';

interface BatchProgressDialogProps {
  open: boolean;
  status: OperationStatus;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  progress: number;
  operationType: 'delete' | 'duplicate' | 'create' | 'update';
  itemName?: string;
  onClose: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
}

const OPERATION_CONFIG = {
  delete: {
    title: 'Excluindo',
    completedTitle: 'Exclusão concluída',
    cancelledTitle: 'Exclusão cancelada',
    verb: 'excluídos',
    icon: '🗑️',
    color: 'red',
  },
  duplicate: {
    title: 'Duplicando',
    completedTitle: 'Duplicação concluída',
    cancelledTitle: 'Duplicação cancelada',
    verb: 'duplicados',
    icon: '📋',
    color: 'blue',
  },
  create: {
    title: 'Criando',
    completedTitle: 'Criação concluída',
    cancelledTitle: 'Criação cancelada',
    verb: 'criados',
    icon: '✨',
    color: 'green',
  },
  update: {
    title: 'Atualizando',
    completedTitle: 'Atualização concluída',
    cancelledTitle: 'Atualização cancelada',
    verb: 'atualizados',
    icon: '🔄',
    color: 'blue',
  },
} as const;

export function BatchProgressDialog({
  open,
  status,
  total,
  processed,
  succeeded,
  failed,
  progress,
  operationType,
  itemName = 'itens',
  onClose,
  onPause,
  onResume,
  onCancel,
}: BatchProgressDialogProps) {
  const config = OPERATION_CONFIG[operationType];
  const hasErrors = failed > 0;

  const getTitle = () => {
    if (status === 'completed') return config.completedTitle;
    if (status === 'cancelled') return config.cancelledTitle;
    if (status === 'paused')
      return `${config.title} (pausado) - ${processed}/${total}`;
    return `${config.title} ${itemName}... (${processed}/${total})`;
  };

  const getDescription = () => {
    if (status === 'completed') {
      if (hasErrors) {
        return `${succeeded} ${itemName} ${config.verb} com sucesso, ${failed} falharam.`;
      }
      return `${succeeded} ${itemName} ${config.verb} com sucesso!`;
    }

    if (status === 'cancelled') {
      return `Operação cancelada. ${succeeded} ${itemName} foram ${config.verb} antes do cancelamento.`;
    }

    if (status === 'paused') {
      return `Operação pausada. ${processed} de ${total} processados.`;
    }

    return `Processando ${itemName}...`;
  };

  const getIcon = () => {
    if (status === 'completed') {
      return hasErrors ? (
        <AlertCircle className="w-6 h-6 text-amber-500" />
      ) : (
        <CheckCircle2 className="w-6 h-6 text-green-500" />
      );
    }

    if (status === 'cancelled') {
      return <XCircle className="w-6 h-6 text-red-500" />;
    }

    if (status === 'paused') {
      return <AlertCircle className="w-6 h-6 text-blue-500" />;
    }

    return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>

        {/* Progress Bar */}
        {status !== 'completed' && status !== 'cancelled' && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>
                {processed} de {total}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>

            {/* Counters */}
            <div className="flex items-center gap-4 text-sm mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {succeeded} sucesso
                </span>
              </div>
              {failed > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {failed} falhas
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary on complete */}
        {(status === 'completed' || status === 'cancelled') && (
          <div className="flex items-center gap-6 text-sm p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {succeeded} sucesso
              </span>
            </div>
            {failed > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {failed} falhas
                </span>
              </div>
            )}
          </div>
        )}

        <AlertDialogFooter>
          {status === 'running' && (
            <>
              {onPause && (
                <Button variant="outline" onClick={onPause}>
                  Pausar
                </Button>
              )}
              {onCancel && (
                <Button variant="destructive" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
            </>
          )}

          {status === 'paused' && (
            <>
              {onResume && (
                <Button variant="default" onClick={onResume}>
                  Retomar
                </Button>
              )}
              {onCancel && (
                <Button variant="destructive" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
            </>
          )}

          {(status === 'completed' || status === 'cancelled') && (
            <Button variant="default" onClick={onClose}>
              Fechar
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
