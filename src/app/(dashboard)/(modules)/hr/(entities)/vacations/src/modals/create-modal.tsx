'use client';

/**
 * OpenSea OS - Create Vacation Period Modal (HR)
 *
 * Modal para criar novo período de férias.
 * Two-column layout: icon left, content right.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { EmployeeSelector } from '@/components/shared/employee-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { CalendarHeart, X } from 'lucide-react';
import { useCreateVacation } from '../api';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateModal({ isOpen, onClose }: CreateModalProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [acquisitionStart, setAcquisitionStart] = useState('');
  const [acquisitionEnd, setAcquisitionEnd] = useState('');
  const [concessionStart, setConcessionStart] = useState('');
  const [concessionEnd, setConcessionEnd] = useState('');
  const [totalDays, setTotalDays] = useState(30);
  const [notes, setNotes] = useState('');

  const createVacation = useCreateVacation({
    onSuccess: () => {
      resetForm();
      onClose();
    },
  });

  function resetForm() {
    setEmployeeId('');
    setAcquisitionStart('');
    setAcquisitionEnd('');
    setConcessionStart('');
    setConcessionEnd('');
    setTotalDays(30);
    setNotes('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !employeeId ||
      !acquisitionStart ||
      !acquisitionEnd ||
      !concessionStart ||
      !concessionEnd
    )
      return;

    createVacation.mutate({
      employeeId,
      acquisitionStart,
      acquisitionEnd,
      concessionStart,
      concessionEnd,
      totalDays,
      notes: notes || undefined,
    });
  }

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid =
    employeeId &&
    acquisitionStart &&
    acquisitionEnd &&
    concessionStart &&
    concessionEnd &&
    totalDays > 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[800px] max-w-[800px] h-[530px] p-0 gap-0 overflow-hidden flex flex-row"
      >
        <VisuallyHidden>
          <DialogTitle>Novo Período de Férias</DialogTitle>
        </VisuallyHidden>

        {/* Left icon column */}
        <div className="w-[200px] shrink-0 bg-slate-50 dark:bg-white/5 flex items-center justify-center border-r border-border/50">
          <CalendarHeart
            className="h-16 w-16 text-emerald-400"
            strokeWidth={1.2}
          />
        </div>

        {/* Right content column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div>
              <h2 className="text-lg font-semibold">
                Novo Período de Férias
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure o período aquisitivo e concessivo
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable body */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-4">
              <div className="space-y-2">
                <Label>Funcionário *</Label>
                <EmployeeSelector
                  value={employeeId}
                  onChange={id => setEmployeeId(id)}
                  placeholder="Selecionar funcionário..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vacation-acq-start">
                    Início Aquisitivo *
                  </Label>
                  <Input
                    id="vacation-acq-start"
                    type="date"
                    value={acquisitionStart}
                    onChange={e => setAcquisitionStart(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vacation-acq-end">Fim Aquisitivo *</Label>
                  <Input
                    id="vacation-acq-end"
                    type="date"
                    value={acquisitionEnd}
                    onChange={e => setAcquisitionEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vacation-con-start">
                    Início Concessivo *
                  </Label>
                  <Input
                    id="vacation-con-start"
                    type="date"
                    value={concessionStart}
                    onChange={e => setConcessionStart(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vacation-con-end">Fim Concessivo *</Label>
                  <Input
                    id="vacation-con-end"
                    type="date"
                    value={concessionEnd}
                    onChange={e => setConcessionEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vacation-total-days">Total de Dias *</Label>
                <Input
                  id="vacation-total-days"
                  type="number"
                  min={1}
                  max={30}
                  value={totalDays}
                  onChange={e => setTotalDays(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vacation-notes">
                  Observações (opcional)
                </Label>
                <Textarea
                  id="vacation-notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Observações sobre o período de férias..."
                  rows={3}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isValid || createVacation.isPending}
              >
                <CalendarHeart className="h-4 w-4 mr-2" />
                {createVacation.isPending ? 'Criando...' : 'Criar Período'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateModal;
