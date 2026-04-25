import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { posConflictsService } from '@/services/sales/pos-conflicts.service';
import type {
  ListConflictsParams,
  ResolveConflictRequest,
} from '@/types/sales';

const KEYS = {
  all: ['pos-conflicts'] as const,
  list: (params: ListConflictsParams) => [...KEYS.all, 'list', params] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
};

/**
 * Lists POS order conflicts for the admin panel (Emporion Fase 1).
 */
export function usePosConflicts(params: ListConflictsParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => posConflictsService.list(params),
  });
}

/**
 * Fetches a single conflict in detail (Emporion Fase 1).
 */
export function usePosConflict(id: string | null | undefined) {
  return useQuery({
    queryKey: KEYS.detail(id ?? ''),
    queryFn: () => {
      if (!id) {
        throw new Error('Conflict id is required.');
      }
      return posConflictsService.get(id);
    },
    enabled: !!id,
  });
}

/**
 * Mutation for the admin "resolve conflict" action — supports
 * CANCEL_AND_REFUND, FORCE_ADJUSTMENT, and SUBSTITUTE_ITEM.
 */
export function useResolveConflict() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ResolveConflictRequest;
    }) => posConflictsService.resolve(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Conflito resolvido com sucesso.');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Erro ao resolver conflito.';
      toast.error(message);
    },
  });
}
