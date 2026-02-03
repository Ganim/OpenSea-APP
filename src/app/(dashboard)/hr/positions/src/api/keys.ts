/**
 * OpenSea OS - Positions Query Keys
 */

export interface PositionFilters {
  page?: number;
  perPage?: number;
  search?: string;
  departmentId?: string;
  companyId?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
}

export const positionKeys = {
  all: ['positions'] as const,
  lists: () => [...positionKeys.all, 'list'] as const,
  list: (filters?: PositionFilters) =>
    [...positionKeys.lists(), filters ?? {}] as const,
  details: () => [...positionKeys.all, 'detail'] as const,
  detail: (id: string) => [...positionKeys.details(), id] as const,

  byDepartment: (departmentId: string) =>
    [...positionKeys.all, 'by-department', departmentId] as const,
  employees: (positionId: string) =>
    [...positionKeys.detail(positionId), 'employees'] as const,
} as const;

type PositionKeyFunctions = {
  [K in keyof typeof positionKeys]: (typeof positionKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof positionKeys)[K];
};

export type PositionQueryKey = PositionKeyFunctions[keyof PositionKeyFunctions];

export default positionKeys;
