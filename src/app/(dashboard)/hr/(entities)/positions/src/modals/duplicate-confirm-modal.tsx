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
      title="Duplicar Cargo"
      description={
        itemCount === 1
          ? 'Tem certeza que deseja duplicar este cargo?'
          : `Tem certeza que deseja duplicar ${itemCount} cargos?`
      }
      onConfirm={onConfirm}
      confirmLabel="Duplicar"
      cancelLabel="Cancelar"
      isLoading={isLoading}
    />
  );
}
