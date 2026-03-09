'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RecurrenceUnit } from '@/types/finance';
import { RECURRENCE_UNIT_LABELS } from '@/types/finance';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { InstallmentPreview } from './installment-preview';
import type { WizardData, WizardStep } from './payable-wizard-modal';

// ============================================================================
// PROPS
// ============================================================================

interface WizardStepInstallmentsProps {
  wizardData: WizardData;
  updateWizardData: (updates: Partial<WizardData>) => void;
  goToStep: (step: WizardStep) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WizardStepInstallments({
  wizardData,
  updateWizardData,
  goToStep,
}: WizardStepInstallmentsProps) {
  const isInstallment = wizardData.recurrenceType === 'INSTALLMENT';

  return (
    <div className="space-y-4">
      {/* Toggle: Avulso vs Parcelado */}
      <div className="space-y-2">
        <Label>Tipo de Lancamento</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateWizardData({ recurrenceType: 'SINGLE' })}
            className={`p-3 rounded-lg border-2 text-center transition-all ${
              !isInstallment
                ? 'border-primary bg-primary/5 font-medium'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="text-sm">Avulso</span>
            <p className="text-xs text-muted-foreground mt-1">
              Lancamento unico
            </p>
          </button>
          <button
            type="button"
            onClick={() => updateWizardData({ recurrenceType: 'INSTALLMENT' })}
            className={`p-3 rounded-lg border-2 text-center transition-all ${
              isInstallment
                ? 'border-primary bg-primary/5 font-medium'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="text-sm">Parcelado</span>
            <p className="text-xs text-muted-foreground mt-1">
              Dividir em parcelas
            </p>
          </button>
        </div>
      </div>

      {/* Single summary */}
      {!isInstallment && (
        <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">Descricao:</span>{' '}
            {wizardData.description || '--'}
          </p>
          <p>
            <span className="text-muted-foreground">Valor:</span>{' '}
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(wizardData.expectedAmount)}
          </p>
          <p>
            <span className="text-muted-foreground">Vencimento:</span>{' '}
            {wizardData.dueDate || '--'}
          </p>
        </div>
      )}

      {/* Installment config */}
      {isInstallment && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="wizard-installments">Parcelas</Label>
              <Input
                id="wizard-installments"
                type="number"
                min={2}
                max={120}
                value={wizardData.totalInstallments}
                onChange={(e) =>
                  updateWizardData({
                    totalInstallments: Math.max(2, parseInt(e.target.value) || 2),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wizard-interval">Intervalo</Label>
              <Input
                id="wizard-interval"
                type="number"
                min={1}
                max={12}
                value={wizardData.recurrenceInterval}
                onChange={(e) =>
                  updateWizardData({
                    recurrenceInterval: Math.max(
                      1,
                      parseInt(e.target.value) || 1
                    ),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select
                value={wizardData.recurrenceUnit}
                onValueChange={(val) =>
                  updateWizardData({
                    recurrenceUnit: val as RecurrenceUnit,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RECURRENCE_UNIT_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Previa das Parcelas</Label>
            <InstallmentPreview
              dueDate={wizardData.dueDate}
              amount={wizardData.expectedAmount}
              totalInstallments={wizardData.totalInstallments}
              interval={wizardData.recurrenceInterval}
              unit={wizardData.recurrenceUnit}
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => goToStep(2)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={() => goToStep(4)}>
          Proximo
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
