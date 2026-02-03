import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy } from 'lucide-react';

interface DuplicateConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemCount: number;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function DuplicateConfirmModal({
  isOpen,
  onClose,
  itemCount,
  onConfirm,
  isLoading,
}: DuplicateConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Confirmar duplicacao
          </DialogTitle>
          <DialogDescription>
            Criar copia de{' '}
            {itemCount === 1 ? '1 fornecedor' : `${itemCount} fornecedores`}?
            <br />
            <span className="text-amber-600 dark:text-amber-400 mt-2 block">
              Nota: O CNPJ sera regenerado automaticamente para cada copia.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Duplicando...' : 'Duplicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
