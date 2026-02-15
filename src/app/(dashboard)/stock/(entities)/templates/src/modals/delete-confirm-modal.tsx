'use client';

import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';

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
}: DeleteConfirmModalProps) {
  return (
    <VerifyActionPinModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={() => onConfirm()}
      title="Confirmar Exclusão"
      description={
        itemCount === 1
          ? 'Digite seu PIN de ação para excluir este template. Esta ação não pode ser desfeita.'
          : `Digite seu PIN de ação para excluir ${itemCount} templates. Esta ação não pode ser desfeita.`
      }
    />
  );
}
