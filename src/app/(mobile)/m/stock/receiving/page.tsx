'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MobileTopBar } from '@/components/mobile/mobile-top-bar';
import {
  usePendingPurchaseOrders,
  getReceivingProgress,
  isOrderOverdue,
  isOrderToday,
} from '@/hooks/mobile/use-receiving';
import {
  Search,
  Loader2,
  PackageOpen,
  CalendarClock,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import type { PurchaseOrder } from '@/types/stock';

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function OrderCard({
  order,
  onClick,
}: {
  order: PurchaseOrder;
  onClick: () => void;
}) {
  const progress = getReceivingProgress(order);
  const overdue = isOrderOverdue(order.expectedDate);
  const today = isOrderToday(order.expectedDate);

  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-800/60 p-3.5 text-left active:bg-slate-700/60"
    >
      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
        <PackageOpen className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Header: PO number + badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-100 truncate">
            {order.orderNumber}
          </span>
          {overdue && (
            <span className="shrink-0 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-400">
              Atrasado
            </span>
          )}
          {today && !overdue && (
            <span className="shrink-0 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400">
              Hoje
            </span>
          )}
        </div>

        {/* Supplier */}
        <p className="text-xs text-slate-400 truncate">
          {order.supplierName || 'Fornecedor'}
        </p>

        {/* Info row */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            {formatDate(order.expectedDate)}
          </span>
          <span>
            {progress.totalReceived}/{progress.totalExpected} itens
          </span>
          <span className="ml-auto text-slate-400">
            {formatCurrency(order.totalCost)}
          </span>
        </div>

        {/* Progress bar */}
        {progress.totalExpected > 0 && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Chevron */}
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-600 mt-3" />
    </button>
  );
}

export default function ReceivingListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const {
    data: orders,
    isLoading,
    error,
  } = usePendingPurchaseOrders(search || undefined);

  return (
    <div className="flex h-dvh flex-col bg-slate-950">
      <MobileTopBar title="Recebimento" showBack />

      {/* Search */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por número ou fornecedor..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            <p className="text-sm text-slate-500">Carregando pedidos...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
              <AlertCircle className="h-6 w-6 text-rose-400" />
            </div>
            <p className="text-sm text-slate-400">Erro ao carregar pedidos</p>
            <p className="text-xs text-slate-600">Tente novamente mais tarde</p>
          </div>
        )}

        {!isLoading && !error && orders && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
              <PackageOpen className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-sm text-slate-400">Nenhum pedido pendente</p>
            <p className="text-xs text-slate-600">
              {search
                ? 'Tente outra busca'
                : 'Todos os pedidos foram recebidos'}
            </p>
          </div>
        )}

        {orders?.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onClick={() => router.push(`/m/stock/receiving/${order.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
