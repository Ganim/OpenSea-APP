/**
 * OpenSea OS - List Payrolls Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { payrollService } from '@/services/hr/payroll.service';
import type { Payroll } from '@/types/hr';
import { payrollKeys, type PayrollFilters } from './keys';

export type ListPayrollsParams = PayrollFilters;

export interface ListPayrollsResponse {
  payrolls: Payroll[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export type ListPayrollsOptions = Omit<
  UseQueryOptions<ListPayrollsResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListPayrolls(
  params?: ListPayrollsParams,
  options?: ListPayrollsOptions
) {
  return useQuery({
    queryKey: payrollKeys.list(params),

    queryFn: async (): Promise<ListPayrollsResponse> => {
      const response = await payrollService.list({
        referenceMonth: params?.referenceMonth,
        referenceYear: params?.referenceYear,
        status: params?.status,
        page: params?.page,
        perPage: params?.perPage ?? 100,
      });

      const payrolls = (response as { payrolls?: Payroll[] }).payrolls ?? [];
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 100;

      return {
        payrolls,
        total: payrolls.length,
        page,
        perPage,
        hasMore: payrolls.length >= perPage,
      };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListPayrolls;
