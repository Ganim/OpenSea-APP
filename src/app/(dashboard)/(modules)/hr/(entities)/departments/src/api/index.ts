/**
 * OpenSea OS - Departments API Module
 */

// Query Keys
export {
  departmentKeys,
  type DepartmentFilters,
  type DepartmentQueryKey,
} from './keys';

// Queries
export {
  useListDepartments,
  type ListDepartmentsParams,
  type ListDepartmentsResponse,
  type ListDepartmentsOptions,
} from './list-departments.query';

// Mutations
export {
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  type CreateDepartmentOptions,
  type UpdateDepartmentVariables,
  type UpdateDepartmentOptions,
  type DeleteDepartmentOptions,
} from './mutations';

// Legacy API
export * from './departments.api';
