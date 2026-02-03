import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemCount: number;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  itemCount,
  onConfirm,
  isLoading,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Confirmar exclusao
          </DialogTitle>
          <DialogDescription>
            Esta acao ira remover{' '}
            {itemCount === 1
              ? 'o fornecedor selecionado'
              : `${itemCount} fornecedores selecionados`}
            . Esta operacao e reversivel apenas se houver soft delete no
            backend.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
