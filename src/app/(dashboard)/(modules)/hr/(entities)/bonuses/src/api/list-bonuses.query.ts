/**
 * OpenSea OS - List Bonuses Query
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { bonusesService } from '@/services/hr/bonuses.service';
import type { Bonus } from '@/types/hr';
import { bonusKeys, type BonusFilters } from './keys';

export type ListBonusesParams = BonusFilters;

export interface ListBonusesResponse {
  bonuses: Bonus[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export function useListBonuses(params?: ListBonusesParams) {
  return useInfiniteQuery<ListBonusesResponse>({
    queryKey: bonusKeys.list(params),

    queryFn: async ({ pageParam }): Promise<ListBonusesResponse> => {
      const page = pageParam as number;
      const response = await bonusesService.list({
        employeeId: params?.employeeId,
        isPaid: params?.isPaid,
        startDate: params?.startDate,
        endDate: params?.endDate,
        page,
        perPage: PAGE_SIZE,
      });

      const bonuses = (response as { bonuses?: Bonus[] }).bonuses ?? [];
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
      const total = meta?.total ?? bonuses.length;
      const totalPages =
        meta?.totalPages ?? (bonuses.length < PAGE_SIZE ? page : page + 1);

      return {
        bonuses,
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

export default useListBonuses;
