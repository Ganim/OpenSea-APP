/**
 * BoletoEmitModal
 * Dialog simples para emitir um boleto para uma conta a receber,
 * com suporte a boleto híbrido (código de barras + QR PIX).
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Banknote,
  Loader2,
  Copy,
  Download,
  CheckCircle2,
  Barcode,
} from 'lucide-react';
import { toast } from 'sonner';
import { boletoService } from '@/services/finance';
import { useBankAccounts } from '@/hooks/finance/use-bank-accounts';
import type { EmitBoletoResponse } from '@/services/finance/boleto-pix.service';

// ============================================================================
// TYPES
// ============================================================================

interface BoletoEmitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  entryDescription?: string;
  entryAmount?: number;
  entryDueDate?: string;
  customerName?: string | null;
  onSuccess?: (result: EmitBoletoResponse) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

// ============================================================================
// RESULT VIEW
// ============================================================================

function BoletoResultView({ result }: { result: EmitBoletoResponse }) {
  const handleCopyDigitableLine = async () => {
    try {
      await navigator.clipboard.writeText(result.digitableLine);
      toast.success('Linha digitável copiada!');
    } catch {
      toast.error('Erro ao copiar para a área de transferência.');
    }
  };

  const handleCopyBarcode = async () => {
    try {
      await navigator.clipboard.writeText(result.barcode);
      toast.success('Código de barras copiado!');
    } catch {
      toast.error('Erro ao copiar para a área de transferência.');
    }
  };

  const handleDownloadPdf = () => {
    if (result.pdfUrl) {
      window.open(result.pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-5 pt-2">
      {/* Success banner */}
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-600/20 dark:border-emerald-500/20 p-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          Boleto emitido com sucesso!
        </span>
      </div>

      {/* Amount + Due Date */}
      {result.amount !== undefined && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Valor</p>
          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
            {formatCurrency(result.amount)}
          </p>
          {result.dueDate && (
            <p className="text-xs text-muted-foreground mt-1">
              Vencimento: {formatDate(result.dueDate)}
            </p>
          )}
        </div>
      )}

      {/* Nosso Número */}
      <div>
        <p className="text-sm text-muted-foreground mb-1">Nosso Número</p>
        <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
          <Badge variant="outline" className="font-mono text-xs shrink-0">
            {result.nossoNumero}
          </Badge>
        </div>
      </div>

      {/* Linha Digitável */}
      {result.digitableLine && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Linha Digitável</p>
          <div className="bg-sky-50 dark:bg-sky-500/8 rounded-lg p-3">
            <p className="font-mono text-sm tracking-wide break-all text-sky-700 dark:text-sky-300">
              {result.digitableLine}
            </p>
          </div>
        </div>
      )}

      {/* Código de Barras */}
      {result.barcode && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Código de Barras</p>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="font-mono text-xs tracking-wider break-all">
              {result.barcode}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        {result.digitableLine && (
          <Button
            variant="default"
            className="w-full gap-2"
            onClick={handleCopyDigitableLine}
          >
            <Copy className="h-4 w-4" />
            Copiar Linha Digitável
          </Button>
        )}
        {result.barcode && (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleCopyBarcode}
          >
            <Barcode className="h-4 w-4" />
            Copiar Código de Barras
          </Button>
        )}
        {result.pdfUrl && (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleDownloadPdf}
          >
            <Download className="h-4 w-4" />
            Baixar PDF do Boleto
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BoletoEmitModal({
  open,
  onOpenChange,
  entryId,
  entryDescription,
  entryAmount,
  entryDueDate,
  customerName,
  onSuccess,
}: BoletoEmitModalProps) {
  const [isHybrid, setIsHybrid] = useState(true);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EmitBoletoResponse | null>(null);

  // Load bank accounts with API enabled
  const { data: bankAccountsData } = useBankAccounts({ status: 'ACTIVE' });
  const enabledAccounts =
    bankAccountsData?.bankAccounts.filter(a => a.apiEnabled) ?? [];

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setResult(null);
      setIsHybrid(true);
      setSelectedBankAccountId('');
      setIsLoading(false);
    }
  }, [open]);

  // Auto-select first enabled account
  useEffect(() => {
    if (enabledAccounts.length > 0 && !selectedBankAccountId) {
      setSelectedBankAccountId(enabledAccounts[0].id);
    }
  }, [enabledAccounts, selectedBankAccountId]);

  const handleEmit = async () => {
    if (!selectedBankAccountId) {
      toast.error(
        'Selecione uma conta bancária com integração de API habilitada.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const data = await boletoService.emit({
        entryId,
        bankAccountId: selectedBankAccountId,
        isHybrid,
      });
      setResult(data);
      toast.success('Boleto emitido com sucesso!');
      onSuccess?.(data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(
        e?.response?.data?.message ?? 'Erro ao emitir boleto. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-500/10">
              <Banknote className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <DialogTitle className="text-lg">Emitir Boleto</DialogTitle>
              <DialogDescription>
                {entryDescription || 'Emitir cobrança via boleto bancário'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {result ? (
          <>
            <BoletoResultView result={result} />
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-5 pt-2">
            {/* Entry summary */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Resumo da cobrança
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {entryDescription && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Descrição: </span>
                    <span className="font-medium">{entryDescription}</span>
                  </div>
                )}
                {entryAmount !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Valor: </span>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">
                      {formatCurrency(entryAmount)}
                    </span>
                  </div>
                )}
                {entryDueDate && (
                  <div>
                    <span className="text-muted-foreground">Vencimento: </span>
                    <span className="font-medium">
                      {formatDate(entryDueDate)}
                    </span>
                  </div>
                )}
                {customerName && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Cliente: </span>
                    <span className="font-medium">{customerName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bank account selector */}
            <div className="space-y-1.5">
              <Label htmlFor="bankAccount">Conta Bancária</Label>
              {enabledAccounts.length === 0 ? (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-500/8 border border-amber-600/20 p-3 text-sm text-amber-700 dark:text-amber-300">
                  Nenhuma conta bancária com integração de API habilitada.
                  Configure uma conta antes de emitir boletos.
                </div>
              ) : (
                <Select
                  value={selectedBankAccountId}
                  onValueChange={setSelectedBankAccountId}
                >
                  <SelectTrigger id="bankAccount">
                    <SelectValue placeholder="Selecione a conta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {enabledAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        <div className="flex items-center gap-2">
                          <span>{acc.name}</span>
                          {acc.bankName && (
                            <span className="text-xs text-muted-foreground">
                              — {acc.bankName}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Hybrid toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  Boleto Híbrido (Código de Barras + QR PIX)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Inclui QR Code PIX no boleto para pagamento instantâneo.
                </p>
              </div>
              <Switch checked={isHybrid} onCheckedChange={setIsHybrid} />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                className="w-full gap-2"
                onClick={handleEmit}
                disabled={
                  isLoading ||
                  !selectedBankAccountId ||
                  enabledAccounts.length === 0
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Emitindo boleto...
                  </>
                ) : (
                  <>
                    <Banknote className="h-4 w-4" />
                    Emitir Boleto
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
