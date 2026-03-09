/**
 * OpenSea OS - List Absences Query (HR)
 *
 * Hook para listar ausências com suporte a filtros, paginação e cache.
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
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

export type ListAbsencesOptions = Omit<
  UseQueryOptions<ListAbsencesResponse, Error>,
  'queryKey' | 'queryFn'
>;

/* ===========================================
   QUERY HOOK
   =========================================== */

export function useListAbsences(
  params?: ListAbsencesParams,
  options?: ListAbsencesOptions
) {
  return useQuery({
    queryKey: absenceKeys.list(params),

    queryFn: async (): Promise<ListAbsencesResponse> => {
      const response = await absencesApi.list(params);

      return {
        absences: response.absences ?? [],
        total: response.meta?.total ?? 0,
        page: response.meta?.page ?? 1,
        perPage: response.meta?.perPage ?? 20,
        totalPages: response.meta?.totalPages ?? 1,
      };
    },

    staleTime: 2 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListAbsences;
