'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
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
import { absencesService } from '@/services/hr/absences.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type AbsenceCategory =
  | 'SICK_LEAVE'
  | 'PERSONAL_LEAVE'
  | 'UNPAID_LEAVE'
  | 'OTHER';

const ABSENCE_TYPE_LABELS: Record<AbsenceCategory, string> = {
  SICK_LEAVE: 'Atestado Médico',
  PERSONAL_LEAVE: 'Licença Pessoal',
  UNPAID_LEAVE: 'Falta',
  OTHER: 'Outro',
};

interface QuickAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: { id: string; fullName: string } | null;
}

export function QuickAbsenceModal({
  isOpen,
  onClose,
  employee,
}: QuickAbsenceModalProps) {
  const queryClient = useQueryClient();

  const [absenceType, setAbsenceType] = useState<AbsenceCategory>('SICK_LEAVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cid, setCid] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  function resetForm() {
    setAbsenceType('SICK_LEAVE');
    setStartDate('');
    setEndDate('');
    setCid('');
    setReason('');
    setNotes('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (!employee) throw new Error('Funcionário não selecionado');

      // Use requestSickLeave for medical absences (has the most flexible schema)
      return absencesService.requestSickLeave({
        employeeId: employee.id,
        startDate,
        endDate,
        cid: cid || absenceType, // Use type code as CID fallback for non-medical
        reason: reason || ABSENCE_TYPE_LABELS[absenceType],
      });
    },
    onSuccess: () => {
      toast.success(`Ausência registrada para ${employee?.fullName}`, {
        description: `${ABSENCE_TYPE_LABELS[absenceType]} de ${formatDate(startDate)} a ${formatDate(endDate)}`,
      });
      queryClient.invalidateQueries({ queryKey: ['absences'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      handleClose();
    },
    onError: () => {
      toast.error('Erro ao registrar ausência', {
        description: 'Verifique os dados e tente novamente.',
      });
    },
  });

  const isValid =
    !!startDate &&
    !!endDate &&
    startDate <= endDate &&
    (absenceType !== 'SICK_LEAVE' || !!cid) &&
    !!reason;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/8">
              <CalendarOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle>Registrar Ausência</DialogTitle>
              <DialogDescription>
                {employee
                  ? `Registrar ausência para ${employee.fullName}`
                  : 'Registrar ausência do funcionário'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo de Ausência */}
          <div className="space-y-2">
            <Label htmlFor="absence-type">Tipo de Ausência *</Label>
            <Select
              value={absenceType}
              onValueChange={v => setAbsenceType(v as AbsenceCategory)}
            >
              <SelectTrigger id="absence-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ABSENCE_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="absence-start">Data Início *</Label>
              <DatePicker
                id="absence-start"
                value={startDate}
                onChange={v => setStartDate(typeof v === 'string' ? v : '')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="absence-end">Data Fim *</Label>
              <DatePicker
                id="absence-end"
                value={endDate}
                onChange={v => setEndDate(typeof v === 'string' ? v : '')}
                fromDate={startDate ? new Date(startDate) : undefined}
              />
            </div>
          </div>

          {/* Days preview */}
          {startDate && endDate && startDate <= endDate && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              Duração:{' '}
              <span className="font-medium text-foreground">
                {calculateDays(startDate, endDate)} dia(s)
              </span>
            </div>
          )}

          {/* CID (only for sick leave) */}
          {absenceType === 'SICK_LEAVE' && (
            <div className="space-y-2">
              <Label htmlFor="absence-cid">CID (Código da Doença) *</Label>
              <Input
                id="absence-cid"
                value={cid}
                onChange={e => setCid(e.target.value)}
                placeholder="Ex: J06.9, A09"
                maxLength={10}
              />
            </div>
          )}

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="absence-reason">
              Motivo {absenceType === 'SICK_LEAVE' ? '*' : ''}
            </Label>
            <Input
              id="absence-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Motivo da ausência"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="absence-notes">Observações</Label>
            <Textarea
              id="absence-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
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

function calculateDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
