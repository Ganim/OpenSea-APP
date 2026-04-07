'use client';

import { translateError } from '@/lib/error-messages';
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
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { useBankAccounts } from '@/hooks/finance/use-bank-accounts';
import { useBulkPayEntries } from '@/hooks/finance/use-finance-bulk-actions';
import type { FinanceEntry, PaymentMethod } from '@/types/finance';
import { PAYMENT_METHOD_LABELS } from '@/types/finance';
import {
  CheckCircle,
  CreditCard,
  DollarSign,
  ListChecks,
  Loader2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface BulkPayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  entries: FinanceEntry[];
  onSuccess: () => void;
  /** Label: "Registrar Pagamento" ou "Registrar Recebimento" */
  actionLabel: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_METHODS: PaymentMethod[] = [
  'PIX',
  'BOLETO',
  'TRANSFER',
  'CASH',
  'CHECK',
  'CARD',
];

// ============================================================================
// COMPONENT
// ============================================================================

export function BulkPayModal({
  open,
  onOpenChange,
  selectedIds,
  entries,
  onSuccess,
  actionLabel,
}: BulkPayModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bankAccountId, setBankAccountId] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [reference, setReference] = useState('');

  const { data: bankAccountsData } = useBankAccounts({ perPage: 100 });
  const bankAccounts = bankAccountsData?.bankAccounts ?? [];

  const bulkPayMutation = useBulkPayEntries();

  // Compute total from selected entries
  const totalAmount = useMemo(() => {
    return entries
      .filter(e => selectedIds.includes(e.id))
      .reduce((sum, e) => sum + (e.remainingBalance || e.expectedAmount), 0);
  }, [entries, selectedIds]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const selectedBankAccount = useMemo(
    () => bankAccounts.find(a => a.id === bankAccountId),
    [bankAccounts, bankAccountId]
  );

  const handleClose = useCallback(() => {
    setBankAccountId('');
    setMethod('PIX');
    setReference('');
    setCurrentStep(1);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleConfirm = useCallback(async () => {
    if (!bankAccountId) {
      toast.error('Selecione uma conta bancária.');
      return;
    }

    try {
      const result = await bulkPayMutation.mutateAsync({
        entryIds: selectedIds,
        bankAccountId,
        method,
        reference: reference || undefined,
      });

      if (result.failed > 0) {
        toast.warning(
          `${result.success} de ${selectedIds.length} lançamentos processados.`,
          {
            description: result.errors
              .map(e => e.error)
              .slice(0, 3)
              .join('; '),
          }
        );
      } else {
        toast.success(
          `${result.success} ${result.success === 1 ? 'lançamento atualizado' : 'lançamentos atualizados'} com sucesso.`
        );
      }

      handleClose();
      onSuccess();
    } catch (err) {
      toast.error(translateError(err));
    }
  }, [
    bankAccountId,
    method,
    reference,
    selectedIds,
    bulkPayMutation,
    handleClose,
    onSuccess,
  ]);

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Confirmar Seleção',
        description: 'Revise os lançamentos selecionados para pagamento',
        icon: (
          <ListChecks className="h-16 w-16 text-violet-400" strokeWidth={1.2} />
        ),
        content: (
          <div className="space-y-6 py-2">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Lançamentos selecionados
                </span>
                <span className="text-2xl font-bold">{selectedIds.length}</span>
              </div>
              <div className="border-t border-border/50 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Valor total
                  </span>
                  <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Ao avançar, você poderá selecionar a conta bancária e o método de
              pagamento para processar todos os lançamentos de uma vez.
            </p>
          </div>
        ),
        isValid: selectedIds.length > 0,
      },
      {
        title: 'Método de Pagamento',
        description: 'Selecione a conta e a forma de pagamento',
        icon: (
          <CreditCard className="h-16 w-16 text-sky-400" strokeWidth={1.2} />
        ),
        content: (
          <div className="space-y-4 py-2">
            {/* Bank Account */}
            <div className="space-y-2">
              <Label>Conta Bancária *</Label>
              <Select value={bankAccountId} onValueChange={setBankAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta bancária" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts
                    .filter(a => a.status === 'ACTIVE')
                    .map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}{' '}
                        {account.bankName ? `(${account.bankName})` : ''}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Forma de Pagamento *</Label>
              <Select
                value={method}
                onValueChange={v => setMethod(v as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => (
                    <SelectItem key={m} value={m}>
                      {PAYMENT_METHOD_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reference */}
            <div className="space-y-2">
              <Label>Referência (opcional)</Label>
              <Input
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="Número do comprovante, protocolo, etc."
              />
            </div>
          </div>
        ),
        isValid: !!bankAccountId,
      },
      {
        title: 'Confirmação',
        description: 'Revise os dados antes de confirmar',
        icon: (
          <CheckCircle
            className="h-16 w-16 text-emerald-400"
            strokeWidth={1.2}
          />
        ),
        content: (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lançamentos</span>
                <span className="font-medium">{selectedIds.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor total</span>
                <span className="font-medium text-violet-600 dark:text-violet-400">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="border-t border-border/50 pt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">Conta bancária</span>
                <span className="font-medium">
                  {selectedBankAccount
                    ? `${selectedBankAccount.name}${selectedBankAccount.bankName ? ` (${selectedBankAccount.bankName})` : ''}`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Forma de pagamento
                </span>
                <span className="font-medium">
                  {PAYMENT_METHOD_LABELS[method]}
                </span>
              </div>
              {reference && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Referência</span>
                  <span className="font-medium">{reference}</span>
                </div>
              )}
            </div>
          </div>
        ),
        footer: (
          <div className="flex items-center gap-2 w-full justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(2)}
            >
              ← Voltar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={bulkPayMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {bulkPayMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
              Pagar {selectedIds.length}{' '}
              {selectedIds.length === 1 ? 'Lançamento' : 'Lançamentos'}
            </Button>
          </div>
        ),
      },
    ],
    [
      selectedIds,
      totalAmount,
      bankAccountId,
      bankAccounts,
      method,
      reference,
      selectedBankAccount,
      handleConfirm,
      bulkPayMutation.isPending,
    ]
  );

  return (
    <StepWizardDialog
      open={open}
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
