/**
 * OpenSea OS - List Overtime Query
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { overtimeService } from '@/services/hr/overtime.service';
import type { Overtime } from '@/types/hr';
import { overtimeKeys, type OvertimeFilters } from './keys';

export type ListOvertimeParams = OvertimeFilters;

export interface ListOvertimeResponse {
  overtime: Overtime[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export function useListOvertime(params?: ListOvertimeParams) {
  return useInfiniteQuery<ListOvertimeResponse>({
    queryKey: overtimeKeys.list(params),

    queryFn: async ({ pageParam }): Promise<ListOvertimeResponse> => {
      const page = pageParam as number;
      const response = await overtimeService.list({
        employeeId: params?.employeeId,
        startDate: params?.startDate,
        endDate: params?.endDate,
        approved: params?.approved,
        page,
        perPage: PAGE_SIZE,
      });

      const overtime = (response as { overtime?: Overtime[] }).overtime ?? [];
      const meta = (
        response as {
          meta?: {
            total?: number;
            page?: number;
            perPage?: number;
            totalPages?: number;
          };
        }
      ).meta;
      const total = meta?.total ?? overtime.length;
      const totalPages =
        meta?.totalPages ?? (overtime.length < PAGE_SIZE ? page : page + 1);

      return {
        overtime,
        total,
        page,
        perPage: PAGE_SIZE,
        totalPages,
      };
    },

    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,

    staleTime: 5 * 60 * 1000,
  });
}
