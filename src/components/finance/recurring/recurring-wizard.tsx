'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
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
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateRecurringConfig } from '@/hooks/finance/use-recurring';
import { useFinanceCategories } from '@/hooks/finance/use-finance-categories';
import { useBankAccounts } from '@/hooks/finance/use-bank-accounts';
import type {
  FinanceEntryType,
  RecurrenceUnit,
  CreateRecurringConfigRequest,
} from '@/types/finance';
import {
  FINANCE_ENTRY_TYPE_LABELS,
  FREQUENCY_LABELS,
} from '@/types/finance';
import { Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface WizardData {
  type: FinanceEntryType | null;
  description: string;
  categoryId: string;
  bankAccountId: string;
  costCenterId: string;
  supplierName: string;
  customerName: string;
  expectedAmount: number;
  isVariable: boolean;
  frequencyUnit: RecurrenceUnit;
  frequencyInterval: number;
  startDate: string;
  endCondition: 'indefinite' | 'occurrences' | 'endDate';
  totalOccurrences: number;
  endDate: string;
  interestRate: number;
  penaltyRate: number;
  skipRates: boolean;
  notes: string;
}

const INITIAL_DATA: WizardData = {
  type: null,
  description: '',
  categoryId: '',
  bankAccountId: '',
  costCenterId: '',
  supplierName: '',
  customerName: '',
  expectedAmount: 0,
  isVariable: false,
  frequencyUnit: 'MONTHLY',
  frequencyInterval: 1,
  startDate: new Date().toISOString().split('T')[0],
  endCondition: 'indefinite',
  totalOccurrences: 12,
  endDate: '',
  interestRate: 0,
  penaltyRate: 0,
  skipRates: true,
  notes: '',
};

const STEP_LABELS = ['Tipo', 'Dados', 'Frequência', 'Juros/Multa', 'Confirmação'];

const FREQUENCY_OPTIONS: { value: RecurrenceUnit; label: string }[] = [
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'BIWEEKLY', label: 'Quinzenal' },
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'QUARTERLY', label: 'Trimestral' },
  { value: 'SEMIANNUAL', label: 'Semestral' },
  { value: 'ANNUAL', label: 'Anual' },
];

// ============================================================================
// PROPS
// ============================================================================

interface RecurringWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RecurringWizard({
  open,
  onOpenChange,
  onCreated,
}: RecurringWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [data, setData] = useState<WizardData>({ ...INITIAL_DATA });

  const createMutation = useCreateRecurringConfig();
  const { data: categoriesData } = useFinanceCategories();
  const { data: bankAccountsData } = useBankAccounts();

  const categories = categoriesData?.categories ?? [];
  const bankAccounts = bankAccountsData?.bankAccounts ?? [];

  const update = useCallback((updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setData({ ...INITIAL_DATA, startDate: new Date().toISOString().split('T')[0] });
  }, []);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) handleReset();
      onOpenChange(value);
    },
    [onOpenChange, handleReset]
  );

  const handleConfirm = useCallback(async () => {
    if (!data.type) return;

    const payload: CreateRecurringConfigRequest = {
      type: data.type,
      description: data.description,
      categoryId: data.categoryId,
      expectedAmount: data.expectedAmount,
      isVariable: data.isVariable,
      frequencyUnit: data.frequencyUnit,
      frequencyInterval: data.frequencyInterval,
      startDate: data.startDate,
    };

    if (data.bankAccountId) payload.bankAccountId = data.bankAccountId;
    if (data.costCenterId) payload.costCenterId = data.costCenterId;
    if (data.type === 'PAYABLE' && data.supplierName)
      payload.supplierName = data.supplierName;
    if (data.type === 'RECEIVABLE' && data.customerName)
      payload.customerName = data.customerName;
    if (data.endCondition === 'occurrences')
      payload.totalOccurrences = data.totalOccurrences;
    if (data.endCondition === 'endDate' && data.endDate)
      payload.endDate = data.endDate;
    if (!data.skipRates) {
      if (data.interestRate > 0) payload.interestRate = data.interestRate;
      if (data.penaltyRate > 0) payload.penaltyRate = data.penaltyRate;
    }
    if (data.notes) payload.notes = data.notes;

    try {
      await createMutation.mutateAsync(payload);
      toast.success('Recorrência criada com sucesso!');
      handleOpenChange(false);
      onCreated?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar recorrência.';
      toast.error(message);
    }
  }, [data, createMutation, handleOpenChange, onCreated]);

  const canGoNext = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return !!data.type;
      case 2:
        return !!data.description && !!data.categoryId && data.expectedAmount > 0;
      case 3:
        return !!data.frequencyUnit && !!data.startDate;
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, data]);

  const goNext = useCallback(() => {
    if (currentStep < 5) setCurrentStep((s) => (s + 1) as WizardStep);
  }, [currentStep]);

  const goPrev = useCallback(() => {
    if (currentStep > 1) setCurrentStep((s) => (s - 1) as WizardStep);
  }, [currentStep]);

  // --------------------------------------------------------------------------
  // Render helpers
  // --------------------------------------------------------------------------

  const filteredCategories = categories.filter((c) => {
    if (!data.type) return true;
    if (data.type === 'PAYABLE') return c.type === 'EXPENSE' || c.type === 'BOTH';
    return c.type === 'INCOME' || c.type === 'BOTH';
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      value
    );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Recorrência</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {STEP_LABELS.map((label, index) => {
            const stepNum = (index + 1) as WizardStep;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;

            return (
              <div key={label} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {index > 0 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        isCompleted || isActive
                          ? 'bg-primary'
                          : 'bg-muted-foreground/20'
                      }`}
                    />
                  )}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shrink-0 ${
                      isCompleted || isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                  {index < STEP_LABELS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    isActive || isCompleted
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step 1: Tipo */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione o tipo de recorrência:
            </p>
            <div className="grid grid-cols-2 gap-4">
              {(['PAYABLE', 'RECEIVABLE'] as FinanceEntryType[]).map((type) => (
                <Card
                  key={type}
                  className={`p-4 cursor-pointer transition-all ${
                    data.type === type
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => update({ type })}
                >
                  <div className="text-center">
                    <div
                      className={`text-2xl mb-2 ${
                        type === 'PAYABLE' ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {type === 'PAYABLE' ? '\u2193' : '\u2191'}
                    </div>
                    <p className="font-medium">
                      {FINANCE_ENTRY_TYPE_LABELS[type]}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Dados */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rec-description">Descrição</Label>
              <Input
                id="rec-description"
                value={data.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Ex: Aluguel do escritório"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-category">Categoria</Label>
              <Select
                value={data.categoryId}
                onValueChange={(v) => update({ categoryId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-bank">Conta Bancária</Label>
              <Select
                value={data.bankAccountId}
                onValueChange={(v) =>
                  update({ bankAccountId: v === '__none__' ? '' : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhuma</SelectItem>
                  {bankAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {data.type === 'PAYABLE' && (
              <div className="space-y-1.5">
                <Label htmlFor="rec-supplier">Fornecedor</Label>
                <Input
                  id="rec-supplier"
                  value={data.supplierName}
                  onChange={(e) => update({ supplierName: e.target.value })}
                  placeholder="Nome do fornecedor (opcional)"
                />
              </div>
            )}

            {data.type === 'RECEIVABLE' && (
              <div className="space-y-1.5">
                <Label htmlFor="rec-customer">Cliente</Label>
                <Input
                  id="rec-customer"
                  value={data.customerName}
                  onChange={(e) => update({ customerName: e.target.value })}
                  placeholder="Nome do cliente (opcional)"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="rec-amount">Valor Esperado (R$)</Label>
              <Input
                id="rec-amount"
                type="number"
                min={0}
                step={0.01}
                value={data.expectedAmount || ''}
                onChange={(e) =>
                  update({ expectedAmount: parseFloat(e.target.value) || 0 })
                }
                placeholder="0,00"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rec-variable"
                checked={data.isVariable}
                onCheckedChange={(checked) =>
                  update({ isVariable: checked === true })
                }
              />
              <Label htmlFor="rec-variable" className="text-sm">
                Valor variável -- o valor pode mudar a cada período
              </Label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-notes">Observações</Label>
              <Input
                id="rec-notes"
                value={data.notes}
                onChange={(e) => update({ notes: e.target.value })}
                placeholder="Observações (opcional)"
              />
            </div>
          </div>
        )}

        {/* Step 3: Frequência */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rec-freq">Frequência</Label>
              <Select
                value={data.frequencyUnit}
                onValueChange={(v) =>
                  update({ frequencyUnit: v as RecurrenceUnit })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-interval">Intervalo</Label>
              <Input
                id="rec-interval"
                type="number"
                min={1}
                value={data.frequencyInterval}
                onChange={(e) =>
                  update({ frequencyInterval: parseInt(e.target.value) || 1 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Ex: 1 = a cada período, 2 = a cada 2 períodos
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-start">Data de Início</Label>
              <Input
                id="rec-start"
                type="date"
                value={data.startDate}
                onChange={(e) => update({ startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Condição de Término</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="end-indef"
                    name="endCondition"
                    checked={data.endCondition === 'indefinite'}
                    onChange={() => update({ endCondition: 'indefinite' })}
                    className="accent-primary"
                  />
                  <Label htmlFor="end-indef" className="text-sm font-normal">
                    Indefinida
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="end-occ"
                    name="endCondition"
                    checked={data.endCondition === 'occurrences'}
                    onChange={() => update({ endCondition: 'occurrences' })}
                    className="accent-primary"
                  />
                  <Label htmlFor="end-occ" className="text-sm font-normal">
                    Após
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    className="w-20"
                    value={data.totalOccurrences}
                    onChange={(e) =>
                      update({
                        totalOccurrences: parseInt(e.target.value) || 1,
                        endCondition: 'occurrences',
                      })
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    ocorrências
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="end-date"
                    name="endCondition"
                    checked={data.endCondition === 'endDate'}
                    onChange={() => update({ endCondition: 'endDate' })}
                    className="accent-primary"
                  />
                  <Label htmlFor="end-date" className="text-sm font-normal">
                    Até
                  </Label>
                  <Input
                    type="date"
                    className="w-44"
                    value={data.endDate}
                    onChange={(e) =>
                      update({ endDate: e.target.value, endCondition: 'endDate' })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Juros e Multa */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="rec-skip-rates"
                checked={data.skipRates}
                onCheckedChange={(checked) =>
                  update({ skipRates: checked === true })
                }
              />
              <Label htmlFor="rec-skip-rates" className="text-sm">
                Não aplicar juros e multa
              </Label>
            </div>

            {!data.skipRates && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="rec-interest">Taxa de Juros (% mensal)</Label>
                  <Input
                    id="rec-interest"
                    type="number"
                    min={0}
                    step={0.01}
                    value={data.interestRate || ''}
                    onChange={(e) =>
                      update({ interestRate: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rec-penalty">Taxa de Multa (% única)</Label>
                  <Input
                    id="rec-penalty"
                    type="number"
                    min={0}
                    step={0.01}
                    value={data.penaltyRate || ''}
                    onChange={(e) =>
                      update({ penaltyRate: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0,00"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 5: Confirmação */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="font-medium">Resumo da Recorrência</h3>
            <Card className="p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span className="font-medium">
                  {data.type ? FINANCE_ENTRY_TYPE_LABELS[data.type] : '\u2014'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descrição</span>
                <span className="font-medium">{data.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor</span>
                <span className="font-medium">
                  {formatCurrency(data.expectedAmount)}
                  {data.isVariable && ' (variável)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequência</span>
                <span className="font-medium">
                  {data.frequencyInterval > 1
                    ? `A cada ${data.frequencyInterval}x `
                    : ''}
                  {FREQUENCY_LABELS[data.frequencyUnit]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Início</span>
                <span className="font-medium">
                  {new Date(data.startDate + 'T12:00:00').toLocaleDateString(
                    'pt-BR'
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Término</span>
                <span className="font-medium">
                  {data.endCondition === 'indefinite'
                    ? 'Indefinida'
                    : data.endCondition === 'occurrences'
                      ? `Após ${data.totalOccurrences} ocorrências`
                      : data.endDate
                        ? new Date(
                            data.endDate + 'T12:00:00'
                          ).toLocaleDateString('pt-BR')
                        : '\u2014'}
                </span>
              </div>
              {!data.skipRates && (data.interestRate > 0 || data.penaltyRate > 0) && (
                <>
                  {data.interestRate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Juros</span>
                      <span className="font-medium">
                        {data.interestRate}% ao mês
                      </span>
                    </div>
                  )}
                  {data.penaltyRate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Multa</span>
                      <span className="font-medium">{data.penaltyRate}%</span>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          {currentStep < 5 ? (
            <Button onClick={goNext} disabled={!canGoNext()}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Criar Recorrência
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
