import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PurchaseOrder } from '@/types/stock';
import { Loader2, XCircle } from 'lucide-react';

interface CancelOrderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderToCancel: PurchaseOrder | null;
  onConfirmCancel: () => void;
  isCancelling: boolean;
}

export function CancelOrderDialog({
  isOpen,
  onOpenChange,
  orderToCancel,
  onConfirmCancel,
  isCancelling,
}: CancelOrderDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Ordem de Compra</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar a ordem{' '}
            <strong>{orderToCancel?.orderNumber}</strong>? Esta ação não pode
            ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Não, manter
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmCancel}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Sim, cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
