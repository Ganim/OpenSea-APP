import type { ItemMovement } from '@/types/stock';
import { isStockIncrease, isStockDecrease } from '@/types/stock';
import { MOVEMENT_SUBTYPE_CONFIG } from '../constants';
import type { DirectionFilter, SubtypeFilter } from '../types/movements.types';

/**
 * Formats a date/string to DD/MM/YYYY HH:MM
 */
export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Filters movements by search query (matches itemId, batchNumber, notes)
 */
export function filterMovementsBySearch(
  movements: ItemMovement[],
  searchQuery: string
): ItemMovement[] {
  if (!searchQuery) return movements;
  const s = searchQuery.toLowerCase();
  return movements.filter(
    m =>
      m.batchNumber?.toLowerCase().includes(s) ||
      m.notes?.toLowerCase().includes(s) ||
      m.itemId.toLowerCase().includes(s)
  );
}

/**
 * Determines movement direction: IN (stock increase), OUT (decrease), NEUTRAL (transfer/reconfig).
 */
export function getMovementDirection(
  m: ItemMovement
): 'IN' | 'OUT' | 'NEUTRAL' {
  if (isStockIncrease(m.movementType)) return 'IN';
  if (m.movementType === 'TRANSFER' || m.movementType === 'ZONE_RECONFIGURE') {
    return 'NEUTRAL';
  }
  return 'OUT';
}

/**
 * Filters movements by direction (IN = stock increase, OUT = stock decrease).
 */
export function filterMovementsByDirection(
  movements: ItemMovement[],
  direction: DirectionFilter
): ItemMovement[] {
  if (direction === 'all') return movements;
  if (direction === 'IN')
    return movements.filter(m => isStockIncrease(m.movementType));
  return movements.filter(m => isStockDecrease(m.movementType));
}

/**
 * Filters movements by subtype using MOVEMENT_SUBTYPE_CONFIG matchers.
 */
export function filterMovementsBySubtype(
  movements: ItemMovement[],
  subtype: SubtypeFilter
): ItemMovement[] {
  if (subtype === 'all') return movements;
  const config = MOVEMENT_SUBTYPE_CONFIG[subtype];
  if (!config) return movements;
  return movements.filter(config.match);
}

/**
 * Resolves a user-friendly subtype label for a movement.
 */
export function resolveSubtypeLabel(movement: ItemMovement): string {
  for (const config of Object.values(MOVEMENT_SUBTYPE_CONFIG)) {
    if (config.match(movement)) return config.label;
  }
  return movement.movementType;
}
