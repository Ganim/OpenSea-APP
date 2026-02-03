/**
 * OpenSea OS - Get User Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { usersService } from '@/services/auth/users.service';
import type { User } from '@/types/auth';
import { userKeys } from './keys';

export type GetUserOptions = Omit<
  UseQueryOptions<User, Error>,
  'queryKey' | 'queryFn'
>;

export function useGetUser(id: string, options?: GetUserOptions) {
  return useQuery({
    queryKey: userKeys.detail(id),

    queryFn: async (): Promise<User> => {
      const response = await usersService.getUser(id);
      return response.user;
    },

    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get user by email
 */
export function useGetUserByEmail(email: string, options?: GetUserOptions) {
  return useQuery({
    queryKey: userKeys.byEmail(email),

    queryFn: async (): Promise<User> => {
      const response = await usersService.getUserByEmail(email);
      return response.user;
    },

    enabled: !!email,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get user by username
 */
export function useGetUserByUsername(
  username: string,
  options?: GetUserOptions
) {
  return useQuery({
    queryKey: userKeys.byUsername(username),

    queryFn: async (): Promise<User> => {
      const response = await usersService.getUserByUsername(username);
      return response.user;
    },

    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Get online users
 */
export interface OnlineUsersResponse {
  users: User[];
  total: number;
}

export type OnlineUsersOptions = Omit<
  UseQueryOptions<OnlineUsersResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useOnlineUsers(options?: OnlineUsersOptions) {
  return useQuery({
    queryKey: userKeys.online(),

    queryFn: async (): Promise<OnlineUsersResponse> => {
      const response = await usersService.getOnlineUsers();
      return {
        users: response.users ?? [],
        total: response.users?.length ?? 0,
      };
    },

    staleTime: 30 * 1000, // 30 seconds for online status
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  });
}

export default useGetUser;
