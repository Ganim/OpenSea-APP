/**
 * OpenSea OS - List Vacations Query (HR)
 *
 * Hook para listar períodos de férias com suporte a filtros, scroll infinito e cache.
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import type { VacationPeriod } from '@/types/hr';
import { vacationsApi } from './vacations.api';
import { vacationKeys, type VacationFilters } from './keys';

/* ===========================================
   TYPES
   =========================================== */

export type ListVacationsParams = VacationFilters;

export interface ListVacationsResponse {
  vacationPeriods: VacationPeriod[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

/* ===========================================
   QUERY HOOK
   =========================================== */

export function useListVacations(params?: ListVacationsParams) {
  return useInfiniteQuery<ListVacationsResponse>({
    queryKey: vacationKeys.list(params),

    queryFn: async ({ pageParam }): Promise<ListVacationsResponse> => {
      const page = pageParam as number;
      const response = await vacationsApi.list({
        ...params,
        page,
        perPage: PAGE_SIZE,
      });

      const total = response.meta?.total ?? 0;
      const totalPages = response.meta?.totalPages ?? 1;

      return {
        vacationPeriods: response.vacationPeriods ?? [],
        total,
        page: response.meta?.page ?? page,
        perPage: response.meta?.perPage ?? PAGE_SIZE,
        totalPages,
      };
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,

    staleTime: 2 * 60 * 1000,
  });
}

export default useListVacations;
