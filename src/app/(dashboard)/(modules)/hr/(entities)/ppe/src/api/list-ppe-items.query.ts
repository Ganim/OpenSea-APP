/**
 * List PPE Items Query (Infinite Scroll)
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { ppeService } from '@/services/hr/ppe.service';
import type { PPEItem } from '@/types/hr';
import { ppeKeys, type PPEItemFilters } from './keys';

export interface ListPPEItemsResponse {
  ppeItems: PPEItem[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export function useListPPEItems(params?: PPEItemFilters) {
  return useInfiniteQuery<ListPPEItemsResponse>({
    queryKey: ppeKeys.itemList(params),

    queryFn: async ({ pageParam }): Promise<ListPPEItemsResponse> => {
      const page = pageParam as number;
      const response = await ppeService.listItems({
        category: params?.category,
        isActive: params?.isActive,
        lowStockOnly: params?.lowStockOnly,
        search: params?.search,
        page,
        perPage: PAGE_SIZE,
      });

      const items = response.ppeItems;

      return {
        ppeItems: items,
        total: response.total,
        page,
        perPage: PAGE_SIZE,
        hasMore: items.length >= PAGE_SIZE,
      };
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default useListPPEItems;
