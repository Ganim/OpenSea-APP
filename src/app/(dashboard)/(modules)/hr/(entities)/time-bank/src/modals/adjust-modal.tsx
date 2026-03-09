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

interface AdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    employeeId: string;
    newBalance: number;
    year?: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function AdjustModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: AdjustModalProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [year, setYear] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      employeeId,
      newBalance: Number(newBalance),
      year: year ? Number(year) : undefined,
    });
    setEmployeeId('');
    setNewBalance('');
    setYear('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Saldo</DialogTitle>
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
            <Label htmlFor="adjust-balance">Novo Saldo (horas)</Label>
            <Input
              id="adjust-balance"
              type="number"
              step="0.5"
              placeholder="Ex: 16"
              value={newBalance}
              onChange={e => setNewBalance(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="adjust-year">Ano (opcional)</Label>
            <Input
              id="adjust-year"
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
              disabled={isLoading || !employeeId || newBalance === ''}
            >
              {isLoading ? 'Ajustando...' : 'Ajustar Saldo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
