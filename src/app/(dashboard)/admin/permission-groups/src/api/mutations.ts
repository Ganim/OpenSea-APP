/**
 * OpenSea OS - Permission Group Mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as rbacService from '@/services/rbac/rbac.service';
import type {
  PermissionGroup,
  CreatePermissionGroupDTO,
  UpdatePermissionGroupDTO,
  AddPermissionToGroupDTO,
  AssignGroupToUserDTO,
} from '@/types/rbac';
import { toast } from 'sonner';
import { translateError } from '@/lib/errors';
import { permissionGroupKeys, permissionKeys } from './keys';

// User keys - defined locally to avoid cross-module imports
const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  groups: (userId: string) =>
    [...userKeys.all, 'detail', userId, 'groups'] as const,
};

/* ===========================================
   CREATE PERMISSION GROUP
   =========================================== */

export type CreatePermissionGroupData = CreatePermissionGroupDTO;

export interface CreatePermissionGroupOptions {
  onSuccess?: (group: PermissionGroup) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useCreatePermissionGroup(
  options: CreatePermissionGroupOptions = {}
) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async (
      data: CreatePermissionGroupData
    ): Promise<PermissionGroup> => {
      return rbacService.createPermissionGroup(data);
    },

    onSuccess: group => {
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.lists() });

      if (showSuccessToast) {
        toast.success(`Grupo "${group.name}" criado com sucesso!`);
      }

      onSuccess?.(group);
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   UPDATE PERMISSION GROUP
   =========================================== */

export interface UpdatePermissionGroupVariables {
  id: string;
  data: UpdatePermissionGroupDTO;
}

export interface UpdatePermissionGroupOptions {
  onSuccess?: (group: PermissionGroup) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useUpdatePermissionGroup(
  options: UpdatePermissionGroupOptions = {}
) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: UpdatePermissionGroupVariables): Promise<PermissionGroup> => {
      return rbacService.updatePermissionGroup(id, data);
    },

    onSuccess: (group, { id }) => {
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: permissionGroupKeys.detail(id),
      });

      if (showSuccessToast) {
        toast.success(`Grupo "${group.name}" atualizado!`);
      }

      onSuccess?.(group);
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   DELETE PERMISSION GROUP
   =========================================== */

export interface DeletePermissionGroupVariables {
  id: string;
  force?: boolean;
}

export interface DeletePermissionGroupOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useDeletePermissionGroup(
  options: DeletePermissionGroupOptions = {}
) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async ({
      id,
      force = false,
    }: DeletePermissionGroupVariables): Promise<void> => {
      await rbacService.deletePermissionGroup(id, force);
    },

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: permissionGroupKeys.lists() });
      queryClient.removeQueries({ queryKey: permissionGroupKeys.detail(id) });

      if (showSuccessToast) {
        toast.success('Grupo de permissões excluído!');
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
   ADD PERMISSION TO GROUP
   =========================================== */

export interface AddPermissionToGroupVariables {
  groupId: string;
  data: AddPermissionToGroupDTO;
}

export interface AddPermissionToGroupOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useAddPermissionToGroup(
  options: AddPermissionToGroupOptions = {}
) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async ({
      groupId,
      data,
    }: AddPermissionToGroupVariables): Promise<boolean> => {
      return rbacService.addPermissionToGroup(groupId, data);
    },

    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: permissionGroupKeys.detail(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: permissionGroupKeys.permissions(groupId),
      });

      if (showSuccessToast) {
        toast.success('Permissão adicionada ao grupo!');
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
   REMOVE PERMISSION FROM GROUP
   =========================================== */

export interface RemovePermissionFromGroupVariables {
  groupId: string;
  permissionCode: string;
}

export interface RemovePermissionFromGroupOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useRemovePermissionFromGroup(
  options: RemovePermissionFromGroupOptions = {}
) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async ({
      groupId,
      permissionCode,
    }: RemovePermissionFromGroupVariables): Promise<void> => {
      await rbacService.removePermissionFromGroup(groupId, permissionCode);
    },

    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: permissionGroupKeys.detail(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: permissionGroupKeys.permissions(groupId),
      });

      if (showSuccessToast) {
        toast.success('Permissão removida do grupo!');
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
   ASSIGN GROUP TO USER
   =========================================== */

export interface AssignGroupToUserVariables {
  userId: string;
  data: AssignGroupToUserDTO;
}

export interface AssignGroupToUserOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useAssignGroupToUser(options: AssignGroupToUserOptions = {}) {
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
    }: AssignGroupToUserVariables): Promise<boolean> => {
      return rbacService.assignGroupToUser(userId, data);
    },

    onSuccess: (_, { userId, data }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.groups(userId) });
      queryClient.invalidateQueries({
        queryKey: permissionGroupKeys.users(data.groupId),
      });

      if (showSuccessToast) {
        toast.success('Grupo atribuído ao usuário!');
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
   REMOVE GROUP FROM USER
   =========================================== */

export interface RemoveGroupFromUserVariables {
  userId: string;
  groupId: string;
}

export interface RemoveGroupFromUserOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useRemoveGroupFromUser(
  options: RemoveGroupFromUserOptions = {}
) {
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
      groupId,
    }: RemoveGroupFromUserVariables): Promise<void> => {
      await rbacService.removeGroupFromUser(userId, groupId);
    },

    onSuccess: (_, { userId, groupId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.groups(userId) });
      queryClient.invalidateQueries({
        queryKey: permissionGroupKeys.users(groupId),
      });

      if (showSuccessToast) {
        toast.success('Grupo removido do usuário!');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}
