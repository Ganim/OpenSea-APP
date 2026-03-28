/**
 * OpenSea OS - List CIPA Mandates Query (Infinite Scroll)
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { cipaService } from '@/services/hr/cipa.service';
import type { CipaMandate } from '@/types/hr';
import { cipaKeys, type CipaMandateFilters } from './keys';

const PAGE_SIZE = 20;

export interface ListCipaMandatesPage {
  mandates: CipaMandate[];
  total: number;
  page: number;
  totalPages: number;
}

// Cache for the full dataset so subsequent pages don't re-fetch
let _cachedKey: string | null = null;
let _cachedMandates: CipaMandate[] | null = null;

export function useListCipaMandates(params?: CipaMandateFilters) {
  return useInfiniteQuery({
    queryKey: cipaKeys.mandateList(params),

    queryFn: async ({ pageParam = 1 }): Promise<ListCipaMandatesPage> => {
      const cacheKey = JSON.stringify(params ?? {});
      let allMandates: CipaMandate[];

      if (_cachedKey === cacheKey && _cachedMandates && pageParam > 1) {
        allMandates = _cachedMandates;
      } else {
        const response = await cipaService.listMandates({
          status: params?.status,
          perPage: 200,
        });

        allMandates =
          (response as { mandates?: CipaMandate[] }).mandates ?? [];

        _cachedKey = cacheKey;
        _cachedMandates = allMandates;
      }

      const total = allMandates.length;
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const start = (pageParam - 1) * PAGE_SIZE;
      const paginatedMandates = allMandates.slice(start, start + PAGE_SIZE);

      return {
        mandates: paginatedMandates,
        total,
        page: pageParam,
        totalPages,
      };
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },

    staleTime: 5 * 60 * 1000,
  });
}

export default useListCipaMandates;
