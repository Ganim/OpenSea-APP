'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmployeeSelector } from '@/components/shared/employee-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CreateOvertimeData } from '@/types/hr';
import { Clock, Loader2, Check, X } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
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
      onOpenChange={val => {
        if (!val) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[800px] max-w-[800px] h-[490px] p-0 gap-0 overflow-hidden flex flex-row"
      >
        <VisuallyHidden>
          <DialogTitle>Solicitar Hora Extra</DialogTitle>
        </VisuallyHidden>

        {/* Left icon column */}
        <div className="w-[200px] shrink-0 bg-slate-50 dark:bg-white/5 flex items-center justify-center border-r border-border/50">
          <Clock className="h-16 w-16 text-amber-400" strokeWidth={1.2} />
        </div>

        {/* Right content column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div>
              <h2 className="text-lg font-semibold leading-none">
                Solicitar Hora Extra
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Registre horas extras realizadas pelo funcionário.
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
            id="create-overtime-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-2 space-y-4"
          >
            {/* Funcionário */}
            <div className="space-y-2">
              <Label>Funcionário *</Label>
              <EmployeeSelector
                value={employeeId}
                onChange={id => setEmployeeId(id)}
                placeholder="Selecionar funcionário..."
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
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50">
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
              form="create-overtime-form"
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Solicitar Hora Extra
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
