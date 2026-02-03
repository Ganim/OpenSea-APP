'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  icon?: React.ReactNode;
}

const variantStyles = {
  default: 'bg-blue-500',
  destructive: 'bg-red-500',
  warning: 'bg-yellow-500',
  success: 'bg-green-500',
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  variant = 'default',
  icon,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl p-6">
        <DialogHeader>
          {icon && (
            <div
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center mb-4',
                variantStyles[variant],
                'text-white'
              )}
            >
              {icon}
            </div>
          )}
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-white/60">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-xl"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            className={cn(
              'h-11 rounded-xl text-white border-0',
              variant === 'destructive' && 'bg-red-500 hover:bg-red-600',
              variant === 'default' &&
                'bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            )}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
