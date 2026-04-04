'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingBag, Plus, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useCashierQueue } from '@/hooks/sales/use-pdv';
import type { CashierQueueItem } from '@/types/sales';

// =============================================================================
// Relative time helper (inline to avoid cross-module import)
// =============================================================================

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'agora';
  if (diffMins === 1) return 'há 1 min';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours === 1) return 'há 1 hora';
  if (diffHours < 24) return `há ${diffHours} horas`;
  if (diffDays === 1) return 'ontem';
  return `há ${diffDays} dias`;
}

// =============================================================================
// Types
// =============================================================================

interface CashierQueueProps {
  selectedOrderId: string | null;
  currentUserId: string | null;
  onSelect: (orderId: string) => void;
  onCreateDirect: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function CashierQueue({
  selectedOrderId,
  currentUserId,
  onSelect,
  onCreateDirect,
}: CashierQueueProps) {
  const [search, setSearch] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useCashierQueue({
    search: search || undefined,
  });

  const orders = data?.orders ?? [];

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="shrink-0 border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, cliente ou CPF..."
            className={cn(
              'h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm',
              'placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20',
              'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-violet-400'
            )}
          />
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <ShoppingBag className="size-8 text-zinc-400" />
            </div>
            <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
              Nenhuma venda na fila
            </p>
            <p className="mb-6 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Aguardando pedidos dos vendedores
            </p>
            <button
              type="button"
              onClick={onCreateDirect}
              className={cn(
                'flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium',
                'bg-violet-600 text-white hover:bg-violet-700 active:scale-95 transition-all'
              )}
            >
              <Plus className="size-4" />
              Criar venda direta
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4">
            {orders.map((order) => {
              const isClaimedByOther =
                order.claimedByUserId !== null &&
                order.claimedByUserId !== currentUserId;
              const isSelected = selectedOrderId === order.id;

              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => onSelect(order.id)}
                  disabled={isClaimedByOther}
                  className={cn(
                    'relative flex flex-col gap-2 rounded-lg border-l-4 border border-zinc-200 bg-white p-4 text-left transition-all',
                    'dark:border-zinc-700 dark:bg-zinc-900',
                    'hover:shadow-md active:scale-[0.98]',
                    isSelected
                      ? 'border-l-violet-600 ring-2 ring-violet-500/20 dark:border-l-violet-500'
                      : 'border-l-violet-600 dark:border-l-violet-500',
                    isClaimedByOther && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  {/* Top row: code + time */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {order.saleCode}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <Clock className="size-3" />
                      {formatRelativeTime(order.createdAt)}
                    </div>
                  </div>

                  {/* Customer + Vendor */}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                      <User className="size-3 shrink-0" />
                      <span className="truncate">{order.customerName}</span>
                    </div>
                    <span className="text-zinc-400">|</span>
                    <span className="truncate text-zinc-500 dark:text-zinc-400">
                      {order.assignedToName}
                    </span>
                  </div>

                  {/* Bottom row: total + badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-violet-600 dark:text-violet-400">
                      {formatCurrency(order.grandTotal)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {order.itemCount} {order.itemCount === 1 ? 'item' : 'itens'}
                      </span>
                      {isClaimedByOther && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                          Em atendimento
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />
          </div>
        )}
      </div>
    </div>
  );
}
