/**
 * OpenSea OS - OKR Query Keys (HR)
 */

import type { ObjectiveLevel, ObjectiveStatus } from '@/types/hr';

export interface OkrFilters {
  ownerId?: string;
  parentId?: string;
  level?: ObjectiveLevel | '';
  status?: ObjectiveStatus | '';
  period?: string;
  page?: number;
  perPage?: number;
}

export const okrKeys = {
  all: ['okrs'] as const,
  lists: () => [...okrKeys.all, 'list'] as const,
  list: (filters?: OkrFilters) => [...okrKeys.lists(), filters ?? {}] as const,
  details: () => [...okrKeys.all, 'detail'] as const,
  detail: (id: string) => [...okrKeys.details(), id] as const,
} as const;

export default okrKeys;
