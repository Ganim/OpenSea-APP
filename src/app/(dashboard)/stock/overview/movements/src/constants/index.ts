import {
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  Box,
  HelpCircle,
  Repeat2,
  RotateCcw,
} from 'lucide-react';

import type { ItemMovement, MovementType } from '@/types/stock';
import type { MovementTypeConfig } from '../types/movements.types';

/**
 * Visual configuration for each movement type
 * Maps movement types to their display properties (label, icon, colors)
 */
export const MOVEMENT_CONFIG: Record<MovementType, MovementTypeConfig> = {
  PURCHASE: {
    label: 'Compra',
    icon: ArrowDownToLine,
    className: 'text-green-600',
    bgClass:
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  },
  CUSTOMER_RETURN: {
    label: 'Devolução (Cliente)',
    icon: ArrowDownToLine,
    className: 'text-green-600',
    bgClass:
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  },
  SALE: {
    label: 'Venda',
    icon: ArrowUpFromLine,
    className: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  },
  PRODUCTION: {
    label: 'Utilização',
    icon: ArrowUpFromLine,
    className: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  },
  SAMPLE: {
    label: 'Amostra',
    icon: ArrowUpFromLine,
    className: 'text-gray-600',
    bgClass:
      'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
  },
  LOSS: {
    label: 'Perda',
    icon: ArrowUpFromLine,
    className: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  },
  SUPPLIER_RETURN: {
    label: 'Devolução (Fornecedor)',
    icon: ArrowUpFromLine,
    className: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  },
  TRANSFER: {
    label: 'Transferência',
    icon: ArrowRightLeft,
    className: 'text-blue-600',
    bgClass:
      'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  },
  INVENTORY_ADJUSTMENT: {
    label: 'Ajuste',
    icon: Box,
    className: 'text-orange-600',
    bgClass:
      'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  },
  ZONE_RECONFIGURE: {
    label: 'Reconfiguração',
    icon: RotateCcw,
    className: 'text-purple-600',
    bgClass:
      'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  },
};

/**
 * Fallback config for unknown movement types
 */
export const MOVEMENT_CONFIG_FALLBACK: MovementTypeConfig = {
  label: 'Outro',
  icon: HelpCircle,
  className: 'text-gray-600',
  bgClass:
    'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
};

/**
 * User-friendly subtype mapping for movement filters.
 * Each subtype matches directly by movementType.
 */
export const MOVEMENT_SUBTYPE_CONFIG: Record<
  string,
  { label: string; match: (m: ItemMovement) => boolean }
> = {
  PURCHASE: {
    label: 'Compra',
    match: m => m.movementType === 'PURCHASE',
  },
  CUSTOMER_RETURN: {
    label: 'Devolução (Cliente)',
    match: m => m.movementType === 'CUSTOMER_RETURN',
  },
  SALE: {
    label: 'Venda',
    match: m => m.movementType === 'SALE',
  },
  PRODUCTION: {
    label: 'Utilização',
    match: m => m.movementType === 'PRODUCTION',
  },
  SAMPLE: {
    label: 'Amostra',
    match: m => m.movementType === 'SAMPLE',
  },
  LOSS: {
    label: 'Perda',
    match: m => m.movementType === 'LOSS',
  },
  SUPPLIER_RETURN: {
    label: 'Devolução (Fornecedor)',
    match: m => m.movementType === 'SUPPLIER_RETURN',
  },
  TRANSFER: {
    label: 'Transferência',
    match: m => m.movementType === 'TRANSFER',
  },
  INVENTORY_ADJUSTMENT: {
    label: 'Ajuste',
    match: m => m.movementType === 'INVENTORY_ADJUSTMENT',
  },
  ZONE_RECONFIGURE: {
    label: 'Reconfiguração',
    match: m => m.movementType === 'ZONE_RECONFIGURE',
  },
};

/**
 * Direction config for IN/OUT display
 */
export const DIRECTION_CONFIG = {
  IN: {
    label: 'Entrada',
    icon: ArrowDownToLine,
    className:
      'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30',
  },
  OUT: {
    label: 'Saída',
    icon: ArrowUpFromLine,
    className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
  },
  NEUTRAL: {
    label: 'Neutro',
    icon: Repeat2,
    className:
      'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  },
} as const;
