/**
 * OpenSea OS - Get Permission Group Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import * as rbacService from '@/services/rbac/rbac.service';
import type {
  PermissionGroup,
  PermissionWithEffect,
  UserInGroup,
} from '@/types/rbac';
import { permissionGroupKeys } from './keys';

export interface PermissionGroupDetails {
  group: PermissionGroup;
  permissions: PermissionWithEffect[];
  users: UserInGroup[];
}

export type GetPermissionGroupOptions = Omit<
  UseQueryOptions<PermissionGroupDetails, Error>,
  'queryKey' | 'queryFn'
>;

export function useGetPermissionGroup(
  id: string,
  options?: GetPermissionGroupOptions
) {
  return useQuery({
    queryKey: permissionGroupKeys.detail(id),

    queryFn: async (): Promise<PermissionGroupDetails> => {
      const response = await rbacService.getPermissionGroupDetails(id);
      return response;
    },

    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get group permissions only
 */
export function useGroupPermissions(
  groupId: string,
  options?: Omit<
    UseQueryOptions<PermissionWithEffect[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: permissionGroupKeys.permissions(groupId),

    queryFn: async (): Promise<PermissionWithEffect[]> => {
      const permissions = await rbacService.listGroupPermissions(groupId);
      return permissions ?? [];
    },

    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get group users only
 */
export function useGroupUsers(
  groupId: string,
  includeExpired = false,
  options?: Omit<UseQueryOptions<UserInGroup[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: permissionGroupKeys.users(groupId),

    queryFn: async (): Promise<UserInGroup[]> => {
      const users = await rbacService.listUsersByGroup(groupId, includeExpired);
      return users ?? [];
    },

    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export default useGetPermissionGroup;
