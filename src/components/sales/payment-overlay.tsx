'use client';

import * as React from 'react';
import {
  Banknote,
  CreditCard,
  QrCode,
  Wallet,
  CircleDollarSign,
  MoreHorizontal,
  X,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  FileText,
  RefreshCw,
  Loader2,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Numpad } from '@/components/ui/numpad';
import { Button } from '@/components/ui/button';
import { useReceivePayment } from '@/hooks/sales/use-pdv';
import {
  usePaymentConfig,
  useCreateCharge,
  useChargeStatus,
} from '@/hooks/sales/use-payment-config';
import type { PaymentCharge } from '@/types/sales';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

type PaymentMethodType =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'PIX'
  | 'STORE_CREDIT'
  | 'OTHER';

interface PaymentEntry {
  id: string;
  method: PaymentMethodType;
  amount: number; // in decimal (e.g., 45.90)
  nsu?: string;
  authorizationCode?: string;
  installments?: number;
  notes?: string;
  chargeId?: string; // gateway charge ID
  chargeStatus?: string;
}

interface PaymentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /** Grand total in decimal (e.g., 45.90) */
  total: number;
  orderId: string;
  terminalMode: 'STANDARD' | 'FAST_CHECKOUT';
  posSessionId?: string;
  expectedVersion: number;
  onSuccess: (result: { changeAmount: number; saleCode: string }) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const PAYMENT_METHODS: Array<{
  type: PaymentMethodType;
  label: string;
  icon: React.ElementType;
}> = [
  { type: 'CASH', label: 'Dinheiro', icon: Banknote },
  { type: 'CREDIT_CARD', label: 'Cartão Crédito', icon: CreditCard },
  { type: 'DEBIT_CARD', label: 'Cartão Débito', icon: CreditCard },
  { type: 'PIX', label: 'PIX', icon: QrCode },
  { type: 'STORE_CREDIT', label: 'Crédito Loja', icon: Wallet },
  { type: 'OTHER', label: 'Outro', icon: MoreHorizontal },
];

const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Cartão Crédito',
  DEBIT_CARD: 'Cartão Débito',
  PIX: 'PIX',
  STORE_CREDIT: 'Crédito Loja',
  OTHER: 'Outro',
};

/** Methods that can use a gateway for automated charging */
const GATEWAY_ELIGIBLE_METHODS: PaymentMethodType[] = [
  'PIX',
  'CREDIT_CARD',
  'DEBIT_CARD',
];

const STORAGE_KEY = 'pos_payment_intent';

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// =============================================================================
// PAYMENT OVERLAY COMPONENT
// =============================================================================

function PaymentOverlay({
  isOpen,
  onClose,
  total,
  orderId,
  terminalMode,
  posSessionId,
  expectedVersion,
  onSuccess,
}: PaymentOverlayProps) {
  const [selectedMethod, setSelectedMethod] =
    React.useState<PaymentMethodType | null>(null);
  const [payments, setPayments] = React.useState<PaymentEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Gateway mode state
  const [gatewayMode, setGatewayMode] = React.useState<
    'gateway' | 'manual'
  >('manual');
  const [activeCharge, setActiveCharge] = React.useState<PaymentCharge | null>(
    null
  );

  const receivePayment = useReceivePayment();
  const { data: paymentConfig } = usePaymentConfig();
  const createCharge = useCreateCharge();

  // Poll charge status when there's an active charge
  const { data: chargeStatus } = useChargeStatus(activeCharge?.id ?? null);

  // Form state for current entry
  const [cashCents, setCashCents] = React.useState(0);
  const [cardAmount, setCardAmount] = React.useState('');
  const [nsu, setNsu] = React.useState('');
  const [authCode, setAuthCode] = React.useState('');
  const [installments, setInstallments] = React.useState('1');
  const [pixAmount, setPixAmount] = React.useState('');
  const [otherAmount, setOtherAmount] = React.useState('');
  const [otherNotes, setOtherNotes] = React.useState('');

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const totalCents = Math.round(total * 100);
  const remainingCents = Math.round(remaining * 100);
  const canConfirm = totalPaid >= total && payments.length > 0;

  // Check if gateway is available for a given method
  const isGatewayAvailable = React.useCallback(
    (method: PaymentMethodType): boolean => {
      if (!paymentConfig) return false;
      if (!GATEWAY_ELIGIBLE_METHODS.includes(method)) return false;
      return paymentConfig.primaryActive || paymentConfig.fallbackActive;
    },
    [paymentConfig]
  );

  // Handle charge status changes from polling
  React.useEffect(() => {
    if (!chargeStatus || !activeCharge) return;

    if (chargeStatus.status === 'PAID') {
      // Auto-add to payments list
      const entry: PaymentEntry = {
        id: generateId(),
        method: selectedMethod!,
        amount: chargeStatus.amount,
        chargeId: chargeStatus.id,
        chargeStatus: 'PAID',
      };
      setPayments((prev) => [...prev, entry]);
      setActiveCharge(null);
      setSelectedMethod(null);
      resetFormFields();
      toast.success('Pagamento confirmado pelo gateway.');
    }
  }, [chargeStatus?.status]);

  // Reset state when overlay opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedMethod(null);
      setPayments([]);
      setError(null);
      setGatewayMode('manual');
      setActiveCharge(null);
      resetFormFields();
    }
  }, [isOpen]);

  function resetFormFields() {
    setCashCents(0);
    setCardAmount('');
    setNsu('');
    setAuthCode('');
    setInstallments('1');
    setPixAmount('');
    setOtherAmount('');
    setOtherNotes('');
  }

  function handleSelectMethod(method: PaymentMethodType) {
    setSelectedMethod(method);
    setError(null);
    setActiveCharge(null);
    resetFormFields();

    // Default to gateway mode if available for this method
    if (isGatewayAvailable(method)) {
      setGatewayMode('gateway');
    } else {
      setGatewayMode('manual');
    }

    // Pre-fill amounts with remaining
    if (method === 'CREDIT_CARD' || method === 'DEBIT_CARD') {
      setCardAmount(remaining.toFixed(2));
    } else if (method === 'PIX') {
      setPixAmount(remaining.toFixed(2));
    } else if (method === 'STORE_CREDIT' || method === 'OTHER') {
      setOtherAmount(remaining.toFixed(2));
    }
  }

  async function handleCreateGatewayCharge() {
    if (!selectedMethod) return;

    let amount = 0;
    if (selectedMethod === 'PIX') {
      amount = parseFloat(pixAmount) || 0;
    } else if (
      selectedMethod === 'CREDIT_CARD' ||
      selectedMethod === 'DEBIT_CARD'
    ) {
      amount = parseFloat(cardAmount) || 0;
    }

    if (amount <= 0) {
      toast.error('Informe um valor válido.');
      return;
    }

    try {
      const charge = await createCharge.mutateAsync({
        orderId,
        method: selectedMethod,
        amount,
        installments:
          selectedMethod === 'CREDIT_CARD'
            ? parseInt(installments) || 1
            : undefined,
      });
      setActiveCharge(charge);
    } catch {
      // Error toast is already handled in the hook
    }
  }

  async function handleRegenerateCharge() {
    setActiveCharge(null);
    // Small delay before creating new charge
    setTimeout(() => {
      handleCreateGatewayCharge();
    }, 300);
  }

  function addPayment() {
    let amount = 0;
    const entry: Partial<PaymentEntry> = {
      id: generateId(),
      method: selectedMethod!,
    };

    switch (selectedMethod) {
      case 'CASH':
        amount = cashCents / 100;
        break;
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        amount = parseFloat(cardAmount) || 0;
        entry.nsu = nsu || undefined;
        entry.authorizationCode = authCode || undefined;
        entry.installments = parseInt(installments) || 1;
        break;
      case 'PIX':
        amount = parseFloat(pixAmount) || 0;
        break;
      case 'STORE_CREDIT':
      case 'OTHER':
        amount = parseFloat(otherAmount) || 0;
        entry.notes = otherNotes || undefined;
        break;
    }

    if (amount <= 0) return;

    entry.amount = amount;
    setPayments((prev) => [...prev, entry as PaymentEntry]);
    setSelectedMethod(null);
    setActiveCharge(null);
    resetFormFields();
  }

  function removePayment(id: string) {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleConfirm() {
    if (!canConfirm) return;
    setIsSubmitting(true);
    setError(null);

    // Save intent to localStorage for recovery
    const intent = { orderId, payments, total, terminalMode, posSessionId };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
    } catch {
      // localStorage might be unavailable
    }

    try {
      const apiPayments = payments.map((p) => ({
        method: p.method,
        amount: p.amount,
        receivedAmount: p.method === 'CASH' ? p.amount : undefined,
        installments: p.installments,
        authCode: p.authorizationCode,
        nsu: p.nsu,
        notes: p.notes,
        chargeId: p.chargeId,
      }));

      const result = await receivePayment.mutateAsync({
        orderId,
        data: {
          terminalMode,
          posSessionId,
          expectedVersion,
          payments: apiPayments,
        },
      });

      const changeAmount =
        result.transaction?.changeAmount ?? Math.max(0, totalPaid - total);
      const saleCode = result.order?.saleCode ?? '';

      // Clear recovery intent
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }

      onSuccess({ changeAmount, saleCode });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao processar pagamento. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <button
          type="button"
          onClick={onClose}
          className="flex size-11 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Fechar"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          PAGAMENTO — {formatCurrency(total)}
        </h1>
        <button
          type="button"
          onClick={onClose}
          className="flex size-11 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Fechar"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Added Payments */}
        {payments.length > 0 && (
          <div className="mb-4 space-y-2">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Pagamentos adicionados
            </h2>
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {PAYMENT_METHOD_LABELS[payment.method]}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {formatCurrency(payment.amount)}
                  </span>
                  {payment.chargeId && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                      <Zap className="size-3" />
                      Gateway
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removePayment(payment.id)}
                  className="flex size-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  aria-label="Remover pagamento"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}

            {remaining > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                Restante: {formatCurrency(remaining)}
              </div>
            )}
          </div>
        )}

        {/* Method Selection */}
        {!selectedMethod && (
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => handleSelectMethod(type)}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-4',
                  'min-h-[80px] select-none transition-all duration-150',
                  'hover:border-violet-300 hover:shadow-md active:scale-95',
                  'dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-violet-500/50'
                )}
              >
                <Icon className="size-7 text-violet-600 dark:text-violet-400" />
                <span className="text-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {label}
                </span>
                {isGatewayAvailable(type) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                    <Zap className="size-2.5" />
                    Gateway
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Contextual Panels */}
        {selectedMethod && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod(null);
                  setActiveCharge(null);
                }}
                className="flex size-9 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="size-4" />
              </button>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {PAYMENT_METHOD_LABELS[selectedMethod]}
              </h2>
            </div>

            {/* Gateway / Manual Toggle */}
            {isGatewayAvailable(selectedMethod) && (
              <GatewayManualToggle
                mode={gatewayMode}
                onModeChange={(mode) => {
                  setGatewayMode(mode);
                  setActiveCharge(null);
                }}
                providerName={
                  paymentConfig?.primaryProvider ?? 'Gateway'
                }
              />
            )}

            {/* CASH Panel — Always manual */}
            {selectedMethod === 'CASH' && (
              <CashPanel
                cents={cashCents}
                onCentsChange={setCashCents}
                remainingCents={remainingCents}
                totalCents={totalCents}
                onAdd={addPayment}
              />
            )}

            {/* CREDIT/DEBIT Panel */}
            {(selectedMethod === 'CREDIT_CARD' ||
              selectedMethod === 'DEBIT_CARD') &&
              gatewayMode === 'manual' && (
                <CardPanel
                  amount={cardAmount}
                  onAmountChange={setCardAmount}
                  nsu={nsu}
                  onNsuChange={setNsu}
                  authCode={authCode}
                  onAuthCodeChange={setAuthCode}
                  installments={installments}
                  onInstallmentsChange={setInstallments}
                  showInstallments={selectedMethod === 'CREDIT_CARD'}
                  onAdd={addPayment}
                />
              )}

            {/* CREDIT/DEBIT Gateway Panel */}
            {(selectedMethod === 'CREDIT_CARD' ||
              selectedMethod === 'DEBIT_CARD') &&
              gatewayMode === 'gateway' && (
                <CardGatewayPanel
                  amount={cardAmount}
                  onAmountChange={setCardAmount}
                  installments={installments}
                  onInstallmentsChange={setInstallments}
                  showInstallments={selectedMethod === 'CREDIT_CARD'}
                  charge={activeCharge}
                  chargeStatus={chargeStatus ?? null}
                  onCreateCharge={handleCreateGatewayCharge}
                  onRegenerate={handleRegenerateCharge}
                  isCreating={createCharge.isPending}
                />
              )}

            {/* PIX Panel — Manual */}
            {selectedMethod === 'PIX' && gatewayMode === 'manual' && (
              <PixPanel
                amount={pixAmount}
                onAmountChange={setPixAmount}
                onAdd={addPayment}
              />
            )}

            {/* PIX Panel — Gateway */}
            {selectedMethod === 'PIX' && gatewayMode === 'gateway' && (
              <PixGatewayPanel
                amount={pixAmount}
                onAmountChange={setPixAmount}
                charge={activeCharge}
                chargeStatus={chargeStatus ?? null}
                onCreateCharge={handleCreateGatewayCharge}
                onRegenerate={handleRegenerateCharge}
                isCreating={createCharge.isPending}
              />
            )}

            {/* OTHER / STORE_CREDIT Panel */}
            {(selectedMethod === 'STORE_CREDIT' ||
              selectedMethod === 'OTHER') && (
              <OtherPanel
                amount={otherAmount}
                onAmountChange={setOtherAmount}
                notes={otherNotes}
                onNotesChange={setOtherNotes}
                onAdd={addPayment}
              />
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/30 dark:bg-rose-500/10">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                {error}
              </p>
              <button
                type="button"
                onClick={handleConfirm}
                className="mt-2 text-sm font-semibold text-rose-700 underline dark:text-rose-300"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        {totalPaid > total && (
          <div className="mb-3 text-center text-lg font-bold text-emerald-600 dark:text-emerald-400">
            Troco: {formatCurrency(totalPaid - total)}
          </div>
        )}
        <Button
          onClick={handleConfirm}
          disabled={!canConfirm || isSubmitting}
          className={cn(
            'h-14 w-full rounded-xl text-base font-bold',
            'bg-violet-600 text-white hover:bg-violet-700',
            'disabled:opacity-50'
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processando...
            </span>
          ) : (
            'CONFIRMAR PAGAMENTO'
          )}
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// GATEWAY / MANUAL TOGGLE
// =============================================================================

function GatewayManualToggle({
  mode,
  onModeChange,
  providerName,
}: {
  mode: 'gateway' | 'manual';
  onModeChange: (mode: 'gateway' | 'manual') => void;
  providerName: string;
}) {
  const displayName =
    providerName === 'infinitepay'
      ? 'InfinitePay'
      : providerName === 'asaas'
        ? 'Asaas'
        : providerName;

  return (
    <div className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => onModeChange('gateway')}
        className={cn(
          'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
          mode === 'gateway'
            ? 'bg-violet-600 text-white shadow-sm'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
        )}
      >
        <Zap className="size-4" />
        Cobrar via {displayName}
      </button>
      <button
        type="button"
        onClick={() => onModeChange('manual')}
        className={cn(
          'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
          mode === 'manual'
            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
        )}
      >
        Manual
      </button>
    </div>
  );
}

// =============================================================================
// PIX GATEWAY PANEL
// =============================================================================

function PixGatewayPanel({
  amount,
  onAmountChange,
  charge,
  chargeStatus,
  onCreateCharge,
  onRegenerate,
  isCreating,
}: {
  amount: string;
  onAmountChange: (v: string) => void;
  charge: PaymentCharge | null;
  chargeStatus: PaymentCharge | null;
  onCreateCharge: () => void;
  onRegenerate: () => void;
  isCreating: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const currentStatus = chargeStatus?.status ?? charge?.status;
  const isExpired = currentStatus === 'EXPIRED';
  const isFailed = currentStatus === 'FAILED';
  const isPending = currentStatus === 'PENDING';
  const qrPayload = chargeStatus?.qrCode ?? charge?.qrCode;
  const checkoutUrl = chargeStatus?.checkoutUrl ?? charge?.checkoutUrl;

  async function handleCopy() {
    const textToCopy = qrPayload ?? checkoutUrl ?? '';
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Copiado para a área de transferência.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar.');
    }
  }

  // Not yet created — show amount + create button
  if (!charge) {
    return (
      <div className="space-y-4">
        <FormField label="Valor" required>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className={inputClassName}
            placeholder="0,00"
          />
        </FormField>

        <Button
          onClick={onCreateCharge}
          disabled={
            isCreating || !amount || parseFloat(amount) <= 0
          }
          className="h-14 w-full rounded-xl bg-violet-600 text-base font-bold text-white hover:bg-violet-700"
        >
          {isCreating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Gerando QR Code...
            </span>
          ) : (
            'Gerar QR Code PIX'
          )}
        </Button>
      </div>
    );
  }

  // Expired or Failed
  if (isExpired || isFailed) {
    return (
      <div className="space-y-4">
        <div
          className={cn(
            'flex flex-col items-center gap-3 rounded-xl border p-6',
            isExpired
              ? 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10'
              : 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10'
          )}
        >
          <AlertCircle
            className={cn(
              'size-10',
              isExpired
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            )}
          />
          <p
            className={cn(
              'text-lg font-bold',
              isExpired
                ? 'text-amber-700 dark:text-amber-300'
                : 'text-rose-700 dark:text-rose-300'
            )}
          >
            {isExpired ? 'QR Code Expirado' : 'Falha na Cobrança'}
          </p>
        </div>

        <Button
          onClick={onRegenerate}
          className="h-14 w-full rounded-xl bg-violet-600 text-base font-bold text-white hover:bg-violet-700"
        >
          <RefreshCw className="mr-2 size-5" />
          Gerar novo QR Code
        </Button>
      </div>
    );
  }

  // Pending — show QR Code
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        {(qrPayload || checkoutUrl) && (
          <div className="rounded-xl bg-white p-3">
            <QRCodeSVG
              value={qrPayload || checkoutUrl || ''}
              size={200}
              level="M"
            />
          </div>
        )}

        {isPending && (
          <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400">
            <Loader2 className="size-4 animate-spin" />
            Aguardando pagamento...
          </div>
        )}

        {/* Copia e cola */}
        {(qrPayload || checkoutUrl) && (
          <div className="w-full space-y-2">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Copia e cola
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={qrPayload || checkoutUrl || ''}
                className={cn(
                  inputClassName,
                  'h-10 truncate text-xs font-mono'
                )}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-10 shrink-0 gap-1.5 px-3"
              >
                {copied ? (
                  <Check className="size-4 text-emerald-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {charge.expiresAt && (
        <ExpirationTimer expiresAt={charge.expiresAt} />
      )}
    </div>
  );
}

// =============================================================================
// CARD GATEWAY PANEL
// =============================================================================

function CardGatewayPanel({
  amount,
  onAmountChange,
  installments,
  onInstallmentsChange,
  showInstallments,
  charge,
  chargeStatus,
  onCreateCharge,
  onRegenerate,
  isCreating,
}: {
  amount: string;
  onAmountChange: (v: string) => void;
  installments: string;
  onInstallmentsChange: (v: string) => void;
  showInstallments: boolean;
  charge: PaymentCharge | null;
  chargeStatus: PaymentCharge | null;
  onCreateCharge: () => void;
  onRegenerate: () => void;
  isCreating: boolean;
}) {
  const currentStatus = chargeStatus?.status ?? charge?.status;
  const isExpired = currentStatus === 'EXPIRED';
  const isFailed = currentStatus === 'FAILED';
  const isPending = currentStatus === 'PENDING';
  const checkoutUrl = chargeStatus?.checkoutUrl ?? charge?.checkoutUrl;

  // Not yet created
  if (!charge) {
    return (
      <div className="space-y-4">
        <FormField label="Valor" required>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className={inputClassName}
            placeholder="0,00"
          />
        </FormField>

        {showInstallments && (
          <FormField label="Parcelas">
            <select
              value={installments}
              onChange={(e) => onInstallmentsChange(e.target.value)}
              className={inputClassName}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}x {n === 1 ? '(à vista)' : ''}
                </option>
              ))}
            </select>
          </FormField>
        )}

        <Button
          onClick={onCreateCharge}
          disabled={
            isCreating || !amount || parseFloat(amount) <= 0
          }
          className="h-14 w-full rounded-xl bg-violet-600 text-base font-bold text-white hover:bg-violet-700"
        >
          {isCreating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Gerando link...
            </span>
          ) : (
            'Gerar Link de Pagamento'
          )}
        </Button>
      </div>
    );
  }

  // Expired or Failed
  if (isExpired || isFailed) {
    return (
      <div className="space-y-4">
        <div
          className={cn(
            'flex flex-col items-center gap-3 rounded-xl border p-6',
            isExpired
              ? 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10'
              : 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10'
          )}
        >
          <AlertCircle
            className={cn(
              'size-10',
              isExpired
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            )}
          />
          <p
            className={cn(
              'text-lg font-bold',
              isExpired
                ? 'text-amber-700 dark:text-amber-300'
                : 'text-rose-700 dark:text-rose-300'
            )}
          >
            {isExpired ? 'Link Expirado' : 'Falha na Cobrança'}
          </p>
        </div>

        <Button
          onClick={onRegenerate}
          className="h-14 w-full rounded-xl bg-violet-600 text-base font-bold text-white hover:bg-violet-700"
        >
          <RefreshCw className="mr-2 size-5" />
          Gerar novo link
        </Button>
      </div>
    );
  }

  // Pending — show checkout link + QR
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        {checkoutUrl && (
          <>
            <div className="rounded-xl bg-white p-3">
              <QRCodeSVG value={checkoutUrl} size={180} level="M" />
            </div>
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              Escaneie o QR Code ou abra o link abaixo
            </p>
            <Button
              variant="outline"
              className="h-11 w-full gap-2"
              onClick={() => window.open(checkoutUrl, '_blank')}
            >
              <ExternalLink className="size-4" />
              Abrir link de pagamento
            </Button>
          </>
        )}

        {isPending && (
          <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400">
            <Loader2 className="size-4 animate-spin" />
            Aguardando pagamento...
          </div>
        )}
      </div>

      {charge.expiresAt && (
        <ExpirationTimer expiresAt={charge.expiresAt} />
      )}
    </div>
  );
}

// =============================================================================
// EXPIRATION TIMER
// =============================================================================

function ExpirationTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = React.useState('');

  React.useEffect(() => {
    function update() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expirado');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
      {timeLeft === 'Expirado' ? (
        <span className="font-medium text-amber-600 dark:text-amber-400">
          Expirado
        </span>
      ) : (
        <>
          Expira em{' '}
          <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
            {timeLeft}
          </span>
        </>
      )}
    </div>
  );
}

// =============================================================================
// ORIGINAL SUB-PANELS (unchanged)
// =============================================================================

function CashPanel({
  cents,
  onCentsChange,
  remainingCents,
  totalCents,
  onAdd,
}: {
  cents: number;
  onCentsChange: (v: number) => void;
  remainingCents: number;
  totalCents: number;
  onAdd: () => void;
}) {
  const changeAmount =
    cents > remainingCents ? (cents - remainingCents) / 100 : 0;

  const shortcuts = [
    { label: 'Valor exato', value: remainingCents },
    { label: 'R$ 50', value: 5000 },
    { label: 'R$ 100', value: 10000 },
  ];

  return (
    <div className="space-y-4">
      <Numpad value={cents} onChange={onCentsChange} shortcuts={shortcuts} />

      {changeAmount > 0 && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-center text-lg font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          Troco: {formatCurrency(changeAmount)}
        </div>
      )}

      <Button
        onClick={onAdd}
        disabled={cents === 0}
        className="h-14 w-full rounded-xl bg-violet-600 text-base font-bold text-white hover:bg-violet-700"
      >
        Adicionar pagamento
      </Button>
    </div>
  );
}

function CardPanel({
  amount,
  onAmountChange,
  nsu,
  onNsuChange,
  authCode,
  onAuthCodeChange,
  installments,
  onInstallmentsChange,
  showInstallments,
  onAdd,
}: {
  amount: string;
  onAmountChange: (v: string) => void;
  nsu: string;
  onNsuChange: (v: string) => void;
  authCode: string;
  onAuthCodeChange: (v: string) => void;
  installments: string;
  onInstallmentsChange: (v: string) => void;
  showInstallments: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-4">
      <FormField label="Valor" required>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className={inputClassName}
          placeholder="0,00"
        />
      </FormField>

      <FormField label="NSU">
        <input
          type="text"
          value={nsu}
          onChange={(e) => onNsuChange(e.target.value)}
          className={inputClassName}
          placeholder="Número Sequencial Único"
        />
      </FormField>

      <FormField label="Código de Autorização">
        <input
          type="text"
          value={authCode}
          onChange={(e) => onAuthCodeChange(e.target.value)}
          className={inputClassName}
          placeholder="Código da operadora"
        />
      </FormField>

      {showInstallments && (
        <FormField label="Parcelas">
          <select
            value={installments}
            onChange={(e) => onInstallmentsChange(e.target.value)}
            className={inputClassName}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}x {n === 1 ? '(à vista)' : ''}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <Button
        onClick={onAdd}
        disabled={!amount || parseFloat(amount) <= 0}
        className="h-14 w-full rounded-xl bg-violet-600 text-base font-bold text-white hover:bg-violet-700"
      >
        Adicionar pagamento
      </Button>
    </div>
  );
}

function PixPanel({
  amount,
  onAmountChange,
  onAdd,
}: {
  amount: string;
  onAmountChange: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-500/30 dark:bg-sky-500/10">
        <CircleDollarSign className="size-5 text-sky-600 dark:text-sky-400" />
        <span className="text-sm font-medium text-sky-700 dark:text-sky-300">
          Registrar pagamento PIX recebido
        </span>
      </div>

      <FormField label="Valor" required>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className={inputClassName}
          placeholder="0,00"
        />
      </FormField>

      <Button
        onClick={onAdd}
        disabled={!amount || parseFloat(amount) <= 0}
        className="h-14 w-full rounded-xl bg-violet-600 text-base font-bold text-white hover:bg-violet-700"
      >
        Adicionar pagamento
      </Button>
    </div>
  );
}

function OtherPanel({
  amount,
  onAmountChange,
  notes,
  onNotesChange,
  onAdd,
}: {
  amount: string;
  onAmountChange: (v: string) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-4">
      <FormField label="Valor" required>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className={inputClassName}
          placeholder="0,00"
        />
      </FormField>

      <FormField label="Observações">
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className={cn(inputClassName, 'h-24 resize-none py-3')}
          placeholder="Detalhes do pagamento..."
        />
      </FormField>

      <Button
        onClick={onAdd}
        disabled={!amount || parseFloat(amount) <= 0}
        className="h-14 w-full rounded-xl bg-violet-600 text-base font-bold text-white hover:bg-violet-700"
      >
        Adicionar pagamento
      </Button>
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClassName = cn(
  'h-14 w-full rounded-xl border border-zinc-200 bg-white px-4 text-base',
  'placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20',
  'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-violet-400'
);

export {
  PaymentOverlay,
  type PaymentOverlayProps,
  type PaymentEntry,
  type PaymentMethodType,
};
