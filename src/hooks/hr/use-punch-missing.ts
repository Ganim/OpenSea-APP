'use client';

/**
 * usePunchMissing — paginated list of PunchMissedLog (today by default).
 * Phase 7 / Plan 07-06 / Task 1.
 *
 * useInfiniteQuery per CLAUDE.md APP §1 (always infinite scroll, never page
 * numbers). LGPD-safe payload: backend strips CPF (Plan 07-03).
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  punchDashboardService,
  type MissingPunchesResponse,
} from '@/services/hr/punch-dashboard.service';

export interface UsePunchMissingParams {
  /** YYYY-MM-DD; defaults server-side to today. */
  date?: string;
}

const PAGE_SIZE = 30;

export const PUNCH_MISSING_QUERY_KEY = (params: UsePunchMissingParams) =>
  ['punch', 'missing', params.date ?? 'today'] as const;

export function usePunchMissing(params: UsePunchMissingParams = {}) {
  return useInfiniteQuery<MissingPunchesResponse, Error>({
    queryKey: PUNCH_MISSING_QUERY_KEY(params),
    queryFn: ({ pageParam }) =>
      punchDashboardService.fetchMissing({
        date: params.date,
        page: (pageParam as number) ?? 1,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: last =>
      last.page < last.pages ? last.page + 1 : undefined,
    staleTime: 30_000,
  });
}
