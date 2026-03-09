'use client';

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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CreateDeductionData } from '@/types/hr';
import { Loader2, MinusCircle } from 'lucide-react';
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
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-red-500 to-red-600 p-2 rounded-lg">
              <MinusCircle className="h-5 w-5" />
            </div>
            Nova Dedução
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Funcionário */}
          <div className="space-y-2">
            <Label htmlFor="ded-employee">Funcionário *</Label>
            <Input
              id="ded-employee"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              placeholder="ID do funcionário"
              required
              autoFocus
            />
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="ded-name">Nome *</Label>
            <Input
              id="ded-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex.: Adiantamento salarial"
              required
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ded-amount">Valor (R$) *</Label>
              <Input
                id="ded-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ded-date">Data *</Label>
              <Input
                id="ded-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="ded-reason">Motivo *</Label>
            <Textarea
              id="ded-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Descreva o motivo da dedução (mínimo 10 caracteres)"
              rows={3}
              required
            />
            {reason.trim().length > 0 && !isReasonValid && (
              <p className="text-xs text-destructive">
                O motivo deve ter no mínimo 10 caracteres.
              </p>
            )}
          </div>

          {/* Recorrente */}
          <div className="flex items-center justify-between">
            <Label htmlFor="ded-recurring" className="cursor-pointer">
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
            <div className="space-y-2">
              <Label htmlFor="ded-installments">Número de parcelas *</Label>
              <Input
                id="ded-installments"
                type="number"
                min="1"
                value={installments}
                onChange={e => setInstallments(e.target.value)}
                placeholder="Ex.: 12"
                required
              />
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
