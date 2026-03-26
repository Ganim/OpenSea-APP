'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PageActionBar } from '@/components/layout/page-action-bar';
import { PageBody, PageLayout } from '@/components/layout/page-layout';
import { GridLoading } from '@/components/handlers/grid-loading';
import { GridError } from '@/components/handlers/grid-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { usePixCharges, useCreatePixCharge } from '@/hooks/cashier';
import type { PixChargeDTO, PixChargeStatus } from '@/types/cashier';
import {
  QrCode,
  Plus,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Ban,
  CircleDollarSign,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  PixChargeStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: 'Ativa',
    className:
      'bg-sky-50 text-sky-700 dark:bg-sky-500/8 dark:text-sky-300 border-sky-200 dark:border-sky-500/20',
  },
  COMPLETED: {
    label: 'Paga',
    className:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20',
  },
  EXPIRED: {
    label: 'Expirada',
    className:
      'bg-slate-50 text-slate-700 dark:bg-slate-500/8 dark:text-slate-300 border-slate-200 dark:border-slate-500/20',
  },
  CANCELLED: {
    label: 'Cancelada',
    className:
      'bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300 border-rose-200 dark:border-rose-500/20',
  },
};

// ---------------------------------------------------------------------------
// Expiration options
// ---------------------------------------------------------------------------
const EXPIRATION_OPTIONS = [
  { value: '1800', label: '30 minutos' },
  { value: '3600', label: '1 hora' },
  { value: '7200', label: '2 horas' },
  { value: '86400', label: '24 horas' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateStr));
}

function truncate(str: string, max: number) {
  return str.length > max ? `${str.slice(0, max)}...` : str;
}

// ---------------------------------------------------------------------------
// Countdown hook
// ---------------------------------------------------------------------------
function useCountdown(targetDate: string | undefined) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!targetDate) return;

    function tick() {
      const diff = new Date(targetDate!).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Expirado');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(
        h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`
      );
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return remaining;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function PixChargesPage() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PixChargeStatus | undefined>(
    undefined
  );

  // Wizard form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expiration, setExpiration] = useState('3600');

  // Created charge state (for steps 2 & 3)
  const [createdCharge, setCreatedCharge] = useState<PixChargeDTO | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    charges,
    total,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePixCharges(statusFilter ? { status: statusFilter } : undefined);

  const createPixCharge = useCreatePixCharge();

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ---------------------------------------------------------------------------
  // Wizard handlers
  // ---------------------------------------------------------------------------
  const openWizard = useCallback(() => {
    setAmount('');
    setDescription('');
    setExpiration('3600');
    setCreatedCharge(null);
    setCopied(false);
    setWizardStep(1);
    setWizardOpen(true);
  }, []);

  const closeWizard = useCallback(() => {
    setWizardOpen(false);
  }, []);

  const handleCreateCharge = useCallback(async () => {
    const parsedAmount = Math.round(parseFloat(amount.replace(',', '.')) * 100);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Informe um valor valido.');
      return;
    }

    try {
      const result = await createPixCharge.mutateAsync({
        amount: parsedAmount,
        description: description || undefined,
        expirationSeconds: parseInt(expiration, 10),
      });
      setCreatedCharge(result.charge);
      setWizardStep(2);
    } catch {
      // Error already handled by the mutation hook
    }
  }, [amount, description, expiration, createPixCharge]);

  const handleCopyPixCode = useCallback(async () => {
    if (!createdCharge?.pixCopiaECola) return;
    try {
      await navigator.clipboard.writeText(createdCharge.pixCopiaECola);
      setCopied(true);
      toast.success('Codigo PIX copiado.');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Falha ao copiar codigo.');
    }
  }, [createdCharge]);

  // ---------------------------------------------------------------------------
  // Wizard steps
  // ---------------------------------------------------------------------------
  const countdown = useCountdown(createdCharge?.expiresAt);

  const amountIsValid =
    amount.trim() !== '' &&
    !isNaN(parseFloat(amount.replace(',', '.'))) &&
    parseFloat(amount.replace(',', '.')) > 0;

  const wizardSteps: WizardStep[] = [
    // Step 1 — Valor e descricao
    {
      title: 'Nova Cobranca PIX',
      description: 'Informe os dados da cobranca',
      icon: (
        <CircleDollarSign className="h-16 w-16 text-emerald-500 opacity-80" />
      ),
      isValid: amountIsValid,
      content: (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="pix-amount">Valor (R$)</Label>
            <Input
              id="pix-amount"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="text-lg font-semibold"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pix-description">
              Descricao{' '}
              <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="pix-description"
              type="text"
              placeholder="Ex: Venda #1234"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pix-expiration">Validade</Label>
            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger id="pix-expiration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPIRATION_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      footer: (
        <>
          <Button type="button" variant="outline" onClick={closeWizard}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!amountIsValid || createPixCharge.isPending}
            onClick={handleCreateCharge}
          >
            {createPixCharge.isPending ? 'Gerando...' : 'Gerar Cobranca'}
          </Button>
        </>
      ),
    },

    // Step 2 — QR Code / Copia e Cola
    {
      title: 'Aguardando Pagamento',
      description: 'Apresente o QR Code ou envie o codigo PIX',
      icon: <QrCode className="h-16 w-16 text-sky-500 opacity-80" />,
      content: (
        <div className="space-y-5">
          {/* Amount */}
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">
              {createdCharge ? formatCurrency(createdCharge.amount) : ''}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex items-center justify-center rounded-xl border-2 border-border bg-white dark:bg-slate-800/60 p-8">
            <QRCodeSVG
              value={createdCharge?.pixCopiaECola || 'opensea-pix-placeholder'}
              size={200}
              level="M"
              includeMargin
            />
          </div>

          {/* Copia e Cola */}
          <div className="space-y-2">
            <Label>PIX Copia e Cola</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-xs break-all select-all">
                {createdCharge?.pixCopiaECola ?? ''}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={handleCopyPixCode}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
              </span>
              <span className="text-sm text-muted-foreground">
                Aguardando pagamento...
              </span>
            </div>
            {countdown && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{countdown}</span>
              </div>
            )}
          </div>
        </div>
      ),
      footer: (
        <Button type="button" variant="outline" onClick={closeWizard}>
          Fechar
        </Button>
      ),
    },

    // Step 3 — Confirmacao
    {
      title: 'Pagamento Confirmado',
      description: 'A cobranca PIX foi paga com sucesso',
      icon: <CheckCircle2 className="h-16 w-16 text-emerald-500 opacity-80" />,
      content: (
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {createdCharge ? formatCurrency(createdCharge.amount) : ''}
          </p>
          <p className="text-sm text-muted-foreground">
            Pagamento recebido com sucesso
          </p>
          {createdCharge?.payerName && (
            <p className="text-sm text-muted-foreground">
              Pagador: {createdCharge.payerName}
            </p>
          )}
        </div>
      ),
      footer: (
        <Button type="button" onClick={closeWizard}>
          Concluir
        </Button>
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <PageLayout>
      <PageActionBar
        breadcrumbItems={[
          { label: 'Vendas', href: '/sales' },
          { label: 'PDV', href: '/sales/pos' },
          { label: 'Cobrancas PIX' },
        ]}
        actions={
          <Button size="sm" className="h-9 px-2.5" onClick={openWizard}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Cobranca
          </Button>
        }
      />

      <PageBody>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Cobrancas PIX</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas cobrancas PIX e acompanhe os pagamentos
          </p>
        </div>

        {/* Status filter */}
        <div className="mb-4 flex items-center gap-2">
          <Button
            size="sm"
            variant={!statusFilter ? 'default' : 'outline'}
            onClick={() => setStatusFilter(undefined)}
          >
            Todas
          </Button>
          {(
            Object.entries(STATUS_CONFIG) as [
              PixChargeStatus,
              (typeof STATUS_CONFIG)[PixChargeStatus],
            ][]
          ).map(([key, cfg]) => (
            <Button
              key={key}
              size="sm"
              variant={statusFilter === key ? 'default' : 'outline'}
              onClick={() =>
                setStatusFilter(statusFilter === key ? undefined : key)
              }
            >
              {cfg.label}
            </Button>
          ))}
          {total > 0 && (
            <span className="ml-auto text-sm text-muted-foreground">
              {total} cobranca{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <GridLoading />
        ) : error ? (
          <GridError />
        ) : charges.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 border-dashed">
            <QrCode className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-1">
              Nenhuma cobranca encontrada
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie sua primeira cobranca PIX para comecar a receber pagamentos
            </p>
            <Button onClick={openWizard}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Cobranca
            </Button>
          </Card>
        ) : (
          <>
            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      TX ID
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Valor
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Pagador
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Criado em
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Pago em
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {charges.map((charge: PixChargeDTO) => {
                    const statusCfg = STATUS_CONFIG[charge.status];
                    return (
                      <tr
                        key={charge.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs">
                          {truncate(charge.txId, 20)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatCurrency(charge.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant="outline"
                            className={statusCfg.className}
                          >
                            {statusCfg.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {charge.payerName ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(charge.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {charge.paidAt ? formatDate(charge.paidAt) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-8" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </>
        )}
      </PageBody>

      {/* Create PIX Charge Wizard */}
      <StepWizardDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        steps={wizardSteps}
        currentStep={wizardStep}
        onStepChange={setWizardStep}
        onClose={closeWizard}
        heightClass="h-[540px]"
      />
    </PageLayout>
  );
}
