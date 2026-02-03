/**
 * Add To Queue Button
 * Botão reutilizável para adicionar itens à fila de impressão
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Item, Product, Variant } from '@/types/stock';
import { Check, Printer } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { usePrintQueue } from '../context/print-queue-context';
import type { AddToQueueInput } from '../types';

// ============================================
// SINGLE ITEM BUTTON
// ============================================

interface AddToQueueButtonProps {
  item: Item;
  variant?: Variant;
  product?: Product;
  copies?: number;
  showLabel?: boolean;
  onAdded?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AddToQueueButton({
  item,
  variant,
  product,
  copies = 1,
  showLabel = false,
  onAdded,
  className,
  disabled,
  size,
}: AddToQueueButtonProps) {
  const { actions, isHydrated } = usePrintQueue();
  const isInQueue = actions.isInQueue(item.id);

  const handleClick = useCallback(() => {
    if (isInQueue) {
      toast.info('Item ja esta na fila de impressao');
      return;
    }

    actions.addToQueue({ item, variant, product, copies });
    toast.success('Item adicionado a fila de impressao');
    onAdded?.();
  }, [item, variant, product, copies, isInQueue, actions, onAdded]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isInQueue ? 'secondary' : 'outline'}
            size={size || (showLabel ? 'sm' : 'icon')}
            className={cn(
              isInQueue && 'text-green-600 border-green-300',
              className
            )}
            onClick={handleClick}
            disabled={disabled || !isHydrated}
          >
            {isInQueue ? (
              <>
                <Check className="w-4 h-4" />
                {showLabel && <span className="ml-1">Na fila</span>}
              </>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                {showLabel && <span className="ml-1">Imprimir</span>}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isInQueue ? 'Ja esta na fila' : 'Adicionar a fila de impressao'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// BATCH ADD BUTTON
// ============================================

interface BatchAddToQueueButtonProps {
  items: Array<{
    item: Item;
    variant?: Variant;
    product?: Product;
    copies?: number;
  }>;
  showLabel?: boolean;
  onAdded?: (count: number) => void;
  className?: string;
  disabled?: boolean;
}

export function BatchAddToQueueButton({
  items,
  showLabel = true,
  onAdded,
  className,
  disabled,
}: BatchAddToQueueButtonProps) {
  const { actions, isHydrated } = usePrintQueue();

  // Contar quantos já estão na fila
  const { notInQueue, inQueue } = useMemo(() => {
    const notInQueue: AddToQueueInput[] = [];
    let inQueueCount = 0;

    for (const { item, variant, product, copies } of items) {
      if (actions.isInQueue(item.id)) {
        inQueueCount++;
      } else {
        notInQueue.push({ item, variant, product, copies });
      }
    }

    return { notInQueue, inQueue: inQueueCount };
  }, [items, actions]);

  const allInQueue = notInQueue.length === 0;
  const someInQueue = inQueue > 0 && notInQueue.length > 0;

  const handleClick = useCallback(() => {
    if (allInQueue) {
      toast.info('Todos os itens ja estao na fila');
      return;
    }

    actions.addToQueue(notInQueue);

    const count = notInQueue.length;
    toast.success(
      `${count} item${count !== 1 ? 's' : ''} adicionado${count !== 1 ? 's' : ''} a fila`
    );
    onAdded?.(count);
  }, [notInQueue, allInQueue, actions, onAdded]);

  return (
    <Button
      variant={allInQueue ? 'secondary' : 'outline'}
      size="sm"
      className={cn(allInQueue && 'text-green-600 border-green-300', className)}
      onClick={handleClick}
      disabled={disabled || !isHydrated || items.length === 0}
    >
      {allInQueue ? (
        <>
          <Check className="w-4 h-4" />
          {showLabel && <span className="ml-1">Todos na fila</span>}
        </>
      ) : (
        <>
          <Printer className="w-4 h-4" />
          {showLabel && (
            <span className="ml-1">
              Imprimir {notInQueue.length} item{notInQueue.length !== 1 && 's'}
              {someInQueue && ` (${inQueue} ja na fila)`}
            </span>
          )}
        </>
      )}
    </Button>
  );
}
