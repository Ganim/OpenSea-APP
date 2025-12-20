import { meService } from '@/services';
import type {
    MessageResponse,
    ProfileResponse,
    UpdateEmailRequest,
    UpdatePasswordRequest,
    UpdateProfileRequest,
    UpdateUsernameRequest,
    UserResponse,
} from '@/types/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const meKeys = {
  all: ['me'] as const,
  detail: () => [...meKeys.all, 'detail'] as const,
  profile: () => [...meKeys.all, 'profile'] as const,
};

// Queries

/**
 * Hook para obter dados do usuário autenticado
 * GET /v1/me
 */
export function useMe(enabled = true) {
  return useQuery<UserResponse, Error>({
    queryKey: meKeys.detail(),
    queryFn: () => meService.getMe(),
    enabled,
    retry: false, // Não tentar novamente em caso de erro (ex: token inválido)
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Mutations

/**
 * Hook para atualizar perfil do usuário
 * PATCH /v1/me
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<ProfileResponse, Error, UpdateProfileRequest>({
    mutationFn: data => meService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meKeys.all });
    },
  });
}

/**
 * Hook para atualizar email do usuário
 * PATCH /v1/me/email
 */
export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, UpdateEmailRequest>({
    mutationFn: data => meService.updateEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meKeys.all });
    },
  });
}

/**
 * Hook para atualizar username do usuário
 * PATCH /v1/me/username
 */
export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, UpdateUsernameRequest>({
    mutationFn: data => meService.updateUsername(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meKeys.all });
    },
  });
}

/**
 * Hook para atualizar senha do usuário
 * PATCH /v1/me/password
 */
export function useUpdatePassword() {
  return useMutation<MessageResponse, Error, UpdatePasswordRequest>({
    mutationFn: data => meService.updatePassword(data),
  });
}

/**
 * Hook para deletar conta do usuário
 * DELETE /v1/me
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: () => meService.deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
