'use client';

import { ConfirmDialog } from '@/core';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemCount: number;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  itemCount,
  onConfirm,
  isLoading,
}: DeleteConfirmModalProps) {
  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={open => !open && onClose()}
      title="Excluir Template"
      description={
        itemCount === 1
          ? 'Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.'
          : `Tem certeza que deseja excluir ${itemCount} templates? Esta ação não pode ser desfeita.`
      }
      onConfirm={onConfirm}
      confirmLabel="Excluir"
      cancelLabel="Cancelar"
      variant="destructive"
      isLoading={isLoading}
    />
  );
}
