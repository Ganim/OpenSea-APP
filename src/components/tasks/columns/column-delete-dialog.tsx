'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ColumnDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnTitle: string;
  cardCount: number;
  onConfirm: () => void;
}

export function ColumnDeleteDialog({
  open,
  onOpenChange,
  columnTitle,
  cardCount,
  onConfirm,
}: ColumnDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Excluir coluna &ldquo;{columnTitle}&rdquo;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {cardCount > 0
              ? `Os ${cardCount} cartão(s) desta coluna serão movidos para a coluna padrão.`
              : 'Esta coluna não possui cartões.'}{' '}
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
