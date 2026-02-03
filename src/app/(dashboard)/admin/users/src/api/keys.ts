/**
 * OpenSea OS - Users Query Keys
 */

export interface UserFilters {
  search?: string;
  includeDeleted?: boolean;
}

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters) =>
    [...userKeys.lists(), filters ?? {}] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,

  // Related queries
  byEmail: (email: string) => [...userKeys.all, 'by-email', email] as const,
  byUsername: (username: string) =>
    [...userKeys.all, 'by-username', username] as const,
  online: () => [...userKeys.all, 'online'] as const,
  groups: (userId: string) => [...userKeys.detail(userId), 'groups'] as const,
  permissions: (userId: string) =>
    [...userKeys.detail(userId), 'permissions'] as const,
} as const;

type UserKeyFunctions = {
  [K in keyof typeof userKeys]: (typeof userKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof userKeys)[K];
};

export type UserQueryKey = UserKeyFunctions[keyof UserKeyFunctions];

export default userKeys;
