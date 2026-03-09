'use client';

/**
 * OpenSea OS - Sell Vacation Days Modal (HR)
 *
 * Modal para venda de dias de férias (abono pecuniário).
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';
import type { SellVacationDaysData } from '@/types/hr';

interface SellDaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacationId: string | null;
  onSell: (id: string, data: SellVacationDaysData) => void;
  isSubmitting: boolean;
}

export function SellDaysModal({
  isOpen,
  onClose,
  vacationId,
  onSell,
  isSubmitting,
}: SellDaysModalProps) {
  const [daysToSell, setDaysToSell] = useState(10);

  function resetForm() {
    setDaysToSell(10);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!vacationId || daysToSell <= 0) return;

    onSell(vacationId, { daysToSell });
    resetForm();
  }

  const isValid = daysToSell > 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-sm [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            <div className="flex gap-3 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-amber-500 to-amber-600 p-2 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              Vender Dias de Férias
            </div>
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Informe a quantidade de dias a serem vendidos (abono pecuniário). O
          máximo permitido por lei é 1/3 do período, ou seja, 10 dias.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sell-days">Dias para Vender</Label>
            <Input
              id="sell-days"
              type="number"
              min={1}
              max={10}
              value={daysToSell}
              onChange={e => setDaysToSell(Number(e.target.value))}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-linear-to-r from-amber-500 to-amber-600 text-white"
            >
              {isSubmitting ? 'Vendendo...' : 'Vender Dias'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SellDaysModal;
