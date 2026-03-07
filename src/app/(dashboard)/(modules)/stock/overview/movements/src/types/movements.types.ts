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
 * Direction filter values
 */
export type DirectionFilter = 'all' | 'IN' | 'OUT';

/**
 * Subtype filter values (keys from MOVEMENT_SUBTYPE_CONFIG)
 */
export type SubtypeFilter =
  | 'all'
  | 'PURCHASE'
  | 'CUSTOMER_RETURN'
  | 'SALE'
  | 'PRODUCTION'
  | 'SAMPLE'
  | 'LOSS'
  | 'SUPPLIER_RETURN'
  | 'TRANSFER'
  | 'INVENTORY_ADJUSTMENT'
  | 'ZONE_RECONFIGURE';
