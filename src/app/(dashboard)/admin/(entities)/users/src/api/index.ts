/**
 * OpenSea OS - Users API Module
 */

// Query Keys
export { userKeys, type UserFilters, type UserQueryKey } from './keys';

// Queries
export {
  useListUsers,
  type ListUsersParams,
  type ListUsersResponse,
  type ListUsersOptions,
} from './list-users.query';

export {
  useGetUser,
  useGetUserByEmail,
  useGetUserByUsername,
  useOnlineUsers,
  type GetUserOptions,
} from './get-user.query';

// Mutations
export {
  useCreateUser,
  useUpdateUserEmail,
  useUpdateUserUsername,
  useUpdateUserPassword,
  useUpdateUserProfile,
  useDeleteUser,
  useForcePasswordReset,
  type CreateUserData,
  type CreateUserOptions,
  type UpdateUserEmailVariables,
  type UpdateUserEmailOptions,
  type UpdateUserUsernameVariables,
  type UpdateUserUsernameOptions,
  type UpdateUserPasswordVariables,
  type UpdateUserPasswordOptions,
  type UpdateUserProfileVariables,
  type UpdateUserProfileOptions,
  type DeleteUserOptions,
  type ForcePasswordResetVariables,
  type ForcePasswordResetOptions,
} from './mutations';
