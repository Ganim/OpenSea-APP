/**
 * PixEmitModal
 * Dialog para gerar uma cobrança PIX para uma conta a receber,
 * selecionando a conta bancária e o tempo de expiração.
 *
 * Após a geração, exibe o QR Code e o código Copia e Cola.
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QrCode, Loader2, Copy, Clock, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { pixChargeService } from '@/services/finance';
import { useBankAccounts } from '@/hooks/finance/use-bank-accounts';
import type { PixChargeServiceResponse } from '@/services/finance/boleto-pix.service';

// ============================================================================
// TYPES
// ============================================================================

interface PixEmitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  entryDescription?: string;
  entryAmount?: number;
  customerName?: string | null;
  onSuccess?: (result: PixChargeServiceResponse) => void;
}

// ============================================================================
// EXPIRATION OPTIONS
// ============================================================================

const EXPIRATION_OPTIONS = [
  { label: '15 minutos', value: 900 },
  { label: '30 minutos', value: 1800 },
  { label: '1 hora', value: 3600 },
  { label: '2 horas', value: 7200 },
  { label: '6 horas', value: 21600 },
  { label: '12 horas', value: 43200 },
  { label: '24 horas', value: 86400 },
  { label: 'Personalizado', value: -1 },
];

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatExpiration(expiresAt: string): string {
  return new Date(expiresAt).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

// ============================================================================
// RESULT VIEW
// ============================================================================

function PixResultView({ result }: { result: PixChargeServiceResponse }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.pixCopiaECola);
      toast.success('Código PIX copiado!');
    } catch {
      toast.error('Erro ao copiar para a área de transferência.');
    }
  };

  return (
    <div className="space-y-5 pt-2">
      {/* Success */}
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-600/20 dark:border-emerald-500/20 p-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          Cobrança PIX gerada com sucesso!
        </span>
      </div>

      {/* Amount */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Valor</p>
        <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
          {formatCurrency(result.amount)}
        </p>
      </div>

      {/* Expiration */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Expira em: {formatExpiration(result.expiresAt)}</span>
      </div>

      {/* QR Code */}
      {result.pixCopiaECola && (
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-xl border flex justify-center">
            <QRCodeSVG
              value={result.pixCopiaECola}
              size={192}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="M"
              includeMargin={false}
            />
          </div>
        </div>
      )}

      {/* Pix Copia e Cola */}
      {result.pixCopiaECola && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">PIX Copia e Cola</p>
          <div className="bg-violet-50 dark:bg-violet-500/8 rounded-lg p-3">
            <p className="font-mono text-xs tracking-wide break-all text-violet-700 dark:text-violet-300 line-clamp-4">
              {result.pixCopiaECola}
            </p>
          </div>
        </div>
      )}

      {/* TxID */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">ID da transação:</span>
        <Badge variant="outline" className="font-mono text-xs">
          {result.txId.slice(0, 16)}...
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        <Button variant="default" className="w-full gap-2" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
          Copiar Código PIX
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PixEmitModal({
  open,
  onOpenChange,
  entryId,
  entryDescription,
  entryAmount,
  customerName,
  onSuccess,
}: PixEmitModalProps) {
  const [selectedBankAccountId, setSelectedBankAccountId] = useState('');
  const [expirationPreset, setExpirationPreset] = useState('3600');
  const [customSeconds, setCustomSeconds] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PixChargeServiceResponse | null>(null);

  const { data: bankAccountsData } = useBankAccounts({ status: 'ACTIVE' });

  // Filter accounts that have PIX key configured
  const pixAccounts =
    bankAccountsData?.bankAccounts.filter(a => a.pixKey && a.apiEnabled) ?? [];

  const isCustom = expirationPreset === '-1';
  const expiresInSeconds = isCustom
    ? parseInt(customSeconds, 10) || 3600
    : parseInt(expirationPreset, 10);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setResult(null);
      setSelectedBankAccountId('');
      setExpirationPreset('3600');
      setCustomSeconds('');
      setIsLoading(false);
    }
  }, [open]);

  // Auto-select first PIX-enabled account
  useEffect(() => {
    if (pixAccounts.length > 0 && !selectedBankAccountId) {
      setSelectedBankAccountId(pixAccounts[0].id);
    }
  }, [pixAccounts, selectedBankAccountId]);

  const handleGenerate = async () => {
    if (!selectedBankAccountId) {
      toast.error(
        'Selecione uma conta bancária com chave PIX e integração habilitada.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const data = await pixChargeService.create({
        entryId,
        bankAccountId: selectedBankAccountId,
        expiresInSeconds,
      });
      setResult(data);
      toast.success('Cobrança PIX gerada com sucesso!');
      onSuccess?.(data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(
        e?.response?.data?.message ??
          'Erro ao gerar cobrança PIX. Tente novamente.'
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
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-500/10">
              <QrCode className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <DialogTitle className="text-lg">Gerar Cobrança PIX</DialogTitle>
              <DialogDescription>
                {entryDescription || 'Emitir QR Code PIX para pagamento'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {result ? (
          <>
            <PixResultView result={result} />
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
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Valor: </span>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">
                      {formatCurrency(entryAmount)}
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
              <Label htmlFor="pixBankAccount">Conta Bancária</Label>
              {pixAccounts.length === 0 ? (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-500/8 border border-amber-600/20 p-3 text-sm text-amber-700 dark:text-amber-300">
                  Nenhuma conta com chave PIX e integração de API habilitadas.
                  Configure uma conta antes de gerar cobranças PIX.
                </div>
              ) : (
                <Select
                  value={selectedBankAccountId}
                  onValueChange={setSelectedBankAccountId}
                >
                  <SelectTrigger id="pixBankAccount">
                    <SelectValue placeholder="Selecione a conta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pixAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        <div className="flex items-center gap-2">
                          <span>{acc.name}</span>
                          {acc.pixKey && (
                            <span className="text-xs text-muted-foreground">
                              — {acc.pixKey}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Expiration */}
            <div className="space-y-1.5">
              <Label htmlFor="expiration">Tempo de expiração</Label>
              <Select
                value={expirationPreset}
                onValueChange={setExpirationPreset}
              >
                <SelectTrigger id="expiration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isCustom && (
                <div className="space-y-1">
                  <Label
                    htmlFor="customSeconds"
                    className="text-xs text-muted-foreground"
                  >
                    Segundos personalizados
                  </Label>
                  <Input
                    id="customSeconds"
                    type="number"
                    min="60"
                    max="86400"
                    placeholder="Ex: 3600"
                    value={customSeconds}
                    onChange={e => setCustomSeconds(e.target.value)}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                O QR Code expira após este período sem pagamento.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                className="w-full gap-2"
                onClick={handleGenerate}
                disabled={
                  isLoading ||
                  !selectedBankAccountId ||
                  pixAccounts.length === 0
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando cobrança PIX...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    Gerar Cobrança PIX
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
