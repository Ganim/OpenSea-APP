/**
 * OpenSea OS - List Absences Query (HR)
 *
 * Hook para listar ausências com suporte a filtros, scroll infinito e cache.
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import type { Absence } from '@/types/hr';
import { absencesApi } from './absences.api';
import { absenceKeys, type AbsenceFilters } from './keys';

/* ===========================================
   TYPES
   =========================================== */

export type ListAbsencesParams = AbsenceFilters;

export interface ListAbsencesResponse {
  absences: Absence[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

/* ===========================================
   QUERY HOOK
   =========================================== */

export function useListAbsences(params?: ListAbsencesParams) {
  return useInfiniteQuery<ListAbsencesResponse>({
    queryKey: absenceKeys.list(params),

    queryFn: async ({ pageParam }): Promise<ListAbsencesResponse> => {
      const page = pageParam as number;
      const response = await absencesApi.list({
        ...params,
        page,
        perPage: PAGE_SIZE,
      });

      return {
        absences: response.absences ?? [],
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

export default useListAbsences;
