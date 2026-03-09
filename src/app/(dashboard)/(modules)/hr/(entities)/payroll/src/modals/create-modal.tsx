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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CreatePayrollData } from '@/types/hr';
import { CalendarDays, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const MONTHS = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePayrollData) => void;
  isSubmitting: boolean;
}

export function CreateModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateModalProps) {
  const [referenceMonth, setReferenceMonth] = useState('');
  const [referenceYear, setReferenceYear] = useState(
    String(new Date().getFullYear())
  );

  useEffect(() => {
    if (isOpen) {
      setReferenceMonth('');
      setReferenceYear(String(new Date().getFullYear()));
    }
  }, [isOpen]);

  const parsedYear = parseInt(referenceYear, 10);
  const isYearValid =
    !isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100;
  const canSubmit = referenceMonth && isYearValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const data: CreatePayrollData = {
      referenceMonth: parseInt(referenceMonth, 10),
      referenceYear: parsedYear,
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
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-sky-500 to-sky-600 p-2 rounded-lg">
              <CalendarDays className="h-5 w-5" />
            </div>
            Nova Folha de Pagamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Mês de referência */}
          <div className="space-y-2">
            <Label htmlFor="payroll-month">Mês de Referência *</Label>
            <Select value={referenceMonth} onValueChange={setReferenceMonth}>
              <SelectTrigger id="payroll-month">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(m => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ano de referência */}
          <div className="space-y-2">
            <Label htmlFor="payroll-year">Ano de Referência *</Label>
            <Input
              id="payroll-year"
              type="number"
              min={2000}
              max={2100}
              value={referenceYear}
              onChange={e => setReferenceYear(e.target.value)}
              placeholder="Ex.: 2026"
              required
            />
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
