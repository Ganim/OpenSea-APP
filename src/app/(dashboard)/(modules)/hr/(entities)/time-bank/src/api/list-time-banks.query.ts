/**
 * OpenSea OS - List Time Banks Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { timeBankService } from '@/services/hr/time-bank.service';
import type { TimeBank } from '@/types/hr';
import { timeBankKeys, type TimeBankFilters } from './keys';

export type ListTimeBanksParams = TimeBankFilters;

export interface ListTimeBanksResponse {
  timeBanks: TimeBank[];
  total: number;
}

export type ListTimeBanksOptions = Omit<
  UseQueryOptions<ListTimeBanksResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListTimeBanks(
  params?: ListTimeBanksParams,
  options?: ListTimeBanksOptions
) {
  return useQuery({
    queryKey: timeBankKeys.list(params),

    queryFn: async (): Promise<ListTimeBanksResponse> => {
      const response = await timeBankService.list({
        employeeId: params?.employeeId,
        year: params?.year,
      });

      const timeBanks =
        (response as { timeBanks?: TimeBank[] }).timeBanks ?? [];

      return {
        timeBanks,
        total: timeBanks.length,
      };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListTimeBanks;
