/**
 * OpenSea OS - List Workplace Risks Query (Infinite Scroll)
 * Fetches risks from all safety programs or a specific one
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { workplaceRisksService } from '@/services/hr/workplace-risks.service';
import { safetyProgramsService } from '@/services/hr/safety-programs.service';
import type { WorkplaceRisk } from '@/types/hr';
import { workplaceRiskKeys, type WorkplaceRiskFilters } from './keys';

const PAGE_SIZE = 20;

export interface ListWorkplaceRisksPage {
  risks: WorkplaceRisk[];
  total: number;
  page: number;
  totalPages: number;
}

// Cache for the full dataset so subsequent pages don't re-fetch
let _cachedKey: string | null = null;
let _cachedRisks: WorkplaceRisk[] | null = null;

export function useListWorkplaceRisks(params?: WorkplaceRiskFilters) {
  return useInfiniteQuery({
    queryKey: workplaceRiskKeys.list(params),

    queryFn: async ({ pageParam = 1 }): Promise<ListWorkplaceRisksPage> => {
      const cacheKey = JSON.stringify(params ?? {});
      let allRisks: WorkplaceRisk[];

      if (_cachedKey === cacheKey && _cachedRisks && pageParam > 1) {
        allRisks = _cachedRisks;
      } else {
        // If a specific program is selected, fetch risks for that program
        if (params?.programId) {
          const response = await workplaceRisksService.list(params.programId, {
            category: params?.category,
            severity: params?.severity,
            isActive: params?.isActive,
            perPage: 100,
          });

          allRisks = response.workplaceRisks ?? [];
        } else {
          // Otherwise, fetch all safety programs, then fetch risks from each
          const programsResponse = await safetyProgramsService.list({
            perPage: 100,
          });
          const programs = programsResponse.safetyPrograms ?? [];

          allRisks = [];
          for (const program of programs) {
            const risksResponse = await workplaceRisksService.list(program.id, {
              category: params?.category,
              severity: params?.severity,
              isActive: params?.isActive,
              perPage: 100,
            });
            const risks = risksResponse.workplaceRisks ?? [];
            allRisks.push(...risks);
          }
        }

        _cachedKey = cacheKey;
        _cachedRisks = allRisks;
      }

      const total = allRisks.length;
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const start = (pageParam - 1) * PAGE_SIZE;
      const paginatedRisks = allRisks.slice(start, start + PAGE_SIZE);

      return {
        risks: paginatedRisks,
        total,
        page: pageParam,
        totalPages,
      };
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },

    staleTime: 5 * 60 * 1000,
  });
}

export default useListWorkplaceRisks;
