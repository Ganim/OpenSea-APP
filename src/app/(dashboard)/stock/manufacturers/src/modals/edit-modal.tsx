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
import type { Manufacturer } from '@/types/stock';
import { Edit, Factory, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { manufacturersConfig } from '../config/manufacturers.config';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  manufacturer: Manufacturer | null;
  isSubmitting: boolean;
  onSubmit: (id: string, data: Partial<Manufacturer>) => Promise<void>;
}

export function EditModal({
  isOpen,
  onClose,
  manufacturer,
  isSubmitting,
  onSubmit,
}: EditModalProps) {
  const router = useRouter();

  if (!manufacturer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-violet-500 to-purple-600 p-2 rounded-lg">
                <Factory className="h-5 w-5" />
              </div>
              <div className="flex-col flex">Edição Rápida</div>
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
                    router.push(`/stock/manufacturers/${manufacturer.id}/edit`);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edição avançada</p>
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          config={manufacturersConfig.form! as any}
          mode="edit"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialData={manufacturer as any}
          onSubmit={async data => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await onSubmit(manufacturer.id, data as any);
            onClose();
          }}
          onCancel={() => onClose()}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
