/**
 * OpenSea OS - Permission Groups API Module
 */

// Query Keys
export {
  permissionGroupKeys,
  permissionKeys,
  type PermissionGroupFilters,
  type PermissionGroupQueryKey,
} from './keys';

// Queries
export {
  useListPermissionGroups,
  type ListPermissionGroupsParams,
  type ListPermissionGroupsResponse,
  type ListPermissionGroupsOptions,
} from './list-permission-groups.query';

export {
  useGetPermissionGroup,
  useGroupPermissions,
  useGroupUsers,
  type PermissionGroupDetails,
  type GetPermissionGroupOptions,
} from './get-permission-group.query';

// Mutations
export {
  useCreatePermissionGroup,
  useUpdatePermissionGroup,
  useDeletePermissionGroup,
  useAddPermissionToGroup,
  useRemovePermissionFromGroup,
  useAssignGroupToUser,
  useRemoveGroupFromUser,
  type CreatePermissionGroupData,
  type CreatePermissionGroupOptions,
  type UpdatePermissionGroupVariables,
  type UpdatePermissionGroupOptions,
  type DeletePermissionGroupVariables,
  type DeletePermissionGroupOptions,
  type AddPermissionToGroupVariables,
  type AddPermissionToGroupOptions,
  type RemovePermissionFromGroupVariables,
  type RemovePermissionFromGroupOptions,
  type AssignGroupToUserVariables,
  type AssignGroupToUserOptions,
  type RemoveGroupFromUserVariables,
  type RemoveGroupFromUserOptions,
} from './mutations';
