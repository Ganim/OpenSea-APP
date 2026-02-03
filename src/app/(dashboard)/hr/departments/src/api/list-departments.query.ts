/**
 * OpenSea OS - List Departments Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { departmentsService } from '@/services/hr/departments.service';
import type { Department } from '@/types/hr';
import { departmentKeys, type DepartmentFilters } from './keys';

export type ListDepartmentsParams = DepartmentFilters;

export interface ListDepartmentsResponse {
  departments: Department[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export type ListDepartmentsOptions = Omit<
  UseQueryOptions<ListDepartmentsResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListDepartments(
  params?: ListDepartmentsParams,
  options?: ListDepartmentsOptions
) {
  return useQuery({
    queryKey: departmentKeys.list(params),

    queryFn: async (): Promise<ListDepartmentsResponse> => {
      const response = await departmentsService.listDepartments({
        page: params?.page,
        perPage: params?.perPage ?? 100,
        search: params?.search,
        companyId: params?.companyId,
        isActive: params?.isActive,
        includeDeleted: params?.includeDeleted ?? false,
      });

      const departments =
        (response as { departments?: Department[] }).departments ?? [];
      const page = params?.page ?? 1;
      const perPage = params?.perPage ?? 100;

      return {
        departments: params?.includeDeleted
          ? departments
          : departments.filter(d => !d.deletedAt),
        total: departments.length,
        page,
        perPage,
        hasMore: departments.length >= perPage,
      };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListDepartments;
