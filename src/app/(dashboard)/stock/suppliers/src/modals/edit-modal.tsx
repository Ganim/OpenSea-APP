import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EntityForm } from '@/core';
import type { Supplier } from '@/types/stock';
import { Edit, Truck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { suppliersConfig } from '../config/suppliers.config';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  isSubmitting: boolean;
  onSubmit: (id: string, data: Partial<Supplier>) => Promise<void>;
}

export function EditModal({
  isOpen,
  onClose,
  supplier,
  isSubmitting,
  onSubmit,
}: EditModalProps) {
  const router = useRouter();

  if (!supplier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex-col flex">Edicao Rapida</div>
            </div>
          </DialogTitle>
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    onClose();
                    router.push(`/stock/suppliers/${supplier.id}/edit`);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edicao avancada</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClose()}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fechar</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </DialogHeader>

        <EntityForm
          config={suppliersConfig.form! as never}
          mode="edit"
          initialData={supplier as never}
          onSubmit={async data => {
            await onSubmit(
              supplier.id,
              data as Record<string, unknown> as Partial<Supplier>
            );
            onClose();
          }}
          onCancel={() => onClose()}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
