/**
 * OpenSea OS - List Safety Programs Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
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

export type ListSafetyProgramsOptions = Omit<
  UseQueryOptions<ListSafetyProgramsResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListSafetyPrograms(
  params?: SafetyProgramFilters,
  options?: ListSafetyProgramsOptions
) {
  return useQuery({
    queryKey: safetyProgramKeys.list(params),

    queryFn: async (): Promise<ListSafetyProgramsResponse> => {
      const response = await safetyProgramsService.list({
        type: params?.type,
        status: params?.status,
        page: params?.page,
        perPage: params?.perPage ?? 100,
      });

      const programs =
        (response as { safetyPrograms?: SafetyProgram[] }).safetyPrograms ?? [];
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 100;

      return {
        safetyPrograms: programs,
        total: programs.length,
        page,
        perPage,
        hasMore: programs.length >= perPage,
      };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListSafetyPrograms;
