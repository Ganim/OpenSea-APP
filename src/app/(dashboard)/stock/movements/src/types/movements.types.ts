import type { MovementType } from '@/types/stock';
import type { LucideIcon } from 'lucide-react';

/**
 * Configuration for a specific movement type
 * Used to display type-specific styling and icons
 */
export interface MovementTypeConfig {
  label: string;
  icon: LucideIcon;
  className: string;
  bgClass: string;
}

/**
 * Option for movement type filter dropdown
 */
export interface MovementTypeOption {
  value: MovementType | 'all';
  label: string;
}

/**
 * Date range filter options
 */
export type DateRangeFilter = 'today' | 'week' | 'month' | 'all';

/**
 * Aggregated statistics for filtered movements
 */
export interface MovementStats {
  total: number;
  entries: number;
  exits: number;
  transfers: number;
  adjustments: number;
  totalEntryQty: number;
  totalExitQty: number;
}
