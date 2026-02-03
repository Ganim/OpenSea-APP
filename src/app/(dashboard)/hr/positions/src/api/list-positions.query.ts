/**
 * OpenSea OS - List Positions Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { positionsService } from '@/services/hr/positions.service';
import type { Position } from '@/types/hr';
import { positionKeys, type PositionFilters } from './keys';

export type ListPositionsParams = PositionFilters;

export interface ListPositionsResponse {
  positions: Position[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export type ListPositionsOptions = Omit<
  UseQueryOptions<ListPositionsResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListPositions(
  params?: ListPositionsParams,
  options?: ListPositionsOptions
) {
  return useQuery({
    queryKey: positionKeys.list(params),

    queryFn: async (): Promise<ListPositionsResponse> => {
      const response = await positionsService.listPositions({
        page: params?.page,
        perPage: params?.perPage ?? 100,
        search: params?.search,
        departmentId: params?.departmentId,
        companyId: params?.companyId,
        isActive: params?.isActive,
        includeDeleted: params?.includeDeleted ?? false,
      });

      const positions =
        (response as { positions?: Position[] }).positions ?? [];
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 100;

      return {
        positions: params?.includeDeleted
          ? positions
          : positions.filter(p => !p.deletedAt),
        total: positions.length,
        page,
        perPage,
        hasMore: positions.length >= perPage,
      };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListPositions;
