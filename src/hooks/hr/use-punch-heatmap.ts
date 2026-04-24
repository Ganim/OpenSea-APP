'use client';

/**
 * usePunchHeatmap — fetches GET /v1/hr/punch/dashboard/heatmap.
 * Phase 7 / Plan 07-06 / Task 1.
 *
 * Standard `useQuery` with 60 s staleTime. NO silent fallback (CLAUDE.md APP §2):
 * errors propagate to React Query so the page renders <GridError/>.
 */

import { useQuery } from '@tanstack/react-query';
import {
  punchDashboardService,
  type HeatmapResponse,
} from '@/services/hr/punch-dashboard.service';

export interface UsePunchHeatmapParams {
  month: string; // YYYY-MM
  employeeIds?: string[];
}

export const PUNCH_HEATMAP_QUERY_KEY = (params: UsePunchHeatmapParams) =>
  ['punch', 'heatmap', params.month, ...(params.employeeIds ?? [])] as const;

export function usePunchHeatmap(params: UsePunchHeatmapParams) {
  return useQuery<HeatmapResponse, Error>({
    queryKey: PUNCH_HEATMAP_QUERY_KEY(params),
    queryFn: () =>
      punchDashboardService.fetchHeatmap({
        month: params.month,
        employeeIds: params.employeeIds,
      }),
    staleTime: 60_000,
    enabled: Boolean(params.month),
  });
}
