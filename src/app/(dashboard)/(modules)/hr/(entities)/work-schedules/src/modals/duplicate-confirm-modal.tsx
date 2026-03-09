'use client';

import { ConfirmDialog } from '@/core';

interface DuplicateConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemCount: number;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function DuplicateConfirmModal({
  isOpen,
  onClose,
  itemCount,
  onConfirm,
  isLoading,
}: DuplicateConfirmModalProps) {
  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={open => !open && onClose()}
      title="Duplicar Escala"
      description={
        itemCount === 1
          ? 'Tem certeza que deseja duplicar esta escala de trabalho?'
          : `Tem certeza que deseja duplicar ${itemCount} escalas de trabalho?`
      }
      onConfirm={onConfirm}
      confirmLabel="Duplicar"
      cancelLabel="Cancelar"
      isLoading={isLoading}
    />
  );
}
