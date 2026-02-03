'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface DeleteProgressDialogProps {
  open: boolean;
  isDeleting: boolean;
  progress: number;
  total: number;
  completed: number;
  failed: string[];
  currentBatch?: number;
  totalBatches?: number;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProgressDialog({
  open,
  isDeleting,
  progress,
  total,
  completed,
  failed,
  currentBatch = 0,
  totalBatches = 0,
  onOpenChange,
}: DeleteProgressDialogProps) {
  const hasError = failed.length > 0;
  const isComplete = !isDeleting && total > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isDeleting && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                Excluindo itens...
              </>
            )}
            {isComplete && !hasError && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Exclusão concluída
              </>
            )}
            {isComplete && hasError && (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                Exclusão concluída com erros
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-4">
              {/* Barra de progresso */}
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {completed} de {total} itens
                  </span>
                  <span>{progress}%</span>
                </div>
                {isDeleting && totalBatches > 0 && (
                  <div className="text-xs text-muted-foreground text-center">
                    Lote {currentBatch} de {totalBatches}
                  </div>
                )}
              </div>

              {/* Status */}
              {isComplete && (
                <div className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 dark:text-green-400">
                      ✓ Excluídos com sucesso
                    </span>
                    <span className="font-medium">
                      {completed - failed.length}
                    </span>
                  </div>
                  {hasError && (
                    <div className="mt-2 flex items-center justify-between border-t pt-2">
                      <span className="text-red-600 dark:text-red-400">
                        ✗ Falhas
                      </span>
                      <span className="font-medium">{failed.length}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mensagem */}
              {isDeleting && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Processando exclusões de forma controlada para respeitar
                    limites do servidor.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ⚡ ~5 itens por segundo • Não feche esta janela
                  </p>
                </div>
              )}
              {isComplete && !hasError && (
                <p className="text-sm text-muted-foreground">
                  Todos os itens foram excluídos com sucesso!
                </p>
              )}
              {isComplete && hasError && (
                <p className="text-sm text-muted-foreground">
                  {failed.length}{' '}
                  {failed.length === 1 ? 'item falhou' : 'itens falharam'}{' '}
                  durante a exclusão. Tente novamente mais tarde.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
