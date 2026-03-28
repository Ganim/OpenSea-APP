import type { TimeEntriesResponse } from '@/services/hr/time-control.service';
import { useInfiniteQuery } from '@tanstack/react-query';
import { timeControlApi } from './time-control.api';
import { timeEntryKeys, type TimeEntryFilters } from './keys';

export type ListTimeEntriesParams = TimeEntryFilters;
export type ListTimeEntriesResponse = TimeEntriesResponse;

const PAGE_SIZE = 20;

export function useListTimeEntries(params?: ListTimeEntriesParams) {
  return useInfiniteQuery<ListTimeEntriesResponse>({
    queryKey: timeEntryKeys.list(params),
    queryFn: ({ pageParam }) =>
      timeControlApi.list({ ...params, page: pageParam as number, perPage: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = lastPage.page ?? 1;
      const totalPages = lastPage.totalPages ?? 1;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
}
