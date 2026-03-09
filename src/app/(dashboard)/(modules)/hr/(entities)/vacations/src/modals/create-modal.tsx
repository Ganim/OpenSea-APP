'use client';

/**
 * OpenSea OS - Create Vacation Period Modal (HR)
 *
 * Modal para criar novo período de férias.
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
import { Textarea } from '@/components/ui/textarea';
import { Palmtree } from 'lucide-react';
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
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            <div className="flex gap-3 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-green-500 to-green-600 p-2 rounded-lg">
                <Palmtree className="h-5 w-5" />
              </div>
              Novo Período de Férias
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vacation-employee-id">ID do Funcionário</Label>
            <Input
              id="vacation-employee-id"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              placeholder="ID do funcionário"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vacation-acq-start">Início Aquisitivo</Label>
              <Input
                id="vacation-acq-start"
                type="date"
                value={acquisitionStart}
                onChange={e => setAcquisitionStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacation-acq-end">Fim Aquisitivo</Label>
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
              <Label htmlFor="vacation-con-start">Início Concessivo</Label>
              <Input
                id="vacation-con-start"
                type="date"
                value={concessionStart}
                onChange={e => setConcessionStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacation-con-end">Fim Concessivo</Label>
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
            <Label htmlFor="vacation-total-days">Total de Dias</Label>
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
            <Label htmlFor="vacation-notes">Observações (opcional)</Label>
            <Textarea
              id="vacation-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observações sobre o período de férias..."
              rows={3}
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
              disabled={!isValid || createVacation.isPending}
              className="bg-linear-to-r from-green-500 to-green-600 text-white"
            >
              {createVacation.isPending ? 'Criando...' : 'Criar Período'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateModal;
