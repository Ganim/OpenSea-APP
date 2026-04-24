import { usersService } from '@/services/auth/users.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useAdminSetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: { newPassword: string; forceChangeOnNextLogin: boolean };
    }) => {
      return usersService.adminSetPassword(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
