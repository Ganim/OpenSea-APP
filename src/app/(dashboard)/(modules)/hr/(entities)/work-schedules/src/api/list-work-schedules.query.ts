/**
 * OpenSea OS - List Work Schedules Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { workSchedulesService } from '@/services/hr/work-schedules.service';
import type { WorkSchedule } from '@/types/hr';
import { workScheduleKeys, type WorkScheduleFilters } from './keys';

export type ListWorkSchedulesParams = WorkScheduleFilters;

export interface ListWorkSchedulesResponse {
  workSchedules: WorkSchedule[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export type ListWorkSchedulesOptions = Omit<
  UseQueryOptions<ListWorkSchedulesResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListWorkSchedules(
  params?: ListWorkSchedulesParams,
  options?: ListWorkSchedulesOptions
) {
  return useQuery({
    queryKey: workScheduleKeys.list(params),

    queryFn: async (): Promise<ListWorkSchedulesResponse> => {
      const response = await workSchedulesService.listWorkSchedules({
        page: params?.page,
        perPage: params?.perPage ?? 100,
        activeOnly: params?.activeOnly,
      });

      const workSchedules =
        (response as { workSchedules?: WorkSchedule[] }).workSchedules ?? [];
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 100;

      return {
        workSchedules,
        total: workSchedules.length,
        page,
        perPage,
        hasMore: workSchedules.length >= perPage,
      };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListWorkSchedules;
