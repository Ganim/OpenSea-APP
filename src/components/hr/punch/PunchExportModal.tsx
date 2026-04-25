'use client';

/**
 * PunchExportModal — modal that dispatches a punch export job.
 * Phase 7 / Plan 07-06 / Task 2.
 *
 * - Format: radio CSV/PDF/AFD/AFDT (4 options).
 * - Period: DatePicker start + end.
 * - Scope: TENANT (all employees) | DEPARTMENT | EMPLOYEE.
 * - On submit: usePunchExport().mutateAsync(...).
 *   - mode='sync' → window.open(downloadUrl) and close.
 *   - mode='async' → toast "Exportação em andamento" and close.
 *
 * Mobile (<640px): Sheet bottom-sheet for tap-friendly UX.
 * Desktop: Dialog centered.
 *
 * data-testid: punch-export-modal (root).
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMediaQuery } from '@/hooks/use-media-query';
import { usePunchExport } from '@/hooks/hr/use-punch-export';
import {
  type PunchExportFormat,
  type PunchExportScope,
} from '@/services/hr/punch-export.service';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PunchExportModalProps {
  open: boolean;
  onClose: () => void;
}

const FORMAT_OPTIONS: Array<{
  value: PunchExportFormat;
  label: string;
  hint: string;
}> = [
  { value: 'CSV', label: 'CSV', hint: 'Planilha · UTF-8 com BOM' },
  { value: 'PDF', label: 'PDF', hint: 'Espelho de ponto formatado' },
  { value: 'AFD', label: 'AFD', hint: 'Arquivo Fonte de Dados (Port. 671)' },
  {
    value: 'AFDT',
    label: 'AFDT',
    hint: 'AFD Tratado (com correções aplicadas)',
  },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function PunchExportModal({ open, onClose }: PunchExportModalProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');

  const [format, setFormat] = useState<PunchExportFormat>('CSV');
  const [startDate, setStartDate] = useState<string>(isoNDaysAgo(7));
  const [endDate, setEndDate] = useState<string>(todayIso());
  const [scope, setScope] = useState<PunchExportScope>('TENANT');

  const exportMutation = usePunchExport();

  const reset = () => {
    setFormat('CSV');
    setStartDate(isoNDaysAgo(7));
    setEndDate(todayIso());
    setScope('TENANT');
  };

  const handleClose = () => {
    if (exportMutation.isPending) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error('Informe o período de exportação.');
      return;
    }
    if (startDate > endDate) {
      toast.error('Data inicial deve ser anterior à data final.');
      return;
    }

    try {
      const result = await exportMutation.mutateAsync({
        format,
        startDate,
        endDate,
        scope,
      });
      if (result.mode === 'sync') {
        window.open(result.response.downloadUrl, '_blank', 'noopener');
        toast.success('Exportação concluída. Download iniciado.');
      } else {
        toast.success(
          result.message ??
            'Exportação em andamento. Você será notificado ao concluir.'
        );
      }
      handleClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Falha ao iniciar exportação.'
      );
    }
  };

  const body = (
    <div className="space-y-4 py-2" data-testid="punch-export-modal">
      <div className="space-y-2">
        <Label>Formato</Label>
        <RadioGroup
          value={format}
          onValueChange={value => setFormat(value as PunchExportFormat)}
          className="grid grid-cols-2 gap-2"
        >
          {FORMAT_OPTIONS.map(opt => (
            <Label
              key={opt.value}
              htmlFor={`format-${opt.value}`}
              data-testid={`punch-export-format-${opt.value}`}
              className="flex cursor-pointer items-start gap-2 rounded-md border p-2 text-sm hover:bg-accent/30 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            >
              <RadioGroupItem
                id={`format-${opt.value}`}
                value={opt.value}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.hint}</div>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="export-start">Data inicial</Label>
          <DatePicker
            id="export-start"
            value={startDate}
            onChange={value => setStartDate((value as string) ?? '')}
            valueFormat="iso"
            placeholder="Selecione"
            hideClear
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="export-end">Data final</Label>
          <DatePicker
            id="export-end"
            value={endDate}
            onChange={value => setEndDate((value as string) ?? '')}
            valueFormat="iso"
            placeholder="Selecione"
            hideClear
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="export-scope">Escopo</Label>
        <Select
          value={scope}
          onValueChange={value => setScope(value as PunchExportScope)}
        >
          <SelectTrigger
            id="export-scope"
            data-testid="punch-export-scope-trigger"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TENANT">Toda a empresa</SelectItem>
            <SelectItem value="DEPARTMENT">Por departamento</SelectItem>
            <SelectItem value="EMPLOYEE">Por funcionário</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Para escopo por departamento ou funcionário, use os filtros da
          listagem antes de exportar.
        </p>
      </div>
    </div>
  );

  const footer = (
    <>
      <Button
        variant="outline"
        onClick={handleClose}
        disabled={exportMutation.isPending}
      >
        Cancelar
      </Button>
      <Button
        data-testid="punch-export-submit"
        onClick={handleSubmit}
        disabled={exportMutation.isPending}
      >
        {exportMutation.isPending ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-1 h-4 w-4" />
        )}
        Exportar
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={o => !o && handleClose()}>
        <SheetContent
          side="bottom"
          className="max-h-[90vh] overflow-y-auto rounded-t-lg"
        >
          <SheetHeader>
            <SheetTitle>Exportar batidas de ponto</SheetTitle>
            <SheetDescription>
              Gere um arquivo no formato escolhido para o período selecionado.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-2">{body}</div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            {footer}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && handleClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Exportar batidas de ponto</DialogTitle>
          <DialogDescription>
            Gere um arquivo no formato escolhido para o período selecionado.
          </DialogDescription>
        </DialogHeader>
        {body}
        <DialogFooter className="gap-2">{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
