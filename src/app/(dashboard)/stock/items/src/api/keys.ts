/**
 * OpenSea OS - Items Query Keys
 */

import type { ItemStatus, ItemMovementsQuery } from '@/types/stock';

export interface ItemFilters {
  variantId?: string;
  locationId?: string;
  status?: ItemStatus;
  search?: string;
}

export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (filters?: ItemFilters) =>
    [...itemKeys.lists(), filters ?? {}] as const,
  details: () => [...itemKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,

  // Related queries
  byVariant: (variantId: string) =>
    [...itemKeys.all, 'by-variant', variantId] as const,
  byLocation: (locationId: string) =>
    [...itemKeys.all, 'by-location', locationId] as const,
  movements: (itemId: string) =>
    [...itemKeys.detail(itemId), 'movements'] as const,
} as const;

export const movementKeys = {
  all: ['item-movements'] as const,
  lists: () => [...movementKeys.all, 'list'] as const,
  list: (query?: ItemMovementsQuery) =>
    [...movementKeys.lists(), query ?? {}] as const,
  byItem: (itemId: string) => [...movementKeys.all, 'by-item', itemId] as const,
} as const;

type ItemKeyFunctions = {
  [K in keyof typeof itemKeys]: (typeof itemKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof itemKeys)[K];
};

type MovementKeyFunctions = {
  [K in keyof typeof movementKeys]: (typeof movementKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof movementKeys)[K];
};

export type ItemQueryKey = ItemKeyFunctions[keyof ItemKeyFunctions];
export type MovementQueryKey = MovementKeyFunctions[keyof MovementKeyFunctions];

export default itemKeys;
