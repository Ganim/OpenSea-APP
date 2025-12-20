/**
 * Enterprise Create Modal
 * Modal para criação de nova empresa
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Enterprise } from '@/types/hr';
import { EnterpriseForm } from '../components/enterprise-form';
import type { EnterpriseFormData } from '../types';

export interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (enterprise: Enterprise) => void;
  isSubmitting?: boolean;
  onSubmit: (data: EnterpriseFormData) => Promise<void>;
}

export function CreateModal({
  isOpen,
  onClose,
  onSuccess,
  isSubmitting = false,
  onSubmit,
}: CreateModalProps) {
  const handleSave = async (data: EnterpriseFormData) => {
    await onSubmit(data);
    onSuccess?.({} as Enterprise);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Empresa</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <EnterpriseForm
            onSave={handleSave}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
