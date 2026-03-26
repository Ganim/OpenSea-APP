import { accountantService } from '@/services/finance';
import type { InviteAccountantRequest } from '@/types/finance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEYS = {
  ACCOUNTANT_ACCESSES: ['accountant-accesses'],
} as const;

export { QUERY_KEYS as accountantKeys };

// =============================================================================
// QUERY HOOKS
// =============================================================================

export function useAccountantAccesses() {
  return useQuery({
    queryKey: QUERY_KEYS.ACCOUNTANT_ACCESSES,
    queryFn: () => accountantService.list(),
  });
}

// =============================================================================
// MUTATION HOOKS
// =============================================================================

export function useInviteAccountant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteAccountantRequest) =>
      accountantService.invite(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ACCOUNTANT_ACCESSES,
      });
    },
  });
}

export function useRevokeAccountant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountantService.revoke(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ACCOUNTANT_ACCESSES,
      });
    },
  });
}
