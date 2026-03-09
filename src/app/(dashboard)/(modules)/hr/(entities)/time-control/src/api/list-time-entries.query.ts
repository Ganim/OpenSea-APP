import type { TimeEntriesResponse } from '@/services/hr/time-control.service';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { timeControlApi } from './time-control.api';
import { timeEntryKeys, type TimeEntryFilters } from './keys';

export type ListTimeEntriesParams = TimeEntryFilters;
export type ListTimeEntriesResponse = TimeEntriesResponse;

export type ListTimeEntriesOptions = Omit<
  UseQueryOptions<ListTimeEntriesResponse>,
  'queryKey' | 'queryFn'
>;

export function useListTimeEntries(
  params?: ListTimeEntriesParams,
  options?: ListTimeEntriesOptions
) {
  return useQuery<ListTimeEntriesResponse>({
    queryKey: timeEntryKeys.list(params),
    queryFn: () => timeControlApi.list(params),
    staleTime: 1000 * 60 * 2,
    ...options,
  });
}
