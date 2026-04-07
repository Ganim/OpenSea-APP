/**
 * OpenSea OS - List Offboarding Checklists Query (Infinite Scroll)
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { offboardingService } from '@/services/hr/offboarding.service';
import { offboardingKeys, type OffboardingFilters } from './keys';

const PAGE_SIZE = 20;

export function useListOffboardingChecklists(filters?: OffboardingFilters) {
  return useInfiniteQuery({
    queryKey: offboardingKeys.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await offboardingService.listChecklists({
          page: pageParam,
          perPage: filters?.perPage ?? PAGE_SIZE,
          employeeId: filters?.employeeId,
          status: filters?.status,
          search: filters?.search,
        });

        return {
          checklists: response.checklists,
          meta: response.meta,
        };
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        // 403 = permission not assigned, 404 = no data — return empty list gracefully
        if (status === 403 || status === 404) {
          return {
            checklists: [],
            meta: {
              page: pageParam,
              perPage: PAGE_SIZE,
              total: 0,
              totalPages: 0,
            },
          };
        }
        throw err;
      }
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    staleTime: 30_000,
  });
}
