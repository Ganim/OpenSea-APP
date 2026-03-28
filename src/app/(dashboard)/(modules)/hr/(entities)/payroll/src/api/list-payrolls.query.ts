/**
 * OpenSea OS - List Payrolls Query
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { payrollService } from '@/services/hr/payroll.service';
import type { Payroll } from '@/types/hr';
import { payrollKeys, type PayrollFilters } from './keys';

export type ListPayrollsParams = PayrollFilters;

export interface ListPayrollsResponse {
  payrolls: Payroll[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export function useListPayrolls(params?: ListPayrollsParams) {
  return useInfiniteQuery<ListPayrollsResponse>({
    queryKey: payrollKeys.list(params),

    queryFn: async ({ pageParam }): Promise<ListPayrollsResponse> => {
      const page = pageParam as number;
      const response = await payrollService.list({
        referenceMonth: params?.referenceMonth,
        referenceYear: params?.referenceYear,
        status: params?.status,
        page,
        perPage: PAGE_SIZE,
      });

      const payrolls = (response as { payrolls?: Payroll[] }).payrolls ?? [];
      const meta = (response as { meta?: { total?: number; page?: number; perPage?: number; totalPages?: number } }).meta;
      const total = meta?.total ?? payrolls.length;
      const totalPages = meta?.totalPages ?? (payrolls.length < PAGE_SIZE ? page : page + 1);

      return {
        payrolls,
        total,
        page,
        perPage: PAGE_SIZE,
        totalPages,
      };
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,

    staleTime: 5 * 60 * 1000,
  });
}

export default useListPayrolls;
