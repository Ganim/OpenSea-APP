/**
 * OpenSea OS - List Deductions Query
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { deductionsService } from '@/services/hr/deductions.service';
import type { Deduction } from '@/types/hr';
import { deductionKeys, type DeductionFilters } from './keys';

export type ListDeductionsParams = DeductionFilters;

export interface ListDeductionsResponse {
  deductions: Deduction[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export function useListDeductions(params?: ListDeductionsParams) {
  return useInfiniteQuery<ListDeductionsResponse>({
    queryKey: deductionKeys.list(params),

    queryFn: async ({ pageParam }): Promise<ListDeductionsResponse> => {
      const page = pageParam as number;
      const response = await deductionsService.list({
        employeeId: params?.employeeId,
        isApplied: params?.isApplied,
        isRecurring: params?.isRecurring,
        startDate: params?.startDate,
        endDate: params?.endDate,
        page,
        perPage: PAGE_SIZE,
      });

      const deductions =
        (response as { deductions?: Deduction[] }).deductions ?? [];
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
      const total = meta?.total ?? deductions.length;
      const totalPages =
        meta?.totalPages ?? (deductions.length < PAGE_SIZE ? page : page + 1);

      return {
        deductions,
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

export default useListDeductions;
