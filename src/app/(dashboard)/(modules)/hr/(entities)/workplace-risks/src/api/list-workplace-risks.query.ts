/**
 * OpenSea OS - List Workplace Risks Query
 * Fetches risks from all safety programs or a specific one
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { workplaceRisksService } from '@/services/hr/workplace-risks.service';
import { safetyProgramsService } from '@/services/hr/safety-programs.service';
import type { WorkplaceRisk } from '@/types/hr';
import { workplaceRiskKeys, type WorkplaceRiskFilters } from './keys';

export interface ListWorkplaceRisksResponse {
  risks: WorkplaceRisk[];
  total: number;
}

export type ListWorkplaceRisksOptions = Omit<
  UseQueryOptions<ListWorkplaceRisksResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListWorkplaceRisks(
  params?: WorkplaceRiskFilters,
  options?: ListWorkplaceRisksOptions
) {
  return useQuery({
    queryKey: workplaceRiskKeys.list(params),

    queryFn: async (): Promise<ListWorkplaceRisksResponse> => {
      // If a specific program is selected, fetch risks for that program
      if (params?.programId) {
        const response = await workplaceRisksService.list(params.programId, {
          category: params?.category,
          severity: params?.severity,
          isActive: params?.isActive,
          perPage: 100,
        });

        const risks = response.workplaceRisks ?? [];
        return { risks, total: risks.length };
      }

      // Otherwise, fetch all safety programs, then fetch risks from each
      const programsResponse = await safetyProgramsService.list({ perPage: 100 });
      const programs = programsResponse.safetyPrograms ?? [];

      if (programs.length === 0) {
        return { risks: [], total: 0 };
      }

      const allRisks: WorkplaceRisk[] = [];
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

      return { risks: allRisks, total: allRisks.length };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListWorkplaceRisks;
