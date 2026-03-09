/**
 * OpenSea OS - List Vacations Query (HR)
 *
 * Hook para listar períodos de férias com suporte a filtros, paginação e cache.
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
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
  hasMore: boolean;
}

export type ListVacationsOptions = Omit<
  UseQueryOptions<ListVacationsResponse, Error>,
  'queryKey' | 'queryFn'
>;

/* ===========================================
   QUERY HOOK
   =========================================== */

export function useListVacations(
  params?: ListVacationsParams,
  options?: ListVacationsOptions
) {
  return useQuery({
    queryKey: vacationKeys.list(params),

    queryFn: async (): Promise<ListVacationsResponse> => {
      const response = await vacationsApi.list(params);

      const total = response.meta?.total ?? 0;
      const page = response.meta?.page ?? 1;
      const perPage = response.meta?.perPage ?? 20;
      const totalPages = response.meta?.totalPages ?? 1;

      return {
        vacationPeriods: response.vacationPeriods ?? [],
        total,
        page,
        perPage,
        hasMore: page < totalPages,
      };
    },

    staleTime: 2 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListVacations;
