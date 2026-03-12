/**
 * OpenSea OS - List Bonuses Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { bonusesService } from '@/services/hr/bonuses.service';
import type { Bonus } from '@/types/hr';
import { bonusKeys, type BonusFilters } from './keys';

export type ListBonusesParams = BonusFilters;

export interface ListBonusesResponse {
  bonuses: Bonus[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export type ListBonusesOptions = Omit<
  UseQueryOptions<ListBonusesResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListBonuses(
  params?: ListBonusesParams,
  options?: ListBonusesOptions
) {
  return useQuery({
    queryKey: bonusKeys.list(params),

    queryFn: async (): Promise<ListBonusesResponse> => {
      const response = await bonusesService.list({
        employeeId: params?.employeeId,
        isPaid: params?.isPaid,
        startDate: params?.startDate,
        endDate: params?.endDate,
        page: params?.page,
        perPage: params?.perPage ?? 100,
      });

      const bonuses = (response as { bonuses?: Bonus[] }).bonuses ?? [];
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 100;

      return {
        bonuses,
        total: bonuses.length,
        page,
        perPage,
        hasMore: bonuses.length >= perPage,
      };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListBonuses;
