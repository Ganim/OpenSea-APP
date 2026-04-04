'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Monitor,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { SessionOpenModal } from '@/components/sales/session-open-modal';
import { CashMovementModal } from '@/components/sales/cash-movement-modal';
import { SessionCloseModal } from '@/components/sales/session-close-modal';
import { PaymentOverlay } from '@/components/sales/payment-overlay';
import { SuccessScreen } from '@/components/sales/success-screen';

import {
  useActiveSession,
  useOpenPosSession,
  useClosePosSession,
  useCreatePosCashMovement,
} from '@/hooks/sales/use-pos';
import { useClaimOrder, useCreatePdvOrder } from '@/hooks/sales/use-pdv';

import { CashierQueue } from './_components/cashier-queue';
import { SaleDetail } from './_components/sale-detail';

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_TERMINAL_ID = 'default-cashier';

// =============================================================================
// Page
// =============================================================================

export default function CaixaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const terminalId = searchParams.get('terminalId') ?? DEFAULT_TERMINAL_ID;

  // ---------------------------------------------------------------------------
  // Session state
  // ---------------------------------------------------------------------------
  const {
    data: session,
    isLoading: isSessionLoading,
  } = useActiveSession(terminalId);
  const openSession = useOpenPosSession();
  const closeSession = useClosePosSession();
  const createCashMovement = useCreatePosCashMovement();

  // ---------------------------------------------------------------------------
  // Order state
  // ---------------------------------------------------------------------------
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const claimOrder = useClaimOrder();
  const createPdvOrder = useCreatePdvOrder();

  // ---------------------------------------------------------------------------
  // Modal state
  // ---------------------------------------------------------------------------
  const [showSessionOpen, setShowSessionOpen] = useState(false);
  const [showSessionClose, setShowSessionClose] = useState(false);
  const [cashMovementType, setCashMovementType] = useState<
    'WITHDRAWAL' | 'SUPPLY' | null
  >(null);

  // ---------------------------------------------------------------------------
  // Payment state
  // ---------------------------------------------------------------------------
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [paymentVersion, setPaymentVersion] = useState(0);
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);

  // ---------------------------------------------------------------------------
  // Success state
  // ---------------------------------------------------------------------------
  const [successData, setSuccessData] = useState<{
    saleCode: string;
    total: number;
    changeAmount: number;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // Auto-show session modal if no active session
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isSessionLoading && !session) {
      setShowSessionOpen(true);
    }
  }, [isSessionLoading, session]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleOpenSession = useCallback(
    (openingBalance: number) => {
      openSession.mutate(
        { terminalId, openingBalance },
        {
          onSuccess: () => {
            setShowSessionOpen(false);
            toast.success('Caixa aberto com sucesso.');
          },
        }
      );
    },
    [terminalId, openSession]
  );

  const handleCloseSession = useCallback(
    (data: { countedBalance: number; notes?: string }) => {
      if (!session) return;
      closeSession.mutate(
        {
          sessionId: session.id,
          terminalId,
          data: {
            closingBalance: data.countedBalance,
            notes: data.notes,
          },
        },
        {
          onSuccess: () => {
            setShowSessionClose(false);
            toast.success('Caixa fechado com sucesso.');
            router.push('/sales/pos');
          },
        }
      );
    },
    [session, terminalId, closeSession, router]
  );

  const handleCashMovement = useCallback(
    (data: { amount: number; reason: string }) => {
      if (!session || !cashMovementType) return;
      createCashMovement.mutate(
        {
          sessionId: session.id,
          type: cashMovementType,
          amount: data.amount,
          reason: data.reason,
        },
        {
          onSuccess: () => {
            setCashMovementType(null);
            toast.success(
              cashMovementType === 'WITHDRAWAL'
                ? 'Sangria registrada com sucesso.'
                : 'Suprimento registrado com sucesso.'
            );
          },
        }
      );
    },
    [session, cashMovementType, createCashMovement]
  );

  const handleSelectOrder = useCallback(
    (orderId: string) => {
      // Claim order when selecting
      claimOrder.mutate(orderId, {
        onSuccess: () => {
          setSelectedOrderId(orderId);
        },
        onError: () => {
          // Still show the order even if claim fails (might be already claimed by us)
          setSelectedOrderId(orderId);
        },
      });
    },
    [claimOrder]
  );

  const handleCreateDirect = useCallback(() => {
    createPdvOrder.mutate(undefined, {
      onSuccess: (result) => {
        setSelectedOrderId(result.order.id);
        toast.success('Venda direta criada.');
      },
    });
  }, [createPdvOrder]);

  const handleReceivePayment = useCallback(
    (orderId: string, total: number, version?: number) => {
      setPaymentOrderId(orderId);
      setPaymentTotal(total);
      setPaymentVersion(version ?? 0);
      setShowPaymentOverlay(true);
    },
    []
  );

  const handlePaymentSuccess = useCallback(
    (result: { changeAmount: number; saleCode: string }) => {
      setShowPaymentOverlay(false);
      setSuccessData({
        saleCode: result.saleCode,
        total: paymentTotal,
        changeAmount: result.changeAmount,
      });
    },
    [paymentTotal]
  );

  const handleNewSaleAfterSuccess = useCallback(() => {
    setSuccessData(null);
    setSelectedOrderId(null);
    setPaymentOrderId(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const hasSession = !!session;
  const sessionNumber = session?.id
    ? `#${session.id.slice(-4).toUpperCase()}`
    : '';

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      {/* ===== Header ===== */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/sales/pos')}
            className="h-9 px-2"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Monitor className="size-5 text-violet-600 dark:text-violet-400" />
            <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              CAIXA
            </h1>
          </div>

          {/* Session indicator */}
          {hasSession && (
            <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 dark:border-zinc-700 dark:bg-zinc-800">
              <span
                className={cn(
                  'inline-block size-2 rounded-full',
                  hasSession ? 'bg-emerald-500' : 'bg-zinc-400'
                )}
              />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Sessão {sessionNumber}
              </span>
            </div>
          )}
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateDirect}
            disabled={!hasSession}
            className="h-9 px-2.5"
          >
            <Plus className="mr-1 size-4" />
            Nova Venda
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCashMovementType('WITHDRAWAL')}
            disabled={!hasSession}
            className="h-9 px-2.5"
          >
            <ArrowUpCircle className="mr-1 size-4" />
            Sangria
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCashMovementType('SUPPLY')}
            disabled={!hasSession}
            className="h-9 px-2.5"
          >
            <ArrowDownCircle className="mr-1 size-4" />
            Suprimento
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSessionClose(true)}
            disabled={!hasSession}
            className="h-9 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
          >
            <LogOut className="mr-1 size-4" />
            Fechar Caixa
          </Button>
        </div>
      </header>

      {/* ===== Split Content ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — Queue (40%) */}
        <div className="w-2/5 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <CashierQueue
            selectedOrderId={selectedOrderId}
            currentUserId={null}
            onSelect={handleSelectOrder}
            onCreateDirect={handleCreateDirect}
          />
        </div>

        {/* Right panel — Sale Detail (60%) */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900">
          <SaleDetail
            orderId={selectedOrderId}
            onReceivePayment={handleReceivePayment}
          />
        </div>
      </div>

      {/* ===== Modals / Overlays ===== */}

      {/* Session Open */}
      <SessionOpenModal
        isOpen={showSessionOpen}
        onClose={() => {
          setShowSessionOpen(false);
          if (!session) router.push('/sales/pos');
        }}
        onConfirm={handleOpenSession}
        isPending={openSession.isPending}
      />

      {/* Session Close */}
      <SessionCloseModal
        isOpen={showSessionClose}
        onClose={() => setShowSessionClose(false)}
        expectedBalance={session?.expectedBalance ?? 0}
        breakdown={[]}
        onConfirm={handleCloseSession}
        isPending={closeSession.isPending}
      />

      {/* Cash Movement */}
      {cashMovementType && (
        <CashMovementModal
          isOpen={!!cashMovementType}
          onClose={() => setCashMovementType(null)}
          type={cashMovementType}
          onConfirm={handleCashMovement}
          isPending={createCashMovement.isPending}
        />
      )}

      {/* Payment Overlay */}
      <PaymentOverlay
        isOpen={showPaymentOverlay}
        onClose={() => setShowPaymentOverlay(false)}
        total={paymentTotal}
        orderId={paymentOrderId ?? ''}
        terminalMode="STANDARD"
        posSessionId={session?.id}
        expectedVersion={paymentVersion}
        onSuccess={handlePaymentSuccess}
      />

      {/* Success Screen */}
      <SuccessScreen
        isOpen={!!successData}
        saleCode={successData?.saleCode ?? ''}
        total={successData?.total ?? 0}
        changeAmount={successData?.changeAmount ?? 0}
        payments={[]}
        onNewSale={handleNewSaleAfterSuccess}
        onClose={handleNewSaleAfterSuccess}
      />
    </div>
  );
}
