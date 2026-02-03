/**
 * OpenSea OS - User Mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/auth/users.service';
import type {
  User,
  CreateUserRequest,
  UpdateUserEmailRequest,
  UpdateUserUsernameRequest,
  UpdateUserPasswordRequest,
  UpdateUserProfileRequest,
  ForcePasswordResetRequest,
} from '@/types/auth';
import { toast } from 'sonner';
import { translateError } from '@/lib/errors';
import { userKeys } from './keys';

/* ===========================================
   CREATE USER
   =========================================== */

export type CreateUserData = CreateUserRequest;

export interface CreateUserOptions {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useCreateUser(options: CreateUserOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async (data: CreateUserData): Promise<User> => {
      const response = await usersService.createUser(data);
      return response.user;
    },

    onSuccess: user => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      if (showSuccessToast) {
        toast.success(`Usuário "${user.username}" criado com sucesso!`);
      }

      onSuccess?.(user);
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   UPDATE USER EMAIL
   =========================================== */

export interface UpdateUserEmailVariables {
  userId: string;
  data: UpdateUserEmailRequest;
}

export interface UpdateUserEmailOptions {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useUpdateUserEmail(options: UpdateUserEmailOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: UpdateUserEmailVariables): Promise<User> => {
      const response = await usersService.updateUserEmail(userId, data);
      return response.user;
    },

    onSuccess: (user, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });

      if (showSuccessToast) {
        toast.success('E-mail atualizado com sucesso!');
      }

      onSuccess?.(user);
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   UPDATE USER USERNAME
   =========================================== */

export interface UpdateUserUsernameVariables {
  userId: string;
  data: UpdateUserUsernameRequest;
}

export interface UpdateUserUsernameOptions {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useUpdateUserUsername(options: UpdateUserUsernameOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: UpdateUserUsernameVariables): Promise<User> => {
      const response = await usersService.updateUserUsername(userId, data);
      return response.user;
    },

    onSuccess: (user, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });

      if (showSuccessToast) {
        toast.success('Nome de usuário atualizado com sucesso!');
      }

      onSuccess?.(user);
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   UPDATE USER PASSWORD
   =========================================== */

export interface UpdateUserPasswordVariables {
  userId: string;
  data: UpdateUserPasswordRequest;
}

export interface UpdateUserPasswordOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useUpdateUserPassword(options: UpdateUserPasswordOptions = {}) {
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: UpdateUserPasswordVariables): Promise<void> => {
      await usersService.updateUserPassword(userId, data);
    },

    onSuccess: () => {
      if (showSuccessToast) {
        toast.success('Senha atualizada com sucesso!');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   UPDATE USER PROFILE
   =========================================== */

export interface UpdateUserProfileVariables {
  userId: string;
  data: UpdateUserProfileRequest;
}

export interface UpdateUserProfileOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useUpdateUserProfile(options: UpdateUserProfileOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: UpdateUserProfileVariables): Promise<void> => {
      await usersService.updateUserProfile(userId, data);
    },

    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });

      if (showSuccessToast) {
        toast.success('Perfil atualizado com sucesso!');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   DELETE USER
   =========================================== */

export interface DeleteUserOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useDeleteUser(options: DeleteUserOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      await usersService.deleteUser(userId);
    },

    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(userId) });

      if (showSuccessToast) {
        toast.success('Usuário excluído com sucesso!');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   FORCE PASSWORD RESET
   =========================================== */

export interface ForcePasswordResetVariables {
  userId: string;
  data?: ForcePasswordResetRequest;
}

export interface ForcePasswordResetOptions {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useForcePasswordReset(options: ForcePasswordResetOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: ForcePasswordResetVariables): Promise<User> => {
      const response = await usersService.forcePasswordReset(
        userId,
        data ?? {}
      );
      return response.user;
    },

    onSuccess: (user, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });

      if (showSuccessToast) {
        toast.success(`Redefinição de senha forçada para "${user.username}".`);
      }

      onSuccess?.(user);
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}
