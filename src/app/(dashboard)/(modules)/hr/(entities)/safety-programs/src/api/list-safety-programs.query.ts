/**
 * OpenSea OS - List Safety Programs Query
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { safetyProgramsService } from '@/services/hr/safety-programs.service';
import type { SafetyProgram } from '@/types/hr';
import { safetyProgramKeys, type SafetyProgramFilters } from './keys';

export interface ListSafetyProgramsResponse {
  safetyPrograms: SafetyProgram[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export function useListSafetyPrograms(params?: SafetyProgramFilters) {
  return useInfiniteQuery<ListSafetyProgramsResponse>({
    queryKey: safetyProgramKeys.list(params),

    queryFn: async ({ pageParam }): Promise<ListSafetyProgramsResponse> => {
      const page = pageParam as number;
      const response = await safetyProgramsService.list({
        type: params?.type,
        status: params?.status,
        page,
        perPage: PAGE_SIZE,
      });

      const programs =
        (response as { safetyPrograms?: SafetyProgram[] }).safetyPrograms ?? [];

      return {
        safetyPrograms: programs,
        total: programs.length,
        page,
        perPage: PAGE_SIZE,
        hasMore: programs.length >= PAGE_SIZE,
      };
    },

    initialPageParam: 1,
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default useListSafetyPrograms;
