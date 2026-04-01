'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { timeControlService } from '@/services/hr/time-control.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type EntryAction = 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';

const ENTRY_TYPE_LABELS: Record<EntryAction, string> = {
  CLOCK_IN: 'Entrada',
  CLOCK_OUT: 'Saída',
  BREAK_START: 'Início do Intervalo',
  BREAK_END: 'Fim do Intervalo',
};

interface QuickTimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: { id: string; fullName: string } | null;
}

export function QuickTimeEntryModal({
  isOpen,
  onClose,
  employee,
}: QuickTimeEntryModalProps) {
  const queryClient = useQueryClient();

  const [entryType, setEntryType] = useState<EntryAction>('CLOCK_IN');
  const [dateTime, setDateTime] = useState(() => formatDateTimeLocal(new Date()));
  const [notes, setNotes] = useState('');

  function resetForm() {
    setEntryType('CLOCK_IN');
    setDateTime(formatDateTimeLocal(new Date()));
    setNotes('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (!employee) throw new Error('Funcionário não selecionado');

      const timestamp = new Date(dateTime).toISOString();
      const payload = {
        employeeId: employee.id,
        timestamp,
        notes: notes || undefined,
      };

      // clockIn is used for CLOCK_IN and BREAK_END (starting work)
      // clockOut is used for CLOCK_OUT and BREAK_START (stopping work)
      if (entryType === 'CLOCK_IN' || entryType === 'BREAK_END') {
        return timeControlService.clockIn(payload);
      }
      return timeControlService.clockOut(payload);
    },
    onSuccess: () => {
      toast.success(`Ponto registrado para ${employee?.fullName}`, {
        description: `${ENTRY_TYPE_LABELS[entryType]} em ${formatDisplayDateTime(dateTime)}`,
      });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['time-control'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      handleClose();
    },
    onError: () => {
      toast.error('Erro ao registrar ponto', {
        description: 'Verifique os dados e tente novamente.',
      });
    },
  });

  const isValid = !!dateTime && !!employee;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/8">
              <Clock className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <DialogTitle>Registrar Ponto</DialogTitle>
              <DialogDescription>
                {employee
                  ? `Registrar ponto para ${employee.fullName}`
                  : 'Registrar ponto do funcionário'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo de registro */}
          <div className="space-y-2">
            <Label>Tipo de Registro *</Label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(ENTRY_TYPE_LABELS) as [EntryAction, string][]).map(
                ([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEntryType(key)}
                    className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                      entryType === key
                        ? key === 'CLOCK_IN' || key === 'BREAK_END'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300'
                          : 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-500/8 dark:text-sky-300'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Data/Hora */}
          <div className="space-y-2">
            <Label htmlFor="time-entry-datetime">Data e Hora *</Label>
            <Input
              id="time-entry-datetime"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Padrão: horário atual. Altere se necessário.
            </p>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="time-entry-notes">Observações</Label>
            <Textarea
              id="time-entry-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais (opcional)"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !isValid}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDisplayDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
