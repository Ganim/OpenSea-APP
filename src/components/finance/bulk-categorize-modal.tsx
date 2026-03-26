'use client';

import { translateError } from '@/lib/error-messages';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFinanceCategories } from '@/hooks/finance/use-finance-categories';
import { useBulkCategorizeEntries } from '@/hooks/finance/use-finance-bulk-actions';
import { FolderTree, Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface BulkCategorizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess: () => void;
  /** Category type filter: 'EXPENSE' for payable, 'REVENUE' for receivable */
  categoryType: 'EXPENSE' | 'REVENUE';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BulkCategorizeModal({
  open,
  onOpenChange,
  selectedIds,
  onSuccess,
  categoryType,
}: BulkCategorizeModalProps) {
  const [categoryId, setCategoryId] = useState('');

  const { data: categoriesData } = useFinanceCategories();
  const categories = categoriesData?.categories ?? [];

  const filteredCategories = useMemo(
    () => categories.filter(c => c.type === categoryType || c.type === 'BOTH'),
    [categories, categoryType]
  );

  const bulkCategorizeMutation = useBulkCategorizeEntries();

  const handleConfirm = useCallback(async () => {
    if (!categoryId) {
      toast.error('Selecione uma categoria.');
      return;
    }

    try {
      const result = await bulkCategorizeMutation.mutateAsync({
        entryIds: selectedIds,
        categoryId,
      });

      if (result.failed > 0) {
        toast.warning(
          `${result.success} de ${selectedIds.length} lançamentos atualizados.`,
          {
            description: result.errors
              .map(e => e.error)
              .slice(0, 3)
              .join('; '),
          }
        );
      } else {
        toast.success(
          `Categoria alterada em ${result.success} ${result.success === 1 ? 'lançamento' : 'lançamentos'}.`
        );
      }

      setCategoryId('');
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(translateError(err));
    }
  }, [
    categoryId,
    selectedIds,
    bulkCategorizeMutation,
    onOpenChange,
    onSuccess,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-sky-500" />
            Alterar Categoria
          </DialogTitle>
          <DialogDescription>
            Alterar categoria de {selectedIds.length}{' '}
            {selectedIds.length === 1 ? 'lançamento' : 'lançamentos'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!categoryId || bulkCategorizeMutation.isPending}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            {bulkCategorizeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FolderTree className="h-4 w-4 mr-2" />
            )}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
