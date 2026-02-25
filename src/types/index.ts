// Module barrel re-exports
export * from './admin';
export * from './auth';
export * from './calendar';
export * from './common';
export * from './core';
export * from './email';
export * from './finance';
export * from './hr';
export * from './sales';
export * from './stock';
export * from './storage';

// RBAC has naming conflicts with auth (Permission, PermissionGroup)
// and common (PaginatedResponse). Import from '@/types/rbac' directly
// for the RBAC-specific versions.
export {
    type AddPermissionToGroupDTO, type AllPermissionsResponse, type ApiResponse, type AssignGroupToUserDTO, type CreatePermissionDTO, type CreatePermissionGroupDTO, type EffectivePermission, type GroupWithExpiration, type ListPermissionGroupsQuery, type ListPermissionsQuery, type PermissionAction, type PermissionEffect, type PermissionGroupDetailResponse, type PermissionGroupResponse, type PermissionGroupWithChildren, type PermissionGroupWithDetails, type PermissionItemSimple, type PermissionModule, type PermissionModuleGroup,
    type PermissionResourceGroup, type PermissionResponse, type PermissionWithEffect, type PermissionsByModule, type SuccessResponse, type UpdatePermissionDTO, type UpdatePermissionGroupDTO, type UserInGroup
} from './rbac';

