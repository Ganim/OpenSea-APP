/**
 * OpenSea OS - Safety Programs Query Keys
 */

export interface SafetyProgramFilters {
  type?: string;
  status?: string;
  page?: number;
  perPage?: number;
}

export const safetyProgramKeys = {
  all: ['safety-programs'] as const,
  lists: () => [...safetyProgramKeys.all, 'list'] as const,
  list: (filters?: SafetyProgramFilters) =>
    [...safetyProgramKeys.lists(), filters ?? {}] as const,
  details: () => [...safetyProgramKeys.all, 'detail'] as const,
  detail: (id: string) => [...safetyProgramKeys.details(), id] as const,
  risks: (programId: string) =>
    [...safetyProgramKeys.all, 'risks', programId] as const,
} as const;

export default safetyProgramKeys;
