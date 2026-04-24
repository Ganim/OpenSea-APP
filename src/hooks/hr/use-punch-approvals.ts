'use client';

/**
 * usePunchApprovals — infinite-scroll list of PunchApproval rows.
 * Phase 7 / Plan 07-06 / Task 1.
 *
 * Reuses Phase 4 GET /v1/hr/punch-approvals. No silent fallbacks —
 * errors propagate to React Query.
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  punchDashboardService,
  type PunchApprovalsResponse,
  type FetchApprovalsParams,
} from '@/services/hr/punch-dashboard.service';

export interface UsePunchApprovalsFilters {
  status?: FetchApprovalsParams['status'];
  employeeId?: string;
}

const PAGE_SIZE = 30;

export const PUNCH_APPROVALS_QUERY_KEY = (filters: UsePunchApprovalsFilters) =>
  [
    'punch',
    'approvals',
    filters.status ?? 'ALL',
    filters.employeeId ?? null,
  ] as const;

export function usePunchApprovals(filters: UsePunchApprovalsFilters = {}) {
  return useInfiniteQuery<PunchApprovalsResponse, Error>({
    queryKey: PUNCH_APPROVALS_QUERY_KEY(filters),
    queryFn: ({ pageParam }) =>
      punchDashboardService.fetchApprovals({
        status: filters.status,
        employeeId: filters.employeeId,
        page: (pageParam as number) ?? 1,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: last =>
      last.page < last.pages ? last.page + 1 : undefined,
    staleTime: 30_000,
  });
}
