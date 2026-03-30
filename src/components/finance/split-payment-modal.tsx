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
import { useSplitPayment } from '@/hooks/finance/use-finance-bulk-actions';
import { useFinanceEntriesInfinite } from '@/hooks/finance/use-finance-entries';
import { cn } from '@/lib/utils';
import type { FinanceEntry, PaymentMethod } from '@/types/finance';
import { PAYMENT_METHOD_LABELS } from '@/types/finance';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  DollarSign,
  Loader2,
  Search,
  SplitSquareHorizontal,
  AlertTriangle,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface SplitPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface AllocationEntry {
  entryId: string;
  entry: FinanceEntry;
  amount: number;
}

type ModalState = 'form' | 'success';

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

const PAYABLE_STATUSES = ['PENDING', 'OVERDUE', 'PARTIALLY_PAID'];

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
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SplitPaymentModal({
  open,
  onOpenChange,
  onSuccess,
}: SplitPaymentModalProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [currentStep, setCurrentStep] = useState(1);
  const [modalState, setModalState] = useState<ModalState>('form');

  // Step 1: Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(
    new Set()
  );

  // Step 2: Allocation
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(
    formatDateForInput(new Date())
  );
  const [bankAccountId, setBankAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [notes, setNotes] = useState('');
  const [allocations, setAllocations] = useState<Map<string, number>>(
    new Map()
  );

  // Success state
  const [successResult, setSuccessResult] = useState<{
    fullyPaidCount: number;
    partialCount: number;
    totalAmount: number;
  } | null>(null);

  // ============================================================================
  // DATA
  // ============================================================================

  const { entries: pendingEntries, isLoading: entriesLoading } =
    useFinanceEntriesInfinite({
      type: 'PAYABLE',
      status: 'PENDING',
      search: searchQuery || undefined,
    });

  // Also fetch overdue entries
  const { entries: overdueEntries } = useFinanceEntriesInfinite({
    type: 'PAYABLE',
    status: 'OVERDUE',
    search: searchQuery || undefined,
  });

  // Also fetch partially paid
  const { entries: partialEntries } = useFinanceEntriesInfinite({
    type: 'PAYABLE',
    status: 'PARTIALLY_PAID',
    search: searchQuery || undefined,
  });

  // Combine and deduplicate
  const allPayableEntries = useMemo(() => {
    const map = new Map<string, FinanceEntry>();
    for (const entry of [
      ...pendingEntries,
      ...overdueEntries,
      ...partialEntries,
    ]) {
      if (PAYABLE_STATUSES.includes(entry.status)) {
        map.set(entry.id, entry);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [pendingEntries, overdueEntries, partialEntries]);

  const { data: bankAccountsData } = useBankAccounts({ perPage: 100 });
  const bankAccounts = bankAccountsData?.bankAccounts ?? [];

  const splitPaymentMutation = useSplitPayment();

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const selectedEntries = useMemo(
    () => allPayableEntries.filter(e => selectedEntryIds.has(e.id)),
    [allPayableEntries, selectedEntryIds]
  );

  const selectedTotal = useMemo(
    () => selectedEntries.reduce((sum, e) => sum + e.remainingBalance, 0),
    [selectedEntries]
  );

  const allocationsSum = useMemo(() => {
    let sum = 0;
    for (const amount of allocations.values()) {
      sum += amount;
    }
    return sum;
  }, [allocations]);

  const allocationsMismatch = useMemo(
    () => Math.abs(allocationsSum - paymentAmount) > 0.01,
    [allocationsSum, paymentAmount]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleEntry = useCallback((entryId: string) => {
    setSelectedEntryIds(prev => {
      const next = new Set(prev);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  }, []);

  const initializeAllocations = useCallback(() => {
    const newAllocations = new Map<string, number>();
    let total = 0;
    for (const entry of selectedEntries) {
      const amount = entry.remainingBalance;
      newAllocations.set(entry.id, amount);
      total += amount;
    }
    setAllocations(newAllocations);
    setPaymentAmount(total);
  }, [selectedEntries]);

  const updateAllocation = useCallback((entryId: string, amount: number) => {
    setAllocations(prev => {
      const next = new Map(prev);
      next.set(entryId, amount);
      return next;
    });
  }, []);

  const distributeProportionally = useCallback(() => {
    if (selectedEntries.length === 0 || paymentAmount <= 0) return;

    const totalRemaining = selectedEntries.reduce(
      (sum, e) => sum + e.remainingBalance,
      0
    );

    if (totalRemaining <= 0) return;

    const newAllocations = new Map<string, number>();
    let distributed = 0;

    selectedEntries.forEach((entry, index) => {
      if (index === selectedEntries.length - 1) {
        // Last entry gets the remainder to avoid rounding issues
        const remaining = Math.round((paymentAmount - distributed) * 100) / 100;
        const capped = Math.min(remaining, entry.remainingBalance);
        newAllocations.set(entry.id, Math.max(0, capped));
      } else {
        const proportion = entry.remainingBalance / totalRemaining;
        const amount = Math.round(paymentAmount * proportion * 100) / 100;
        const capped = Math.min(amount, entry.remainingBalance);
        newAllocations.set(entry.id, capped);
        distributed += capped;
      }
    });

    setAllocations(newAllocations);
  }, [selectedEntries, paymentAmount]);

  const handleConfirm = useCallback(async () => {
    if (allocationsMismatch) {
      toast.error(
        'A soma das alocações deve ser igual ao valor total do pagamento.'
      );
      return;
    }

    const allocationList = selectedEntries
      .map(entry => ({
        entryId: entry.id,
        amount: allocations.get(entry.id) ?? 0,
      }))
      .filter(a => a.amount > 0);

    if (allocationList.length === 0) {
      toast.error('Nenhuma alocação válida encontrada.');
      return;
    }

    try {
      const result = await splitPaymentMutation.mutateAsync({
        paymentAmount,
        paymentDate: new Date(paymentDate).toISOString(),
        bankAccountId: bankAccountId || undefined,
        paymentMethod,
        notes: notes || undefined,
        allocations: allocationList,
      });

      setSuccessResult({
        fullyPaidCount: result.fullyPaidEntryIds.length,
        partialCount: result.partialEntryIds.length,
        totalAmount: paymentAmount,
      });
      setModalState('success');
      onSuccess?.();
    } catch (err) {
      toast.error(translateError(err));
    }
  }, [
    allocationsMismatch,
    selectedEntries,
    allocations,
    paymentAmount,
    paymentDate,
    bankAccountId,
    paymentMethod,
    notes,
    splitPaymentMutation,
    onSuccess,
  ]);

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setModalState('form');
    setSearchQuery('');
    setSelectedEntryIds(new Set());
    setPaymentAmount(0);
    setPaymentDate(formatDateForInput(new Date()));
    setBankAccountId('');
    setPaymentMethod('PIX');
    setNotes('');
    setAllocations(new Map());
    setSuccessResult(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleStepChange = useCallback(
    (step: number) => {
      if (step === 2 && currentStep === 1) {
        // Moving from step 1 to step 2: initialize allocations
        initializeAllocations();
      }
      setCurrentStep(step);
    },
    [currentStep, initializeAllocations]
  );

  // ============================================================================
  // SUCCESS VIEW
  // ============================================================================

  if (modalState === 'success' && successResult) {
    const successSteps: WizardStep[] = [
      {
        title: 'Pagamento Registrado',
        description: 'O pagamento foi distribuído com sucesso.',
        icon: (
          <CheckCircle2
            className="h-20 w-20 text-emerald-500"
            strokeWidth={1.5}
          />
        ),
        content: (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(successResult.totalAmount)}
              </p>
              <p className="text-sm text-muted-foreground">
                Valor total distribuído
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              {successResult.fullyPaidCount > 0 && (
                <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200 dark:border-emerald-500/20">
                  <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                    {successResult.fullyPaidCount}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {successResult.fullyPaidCount === 1
                      ? 'Totalmente pago'
                      : 'Totalmente pagos'}
                  </p>
                </div>
              )}
              {successResult.partialCount > 0 && (
                <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/20">
                  <p className="text-lg font-semibold text-amber-700 dark:text-amber-300">
                    {successResult.partialCount}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {successResult.partialCount === 1
                      ? 'Parcialmente pago'
                      : 'Parcialmente pagos'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ),
        footer: (
          <div className="flex items-center gap-2 w-full justify-end">
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        ),
      },
    ];

    return (
      <StepWizardDialog
        open={open}
        onOpenChange={val => {
          if (!val) handleClose();
        }}
        steps={successSteps}
        currentStep={1}
        onStepChange={() => {}}
        onClose={handleClose}
        heightClass="h-[460px]"
      />
    );
  }

  // ============================================================================
  // WIZARD STEPS
  // ============================================================================

  const step1Content = (
    <div className="flex flex-col gap-3 h-full">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar por descrição, fornecedor..."
          className="pl-9"
        />
      </div>

      {/* Entry list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {entriesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : allPayableEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <DollarSign className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhum lançamento pendente encontrado.</p>
          </div>
        ) : (
          allPayableEntries.map(entry => {
            const isSelected = selectedEntryIds.has(entry.id);
            const isOverdue = entry.status === 'OVERDUE';

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => toggleEntry(entry.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                  isSelected
                    ? 'border-violet-500/50 bg-violet-50 dark:bg-violet-500/8'
                    : 'border-border hover:bg-muted/50'
                )}
              >
                {/* Checkbox indicator */}
                <div
                  className={cn(
                    'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
                    isSelected
                      ? 'border-violet-500 bg-violet-500'
                      : 'border-muted-foreground/30'
                  )}
                >
                  {isSelected && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </div>

                {/* Entry info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {entry.description || 'Sem descrição'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {entry.supplierName || 'Sem fornecedor'}
                    {entry.code && (
                      <span className="ml-1.5 font-mono opacity-60">
                        {entry.code}
                      </span>
                    )}
                  </p>
                </div>

                {/* Amount and date */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-semibold font-mono">
                    {formatCurrency(entry.remainingBalance)}
                  </p>
                  <p
                    className={cn(
                      'text-xs flex items-center gap-1 justify-end',
                      isOverdue
                        ? 'text-rose-600 dark:text-rose-400 font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    <CalendarDays className="w-3 h-3" />
                    {formatDate(entry.dueDate)}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Selection summary */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          {selectedEntryIds.size}{' '}
          {selectedEntryIds.size === 1
            ? 'lançamento selecionado'
            : 'lançamentos selecionados'}
        </p>
        <p className="text-sm font-semibold font-mono">
          Total: {formatCurrency(selectedTotal)}
        </p>
      </div>
    </div>
  );

  const step2Content = (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Payment info row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Valor Total do Pagamento</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={paymentAmount || ''}
            onChange={e => setPaymentAmount(Number(e.target.value))}
            placeholder="0,00"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Data do Pagamento</Label>
          <Input
            type="date"
            value={paymentDate}
            onChange={e => setPaymentDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Conta Bancária</Label>
          <Select value={bankAccountId} onValueChange={setBankAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
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
        <div className="space-y-1.5">
          <Label className="text-xs">Forma de Pagamento</Label>
          <Select
            value={paymentMethod}
            onValueChange={v => setPaymentMethod(v as PaymentMethod)}
          >
            <SelectTrigger>
              <SelectValue />
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
      </div>

      {/* Allocations */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">
            Alocação por Lançamento
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={distributeProportionally}
            className="h-7 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700"
          >
            Distribuir Proporcionalmente
          </Button>
        </div>

        <div className="space-y-2 max-h-[180px] overflow-y-auto">
          {selectedEntries.map(entry => {
            const currentAllocation = allocations.get(entry.id) ?? 0;
            const exceedsBalance =
              currentAllocation > entry.remainingBalance + 0.01;

            return (
              <div
                key={entry.id}
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-lg border',
                  exceedsBalance
                    ? 'border-rose-300 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5'
                    : 'border-border'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {entry.description || 'Sem descrição'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Saldo: {formatCurrency(entry.remainingBalance)}
                  </p>
                </div>
                <div className="w-32 shrink-0">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={entry.remainingBalance}
                    value={currentAllocation || ''}
                    onChange={e =>
                      updateAllocation(entry.id, Number(e.target.value))
                    }
                    className={cn(
                      'h-8 text-right font-mono text-sm',
                      exceedsBalance && 'border-rose-400 text-rose-600'
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Validation warning */}
        {allocationsMismatch && paymentAmount > 0 && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              A soma das alocações ({formatCurrency(allocationsSum)}) difere do
              valor total ({formatCurrency(paymentAmount)}).
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-muted-foreground">
            Alocado: {formatCurrency(allocationsSum)}
          </span>
          <span
            className={cn(
              'font-medium',
              allocationsMismatch
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            )}
          >
            {allocationsMismatch
              ? `Diferença: ${formatCurrency(Math.abs(paymentAmount - allocationsSum))}`
              : 'Valores conferem'}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label className="text-xs">Observações</Label>
        <Input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observações do pagamento (opcional)"
        />
      </div>
    </div>
  );

  const steps: WizardStep[] = [
    {
      title: 'Selecionar Lançamentos',
      description:
        'Escolha os lançamentos a pagar que receberão este pagamento.',
      icon: (
        <SplitSquareHorizontal
          className="h-20 w-20 text-violet-500"
          strokeWidth={1.5}
        />
      ),
      content: step1Content,
      isValid: selectedEntryIds.size > 0,
    },
    {
      title: 'Distribuir Pagamento',
      description:
        'Defina o valor total e distribua entre os lançamentos selecionados.',
      icon: (
        <DollarSign className="h-20 w-20 text-violet-500" strokeWidth={1.5} />
      ),
      content: step2Content,
      isValid: !allocationsMismatch && paymentAmount > 0,
      footer: (
        <div className="flex items-center gap-2 w-full justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(1)}
          >
            &larr; Voltar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              allocationsMismatch ||
              paymentAmount <= 0 ||
              splitPaymentMutation.isPending
            }
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {splitPaymentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Confirmar Pagamento
          </Button>
        </div>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={open}
      onOpenChange={val => {
        if (!val) handleClose();
      }}
      steps={steps}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onClose={handleClose}
      heightClass="h-[560px]"
    />
  );
}
