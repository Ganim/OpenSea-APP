'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmployeeSelector } from '@/components/shared/employee-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CreateBonusData } from '@/types/hr';
import { Loader2, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBonusData) => void;
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

  useEffect(() => {
    if (isOpen) {
      setEmployeeId('');
      setName('');
      setAmount('');
      setReason('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const isReasonValid = reason.trim().length >= 10;
  const parsedAmount = parseFloat(amount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;

  const canSubmit =
    employeeId.trim() &&
    name.trim() &&
    isAmountValid &&
    isReasonValid &&
    date;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const data: CreateBonusData = {
      employeeId: employeeId.trim(),
      name: name.trim(),
      amount: parsedAmount,
      reason: reason.trim(),
      date,
    };

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
            <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-lime-500 to-lime-600 p-2 rounded-lg">
              <PlusCircle className="h-5 w-5" />
            </div>
            Nova Bonificação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Funcionário */}
          <div className="space-y-2">
            <Label>Funcionário *</Label>
            <EmployeeSelector
              value={employeeId}
              onChange={id => setEmployeeId(id)}
              placeholder="Selecionar funcionário..."
            />
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="bonus-name">Nome *</Label>
            <Input
              id="bonus-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex.: Bônus de produtividade"
              required
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bonus-amount">Valor (R$) *</Label>
              <Input
                id="bonus-amount"
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
              <Label htmlFor="bonus-date">Data *</Label>
              <Input
                id="bonus-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="bonus-reason">Motivo *</Label>
            <Textarea
              id="bonus-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Descreva o motivo da bonificação (mínimo 10 caracteres)"
              rows={3}
              required
            />
            {reason.trim().length > 0 && !isReasonValid && (
              <p className="text-xs text-destructive">
                O motivo deve ter no mínimo 10 caracteres.
              </p>
            )}
          </div>

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
