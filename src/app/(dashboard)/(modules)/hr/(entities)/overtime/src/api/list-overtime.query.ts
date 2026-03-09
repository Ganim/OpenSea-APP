/**
 * OpenSea OS - List Overtime Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { overtimeService } from '@/services/hr/overtime.service';
import type { Overtime } from '@/types/hr';
import { overtimeKeys, type OvertimeFilters } from './keys';

export type ListOvertimeParams = OvertimeFilters;

export interface ListOvertimeResponse {
  overtime: Overtime[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export type ListOvertimeOptions = Omit<
  UseQueryOptions<ListOvertimeResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListOvertime(
  params?: ListOvertimeParams,
  options?: ListOvertimeOptions
) {
  return useQuery({
    queryKey: overtimeKeys.list(params),
    queryFn: async (): Promise<ListOvertimeResponse> => {
      const response = await overtimeService.list({
        employeeId: params?.employeeId,
        startDate: params?.startDate,
        endDate: params?.endDate,
        approved: params?.approved,
        page: params?.page,
        perPage: params?.perPage ?? 100,
      });

      const overtime = (response as { overtime?: Overtime[] }).overtime ?? [];
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 100;

      return {
        overtime,
        total: overtime.length,
        page,
        perPage,
        hasMore: overtime.length >= perPage,
      };
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}
