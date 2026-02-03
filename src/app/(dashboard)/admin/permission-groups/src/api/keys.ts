/**
 * OpenSea OS - Permission Groups Query Keys
 */

export interface PermissionGroupFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  isSystem?: boolean;
  includeDeleted?: boolean;
}

export const permissionGroupKeys = {
  all: ['permission-groups'] as const,
  lists: () => [...permissionGroupKeys.all, 'list'] as const,
  list: (filters?: PermissionGroupFilters) =>
    [...permissionGroupKeys.lists(), filters ?? {}] as const,
  details: () => [...permissionGroupKeys.all, 'detail'] as const,
  detail: (id: string) => [...permissionGroupKeys.details(), id] as const,

  // Sub-resources
  permissions: (groupId: string) =>
    [...permissionGroupKeys.detail(groupId), 'permissions'] as const,
  users: (groupId: string) =>
    [...permissionGroupKeys.detail(groupId), 'users'] as const,
} as const;

// Permissions keys
export const permissionKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionKeys.all, 'list'] as const,
  list: (filters?: { module?: string; resource?: string; action?: string }) =>
    [...permissionKeys.lists(), filters ?? {}] as const,
  detail: (id: string) => [...permissionKeys.all, 'detail', id] as const,
  byCode: (code: string) => [...permissionKeys.all, 'by-code', code] as const,
} as const;

type PermissionGroupKeyFunctions = {
  [K in keyof typeof permissionGroupKeys]: (typeof permissionGroupKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof permissionGroupKeys)[K];
};

export type PermissionGroupQueryKey =
  PermissionGroupKeyFunctions[keyof PermissionGroupKeyFunctions];

export default permissionGroupKeys;
