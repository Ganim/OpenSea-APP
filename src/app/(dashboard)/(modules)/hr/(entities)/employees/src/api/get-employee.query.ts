/**
 * OpenSea OS - Get Employee Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { employeesService } from '@/services/hr/employees.service';
import type { Employee } from '@/types/hr';
import { employeeKeys } from './keys';

export type GetEmployeeOptions = Omit<
  UseQueryOptions<Employee, Error>,
  'queryKey' | 'queryFn'
>;

export function useGetEmployee(id: string, options?: GetEmployeeOptions) {
  return useQuery({
    queryKey: employeeKeys.detail(id),

    queryFn: async (): Promise<Employee> => {
      const response = await employeesService.getEmployee(id);
      return response.employee;
    },

    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export default useGetEmployee;
