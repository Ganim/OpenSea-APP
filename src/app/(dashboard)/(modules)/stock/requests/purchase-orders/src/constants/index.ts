import type { PurchaseOrderStatus } from '@/types/stock';

/**
 * Purchase Order status visual configuration
 */
export const STATUS_CONFIG: Record<
  PurchaseOrderStatus,
  { label: string; className: string; bgClass: string }
> = {
  PENDING: {
    label: 'Pendente',
    className: 'text-amber-600',
    bgClass:
      'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  },
  CONFIRMED: {
    label: 'Confirmado',
    className: 'text-blue-600',
    bgClass:
      'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  },
  RECEIVED: {
    label: 'Recebido',
    className: 'text-green-600',
    bgClass:
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  },
  CANCELLED: {
    label: 'Cancelado',
    className: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  },
};

/**
 * Purchase Order status dropdown options
 */
export const STATUS_OPTIONS: {
  value: PurchaseOrderStatus | 'all';
  label: string;
}[] = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'RECEIVED', label: 'Recebido' },
  { value: 'CANCELLED', label: 'Cancelado' },
];
