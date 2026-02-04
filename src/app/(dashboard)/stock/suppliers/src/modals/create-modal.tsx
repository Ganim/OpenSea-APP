import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EntityForm } from '@/core';
import type { Supplier } from '@/types/stock';
import { Truck, X } from 'lucide-react';
import { suppliersConfig } from '../config/suppliers.config';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: Partial<Supplier>) => Promise<void>;
  initialData?: Partial<Supplier>;
}

export function CreateModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
  initialData,
}: CreateModalProps) {
  const defaultData: Partial<Supplier> = {
    isActive: true,
    country: 'Brasil',
    ...initialData,
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex-col flex">Novo Fornecedor</div>
            </div>
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <EntityForm
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          config={suppliersConfig.form! as any}
          mode="create"
          initialData={defaultData}
          onSubmit={async data => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await onSubmit(data as any);
            onClose();
          }}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
