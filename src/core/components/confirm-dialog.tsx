/**
 * OpenSea OS - ConfirmDialog Component
 * Diálogo de confirmação genérico para ações destrutivas
 */

'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface ConfirmDialogProps {
  /** Se o diálogo está aberto */
  open: boolean;
  /** Callback ao mudar estado de abertura */
  onOpenChange: (open: boolean) => void;
  /** Título do diálogo */
  title: string;
  /** Descrição/mensagem */
  description: string | React.ReactNode;
  /** Callback ao confirmar */
  onConfirm: () => void | Promise<void>;
  /** Callback ao cancelar (opcional, fecha por padrão) */
  onCancel?: () => void;
  /** Texto do botão de confirmar */
  confirmLabel?: string;
  /** Texto do botão de cancelar */
  cancelLabel?: string;
  /** Variante do botão de confirmar */
  variant?: 'default' | 'destructive';
  /** Está processando a confirmação */
  isLoading?: boolean;
  /** Classes adicionais */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  isLoading = false,
  className,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(className)}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            {typeof description === 'string' ? (
              <p>{description}</p>
            ) : (
              description
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              variant === 'destructive' &&
                'bg-[rgb(var(--color-destructive))] text-white hover:bg-[rgb(var(--color-destructive-hover))] dark:bg-[rgb(var(--color-destructive))]/60  dark:text-destructive-foreground  dark:hover:bg-[rgb(var(--color-destructive-hover))]/80'
            )}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialog;
