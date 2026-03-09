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
import { Textarea } from '@/components/ui/textarea';
import type { CreateOvertimeData } from '@/types/hr';
import { Coffee, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOvertimeData) => void;
  isSubmitting: boolean;
}

export function CreateModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateModalProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmployeeId('');
      setDate(new Date().toISOString().split('T')[0]);
      setHours('');
      setReason('');
    }
  }, [isOpen]);

  const isReasonValid = reason.trim().length >= 10;
  const parsedHours = parseFloat(hours);
  const isHoursValid = !isNaN(parsedHours) && parsedHours > 0;

  const canSubmit = employeeId.trim() && date && isHoursValid && isReasonValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      employeeId: employeeId.trim(),
      date,
      hours: parsedHours,
      reason: reason.trim(),
    });
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
            <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
              <Coffee className="h-5 w-5" />
            </div>
            Registrar Hora Extra
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Funcionario */}
          <div className="space-y-2">
            <Label htmlFor="ot-employee">Funcionário *</Label>
            <Input
              id="ot-employee"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              placeholder="ID do funcionário"
              required
              autoFocus
            />
          </div>

          {/* Data e Horas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ot-date">Data *</Label>
              <Input
                id="ot-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ot-hours">Horas *</Label>
              <Input
                id="ot-hours"
                type="number"
                step="0.5"
                min="0.5"
                value={hours}
                onChange={e => setHours(e.target.value)}
                placeholder="Ex.: 2"
                required
              />
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="ot-reason">Motivo *</Label>
            <Textarea
              id="ot-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Descreva o motivo da hora extra (mínimo 10 caracteres)"
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
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
