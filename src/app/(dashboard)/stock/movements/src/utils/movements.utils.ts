import type { ItemMovement } from '@/types/stock';
import type { DateRangeFilter, MovementStats } from '../types/movements.types';

/**
 * Formats a date/string to Brazilian datetime string (DD/MM/YYYY HH:MM:SS)
 */
export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '-';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return parsedDate.toLocaleString('pt-BR');
}

/**
 * Formats a date/string to Brazilian date string (DD/MM/YYYY)
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return parsedDate.toLocaleDateString('pt-BR');
}

/**
 * Filters movements by date range relative to the current time
 */
export function filterMovementsByDateRange(
  movements: ItemMovement[],
  dateRange: DateRangeFilter
): ItemMovement[] {
  const now = new Date();

  if (dateRange === 'today') {
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    return movements.filter(m => new Date(m.createdAt) >= todayStart);
  }

  if (dateRange === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return movements.filter(m => new Date(m.createdAt) >= weekAgo);
  }

  if (dateRange === 'month') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return movements.filter(m => new Date(m.createdAt) >= monthAgo);
  }

  return movements;
}

/**
 * Filters movements by search query (matches itemId, batchNumber, notes)
 */
export function filterMovementsBySearch(
  movements: ItemMovement[],
  searchQuery: string
): ItemMovement[] {
  if (!searchQuery) return movements;

  const searchLower = searchQuery.toLowerCase();
  return movements.filter(
    m =>
      m.batchNumber?.toLowerCase().includes(searchLower) ||
      m.notes?.toLowerCase().includes(searchLower) ||
      m.itemId.toLowerCase().includes(searchLower)
  );
}

/**
 * Groups movements by their formatted creation date
 */
export function groupMovementsByDate(
  movements: ItemMovement[]
): Record<string, ItemMovement[]> {
  const groups: Record<string, ItemMovement[]> = {};

  movements.forEach(movement => {
    const date = formatDate(movement.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(movement);
  });

  return groups;
}

/**
 * Computes aggregated statistics from a list of movements
 */
export function computeMovementStats(movements: ItemMovement[]): MovementStats {
  const entries = movements.filter(m => m.movementType === 'ENTRY');
  const exits = movements.filter(m => m.movementType === 'EXIT');
  const transfers = movements.filter(m => m.movementType === 'TRANSFER');
  const adjustments = movements.filter(m => m.movementType === 'ADJUSTMENT');

  return {
    total: movements.length,
    entries: entries.length,
    exits: exits.length,
    transfers: transfers.length,
    adjustments: adjustments.length,
    totalEntryQty: entries.reduce((sum, m) => sum + m.quantity, 0),
    totalExitQty: exits.reduce((sum, m) => sum + m.quantity, 0),
  };
}
