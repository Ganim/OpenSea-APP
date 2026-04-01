/**
 * OpenSea OS - List Objectives Query (HR)
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import type { OKRObjective } from '@/types/hr';
import { okrsApi } from './okrs.api';
import { okrKeys, type OkrFilters } from './keys';

export type ListObjectivesParams = OkrFilters;

export interface ListObjectivesResponse {
  objectives: OKRObjective[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export function useListObjectives(params?: ListObjectivesParams) {
  return useInfiniteQuery<ListObjectivesResponse>({
    queryKey: okrKeys.list(params),

    queryFn: async ({ pageParam }): Promise<ListObjectivesResponse> => {
      const page = pageParam as number;
      const response = await okrsApi.list({
        ...params,
        page,
        perPage: PAGE_SIZE,
      });

      return {
        objectives: response.objectives ?? [],
        total: response.meta?.total ?? 0,
        page: response.meta?.page ?? page,
        perPage: response.meta?.perPage ?? PAGE_SIZE,
        totalPages: response.meta?.totalPages ?? 1,
      };
    },

    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,

    staleTime: 2 * 60 * 1000,
  });
}

export default useListObjectives;
