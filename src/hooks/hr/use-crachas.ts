'use client';

/**
 * OpenSea OS - Crachás Hooks
 *
 * TanStack Query wrappers over `crachasApi.list`.
 * Infinite scroll per CLAUDE.md §1 (Frontend Patterns — ALWAYS infinite).
 * No silent `|| []` fallbacks per CLAUDE.md §2.
 */

import { crachasService } from '@/services/hr/crachas.service';
import type { CrachaRotationStatus, ListCrachasResponse } from '@/types/hr';
import { useInfiniteQuery } from '@tanstack/react-query';

export const CRACHAS_QUERY_KEY = (
  search: string,
  rotationStatus: CrachaRotationStatus | 'all'
) => ['crachas', { search, rotationStatus }] as const;

export interface UseBadgesInfiniteParams {
  search: string;
  rotationStatus: CrachaRotationStatus | 'all';
  pageSize?: number;
}

/**
 * Infinite-scroll listing for /hr/crachas. Page size defaults to 50.
 * The query key includes `search` and `rotationStatus` so changing a filter
 * refetches from page 1 cleanly.
 */
export function useBadgesInfinite({
  search,
  rotationStatus,
  pageSize = 50,
}: UseBadgesInfiniteParams) {
  return useInfiniteQuery<ListCrachasResponse>({
    queryKey: CRACHAS_QUERY_KEY(search, rotationStatus),
    queryFn: ({ pageParam = 1 }) =>
      crachasService.list({
        page: pageParam as number,
        pageSize,
        search: search || undefined,
        rotationStatus: rotationStatus === 'all' ? undefined : rotationStatus,
      }),
    initialPageParam: 1,
    getNextPageParam: last =>
      last.page < last.pages ? last.page + 1 : undefined,
    staleTime: 30_000,
  });
}
