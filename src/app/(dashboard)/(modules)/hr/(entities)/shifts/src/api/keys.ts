/**
 * OpenSea OS - Shifts Query Keys
 */

export interface ShiftFilters {
  activeOnly?: boolean;
}

export const shiftKeys = {
  all: ['shifts'] as const,
  lists: () => [...shiftKeys.all, 'list'] as const,
  list: (filters?: ShiftFilters) =>
    [...shiftKeys.lists(), filters ?? {}] as const,
  details: () => [...shiftKeys.all, 'detail'] as const,
  detail: (id: string) => [...shiftKeys.details(), id] as const,
  assignments: (shiftId: string) =>
    [...shiftKeys.all, 'assignments', shiftId] as const,
} as const;

export default shiftKeys;
