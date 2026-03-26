'use client';

import { translateError } from '@/lib/error-messages';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useBankAccounts } from '@/hooks/finance/use-bank-accounts';
import { useBulkPayEntries } from '@/hooks/finance/use-finance-bulk-actions';
import type { FinanceEntry, PaymentMethod } from '@/types/finance';
import { PAYMENT_METHOD_LABELS } from '@/types/finance';
import { DollarSign, Loader2 } from 'lucide-react';
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

      // Reset form
      setBankAccountId('');
      setMethod('PIX');
      setReference('');
      onOpenChange(false);
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
    onOpenChange,
    onSuccess,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-violet-500" />
            {actionLabel}
          </DialogTitle>
          <DialogDescription>
            {actionLabel} de {selectedIds.length}{' '}
            {selectedIds.length === 1 ? 'lançamento' : 'lançamentos'} no valor
            total de {formatCurrency(totalAmount)}.
          </DialogDescription>
        </DialogHeader>

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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!bankAccountId || bulkPayMutation.isPending}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {bulkPayMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <DollarSign className="h-4 w-4 mr-2" />
            )}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
