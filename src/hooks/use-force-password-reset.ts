import { usersService } from '@/services/auth/users.service';
import type { ForcePasswordResetRequest } from '@/types/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useForcePasswordReset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: ForcePasswordResetRequest;
    }) => {
      return usersService.forcePasswordReset(userId, data);
    },
    onSuccess: () => {
      // Invalidar cache de usuários
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
