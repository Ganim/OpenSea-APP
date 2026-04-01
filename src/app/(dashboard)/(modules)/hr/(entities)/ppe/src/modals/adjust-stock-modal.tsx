'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PPEItem } from '@/types/hr';
import { Loader2, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAdjustPPEStock } from '../api';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  ppeItem: PPEItem | null;
}

export function AdjustStockModal({
  isOpen,
  onClose,
  ppeItem,
}: AdjustStockModalProps) {
  const [quantity, setQuantity] = useState('');
  const [mode, setMode] = useState<'add' | 'remove'>('add');

  const adjustMutation = useAdjustPPEStock({
    onSuccess: () => {
      resetForm();
      onClose();
    },
  });

  function resetForm() {
    setQuantity('');
    setMode('add');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    if (!ppeItem || !quantity) return;

    const adjustment = mode === 'add' ? Number(quantity) : -Number(quantity);
    await adjustMutation.mutateAsync({
      id: ppeItem.id,
      adjustment,
    });
  }

  const numQuantity = Number(quantity) || 0;
  const isValid =
    numQuantity > 0 &&
    (mode === 'add' || numQuantity <= (ppeItem?.currentStock ?? 0));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Estoque</DialogTitle>
          <DialogDescription>
            {ppeItem
              ? `Ajustar estoque de "${ppeItem.name}" — Estoque atual: ${ppeItem.currentStock}`
              : 'Ajustar estoque do EPI'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('add')}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                mode === 'add'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
            <button
              type="button"
              onClick={() => setMode('remove')}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                mode === 'remove'
                  ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <Minus className="h-4 w-4" />
              Remover
            </button>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="adjust-quantity">Quantidade *</Label>
            <Input
              id="adjust-quantity"
              type="number"
              min="1"
              max={mode === 'remove' ? ppeItem?.currentStock : undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantidade a ajustar"
            />
            {mode === 'remove' && numQuantity > (ppeItem?.currentStock ?? 0) && (
              <p className="mt-1 text-xs text-rose-500">
                Quantidade excede o estoque atual ({ppeItem?.currentStock})
              </p>
            )}
          </div>

          {/* Preview */}
          {numQuantity > 0 && ppeItem && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="text-muted-foreground">
                Estoque atual:{' '}
                <span className="font-medium text-foreground">
                  {ppeItem.currentStock}
                </span>
              </p>
              <p className="text-muted-foreground">
                Após ajuste:{' '}
                <span className="font-medium text-foreground">
                  {mode === 'add'
                    ? ppeItem.currentStock + numQuantity
                    : ppeItem.currentStock - numQuantity}
                </span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={adjustMutation.isPending || !isValid}
          >
            {adjustMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Confirmar Ajuste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
