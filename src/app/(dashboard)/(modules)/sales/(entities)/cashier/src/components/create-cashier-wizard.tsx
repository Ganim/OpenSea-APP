'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { ApiError } from '@/lib/errors/api-error';
import { translateError } from '@/lib/error-messages';
import type { OpenCashierSessionRequest } from '@/types/sales';
import { Calculator, Check, DollarSign, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────

interface CreateCashierSessionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OpenCashierSessionRequest) => Promise<void>;
  isSubmitting?: boolean;
}

// ─── Step 1: Terminal e Saldo ────────────────────────────────

function StepSelectTerminal({
  posTerminalId,
  onPosTerminalIdChange,
  openingBalance,
  onOpeningBalanceChange,
  fieldErrors,
}: {
  posTerminalId: string;
  onPosTerminalIdChange: (v: string) => void;
  openingBalance: string;
  onOpeningBalanceChange: (v: string) => void;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Terminal (opcional)</Label>
        <Input
          placeholder="ID do terminal PDV"
          value={posTerminalId}
          onChange={e => onPosTerminalIdChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Informe o identificador do terminal, se aplicável.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Saldo de Abertura *</Label>
        <div className="relative">
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={openingBalance}
            onChange={e => onOpeningBalanceChange(e.target.value)}
            aria-invalid={!!fieldErrors.openingBalance}
          />
          <FormErrorIcon message={fieldErrors.openingBalance} />
        </div>
        <p className="text-xs text-muted-foreground">
          Valor em caixa no momento da abertura.
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Confirmação ─────────────────────────────────────

function StepConfirm({
  posTerminalId,
  openingBalance,
}: {
  posTerminalId: string;
  openingBalance: string;
}) {
  const balance = parseFloat(openingBalance) || 0;
  const formattedBalance = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(balance);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Confirme os dados para abrir o caixa:
      </p>

      <div className="w-full rounded-xl border border-border bg-white p-4 dark:bg-slate-800/60 space-y-3">
        {posTerminalId && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Terminal</p>
            <p className="text-sm font-medium">{posTerminalId}</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Saldo de Abertura</p>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {formattedBalance}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Wizard Component ────────────────────────────────────

export function CreateCashierSessionWizard({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateCashierSessionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [posTerminalId, setPosTerminalId] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setPosTerminalId('');
    setOpeningBalance('');
    setFieldErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async () => {
    const balance = parseFloat(openingBalance);
    if (isNaN(balance) || balance < 0) {
      setFieldErrors({
        openingBalance: 'Informe um valor válido.',
      });
      setCurrentStep(1);
      return;
    }

    const payload: OpenCashierSessionRequest = {
      openingBalance: balance,
      posTerminalId: posTerminalId.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      handleClose();
    } catch (err) {
      const apiError = ApiError.from(err);
      if (apiError.fieldErrors?.length) {
        const errors: Record<string, string> = {};
        for (const fe of apiError.fieldErrors) {
          errors[fe.field] = translateError(fe.message);
        }
        setFieldErrors(errors);
        setCurrentStep(1);
      } else {
        toast.error(translateError(apiError.message));
      }
    }
  }, [posTerminalId, openingBalance, onSubmit, handleClose]);

  const balanceValid =
    openingBalance.trim().length > 0 &&
    !isNaN(parseFloat(openingBalance)) &&
    parseFloat(openingBalance) >= 0;

  const steps: WizardStep[] = [
    {
      title: 'Terminal e Saldo',
      description: 'Selecione o terminal e informe o saldo de abertura.',
      icon: (
        <DollarSign className="h-16 w-16 text-teal-400" strokeWidth={1.2} />
      ),
      content: (
        <StepSelectTerminal
          posTerminalId={posTerminalId}
          onPosTerminalIdChange={setPosTerminalId}
          openingBalance={openingBalance}
          onOpeningBalanceChange={v => {
            setOpeningBalance(v);
            setFieldErrors(prev => {
              const { openingBalance: _, ...rest } = prev;
              return rest;
            });
          }}
          fieldErrors={fieldErrors}
        />
      ),
      isValid: balanceValid,
    },
    {
      title: 'Confirmar Abertura',
      description: 'Revise os dados e confirme a abertura do caixa.',
      icon: (
        <Calculator className="h-16 w-16 text-emerald-400" strokeWidth={1.2} />
      ),
      onBack: () => setCurrentStep(1),
      content: (
        <StepConfirm
          posTerminalId={posTerminalId}
          openingBalance={openingBalance}
        />
      ),
      isValid: true,
      footer: (
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Abrir Caixa
        </Button>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={open}
      onOpenChange={onOpenChange}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
    />
  );
}
