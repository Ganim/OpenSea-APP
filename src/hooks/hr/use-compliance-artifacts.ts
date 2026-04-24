'use client';

/**
 * OpenSea OS - useComplianceArtifacts
 *
 * Infinite scroll para /hr/compliance dashboard (Phase 06 Plan 06-06).
 * Segue CLAUDE.md §1 (useInfiniteQuery obrigatório) + §2 (sem silent fallback).
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { complianceService } from '@/services/hr/compliance.service';
import type {
  ComplianceArtifactsListResponse,
  ListComplianceArtifactsParams,
} from '@/types/hr';

export const COMPLIANCE_ARTIFACTS_QUERY_KEY = (
  filters: ListComplianceArtifactsParams
) => ['compliance-artifacts', filters] as const;

export interface UseComplianceArtifactsParams extends ListComplianceArtifactsParams {
  pageSize?: number;
}

export function useComplianceArtifacts(
  params: UseComplianceArtifactsParams = {}
) {
  const { pageSize = 50, ...filters } = params;

  return useInfiniteQuery<ComplianceArtifactsListResponse>({
    queryKey: COMPLIANCE_ARTIFACTS_QUERY_KEY(filters),
    queryFn: ({ pageParam = 1 }) =>
      complianceService.listArtifacts({
        ...filters,
        page: pageParam as number,
        limit: pageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: last =>
      last.meta.page < last.meta.pages ? last.meta.page + 1 : undefined,
    staleTime: 30_000,
  });
}
