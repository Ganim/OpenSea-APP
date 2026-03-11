'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  PAYABLE_SUBTYPE_LABELS,
  RECURRENCE_UNIT_LABELS,
} from '@/types/finance';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import type { WizardData, WizardStep } from './payable-wizard-modal';

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '--';
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dateStr;
  }
}

// ============================================================================
// PROPS
// ============================================================================

interface WizardStepConfirmationProps {
  wizardData: WizardData;
  goToStep: (step: WizardStep) => void;
  onConfirm: () => void;
  isPending: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WizardStepConfirmation({
  wizardData,
  goToStep,
  onConfirm,
  isPending,
}: WizardStepConfirmationProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Confira os dados antes de confirmar:
      </p>

      {/* Tipo */}
      <Card className="p-4 space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Tipo
        </h4>
        <p className="font-medium">
          {wizardData.subType
            ? PAYABLE_SUBTYPE_LABELS[wizardData.subType]
            : '--'}
        </p>
      </Card>

      {/* Dados Gerais */}
      <Card className="p-4 space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dados Gerais
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Descrição:</span>
            <p className="font-medium">{wizardData.description || '--'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Fornecedor:</span>
            <p className="font-medium">{wizardData.supplierName || '--'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Categoria:</span>
            <p className="font-medium">{wizardData.categoryName || '--'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Conta Bancária:</span>
            <p className="font-medium">{wizardData.bankAccountName || '--'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Valor:</span>
            <p className="font-medium">
              {formatCurrency(wizardData.expectedAmount)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Data de Emissão:</span>
            <p className="font-medium">{formatDate(wizardData.issueDate)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Data de Vencimento:</span>
            <p className="font-medium">{formatDate(wizardData.dueDate)}</p>
          </div>
          {wizardData.competenceDate && (
            <div>
              <span className="text-muted-foreground">
                Data de Competência:
              </span>
              <p className="font-medium">
                {formatDate(wizardData.competenceDate)}
              </p>
            </div>
          )}
        </div>

        {/* Cost Center */}
        {wizardData.useRateio &&
        wizardData.costCenterAllocations.length > 0 ? (
          <div className="text-sm">
            <span className="text-muted-foreground">
              Centros de Custo (Rateio):
            </span>
            <ul className="mt-1 space-y-1">
              {wizardData.costCenterAllocations.map((alloc, idx) => (
                <li key={idx} className="font-medium">
                  {alloc.costCenterName || alloc.costCenterId} -{' '}
                  {alloc.percentage.toFixed(2)}% (
                  {formatCurrency(
                    (alloc.percentage / 100) * wizardData.expectedAmount
                  )}
                  )
                </li>
              ))}
            </ul>
          </div>
        ) : wizardData.costCenterName ? (
          <div className="text-sm">
            <span className="text-muted-foreground">Centro de Custo:</span>
            <p className="font-medium">{wizardData.costCenterName}</p>
          </div>
        ) : null}

        {/* Boleto fields */}
        {wizardData.subType === 'BOLETO' &&
          (wizardData.boletoBarcode || wizardData.boletoDigitLine) && (
            <div className="text-sm space-y-1">
              {wizardData.boletoBarcode && (
                <div>
                  <span className="text-muted-foreground">
                    Código de Barras:
                  </span>
                  <p className="font-mono text-xs">
                    {wizardData.boletoBarcode}
                  </p>
                </div>
              )}
              {wizardData.boletoDigitLine && (
                <div>
                  <span className="text-muted-foreground">
                    Linha Digitável:
                  </span>
                  <p className="font-mono text-xs">
                    {wizardData.boletoDigitLine}
                  </p>
                </div>
              )}
            </div>
          )}

        {wizardData.notes && (
          <div className="text-sm">
            <span className="text-muted-foreground">Observações:</span>
            <p className="font-medium">{wizardData.notes}</p>
          </div>
        )}
      </Card>

      {/* Parcelas */}
      {wizardData.recurrenceType === 'INSTALLMENT' && (
        <Card className="p-4 space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Parcelamento
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Parcelas:</span>
              <p className="font-medium">{wizardData.totalInstallments}x</p>
            </div>
            <div>
              <span className="text-muted-foreground">Intervalo:</span>
              <p className="font-medium">{wizardData.recurrenceInterval}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Unidade:</span>
              <p className="font-medium">
                {RECURRENCE_UNIT_LABELS[wizardData.recurrenceUnit]}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Anexo */}
      {wizardData.attachmentFile && (
        <Card className="p-4 space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Anexo
          </h4>
          <p className="text-sm font-medium">
            {wizardData.attachmentFile.name} (
            {(wizardData.attachmentFile.size / 1024).toFixed(1)} KB)
          </p>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => goToStep(4)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={onConfirm} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Confirmar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
