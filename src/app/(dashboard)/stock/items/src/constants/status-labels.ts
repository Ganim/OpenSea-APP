/**
 * Items Module Constants
 * Labels e constantes para o módulo de items
 */

import type { ItemStatus } from '@/types/stock';

/**
 * Labels para status de items
 */
export { ITEM_STATUS_LABELS } from '@/types/stock';

/**
 * Cores para badges de status
 */
export const ITEM_STATUS_COLORS: Record<
  ItemStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  AVAILABLE: 'default',
  RESERVED: 'secondary',
  IN_TRANSIT: 'outline',
  DAMAGED: 'destructive',
  EXPIRED: 'destructive',
  DISPOSED: 'secondary',
};
