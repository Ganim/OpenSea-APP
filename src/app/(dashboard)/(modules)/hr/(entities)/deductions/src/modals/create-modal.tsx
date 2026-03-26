'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { EmployeeSelector } from '@/components/shared/employee-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CreateDeductionData } from '@/types/hr';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Check, Loader2, Receipt, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDeductionData) => void;
  isSubmitting: boolean;
}

export function CreateModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateModalProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [installments, setInstallments] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmployeeId('');
      setName('');
      setAmount('');
      setReason('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsRecurring(false);
      setInstallments('');
    }
  }, [isOpen]);

  const isReasonValid = reason.trim().length >= 10;
  const parsedAmount = parseFloat(amount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const parsedInstallments = parseInt(installments, 10);
  const isInstallmentsValid =
    !isRecurring || (!isNaN(parsedInstallments) && parsedInstallments > 0);

  const canSubmit =
    employeeId.trim() &&
    name.trim() &&
    isAmountValid &&
    isReasonValid &&
    date &&
    isInstallmentsValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const data: CreateDeductionData = {
      employeeId: employeeId.trim(),
      name: name.trim(),
      amount: parsedAmount,
      reason: reason.trim(),
      date,
    };

    if (isRecurring) {
      data.isRecurring = true;
      if (!isNaN(parsedInstallments) && parsedInstallments > 0) {
        data.installments = parsedInstallments;
      }
    }

    onSubmit(data);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[800px] max-w-[800px] h-[540px] p-0 gap-0 overflow-hidden flex flex-row"
      >
        <VisuallyHidden>
          <DialogTitle>Nova Dedução</DialogTitle>
        </VisuallyHidden>

        {/* Left icon column */}
        <div className="w-[200px] shrink-0 bg-slate-50 dark:bg-white/5 flex items-center justify-center border-r border-border/50">
          <Receipt className="h-16 w-16 text-rose-400" strokeWidth={1.2} />
        </div>

        {/* Right content column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div>
              <h2 className="text-lg font-semibold leading-none">
                Nova Dedução
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Registre uma nova dedução para um funcionário.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0"
          >
            <div
              className="flex-1 overflow-y-auto px-6 py-2 space-y-4"
              onWheel={e => e.stopPropagation()}
            >
              {/* Funcionário */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Funcionário <span className="text-rose-500">*</span>
                </Label>
                <EmployeeSelector
                  value={employeeId}
                  onChange={id => setEmployeeId(id)}
                  placeholder="Selecionar funcionário..."
                />
              </div>

              {/* Nome + Valor + Data */}
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="ded-name" className="text-xs">
                    Nome <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="ded-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex.: Adiantamento salarial"
                    className="h-9"
                  />
                </div>
                <div className="w-32 space-y-1.5">
                  <Label htmlFor="ded-amount" className="text-xs">
                    Valor (R$) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="ded-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="h-9"
                  />
                </div>
                <div className="w-36 space-y-1.5">
                  <Label htmlFor="ded-date" className="text-xs">
                    Data <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="ded-date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Motivo */}
              <div className="space-y-1.5">
                <Label htmlFor="ded-reason" className="text-xs">
                  Motivo <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="ded-reason"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Descreva o motivo da dedução (mínimo 10 caracteres)"
                  rows={3}
                />
                {reason.trim().length > 0 && !isReasonValid && (
                  <p className="text-xs text-destructive">
                    O motivo deve ter no mínimo 10 caracteres.
                  </p>
                )}
              </div>

              {/* Recorrente */}
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="ded-recurring"
                  className="cursor-pointer text-xs"
                >
                  Dedução recorrente
                </Label>
                <Switch
                  id="ded-recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>

              {/* Parcelas (somente se recorrente) */}
              {isRecurring && (
                <div className="space-y-1.5">
                  <Label htmlFor="ded-installments" className="text-xs">
                    Número de parcelas <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="ded-installments"
                    type="number"
                    min="1"
                    value={installments}
                    onChange={e => setInstallments(e.target.value)}
                    placeholder="Ex.: 12"
                    className="h-9"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-border/50">
              <Button type="submit" disabled={isSubmitting || !canSubmit}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Criar Dedução
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
