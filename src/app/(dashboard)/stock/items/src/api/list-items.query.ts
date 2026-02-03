/**
 * OpenSea OS - List Items Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { itemsService } from '@/services/stock/items.service';
import type { Item } from '@/types/stock';
import { itemKeys, type ItemFilters } from './keys';

export type ListItemsParams = ItemFilters;

export interface ListItemsResponse {
  items: Item[];
  total: number;
}

export type ListItemsOptions = Omit<
  UseQueryOptions<ListItemsResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListItems(
  params?: ListItemsParams,
  options?: ListItemsOptions
) {
  return useQuery({
    queryKey: itemKeys.list(params),

    queryFn: async (): Promise<ListItemsResponse> => {
      const response = await itemsService.listItems(params?.variantId);

      let items = response.items ?? [];

      // Filter by status if provided
      if (params?.status) {
        items = items.filter(i => i.status === params.status);
      }

      // Filter by locationId if provided
      if (params?.locationId) {
        items = items.filter(i => i.locationId === params.locationId);
      }

      // Filter by search if provided
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        items = items.filter(
          i =>
            i.uniqueCode?.toLowerCase().includes(searchLower) ||
            i.batchNumber?.toLowerCase().includes(searchLower)
        );
      }

      return {
        items,
        total: items.length,
      };
    },

    staleTime: 2 * 60 * 1000, // Items podem mudar mais frequentemente
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListItems;
