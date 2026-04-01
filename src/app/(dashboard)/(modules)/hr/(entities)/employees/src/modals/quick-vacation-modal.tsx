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
import { vacationsService } from '@/services/hr/vacations.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Palmtree } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type VacationType = 'REGULAR' | 'SELL';

const VACATION_TYPE_LABELS: Record<VacationType, string> = {
  REGULAR: 'Férias Regulares',
  SELL: 'Abono Pecuniário',
};

interface QuickVacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: { id: string; fullName: string } | null;
}

export function QuickVacationModal({
  isOpen,
  onClose,
  employee,
}: QuickVacationModalProps) {
  const queryClient = useQueryClient();

  const [vacationType, setVacationType] = useState<VacationType>('REGULAR');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [daysToSell, setDaysToSell] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch available vacation periods for the employee
  const { data: periodsData } = useQuery({
    queryKey: ['vacation-periods', employee?.id],
    queryFn: async () => {
      if (!employee) throw new Error('No employee');
      return vacationsService.list({
        employeeId: employee.id,
        status: 'AVAILABLE',
        perPage: 50,
      });
    },
    enabled: isOpen && !!employee,
  });

  const availablePeriods = periodsData?.vacationPeriods ?? [];

  // Auto-select the first available period
  useEffect(() => {
    if (availablePeriods.length > 0 && !selectedPeriodId) {
      setSelectedPeriodId(availablePeriods[0].id);
    }
  }, [availablePeriods, selectedPeriodId]);

  function resetForm() {
    setVacationType('REGULAR');
    setStartDate('');
    setEndDate('');
    setSelectedPeriodId('');
    setDaysToSell('');
    setNotes('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const days = startDate && endDate && startDate <= endDate
    ? calculateDays(startDate, endDate)
    : 0;

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPeriodId) throw new Error('Período não selecionado');

      if (vacationType === 'SELL') {
        return vacationsService.sellDays(selectedPeriodId, {
          daysToSell: Number(daysToSell),
        });
      }

      return vacationsService.schedule(selectedPeriodId, {
        startDate,
        endDate,
        days,
      });
    },
    onSuccess: () => {
      if (vacationType === 'SELL') {
        toast.success(`Abono pecuniário registrado para ${employee?.fullName}`, {
          description: `${daysToSell} dia(s) convertido(s) em abono`,
        });
      } else {
        toast.success(`Férias agendadas para ${employee?.fullName}`, {
          description: `${days} dia(s) de ${formatDate(startDate)} a ${formatDate(endDate)}`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['vacation-periods'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['absences'] });
      handleClose();
    },
    onError: () => {
      toast.error('Erro ao solicitar férias', {
        description: 'Verifique os dados e tente novamente.',
      });
    },
  });

  const selectedPeriod = availablePeriods.find(p => p.id === selectedPeriodId);

  const isValidRegular =
    vacationType === 'REGULAR' &&
    !!startDate &&
    !!endDate &&
    startDate <= endDate &&
    days > 0 &&
    !!selectedPeriodId;

  const isValidSell =
    vacationType === 'SELL' &&
    !!selectedPeriodId &&
    Number(daysToSell) > 0 &&
    Number(daysToSell) <= (selectedPeriod?.remainingDays ?? 0);

  const isValid = isValidRegular || isValidSell;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/8">
              <Palmtree className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle>Solicitar Férias</DialogTitle>
              <DialogDescription>
                {employee
                  ? `Agendar férias para ${employee.fullName}`
                  : 'Solicitar férias do funcionário'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select
              value={vacationType}
              onValueChange={(v) => setVacationType(v as VacationType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VACATION_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Período aquisitivo */}
          <div className="space-y-2">
            <Label>Período Aquisitivo *</Label>
            {availablePeriods.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/8 dark:text-amber-300">
                Nenhum período aquisitivo disponível para este funcionário.
              </div>
            ) : (
              <Select
                value={selectedPeriodId}
                onValueChange={setSelectedPeriodId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {formatDate(period.acquisitionStart)} a{' '}
                      {formatDate(period.acquisitionEnd)} ({period.remainingDays} dias restantes)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {vacationType === 'REGULAR' ? (
            <>
              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vacation-start">Data Início *</Label>
                  <Input
                    id="vacation-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vacation-end">Data Fim *</Label>
                  <Input
                    id="vacation-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || undefined}
                  />
                </div>
              </div>

              {/* Days preview */}
              {days > 0 && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  Duração:{' '}
                  <span className="font-medium text-foreground">
                    {days} dia(s)
                  </span>
                  {selectedPeriod && (
                    <>
                      {' '}
                      | Saldo restante:{' '}
                      <span className="font-medium text-foreground">
                        {selectedPeriod.remainingDays} dia(s)
                      </span>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Abono pecuniário */}
              <div className="space-y-2">
                <Label htmlFor="days-to-sell">Dias para Abono *</Label>
                <Input
                  id="days-to-sell"
                  type="number"
                  min={1}
                  max={selectedPeriod?.remainingDays ?? 10}
                  value={daysToSell}
                  onChange={(e) => setDaysToSell(e.target.value)}
                  placeholder="Quantidade de dias"
                />
                {selectedPeriod && (
                  <p className="text-xs text-muted-foreground">
                    Máximo: {Math.min(selectedPeriod.remainingDays, 10)} dia(s)
                    (CLT permite até 1/3 do período)
                  </p>
                )}
              </div>
            </>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="vacation-notes">Observações</Label>
            <Textarea
              id="vacation-notes"
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
            onClick={() => scheduleMutation.mutate()}
            disabled={scheduleMutation.isPending || !isValid}
          >
            {scheduleMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Solicitar
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
