/**
 * Session Close Modal
 * Wizard de 3 etapas para fechamento de caixa: Contagem > Conferência > Confirmação
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Numpad } from '@/components/ui/numpad';
import {
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  FileText,
} from 'lucide-react';
import { useState } from 'react';

interface BreakdownItem {
  method: string;
  total: number;
  count: number;
}

interface SessionCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expectedBalance: number;
  breakdown: BreakdownItem[];
  onConfirm: (data: { countedBalance: number; notes?: string }) => void;
  isPending?: boolean;
}

export function SessionCloseModal({
  isOpen,
  onClose,
  expectedBalance,
  breakdown,
  onConfirm,
  isPending,
}: SessionCloseModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [countedAmount, setCountedAmount] = useState(0);
  const [notes, setNotes] = useState('');

  const countedBalance = countedAmount / 100;
  const difference = countedBalance - expectedBalance;
  const isMatch = Math.abs(difference) < 0.01;

  function handleClose() {
    setCurrentStep(1);
    setCountedAmount(0);
    setNotes('');
    onClose();
  }

  function handleConfirm() {
    onConfirm({
      countedBalance,
      notes: notes.trim() || undefined,
    });
  }

  const steps: WizardStep[] = [
    // Step 1 — Contagem
    {
      title: 'Contagem',
      description: 'Informe o valor em caixa',
      icon: (
        <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center">
          <Calculator className="w-10 h-10 text-violet-600 dark:text-violet-400" />
        </div>
      ),
      content: (
        <div className="flex flex-col items-center gap-6">
          <div className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50 p-6 text-center">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
              Valor Contado
            </p>
            <p className="text-3xl font-bold text-foreground tabular-nums">
              {formatCurrency(countedAmount / 100)}
            </p>
          </div>
          <Numpad value={countedAmount} onChange={setCountedAmount} />
        </div>
      ),
      isValid: countedAmount > 0,
    },

    // Step 2 — Conferência
    {
      title: 'Conferência',
      description: 'Comparação entre esperado e contado',
      icon: (
        <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center">
          <ClipboardCheck className="w-10 h-10 text-violet-600 dark:text-violet-400" />
        </div>
      ),
      content: (
        <div className="space-y-6">
          {/* Expected vs Counted */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                Esperado
              </p>
              <p className="text-xl font-bold text-foreground tabular-nums">
                {formatCurrency(expectedBalance)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                Contado
              </p>
              <p className="text-xl font-bold text-foreground tabular-nums">
                {formatCurrency(countedBalance)}
              </p>
            </div>
          </div>

          {/* Difference */}
          <div
            className={cn(
              'rounded-xl border p-4 text-center',
              isMatch
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'
            )}
          >
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
              Diferença
            </p>
            <p
              className={cn(
                'text-2xl font-bold tabular-nums',
                isMatch
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {difference >= 0 ? '+' : ''}
              {formatCurrency(difference)}
            </p>
            <p
              className={cn(
                'text-xs mt-1',
                isMatch
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {isMatch ? 'Valores conferem' : 'Valores divergentes'}
            </p>
          </div>

          {/* Breakdown table */}
          {breakdown.length > 0 && (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 border-b border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Detalhamento por Forma de Pagamento
                </p>
              </div>
              <div className="divide-y divide-border/50">
                {breakdown.map(item => (
                  <div
                    key={item.method}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.method}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} transaç{item.count !== 1 ? 'ões' : 'ão'}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
      isValid: true,
    },

    // Step 3 — Confirmação
    {
      title: 'Confirmação',
      description: 'Observações e fechamento',
      icon: (
        <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center">
          <FileText className="w-10 h-10 text-violet-600 dark:text-violet-400" />
        </div>
      ),
      content: (
        <div className="space-y-6">
          {/* Summary recap */}
          <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2
                className={cn(
                  'w-5 h-5',
                  isMatch
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                )}
              />
              <p className="text-sm font-medium text-foreground">
                {isMatch
                  ? 'Caixa conferido — valores iguais'
                  : `Diferença de ${formatCurrency(Math.abs(difference))}`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Esperado</p>
                <p className="font-semibold tabular-nums">
                  {formatCurrency(expectedBalance)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Contado</p>
                <p className="font-semibold tabular-nums">
                  {formatCurrency(countedBalance)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label
              htmlFor="close-notes"
              className="text-sm font-medium text-foreground"
            >
              Observações{' '}
              <span className="text-muted-foreground font-normal">
                (opcional)
              </span>
            </label>
            <Textarea
              id="close-notes"
              placeholder="Registre informações relevantes sobre o fechamento..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              disabled={isPending}
              className="resize-none"
            />
          </div>
        </div>
      ),
      isValid: true,
      footer: (
        <div className="flex items-center gap-2 w-full justify-end">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(2)}
            disabled={isPending}
          >
            Voltar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isPending ? 'Fechando...' : 'Fechar Caixa'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
      heightClass="h-[580px]"
    />
  );
}
