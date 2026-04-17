'use client';

import { Button } from '@/components/ui/button';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { translateError } from '@/lib/error-messages';
import type { CreatePayrollData } from '@/types/hr';
import { Check, Loader2, Receipt } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setReferenceMonth('');
      setReferenceYear(String(new Date().getFullYear()));
      setFieldErrors({});
      setCurrentStep(1);
    }
  }, [isOpen]);

  const parsedYear = parseInt(referenceYear, 10);
  const isYearValid =
    !isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100;
  const canSubmit = !!(referenceMonth && isYearValid);

  const selectedMonthLabel = useMemo(
    () => MONTHS.find(m => m.value === referenceMonth)?.label ?? '',
    [referenceMonth]
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const data: CreatePayrollData = {
      referenceMonth: parseInt(referenceMonth, 10),
      referenceYear: parsedYear,
    };

    try {
      await onSubmit(data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (
        msg.includes('already') ||
        msg.includes('exists') ||
        msg.includes('já existe')
      ) {
        setFieldErrors(prev => ({
          ...prev,
          referenceMonth: translateError(msg),
        }));
      } else {
        toast.error(translateError(msg));
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCurrentStep(1);
      onClose();
    }
  };

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Período de referência',
        description: 'Qual mês e ano esta folha de pagamento cobre?',
        icon: (
          <Receipt className="h-16 w-16 text-violet-400" strokeWidth={1.2} />
        ),
        isValid: canSubmit,
        content: (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              {/* Mês de referência */}
              <div className="space-y-2">
                <Label htmlFor="payroll-month">Mês de Referência *</Label>
                <Select
                  value={referenceMonth}
                  onValueChange={setReferenceMonth}
                >
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
                <div className="relative">
                  <Input
                    id="payroll-year"
                    type="number"
                    min={2000}
                    max={2100}
                    value={referenceYear}
                    onChange={e => {
                      setReferenceYear(e.target.value);
                      if (fieldErrors.referenceYear)
                        setFieldErrors(prev => ({
                          ...prev,
                          referenceYear: '',
                        }));
                    }}
                    placeholder="Ex.: 2026"
                    required
                    aria-invalid={!!fieldErrors.referenceYear}
                  />
                  <FormErrorIcon message={fieldErrors.referenceYear} />
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'Confirmar criação',
        description: 'Revise antes de gerar o rascunho.',
        icon: (
          <Check className="h-16 w-16 text-emerald-400" strokeWidth={1.2} />
        ),
        isValid: canSubmit,
        content: (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border bg-white dark:bg-slate-800/60 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Período selecionado
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold">
                  {selectedMonthLabel || '—'}
                </span>
                <span className="text-lg font-semibold text-muted-foreground">
                  /
                </span>
                <span className="text-lg font-semibold">
                  {isYearValid ? parsedYear : '—'}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Uma folha em rascunho será criada. Nenhum cálculo é executado aqui
              — use <span className="font-medium">Calcular</span> na lista para
              processar os itens.
            </p>
          </div>
        ),
        footer: (
          <div className="flex items-center gap-2 w-full justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              disabled={isSubmitting}
            >
              ← Voltar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Criar Folha
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      referenceMonth,
      referenceYear,
      fieldErrors,
      canSubmit,
      isYearValid,
      parsedYear,
      selectedMonthLabel,
      isSubmitting,
    ]
  );

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={val => {
        if (!val) handleClose();
      }}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
    />
  );
}
