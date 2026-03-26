/**
 * OpenSea OS - Workplace Risks Query Keys
 */

export interface WorkplaceRiskFilters {
  programId?: string;
  category?: string;
  severity?: string;
  isActive?: boolean;
  page?: number;
  perPage?: number;
}

export const workplaceRiskKeys = {
  all: ['workplace-risks'] as const,
  lists: () => [...workplaceRiskKeys.all, 'list'] as const,
  list: (filters?: WorkplaceRiskFilters) =>
    [...workplaceRiskKeys.lists(), filters ?? {}] as const,
  byProgram: (programId: string, filters?: Omit<WorkplaceRiskFilters, 'programId'>) =>
    [...workplaceRiskKeys.all, 'by-program', programId, filters ?? {}] as const,
  details: () => [...workplaceRiskKeys.all, 'detail'] as const,
  detail: (id: string) => [...workplaceRiskKeys.details(), id] as const,
} as const;

export default workplaceRiskKeys;
