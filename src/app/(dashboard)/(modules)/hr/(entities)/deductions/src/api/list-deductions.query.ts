/**
 * OpenSea OS - List Deductions Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { deductionsService } from '@/services/hr/deductions.service';
import type { Deduction } from '@/types/hr';
import { deductionKeys, type DeductionFilters } from './keys';

export type ListDeductionsParams = DeductionFilters;

export interface ListDeductionsResponse {
  deductions: Deduction[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export type ListDeductionsOptions = Omit<
  UseQueryOptions<ListDeductionsResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListDeductions(
  params?: ListDeductionsParams,
  options?: ListDeductionsOptions
) {
  return useQuery({
    queryKey: deductionKeys.list(params),

    queryFn: async (): Promise<ListDeductionsResponse> => {
      const response = await deductionsService.list({
        employeeId: params?.employeeId,
        isApplied: params?.isApplied,
        isRecurring: params?.isRecurring,
        startDate: params?.startDate,
        endDate: params?.endDate,
        page: params?.page,
        perPage: params?.perPage ?? 100,
      });

      const deductions =
        (response as { deductions?: Deduction[] }).deductions ?? [];
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 100;

      return {
        deductions,
        total: deductions.length,
        page,
        perPage,
        hasMore: deductions.length >= perPage,
      };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListDeductions;
