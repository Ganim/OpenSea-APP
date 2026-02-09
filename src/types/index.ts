// Module barrel re-exports
export * from './auth';
export * from './stock';
export * from './sales';
export * from './hr';
export * from './finance';
export * from './admin';
export * from './common';

// RBAC has naming conflicts with auth (Permission, PermissionGroup)
// and common (PaginatedResponse). Import from '@/types/rbac' directly
// for the RBAC-specific versions.
export {
  type CreatePermissionDTO,
  type UpdatePermissionDTO,
  type ListPermissionsQuery,
  type PermissionGroupWithDetails,
  type CreatePermissionGroupDTO,
  type UpdatePermissionGroupDTO,
  type ListPermissionGroupsQuery,
  type PermissionWithEffect,
  type AddPermissionToGroupDTO,
  type AssignGroupToUserDTO,
  type GroupWithExpiration,
  type EffectivePermission,
  type UserInGroup,
  type ApiResponse,
  type PermissionResponse,
  type PermissionGroupResponse,
  type SuccessResponse,
  type PermissionEffect,
  type PermissionModule,
  type PermissionAction,
  type PermissionGroupWithChildren,
  type PermissionGroupDetailResponse,
  type PermissionsByModule,
  type AllPermissionsResponse,
  type PermissionModuleGroup,
  type PermissionResourceGroup,
  type PermissionItemSimple,
} from './rbac';
