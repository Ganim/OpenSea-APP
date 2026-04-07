/**
 * Cart Indicator
 * Ícone do carrinho na navbar com badge de contagem de itens
 */

'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { CartSheet } from '@/components/sales/cart-sheet';

// Cart provider hook — will be provided by CartProvider
// Safe import with fallback for when provider is not yet mounted
function useCartDataSafe() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, react-hooks/rules-of-hooks
    const { useCartData } = require('@/providers/cart-provider');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCartData();
  } catch {
    return { itemCount: 0 };
  }
}

export function CartIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCartDataSafe();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-xl relative"
        aria-label="Carrinho"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {itemCount > 9 ? '9+' : itemCount}
          </motion.div>
        )}
      </Button>

      <CartSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
