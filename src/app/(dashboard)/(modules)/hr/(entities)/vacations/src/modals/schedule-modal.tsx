'use client';

/**
 * OpenSea OS - Schedule Vacation Modal (HR)
 *
 * Modal para agendar férias de um período disponível.
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
import { CalendarDays } from 'lucide-react';
import type { ScheduleVacationData } from '@/types/hr';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacationId: string | null;
  onSchedule: (id: string, data: ScheduleVacationData) => void;
  isSubmitting: boolean;
}

export function ScheduleModal({
  isOpen,
  onClose,
  vacationId,
  onSchedule,
  isSubmitting,
}: ScheduleModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState(30);

  function resetForm() {
    setStartDate('');
    setEndDate('');
    setDays(30);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!vacationId || !startDate || !endDate || days <= 0) return;

    onSchedule(vacationId, { startDate, endDate, days });
    resetForm();
  }

  const isValid = startDate && endDate && days > 0;

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
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            <div className="flex gap-3 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-green-500 to-green-600 p-2 rounded-lg">
                <CalendarDays className="h-5 w-5" />
              </div>
              Agendar Férias
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-start-date">Data Início</Label>
              <Input
                id="schedule-start-date"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-end-date">Data Fim</Label>
              <Input
                id="schedule-end-date"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-days">Dias</Label>
            <Input
              id="schedule-days"
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              required
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
              disabled={!isValid || isSubmitting}
              className="bg-linear-to-r from-green-500 to-green-600 text-white"
            >
              {isSubmitting ? 'Agendando...' : 'Agendar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ScheduleModal;
