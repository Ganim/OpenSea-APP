/**
 * OpenSea OS - List Terminations Query
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { terminationsService } from '@/services/hr/terminations.service';
import type { Termination } from '@/types/hr';
import { terminationKeys, type TerminationFilters } from './keys';

export interface ListTerminationsResponse {
  terminations: Termination[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export function useListTerminations(params?: TerminationFilters) {
  return useInfiniteQuery<ListTerminationsResponse>({
    queryKey: terminationKeys.list(params),

    queryFn: async ({ pageParam }): Promise<ListTerminationsResponse> => {
      const page = pageParam as number;
      const response = await terminationsService.list({
        employeeId: params?.employeeId,
        type: params?.type,
        status: params?.status,
        startDate: params?.startDate,
        endDate: params?.endDate,
        page,
        perPage: PAGE_SIZE,
      });

      const items =
        (response as { terminations?: Termination[] }).terminations ?? [];

      return {
        terminations: items,
        total: items.length,
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

export default useListTerminations;
