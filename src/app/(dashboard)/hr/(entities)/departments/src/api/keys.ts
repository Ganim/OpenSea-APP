/**
 * OpenSea OS - Departments Query Keys
 *
 * Chaves de query centralizadas para o módulo Departments.
 */

/* ===========================================
   FILTER TYPES
   =========================================== */

export interface DepartmentFilters {
  page?: number;
  perPage?: number;
  search?: string;
  companyId?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
}

/* ===========================================
   QUERY KEYS
   =========================================== */

export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (filters?: DepartmentFilters) =>
    [...departmentKeys.lists(), filters ?? {}] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,

  // Relacionamentos
  byCompany: (companyId: string) =>
    [...departmentKeys.all, 'by-company', companyId] as const,
  positions: (departmentId: string) =>
    [...departmentKeys.detail(departmentId), 'positions'] as const,
  employees: (departmentId: string) =>
    [...departmentKeys.detail(departmentId), 'employees'] as const,
} as const;

type DepartmentKeyFunctions = {
  [K in keyof typeof departmentKeys]: (typeof departmentKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof departmentKeys)[K];
};

export type DepartmentQueryKey =
  DepartmentKeyFunctions[keyof DepartmentKeyFunctions];

export default departmentKeys;
