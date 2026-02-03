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
  operationType: 'delete' | 'duplicate' | 'create';
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
  const isActive = status === 'running' || status === 'paused';
  const isFinished = status === 'completed' || status === 'cancelled';

  // Determina o título baseado no status
  const getTitle = () => {
    if (status === 'running') {
      return (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          {config.title} {itemName}...
        </>
      );
    }

    if (status === 'paused') {
      return (
        <>
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Operação pausada
        </>
      );
    }

    if (status === 'cancelled') {
      return (
        <>
          <XCircle className="h-5 w-5 text-gray-500" />
          {config.cancelledTitle}
        </>
      );
    }

    if (status === 'completed') {
      if (hasErrors) {
        return (
          <>
            <AlertCircle className="h-5 w-5 text-orange-500" />
            {config.completedTitle} com erros
          </>
        );
      }
      return (
        <>
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          {config.completedTitle}
        </>
      );
    }

    return null;
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {getTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-4">
              {/* Barra de progresso */}
              <div className="space-y-2">
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {processed} de {total} {itemName}
                  </span>
                  <span className="font-semibold">{progress}%</span>
                </div>
              </div>

              {/* Estatísticas durante processamento */}
              {isActive && (
                <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-1">
                  {succeeded > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-600 dark:text-green-400">
                        ✓ Sucesso
                      </span>
                      <span className="font-medium">{succeeded}</span>
                    </div>
                  )}
                  {failed > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-600 dark:text-red-400">
                        ✗ Falhas
                      </span>
                      <span className="font-medium">{failed}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mensagem de processamento */}
              {status === 'running' && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Processando de forma controlada para respeitar limites do
                    servidor.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ⚡ ~2 {itemName} por segundo
                  </p>
                </div>
              )}

              {/* Mensagem de pausado */}
              {status === 'paused' && (
                <p className="text-sm text-muted-foreground">
                  A operação foi pausada. Você pode continuar ou cancelar.
                </p>
              )}

              {/* Resumo final - apenas quando completo ou cancelado */}
              {isFinished && (
                <div className="rounded-lg border p-3 text-sm space-y-2">
                  {succeeded > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-600 dark:text-green-400">
                        ✓ {config.verb[0].toUpperCase() + config.verb.slice(1)}{' '}
                        com sucesso
                      </span>
                      <span className="font-medium">{succeeded}</span>
                    </div>
                  )}
                  {failed > 0 && (
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-red-600 dark:text-red-400">
                        ✗ Falharam
                      </span>
                      <span className="font-medium">{failed}</span>
                    </div>
                  )}
                  {status === 'cancelled' && (
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      Operação cancelada. {succeeded} {itemName} foram
                      processados antes do cancelamento.
                    </p>
                  )}
                </div>
              )}

              {/* Mensagem de sucesso completo */}
              {status === 'completed' && !hasErrors && (
                <p className="text-sm text-muted-foreground text-center">
                  {config.icon} Todos os {itemName} foram processados com
                  sucesso!
                </p>
              )}

              {/* Mensagem de erro */}
              {status === 'completed' && hasErrors && (
                <p className="text-sm text-muted-foreground">
                  {failed}{' '}
                  {failed === 1 ? itemName.replace(/s$/, '') : itemName}{' '}
                  {failed === 1 ? 'falhou' : 'falharam'} durante o
                  processamento. Tente novamente mais tarde.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          {/* Botões durante processamento */}
          {status === 'running' && (
            <div className="flex gap-2 w-full">
              {onPause && (
                <Button variant="outline" onClick={onPause} className="flex-1">
                  Pausar
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="destructive"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
            </div>
          )}

          {/* Botões quando pausado */}
          {status === 'paused' && (
            <div className="flex gap-2 w-full">
              {onResume && (
                <Button variant="default" onClick={onResume} className="flex-1">
                  Continuar
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="destructive"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
            </div>
          )}

          {/* Botão quando finalizado */}
          {isFinished && (
            <Button onClick={onClose} className="w-full">
              Fechar
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
