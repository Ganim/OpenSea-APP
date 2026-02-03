/**
 * OpenSea OS - Get Item Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  itemsService,
  itemMovementsService,
} from '@/services/stock/items.service';
import type { Item, ItemMovement } from '@/types/stock';
import { itemKeys, movementKeys } from './keys';

export type GetItemOptions = Omit<
  UseQueryOptions<Item, Error>,
  'queryKey' | 'queryFn'
>;

export function useGetItem(id: string, options?: GetItemOptions) {
  return useQuery({
    queryKey: itemKeys.detail(id),

    queryFn: async (): Promise<Item> => {
      const response = await itemsService.getItem(id);
      return response.item;
    },

    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/* ===========================================
   ITEM MOVEMENTS QUERY
   =========================================== */

export interface ItemMovementsResponse {
  movements: ItemMovement[];
  total: number;
}

export type ListItemMovementsOptions = Omit<
  UseQueryOptions<ItemMovementsResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useItemMovements(
  itemId: string,
  options?: ListItemMovementsOptions
) {
  return useQuery({
    queryKey: movementKeys.byItem(itemId),

    queryFn: async (): Promise<ItemMovementsResponse> => {
      const response = await itemMovementsService.listMovements({ itemId });
      return {
        movements: response.movements ?? [],
        total: response.movements?.length ?? 0,
      };
    },

    enabled: !!itemId,
    staleTime: 1 * 60 * 1000, // Movements should refresh more often
    ...options,
  });
}

export default useGetItem;
