'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Minus,
  Package,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ProductGrid,
  type ProductVariant,
} from '@/components/sales/product-grid';
import {
  usePdvOrder,
  useAddOrderItem,
  useRemoveOrderItem,
  useUpdateOrderItemQuantity,
} from '@/hooks/sales/use-pdv';

// =============================================================================
// Types
// =============================================================================

interface SaleDetailProps {
  orderId: string | null;
  onReceivePayment: (orderId: string, total: number) => void;
}

// =============================================================================
// Component
// =============================================================================

export function SaleDetail({ orderId, onReceivePayment }: SaleDetailProps) {
  const [showProductGrid, setShowProductGrid] = useState(false);

  const { data, isLoading } = usePdvOrder(orderId);
  const addItem = useAddOrderItem();
  const removeItem = useRemoveOrderItem();
  const updateQty = useUpdateOrderItemQuantity();

  const order = data?.order ?? null;

  // Empty state
  if (!orderId) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <ShoppingCart className="size-10 text-zinc-400" />
        </div>
        <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
          Selecione uma venda da fila
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Clique em um pedido para ver os detalhes e processar o pagamento
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading || !order) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  function handleAddToCart(variant: ProductVariant) {
    if (!orderId) return;
    addItem.mutate({
      orderId,
      data: { variantId: variant.id, quantity: 1 },
    });
    setShowProductGrid(false);
  }

  function handleRemoveItem(itemId: string) {
    if (!orderId) return;
    removeItem.mutate({ orderId, itemId });
  }

  function handleUpdateQuantity(itemId: string, delta: number) {
    if (!orderId) return;
    const item = order?.items.find(i => i.id === itemId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeItem.mutate({ orderId, itemId });
    } else {
      updateQty.mutate({ orderId, itemId, quantity: newQty });
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {order.saleCode ?? order.orderNumber}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {order.customerName ?? 'Cliente avulso'}
              {order.assignedToName && (
                <span> &mdash; Vendedor: {order.assignedToName}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
              {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {order.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="mb-3 size-10 text-zinc-400" />
            <p className="text-sm font-medium text-zinc-500">
              Nenhum item no pedido
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {order.items.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
              >
                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {item.name}
                  </p>
                  {item.sku && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      SKU: {item.sku}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatCurrency(item.unitPrice)} un.
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.id, -1)}
                    className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="flex size-9 items-center justify-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.id, 1)}
                    className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="w-24 text-right">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="flex size-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 active:scale-95 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add item button */}
        <button
          type="button"
          onClick={() => setShowProductGrid(true)}
          className={cn(
            'mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed',
            'border-zinc-300 text-sm font-medium text-zinc-600',
            'hover:border-violet-400 hover:text-violet-600 active:scale-[0.98] transition-all',
            'dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-violet-500 dark:hover:text-violet-400'
          )}
        >
          <Plus className="size-4" />
          Adicionar item
        </button>
      </div>

      {/* Summary + Payment Button */}
      <div className="shrink-0 border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        {/* Summary rows */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {formatCurrency(order.subtotal)}
            </span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Desconto</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                -{formatCurrency(order.discountTotal)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-zinc-200 pt-2 dark:border-zinc-800">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Total
            </span>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(order.grandTotal)}
            </span>
          </div>
        </div>

        {/* Payment button */}
        <Button
          onClick={() => onReceivePayment(order.id, order.grandTotal)}
          disabled={order.items.length === 0}
          className={cn(
            'h-16 w-full rounded-xl text-base font-bold',
            'bg-violet-600 text-white hover:bg-violet-700',
            'disabled:opacity-50'
          )}
        >
          <CreditCard className="mr-2 size-5" />
          RECEBER PAGAMENTO {formatCurrency(order.grandTotal)}
        </Button>
      </div>

      {/* Product Grid Dialog */}
      <Dialog open={showProductGrid} onOpenChange={setShowProductGrid}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Adicionar Item</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <ProductGrid onAddToCart={handleAddToCart} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
