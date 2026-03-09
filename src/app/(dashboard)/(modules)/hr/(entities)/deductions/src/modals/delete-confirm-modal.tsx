'use client';

import { ConfirmDialog } from '@/core';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: DeleteConfirmModalProps) {
  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={open => !open && onClose()}
      title="Excluir Dedução"
      description="Tem certeza que deseja excluir esta dedução? Esta ação não pode ser desfeita."
      onConfirm={onConfirm}
      confirmLabel="Excluir"
      cancelLabel="Cancelar"
      variant="destructive"
      isLoading={isLoading}
    />
  );
}
