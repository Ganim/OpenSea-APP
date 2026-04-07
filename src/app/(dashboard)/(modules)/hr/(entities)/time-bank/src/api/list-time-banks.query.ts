/**
 * OpenSea OS - List Time Banks Query
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { timeBankService } from '@/services/hr/time-bank.service';
import type { TimeBank } from '@/types/hr';
import { timeBankKeys, type TimeBankFilters } from './keys';

export type ListTimeBanksParams = TimeBankFilters;

export interface ListTimeBanksResponse {
  timeBanks: TimeBank[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export function useListTimeBanks(params?: ListTimeBanksParams) {
  return useInfiniteQuery<ListTimeBanksResponse>({
    queryKey: timeBankKeys.list(params),

    queryFn: async ({ pageParam }): Promise<ListTimeBanksResponse> => {
      const page = pageParam as number;
      const response = await timeBankService.list({
        employeeId: params?.employeeId,
        year: params?.year,
      });

      const allTimeBanks =
        (response as { timeBanks?: TimeBank[] }).timeBanks ?? [];

      // Client-side pagination since API doesn't support it
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const timeBanks = allTimeBanks.slice(start, end);

      return {
        timeBanks,
        total: allTimeBanks.length,
        page,
        perPage: PAGE_SIZE,
        hasMore: end < allTimeBanks.length,
      };
    },

    initialPageParam: 1,
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default useListTimeBanks;
