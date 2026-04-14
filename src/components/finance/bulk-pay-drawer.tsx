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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useBankAccounts } from '@/hooks/finance/use-bank-accounts';
import { useBulkPayEntries } from '@/hooks/finance/use-finance-bulk-actions';
import { translateError } from '@/lib/error-messages';
import type { FinanceEntry, PaymentMethod } from '@/types/finance';
import { PAYMENT_METHOD_LABELS } from '@/types/finance';
import { DollarSign, Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface BulkPayDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  entries: FinanceEntry[];
  onSuccess: () => void;
  /** "Registrar Pagamento" ou "Registrar Recebimento" */
  actionLabel: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'PIX',
  'BOLETO',
  'TRANSFER',
  'CASH',
  'CHECK',
  'CARD',
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

/**
 * Drawer compacto para baixa em lote — alternativa single-screen ao
 * BulkPayModal (3-step wizard). Inspiração: Omie.Cash "tela única".
 */
export function BulkPayDrawer({
  open,
  onOpenChange,
  selectedIds,
  entries,
  onSuccess,
  actionLabel,
}: BulkPayDrawerProps) {
  const [bankAccountId, setBankAccountId] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [reference, setReference] = useState('');

  const { data: bankAccountsData } = useBankAccounts({ perPage: 100 });
  const bankAccounts = bankAccountsData?.bankAccounts ?? [];
  const bulkPayMutation = useBulkPayEntries();

  const totalAmount = useMemo(
    () =>
      entries
        .filter(e => selectedIds.includes(e.id))
        .reduce((sum, e) => sum + (e.remainingBalance || e.expectedAmount), 0),
    [entries, selectedIds]
  );

  const handleClose = useCallback(() => {
    setBankAccountId('');
    setMethod('PIX');
    setReference('');
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

  const activeBankAccounts = bankAccounts.filter(a => a.status === 'ACTIVE');
  const canSubmit = !!bankAccountId && selectedIds.length > 0;

  return (
    <Sheet
      open={open}
      onOpenChange={val => {
        if (!val) handleClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col gap-0 p-0"
        data-testid="bulk-pay-drawer"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <SheetTitle>{actionLabel} em Lote</SheetTitle>
          <SheetDescription>
            Processe {selectedIds.length}{' '}
            {selectedIds.length === 1 ? 'lançamento' : 'lançamentos'} em uma
            única operação.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Summary card */}
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Lançamentos</span>
              <span className="font-semibold">{selectedIds.length}</span>
            </div>
            <div className="border-t border-border/50 pt-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Valor total</span>
              <span
                className="text-xl font-bold text-violet-600 dark:text-violet-400"
                data-testid="bulk-pay-drawer-total"
              >
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Bank account */}
          <div className="space-y-2">
            <Label htmlFor="bulk-pay-bank">Conta Bancária *</Label>
            <Select value={bankAccountId} onValueChange={setBankAccountId}>
              <SelectTrigger
                id="bulk-pay-bank"
                data-testid="bulk-pay-drawer-bank-select"
              >
                <SelectValue placeholder="Selecione a conta bancária" />
              </SelectTrigger>
              <SelectContent>
                {activeBankAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                    {account.bankName ? ` (${account.bankName})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Method */}
          <div className="space-y-2">
            <Label htmlFor="bulk-pay-method">Forma de Pagamento *</Label>
            <Select
              value={method}
              onValueChange={v => setMethod(v as PaymentMethod)}
            >
              <SelectTrigger
                id="bulk-pay-method"
                data-testid="bulk-pay-drawer-method-select"
              >
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
            <Label htmlFor="bulk-pay-ref">Referência (opcional)</Label>
            <Input
              id="bulk-pay-ref"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="Número do comprovante, protocolo, etc."
              data-testid="bulk-pay-drawer-reference"
            />
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t border-border/50 flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={bulkPayMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canSubmit || bulkPayMutation.isPending}
            className="bg-violet-600 hover:bg-violet-700 text-white"
            data-testid="bulk-pay-drawer-submit"
          >
            {bulkPayMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <DollarSign className="h-4 w-4 mr-2" />
            )}
            {actionLabel} ({selectedIds.length})
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
