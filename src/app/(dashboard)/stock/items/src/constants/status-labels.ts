/**
 * Items Module Constants
 * Labels e constantes para o módulo de items
 */

import type { ItemStatus } from '@/types/stock';

/**
 * Labels para status de items
 */
export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  AVAILABLE: 'Disponível',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
  DAMAGED: 'Danificado',
};

/**
 * Cores para badges de status
 */
export const ITEM_STATUS_COLORS: Record<
  ItemStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  AVAILABLE: 'default',
  RESERVED: 'secondary',
  SOLD: 'outline',
  DAMAGED: 'destructive',
};
