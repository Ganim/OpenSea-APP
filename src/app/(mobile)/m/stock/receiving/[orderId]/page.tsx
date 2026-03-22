'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MobileTopBar } from '@/components/mobile/mobile-top-bar';
import { RecentBinChips } from '@/components/mobile/recent-bin-chips';
import {
  usePurchaseOrder,
  useReceiveItem,
  useRecentBins,
  getReceivingProgress,
  type RecentBin,
} from '@/hooks/mobile/use-receiving';
import {
  Loader2,
  AlertCircle,
  ScanLine,
  Search,
  Check,
  X,
  MapPin,
  Package,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PurchaseOrderItem } from '@/types/stock';

const ScannerCamera = dynamic(
  () =>
    import('@/components/mobile/scanner-camera').then(m => ({
      default: m.ScannerCamera,
    })),
  { ssr: false }
);

// ─── Types ──────────────────────────────────────────────────────────

type ReceivingStep =
  | 'items'
  | 'scanning-item'
  | 'destination'
  | 'scanning-bin'
  | 'confirming';

interface ScannedItemInfo {
  variantId: string;
  productName: string;
  variantName: string;
  unitCost?: number;
  matchedItem?: PurchaseOrderItem;
}

// ─── Product Group ──────────────────────────────────────────────────

interface ProductGroup {
  productName: string;
  items: PurchaseOrderItem[];
  totalExpected: number;
  totalReceived: number;
}

function groupItemsByProduct(items: PurchaseOrderItem[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();

  for (const item of items) {
    const name = item.productName || 'Produto';
    let group = groups.get(name);
    if (!group) {
      group = {
        productName: name,
        items: [],
        totalExpected: 0,
        totalReceived: 0,
      };
      groups.set(name, group);
    }
    group.items.push(item);
    group.totalExpected += item.quantity;
    group.totalReceived += item.receivedQuantity ?? 0;
  }

  return Array.from(groups.values());
}

// ─── Product Group Card ─────────────────────────────────────────────

function ProductGroupCard({ group }: { group: ProductGroup }) {
  const [expanded, setExpanded] = useState(false);
  const isComplete = group.totalReceived >= group.totalExpected;

  return (
    <div
      className={cn(
        'rounded-xl border bg-slate-800/60',
        isComplete ? 'border-green-500/30' : 'border-slate-700/50'
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-3 text-left active:bg-slate-700/40"
      >
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            isComplete
              ? 'bg-green-500/10 text-green-400'
              : 'bg-indigo-500/10 text-indigo-400'
          )}
        >
          {isComplete ? (
            <Check className="h-4 w-4" />
          ) : (
            <Package className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">
            {group.productName}
          </p>
          <p className="text-[11px] text-slate-500">
            {group.totalReceived}/{group.totalExpected} recebidos
          </p>
        </div>

        {expanded ? (
          <ChevronUp className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-700/50 px-3 pb-3 pt-2 space-y-1.5">
          {group.items.map(item => {
            const received = item.receivedQuantity ?? 0;
            const isItemComplete = received >= item.quantity;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-1"
              >
                <span
                  className={cn(
                    'text-xs',
                    isItemComplete ? 'text-green-400' : 'text-slate-300'
                  )}
                >
                  {item.variantName || item.variantSku || 'Variante'}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                    isItemComplete
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-slate-700 text-slate-300'
                  )}
                >
                  {received}/{item.quantity}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function ActiveReceivingPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const { data: order, isLoading, error } = usePurchaseOrder(orderId);
  const receiveItem = useReceiveItem();
  const { bins: recentBins, addBin, clearBins } = useRecentBins();

  const [step, setStep] = useState<ReceivingStep>('items');
  const [scannedItem, setScannedItem] = useState<ScannedItemInfo | null>(null);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [selectedBinAddress, setSelectedBinAddress] = useState<string | null>(
    null
  );
  const [binSearch, setBinSearch] = useState('');
  const [scannerError, setScannerError] = useState<string | null>(null);

  const progress = useMemo(() => {
    if (!order) return { totalExpected: 0, totalReceived: 0, percentage: 0 };
    return getReceivingProgress(order);
  }, [order]);

  const productGroups = useMemo(() => {
    if (!order) return [];
    return groupItemsByProduct(order.items);
  }, [order]);

  // ─── Scan handlers ──────────────────────────────────────────────

  const handleItemScan = useCallback(
    (code: string) => {
      if (!order) return;

      // Try to match code against PO items (by variantSku or variantName)
      const matched = order.items.find(
        item =>
          item.variantSku === code ||
          item.variantName === code ||
          item.variantId === code
      );

      if (matched) {
        setScannedItem({
          variantId: matched.variantId,
          productName: matched.productName || 'Produto',
          variantName: matched.variantName || matched.variantSku || 'Variante',
          unitCost: matched.unitCost,
          matchedItem: matched,
        });
        setStep('destination');
      } else {
        // Item not in PO — still allow receiving with the scanned code as variantId
        setScannedItem({
          variantId: code,
          productName: 'Item Escaneado',
          variantName: code,
        });
        setStep('destination');
      }
    },
    [order]
  );

  const handleBinScan = useCallback(
    (code: string) => {
      // Use scanned code as bin address — we need the bin ID from the address
      // For now, use the code as both ID and address
      setSelectedBinId(code);
      setSelectedBinAddress(code);
      addBin(code, code);
      setStep('confirming');
    },
    [addBin]
  );

  const handleSelectRecentBin = useCallback((bin: RecentBin) => {
    setSelectedBinId(bin.id);
    setSelectedBinAddress(bin.address);
    setStep('confirming');
  }, []);

  const handleBinSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const addr = binSearch.trim();
      if (!addr) return;
      setSelectedBinId(addr);
      setSelectedBinAddress(addr);
      addBin(addr, addr);
      setStep('confirming');
    },
    [binSearch, addBin]
  );

  const handleConfirmEntry = useCallback(() => {
    if (!scannedItem || !selectedBinId || !orderId) return;

    receiveItem.mutate(
      {
        variantId: scannedItem.variantId,
        binId: selectedBinId,
        quantity: 1,
        purchaseOrderId: orderId,
        unitCost: scannedItem.unitCost,
      },
      {
        onSuccess: () => {
          // Reset for next scan
          setScannedItem(null);
          setSelectedBinId(null);
          setSelectedBinAddress(null);
          setBinSearch('');
          setStep('items');
        },
      }
    );
  }, [scannedItem, selectedBinId, orderId, receiveItem]);

  const handleCancel = useCallback(() => {
    setScannedItem(null);
    setSelectedBinId(null);
    setSelectedBinAddress(null);
    setBinSearch('');
    setScannerError(null);
    setStep('items');
  }, []);

  // ─── Loading / Error ──────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col bg-slate-950">
        <MobileTopBar title="Carregando..." showBack />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col bg-slate-950">
        <MobileTopBar title="Erro" showBack />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
            <AlertCircle className="h-6 w-6 text-rose-400" />
          </div>
          <p className="text-sm text-slate-300">
            Não foi possível carregar o pedido
          </p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-slate-950">
      {/* Top bar */}
      <MobileTopBar
        title={order.orderNumber}
        subtitle={`${order.supplierName || 'Fornecedor'} · ${progress.totalReceived}/${progress.totalExpected}`}
        showBack
        rightContent={
          receiveItem.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
          ) : null
        }
      />

      {/* Progress bar */}
      <div className="h-1 w-full bg-slate-800">
        <div
          className={cn(
            'h-full transition-all duration-500',
            progress.percentage >= 100 ? 'bg-green-500' : 'bg-indigo-500'
          )}
          style={{ width: `${Math.min(progress.percentage, 100)}%` }}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Items list (default step) ─────────────────────────── */}
        {step === 'items' && (
          <div className="space-y-2 px-4 py-3">
            {productGroups.map(group => (
              <ProductGroupCard key={group.productName} group={group} />
            ))}

            {productGroups.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500">
                  Nenhum item neste pedido
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Scanning item ─────────────────────────────────────── */}
        {step === 'scanning-item' && (
          <div className="flex flex-1 flex-col">
            <div className="relative flex-1 bg-black">
              {scannerError ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
                  <AlertCircle className="h-7 w-7 text-rose-400" />
                  <p className="text-sm text-slate-300">Câmera indisponível</p>
                  <p className="text-xs text-slate-500">{scannerError}</p>
                </div>
              ) : (
                <ScannerCamera
                  onScan={handleItemScan}
                  onError={setScannerError}
                  enabled={step === 'scanning-item'}
                  className="h-64"
                />
              )}
            </div>

            {/* Manual input */}
            <div className="border-t border-slate-800 bg-slate-900 px-4 py-3">
              <p className="mb-2 text-xs text-slate-400">
                Ou digite o código manualmente:
              </p>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem(
                    'manual-code'
                  ) as HTMLInputElement;
                  const code = input?.value.trim();
                  if (code) {
                    handleItemScan(code);
                    input.value = '';
                  }
                }}
                className="flex gap-2"
              >
                <input
                  name="manual-code"
                  type="text"
                  placeholder="Código do item..."
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white active:bg-indigo-600"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            <button
              onClick={handleCancel}
              className="mx-4 mb-4 mt-2 rounded-lg border border-slate-700 bg-slate-800/60 py-2.5 text-sm text-slate-300 active:bg-slate-700/80"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* ── Destination selection ─────────────────────────────── */}
        {step === 'destination' && scannedItem && (
          <div className="space-y-4 px-4 py-4">
            {/* Scanned item success card */}
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/15 text-green-400">
                  <Check className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-300">
                    Item identificado
                  </p>
                  <p className="text-xs text-green-400/70 truncate">
                    {scannedItem.productName} · {scannedItem.variantName}
                  </p>
                </div>
              </div>
            </div>

            {/* Destination header */}
            <p className="text-sm font-medium text-slate-300">
              Selecione o destino
            </p>

            {/* Scan bin button */}
            <button
              onClick={() => {
                setScannerError(null);
                setStep('scanning-bin');
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/60 p-3.5 text-left active:bg-slate-700/60"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                <ScanLine className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Escanear Bin Destino
                </p>
                <p className="text-[11px] text-slate-500">
                  Leia o QR code da localização
                </p>
              </div>
            </button>

            {/* Recent bins */}
            <RecentBinChips
              bins={recentBins}
              selectedBinId={selectedBinId}
              onSelect={handleSelectRecentBin}
              onClear={clearBins}
            />

            {/* Search bin */}
            <form onSubmit={handleBinSearchSubmit} className="space-y-2">
              <p className="text-xs text-slate-400">Buscar endereço</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={binSearch}
                    onChange={e => setBinSearch(e.target.value)}
                    placeholder="Ex: FAB-EST-102-B"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!binSearch.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white disabled:opacity-40 active:bg-indigo-600"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Cancel */}
            <button
              onClick={handleCancel}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/60 py-2.5 text-sm text-slate-300 active:bg-slate-700/80"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* ── Scanning bin ──────────────────────────────────────── */}
        {step === 'scanning-bin' && (
          <div className="flex flex-1 flex-col">
            <div className="px-4 py-3">
              <p className="text-sm text-slate-300">
                Escaneie o QR code da bin de destino
              </p>
            </div>

            <div className="relative bg-black">
              {scannerError ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
                  <AlertCircle className="h-7 w-7 text-rose-400" />
                  <p className="text-sm text-slate-300">Câmera indisponível</p>
                  <p className="text-xs text-slate-500">{scannerError}</p>
                </div>
              ) : (
                <ScannerCamera
                  onScan={handleBinScan}
                  onError={setScannerError}
                  enabled={step === 'scanning-bin'}
                  className="h-64"
                />
              )}
            </div>

            {/* Manual bin input */}
            <div className="border-t border-slate-800 bg-slate-900 px-4 py-3">
              <form onSubmit={handleBinSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={binSearch}
                  onChange={e => setBinSearch(e.target.value)}
                  placeholder="Endereço manual..."
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!binSearch.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white disabled:opacity-40 active:bg-indigo-600"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            <button
              onClick={() => setStep('destination')}
              className="mx-4 mb-4 mt-2 rounded-lg border border-slate-700 bg-slate-800/60 py-2.5 text-sm text-slate-300 active:bg-slate-700/80"
            >
              Voltar
            </button>
          </div>
        )}

        {/* ── Confirming ────────────────────────────────────────── */}
        {step === 'confirming' && scannedItem && selectedBinAddress && (
          <div className="space-y-4 px-4 py-4">
            {/* Summary */}
            <div className="space-y-3 rounded-xl border border-slate-700/50 bg-slate-800/60 p-4">
              <h3 className="text-sm font-semibold text-slate-200">
                Confirmar Entrada
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Produto</span>
                  <span className="text-slate-200">
                    {scannedItem.productName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Variante</span>
                  <span className="text-slate-200">
                    {scannedItem.variantName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Destino</span>
                  <span className="font-medium text-indigo-400">
                    {selectedBinAddress}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Quantidade</span>
                  <span className="text-slate-200">1</span>
                </div>
                {scannedItem.unitCost != null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Custo unitário</span>
                    <span className="text-slate-200">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(scannedItem.unitCost)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirmEntry}
              disabled={receiveItem.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white active:bg-green-700 disabled:opacity-50"
            >
              {receiveItem.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Confirmar Entrada em {selectedBinAddress}
            </button>

            {/* Error display */}
            {receiveItem.isError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-center">
                <p className="text-sm text-rose-400">
                  Erro ao registrar entrada
                </p>
                <p className="mt-1 text-xs text-rose-400/70">
                  Verifique o item e tente novamente
                </p>
              </div>
            )}

            {/* Back / Cancel */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedBinId(null);
                  setSelectedBinAddress(null);
                  setStep('destination');
                }}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800/60 py-2.5 text-sm text-slate-300 active:bg-slate-700/80"
              >
                Alterar Destino
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-2.5 text-sm text-rose-400 active:bg-rose-500/15"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom action bar (visible on items step) ──────────── */}
      {step === 'items' && (
        <div className="border-t border-slate-800 bg-slate-900 px-4 py-3">
          <button
            onClick={() => {
              setScannerError(null);
              setStep('scanning-item');
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white active:bg-indigo-600"
          >
            <ScanLine className="h-4 w-4" />
            Escanear Item Recebido
          </button>
        </div>
      )}
    </div>
  );
}
