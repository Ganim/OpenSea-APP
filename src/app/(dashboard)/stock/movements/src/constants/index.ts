import {
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  Box,
  RotateCcw,
} from 'lucide-react';

import type { MovementType } from '@/types/stock';
import type {
  MovementTypeConfig,
  MovementTypeOption,
} from '../types/movements.types';

/**
 * Visual configuration for each movement type
 * Maps movement types to their display properties (label, icon, colors)
 */
export const MOVEMENT_CONFIG: Record<MovementType, MovementTypeConfig> = {
  ENTRY: {
    label: 'Entrada',
    icon: ArrowDownToLine,
    className: 'text-green-600',
    bgClass:
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  },
  EXIT: {
    label: 'Saida',
    icon: ArrowUpFromLine,
    className: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  },
  TRANSFER: {
    label: 'Transferencia',
    icon: ArrowRightLeft,
    className: 'text-blue-600',
    bgClass:
      'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  },
  ADJUSTMENT: {
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
 * Options for the movement type filter dropdown
 */
export const MOVEMENT_TYPE_OPTIONS: MovementTypeOption[] = [
  { value: 'all', label: 'Todos os Tipos' },
  { value: 'ENTRY', label: 'Entradas' },
  { value: 'EXIT', label: 'Saidas' },
  { value: 'TRANSFER', label: 'Transferencias' },
  { value: 'ADJUSTMENT', label: 'Ajustes' },
  { value: 'ZONE_RECONFIGURE', label: 'Reconfigurações' },
];
