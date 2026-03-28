/**
 * OpenSea OS - List Admissions Query
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { admissionsService } from '@/services/hr/admissions.service';
import type { AdmissionInvite } from '@/types/hr';
import { admissionKeys, type AdmissionFilters } from './keys';

export interface ListAdmissionsResponse {
  admissions: AdmissionInvite[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export function useListAdmissions(params?: AdmissionFilters) {
  return useInfiniteQuery<ListAdmissionsResponse>({
    queryKey: admissionKeys.list(params),

    queryFn: async ({ pageParam }): Promise<ListAdmissionsResponse> => {
      const page = pageParam as number;
      const response = await admissionsService.list({
        status: params?.status,
        search: params?.search,
        page,
        perPage: PAGE_SIZE,
      });

      const items =
        (response as { admissions?: AdmissionInvite[] }).admissions ?? [];

      return {
        admissions: items,
        total: items.length,
        page,
        perPage: PAGE_SIZE,
        hasMore: items.length >= PAGE_SIZE,
      };
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default useListAdmissions;
