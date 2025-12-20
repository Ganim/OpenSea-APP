/**
 * Enterprise Edit Modal
 * Modal para edição rápida de empresa
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

export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterprise: Enterprise | null;
  isSubmitting?: boolean;
  onSubmit: (id: string, data: EnterpriseFormData) => Promise<void>;
  onSuccess?: (enterprise: Enterprise) => void;
}

export function EditModal({
  isOpen,
  onClose,
  enterprise,
  isSubmitting = false,
  onSubmit,
  onSuccess,
}: EditModalProps) {
  if (!enterprise) return null;

  const handleSave = async (data: EnterpriseFormData) => {
    await onSubmit(enterprise.id, data);
    onSuccess?.(enterprise);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <EnterpriseForm
            enterprise={enterprise}
            onSave={handleSave}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
