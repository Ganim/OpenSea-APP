/**
 * Cart Sheet
 * Slide-over lateral com os itens do carrinho do PDV
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeftRight,
  CreditCard,
  Minus,
  Plus,
  Send,
  ShoppingCart,
  Trash2,
  User,
} from 'lucide-react';

// Cart provider hooks — will be provided by CartProvider
// Safe imports with fallback for when provider is not yet mounted
function useCartDataSafe() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useCartData } = require('@/providers/cart-provider');
    return useCartData();
  } catch {
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      total: 0,
      saleCode: null,
      customer: null,
      draftCount: 0,
    };
  }
}

function useCartActionsSafe() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useCartActions } = require('@/providers/cart-provider');
    return useCartActions();
  } catch {
    return {
      updateQuantity: () => {},
      removeItem: () => {},
      sendToCashier: () => {},
      startPayment: () => {},
      identifyCustomer: () => {},
      switchCart: () => {},
    };
  }
}

interface CartItem {
  id: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const cartData = useCartDataSafe();
  const cartActions = useCartActionsSafe();

  const {
    items = [],
    subtotal = 0,
    discount = 0,
    total = 0,
    saleCode,
    customer,
    draftCount = 0,
  } = cartData as {
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    saleCode: string | null;
    customer: { name: string } | null;
    draftCount: number;
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton
        className="sm:max-w-md w-full flex flex-col p-0"
      >
        {/* Header */}
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-violet-500" />
            <SheetTitle className="text-lg font-bold">Carrinho</SheetTitle>
            {saleCode && (
              <Badge
                variant="outline"
                className="ml-1 text-xs font-mono border-violet-300 text-violet-600 dark:border-violet-500/40 dark:text-violet-400"
              >
                {saleCode}
              </Badge>
            )}
            {draftCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-auto text-xs"
              >
                Em espera: {draftCount}
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* Customer section */}
        <div className="px-4 py-3 border-b border-border/50">
          {customer ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center">
                <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {customer.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground"
                onClick={() => cartActions.identifyCustomer?.()}
              >
                Alterar
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-muted-foreground"
              onClick={() => cartActions.identifyCustomer?.()}
            >
              <User className="w-4 h-4" />
              Identificar cliente
            </Button>
          )}
        </div>

        {/* Item list */}
        <ScrollArea className="flex-1 min-h-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Carrinho vazio
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Adicione produtos ao carrinho para iniciar uma venda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {items.map((item: CartItem) => (
                <div key={item.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {item.name}
                      </p>
                      {item.sku && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          SKU: {item.sku}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatCurrency(item.price)} /un
                      </p>
                    </div>

                    {/* Subtotal + remove */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(item.subtotal)}
                      </p>
                      <button
                        type="button"
                        onClick={() => cartActions.removeItem?.(item.id)}
                        className="text-rose-500 hover:text-rose-600 p-0.5 rounded transition-colors"
                        aria-label={`Remover ${item.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quantity stepper */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        cartActions.updateQuantity?.(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className={cn(
                        'h-9 w-9 rounded-full flex items-center justify-center border transition-colors',
                        'border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed'
                      )}
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        cartActions.updateQuantity?.(item.id, item.quantity + 1)
                      }
                      className={cn(
                        'h-9 w-9 rounded-full flex items-center justify-center border transition-colors',
                        'border-border hover:bg-accent'
                      )}
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Summary + Actions */}
        {items.length > 0 && (
          <SheetFooter className="flex-col gap-3 border-t border-border/50 p-4">
            {/* Summary */}
            <div className="w-full space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                  <span>Desconto</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-foreground pt-1 border-t border-border/50">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full space-y-2">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  cartActions.sendToCashier?.();
                  onClose();
                }}
              >
                <Send className="w-4 h-4" />
                Enviar para Caixa
              </Button>
              <Button
                className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                onClick={() => {
                  cartActions.startPayment?.();
                  onClose();
                }}
              >
                <CreditCard className="w-4 h-4" />
                Cobrar
              </Button>
            </div>

            {/* Switch cart link */}
            {draftCount > 0 && (
              <button
                type="button"
                onClick={() => cartActions.switchCart?.()}
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full pt-1"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Trocar carrinho
              </button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
