/**
 * OpenSea OS - List Users Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { usersService } from '@/services/auth/users.service';
import type { User } from '@/types/auth';
import { userKeys, type UserFilters } from './keys';

export type ListUsersParams = UserFilters;

export interface ListUsersResponse {
  users: User[];
  total: number;
}

export type ListUsersOptions = Omit<
  UseQueryOptions<ListUsersResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListUsers(
  params?: ListUsersParams,
  options?: ListUsersOptions
) {
  return useQuery({
    queryKey: userKeys.list(params),

    queryFn: async (): Promise<ListUsersResponse> => {
      const response = await usersService.listUsers();

      let users = response.users ?? [];

      // Filter locally if search param is provided
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        users = users.filter(
          user =>
            user.username?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.profile?.name?.toLowerCase().includes(searchLower)
        );
      }

      // Filter deleted users unless explicitly included
      if (!params?.includeDeleted) {
        users = users.filter(user => !user.deletedAt);
      }

      return {
        users,
        total: users.length,
      };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListUsers;
