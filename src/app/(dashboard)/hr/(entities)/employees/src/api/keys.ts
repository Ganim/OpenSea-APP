/**
 * OpenSea OS - Employees Query Keys
 */

export interface EmployeeFilters {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  departmentId?: string;
  positionId?: string;
  supervisorId?: string;
  companyId?: string;
  includeDeleted?: boolean;
}

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters?: EmployeeFilters) =>
    [...employeeKeys.lists(), filters ?? {}] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,

  // Related queries
  byDepartment: (departmentId: string) =>
    [...employeeKeys.all, 'by-department', departmentId] as const,
  byPosition: (positionId: string) =>
    [...employeeKeys.all, 'by-position', positionId] as const,
  byCompany: (companyId: string) =>
    [...employeeKeys.all, 'by-company', companyId] as const,
  bySupervisor: (supervisorId: string) =>
    [...employeeKeys.all, 'by-supervisor', supervisorId] as const,
} as const;

type EmployeeKeyFunctions = {
  [K in keyof typeof employeeKeys]: (typeof employeeKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof employeeKeys)[K];
};

export type EmployeeQueryKey = EmployeeKeyFunctions[keyof EmployeeKeyFunctions];

export default employeeKeys;
