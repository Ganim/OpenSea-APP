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
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';

interface BatchOperationProgressDialogProps {
  open: boolean;
  isProcessing: boolean;
  isPaused?: boolean;
  progress: number;
  total: number;
  completed: number;
  failed: string[];
  operationType: 'delete' | 'duplicate' | 'create';
  itemName?: string; // ex: "template", "produto"
  onOpenChange: (open: boolean) => void;
  onPause?: () => void; // Callback para pausar a operação
  onResume?: () => void; // Callback para retomar a operação
  onCancel?: () => void; // Callback para cancelar a operação
}

const operationMessages = {
  delete: {
    processing: 'Excluindo',
    completed: 'Exclusão concluída',
    completedWithErrors: 'Exclusão concluída com erros',
    success: 'Excluídos com sucesso',
    icon: '🗑️',
  },
  duplicate: {
    processing: 'Duplicando',
    completed: 'Duplicação concluída',
    completedWithErrors: 'Duplicação concluída com erros',
    success: 'Duplicados com sucesso',
    icon: '📋',
  },
  create: {
    processing: 'Criando',
    completed: 'Criação concluída',
    completedWithErrors: 'Criação concluída com erros',
    success: 'Criados com sucesso',
    icon: '✨',
  },
};

export function BatchOperationProgressDialog({
  open,
  isProcessing,
  isPaused = false,
  progress,
  total,
  completed,
  failed,
  operationType,
  itemName = 'itens',
  onOpenChange,
  onPause,
  onResume,
  onCancel,
}: BatchOperationProgressDialogProps) {
  const hasError = failed.length > 0;
  const isComplete = !isProcessing && total > 0;
  const messages = operationMessages[operationType];
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelClick = () => {
    // Pausa imediatamente a fila
    if (onPause) {
      onPause();
    }
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirm(false);
    // Confirma o cancelamento
    if (onCancel) {
      onCancel();
    }
  };

  const handleCancelCancel = () => {
    setShowCancelConfirm(false);
    // Retoma a fila
    if (onResume) {
      onResume();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isProcessing && !isPaused && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                {messages.processing} {itemName}...
              </>
            )}
            {isProcessing && isPaused && (
              <>
                <Loader2 className="h-5 w-5 text-yellow-500" />
                Operação pausada
              </>
            )}
            {isComplete && !hasError && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                {messages.completed}
              </>
            )}
            {isComplete && hasError && (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                {messages.completedWithErrors}
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-4">
              {/* Barra de progresso */}
              <div className="space-y-2">
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {completed} de {total} {itemName}
                  </span>
                  <span className="font-medium">{progress}%</span>
                </div>
              </div>

              {/* Status */}
              {isComplete && (
                <div className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 dark:text-green-400">
                      ✓ {messages.success}
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
              {isProcessing && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Processando de forma controlada para respeitar limites do
                    servidor.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ⚡ ~2 {itemName} por segundo • Não feche esta janela
                  </p>
                </div>
              )}
              {isComplete && !hasError && (
                <p className="text-sm text-muted-foreground">
                  {messages.icon} Todos os {itemName} foram processados com
                  sucesso!
                </p>
              )}
              {isComplete && hasError && (
                <p className="text-sm text-muted-foreground">
                  {failed.length}{' '}
                  {failed.length === 1
                    ? itemName.replace(/s$/, '') + ' falhou'
                    : itemName + ' falharam'}{' '}
                  durante o processamento. Tente novamente mais tarde.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          {isProcessing && !showCancelConfirm && (
            <Button
              variant="outline"
              onClick={handleCancelClick}
              className="w-full"
            >
              Cancelar operação
            </Button>
          )}
          {isProcessing && showCancelConfirm && (
            <>
              <p className="text-sm text-center text-muted-foreground">
                Tem certeza que deseja cancelar? O progresso atual será perdido.
              </p>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={handleCancelCancel}
                  className="flex-1"
                >
                  Não, continuar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelConfirm}
                  className="flex-1"
                >
                  Sim, cancelar
                </Button>
              </div>
            </>
          )}
          {isComplete && (
            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
