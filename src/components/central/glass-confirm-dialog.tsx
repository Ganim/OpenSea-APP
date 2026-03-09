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

export interface GlassConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

/**
 * Dialog de confirmação com glassmorphism para o Central.
 * Substitui window.confirm() com visual consistente e suporte a loading.
 */
export function GlassConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: GlassConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          'central-glass-strong border border-[rgb(var(--central-border)/0.15)]',
          'shadow-2xl backdrop-blur-xl'
        )}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="central-text text-lg font-semibold">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="central-text-muted text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            className={cn(
              'central-glass-subtle border border-[rgb(var(--central-border)/0.15)]',
              'central-text hover:central-glass-strong transition-all'
            )}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={e => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(
              'text-white transition-all',
              variant === 'danger' &&
                'bg-red-600 hover:bg-red-700 focus:ring-red-500',
              variant === 'warning' &&
                'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
            )}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
