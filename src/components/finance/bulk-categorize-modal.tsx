'use client';

import { translateError } from '@/lib/error-messages';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { useFinanceCategories } from '@/hooks/finance/use-finance-categories';
import { useBulkCategorizeEntries } from '@/hooks/finance/use-finance-bulk-actions';
import { CheckCircle, FolderTree, Loader2 } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [categoryId, setCategoryId] = useState('');

  const { data: categoriesData } = useFinanceCategories();
  const categories = categoriesData?.categories ?? [];

  const filteredCategories = useMemo(
    () => categories.filter(c => c.type === categoryType || c.type === 'BOTH'),
    [categories, categoryType]
  );

  const selectedCategory = useMemo(
    () => filteredCategories.find(c => c.id === categoryId),
    [filteredCategories, categoryId]
  );

  const bulkCategorizeMutation = useBulkCategorizeEntries();

  const handleClose = useCallback(() => {
    setCategoryId('');
    setCurrentStep(1);
    onOpenChange(false);
  }, [onOpenChange]);

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

      handleClose();
      onSuccess();
    } catch (err) {
      toast.error(translateError(err));
    }
  }, [categoryId, selectedIds, bulkCategorizeMutation, handleClose, onSuccess]);

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Selecionar Categoria',
        description: 'Escolha a categoria para os lançamentos selecionados',
        icon: (
          <FolderTree className="h-16 w-16 text-sky-400" strokeWidth={1.2} />
        ),
        content: (
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
            <p className="text-sm text-muted-foreground">
              {selectedIds.length}{' '}
              {selectedIds.length === 1
                ? 'lançamento será atualizado'
                : 'lançamentos serão atualizados'}{' '}
              com a categoria selecionada.
            </p>
          </div>
        ),
        isValid: !!categoryId,
      },
      {
        title: 'Confirmação',
        description: 'Revise a alteração antes de confirmar',
        icon: (
          <CheckCircle
            className="h-16 w-16 text-emerald-400"
            strokeWidth={1.2}
          />
        ),
        content: (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-5 space-y-4">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  A seguinte alteração será aplicada:
                </p>
                <div className="text-lg font-medium">
                  <span className="text-2xl font-bold">
                    {selectedIds.length}
                  </span>{' '}
                  {selectedIds.length === 1 ? 'lançamento' : 'lançamentos'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedIds.length === 1
                    ? 'será categorizado'
                    : 'serão categorizados'}{' '}
                  como
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 px-4 py-2">
                  <FolderTree className="h-4 w-4 text-sky-500" />
                  <span className="font-medium text-sky-700 dark:text-sky-300">
                    {selectedCategory?.name ?? '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        footer: (
          <div className="flex items-center gap-2 w-full justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
            >
              ← Voltar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={bulkCategorizeMutation.isPending}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              {bulkCategorizeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FolderTree className="h-4 w-4 mr-2" />
              )}
              Confirmar
            </Button>
          </div>
        ),
      },
    ],
    [
      categoryId,
      filteredCategories,
      selectedIds,
      selectedCategory,
      handleConfirm,
      bulkCategorizeMutation.isPending,
    ]
  );

  return (
    <StepWizardDialog
      open={open}
      onOpenChange={val => {
        if (!val) handleClose();
      }}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
      heightClass="h-[420px]"
    />
  );
}
