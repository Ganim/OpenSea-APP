'use client';

/**
 * usePunchCellDetail — fetches GET /v1/hr/punch/cell-detail.
 * Phase 7 / Plan 07-06 / Task 1.
 *
 * One round-trip that returns { timeEntries, activeApproval, activeRequests }
 * for a given employee × date — the Drawer triggered by clicking a heatmap
 * cell uses this (Warning #9 fix).
 *
 * `enabled` so the query only runs when both employeeId and date are set.
 */

import { useQuery } from '@tanstack/react-query';
import {
  punchDashboardService,
  type CellDetailResponse,
} from '@/services/hr/punch-dashboard.service';

export const PUNCH_CELL_DETAIL_QUERY_KEY = (
  employeeId: string | undefined,
  date: string | undefined
) => ['punch', 'cell-detail', employeeId, date] as const;

export function usePunchCellDetail(
  employeeId: string | undefined,
  date: string | undefined
) {
  return useQuery<CellDetailResponse, Error>({
    queryKey: PUNCH_CELL_DETAIL_QUERY_KEY(employeeId, date),
    queryFn: () =>
      punchDashboardService.fetchCellDetail({
        employeeId: employeeId as string,
        date: date as string,
      }),
    enabled: Boolean(employeeId) && Boolean(date),
    staleTime: 30_000,
  });
}
