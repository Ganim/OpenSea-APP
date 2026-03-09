'use client';

import { useState } from 'react';
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

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    employeeId: string;
    hours: number;
    year?: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function CreditModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreditModalProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [hours, setHours] = useState('');
  const [year, setYear] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      employeeId,
      hours: Number(hours),
      year: year ? Number(year) : undefined,
    });
    setEmployeeId('');
    setHours('');
    setYear('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Creditar Horas</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Funcionário *</Label>
            <EmployeeSelector
              value={employeeId}
              onChange={id => setEmployeeId(id)}
              placeholder="Selecionar funcionário..."
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="credit-hours">Horas</Label>
            <Input
              id="credit-hours"
              type="number"
              min="0.5"
              step="0.5"
              placeholder="Ex: 8"
              value={hours}
              onChange={e => setHours(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="credit-year">Ano (opcional)</Label>
            <Input
              id="credit-year"
              type="number"
              min="2020"
              max="2100"
              placeholder={String(new Date().getFullYear())}
              value={year}
              onChange={e => setYear(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !employeeId || !hours}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? 'Creditando...' : 'Creditar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
