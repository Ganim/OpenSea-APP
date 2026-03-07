/**
 * OpenSea OS - Employees API Module
 */

// Query Keys
export {
  employeeKeys,
  type EmployeeFilters,
  type EmployeeQueryKey,
} from './keys';

// Queries
export {
  useListEmployees,
  type ListEmployeesParams,
  type ListEmployeesResponse,
  type ListEmployeesOptions,
} from './list-employees.query';

export { useGetEmployee, type GetEmployeeOptions } from './get-employee.query';

// Mutations (note: CreateEmployeeData is already exported from types)
export {
  useCreateEmployee,
  useCreateEmployeeWithUser,
  useUpdateEmployee,
  useDeleteEmployee,
  useCreateUserForEmployee,
  type CreateEmployeeOptions,
  type CreateEmployeeWithUserData,
  type CreateEmployeeWithUserOptions,
  type UpdateEmployeeVariables,
  type UpdateEmployeeOptions,
  type DeleteEmployeeOptions,
  type CreateUserForEmployeeVariables,
  type CreateUserForEmployeeOptions,
} from './mutations';

// Legacy API
export * from './employees.api';
