/**
 * OpenSea OS - List Employees Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { employeesService } from '@/services/hr/employees.service';
import type { Employee } from '@/types/hr';
import { employeeKeys, type EmployeeFilters } from './keys';

export type ListEmployeesParams = EmployeeFilters;

export interface ListEmployeesResponse {
  employees: Employee[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export type ListEmployeesOptions = Omit<
  UseQueryOptions<ListEmployeesResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListEmployees(
  params?: ListEmployeesParams,
  options?: ListEmployeesOptions
) {
  return useQuery({
    queryKey: employeeKeys.list(params),

    queryFn: async (): Promise<ListEmployeesResponse> => {
      const response = await employeesService.listEmployees({
        page: params?.page,
        perPage: params?.perPage ?? 50,
        search: params?.search,
        status: params?.status,
        departmentId: params?.departmentId,
        positionId: params?.positionId,
        supervisorId: params?.supervisorId,
        companyId: params?.companyId,
        includeDeleted: params?.includeDeleted ?? false,
      });

      const employees = response.employees ?? [];
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 50;

      return {
        employees: params?.includeDeleted
          ? employees
          : employees.filter(e => !e.deletedAt),
        total: response.total ?? employees.length,
        page,
        perPage,
        hasMore: employees.length >= perPage,
      };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListEmployees;
