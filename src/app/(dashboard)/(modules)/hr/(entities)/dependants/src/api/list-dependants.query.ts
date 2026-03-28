/**
 * OpenSea OS - List Dependants Query
 * Fetches dependants from a specific employee or aggregated across all employees
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { dependantsService } from '@/services/hr/dependants.service';
import { employeesService } from '@/services/hr/employees.service';
import type { EmployeeDependant } from '@/types/hr';
import { dependantKeys, type DependantFilters } from './keys';

export type ListDependantsParams = DependantFilters;

const PAGE_SIZE = 20;

export interface ListDependantsPage {
  dependants: EmployeeDependant[];
  total: number;
  page: number;
  totalPages: number;
}

// Cache for the full dataset so subsequent pages don't re-fetch
let _cachedKey: string | null = null;
let _cachedDependants: EmployeeDependant[] | null = null;

export function useListDependants(params?: ListDependantsParams) {
  return useInfiniteQuery({
    queryKey: dependantKeys.list(params),

    queryFn: async ({ pageParam = 1 }): Promise<ListDependantsPage> => {
      const cacheKey = JSON.stringify(params ?? {});
      let allDependants: EmployeeDependant[];

      if (_cachedKey === cacheKey && _cachedDependants && pageParam > 1) {
        allDependants = _cachedDependants;
      } else {
      // If a specific employee is selected, fetch dependants for that employee
      if (params?.employeeId) {
        const response = await dependantsService.list(params.employeeId);
        allDependants = response.dependants ?? [];
      } else {
        // Otherwise, fetch all active employees, then aggregate dependants from each
        const employeesResponse = await employeesService.listEmployees({
          perPage: 100,
          status: 'ACTIVE',
        });
        const employees = employeesResponse.employees ?? [];

        allDependants = [];
        for (const employee of employees) {
          try {
            const response = await dependantsService.list(employee.id);
            const dependants = response.dependants ?? [];
            allDependants.push(...dependants);
          } catch {
            // Skip employees that fail — they may not have dependants access
          }
        }
      }

        _cachedKey = cacheKey;
        _cachedDependants = allDependants;
      }

      const total = allDependants.length;
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const start = (pageParam - 1) * PAGE_SIZE;
      const paginatedDependants = allDependants.slice(start, start + PAGE_SIZE);

      return {
        dependants: paginatedDependants,
        total,
        page: pageParam,
        totalPages,
      };
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },

    staleTime: 5 * 60 * 1000,
  });
}

export default useListDependants;
