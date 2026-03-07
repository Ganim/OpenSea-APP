/**
 * OpenSea OS - List Permission Groups Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import * as rbacService from '@/services/rbac/rbac.service';
import type { PermissionGroup } from '@/types/rbac';
import { permissionGroupKeys, type PermissionGroupFilters } from './keys';

export type ListPermissionGroupsParams = PermissionGroupFilters;

export interface ListPermissionGroupsResponse {
  groups: PermissionGroup[];
  total: number;
}

export type ListPermissionGroupsOptions = Omit<
  UseQueryOptions<ListPermissionGroupsResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListPermissionGroups(
  params?: ListPermissionGroupsParams,
  options?: ListPermissionGroupsOptions
) {
  return useQuery({
    queryKey: permissionGroupKeys.list(params),

    queryFn: async (): Promise<ListPermissionGroupsResponse> => {
      const groups = await rbacService.listPermissionGroups({
        page: params?.page,
        limit: params?.limit,
        isActive: params?.isActive,
        isSystem: params?.isSystem,
        includeDeleted: params?.includeDeleted,
      });

      return {
        groups: groups ?? [],
        total: groups?.length ?? 0,
      };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListPermissionGroups;
