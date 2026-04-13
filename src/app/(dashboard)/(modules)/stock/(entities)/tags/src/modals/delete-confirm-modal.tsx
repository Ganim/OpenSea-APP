'use client';

import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  count: number;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onSuccess,
  count,
}: DeleteConfirmModalProps) {
  return (
    <VerifyActionPinModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      title="Confirmar Exclusão"
      description={
        count === 1
          ? 'Digite seu PIN de ação para excluir esta tag.'
          : `Digite seu PIN de ação para excluir ${count} tags.`
      }
    />
  );
}
