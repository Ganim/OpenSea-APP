import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { posConflictsService } from '@/services/sales/pos-conflicts.service';
import type {
  ListConflictsParams,
  ListConflictsResponse,
  ResolveConflictRequest,
} from '@/types/sales';

const KEYS = {
  all: ['pos-conflicts'] as const,
  list: (params: ListConflictsParams) => [...KEYS.all, 'list', params] as const,
  infinite: (params: Omit<ListConflictsParams, 'page'>) =>
    [...KEYS.all, 'infinite', params] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
};

/**
 * Lists POS order conflicts for the admin panel (Emporion Fase 1).
 *
 * Kept for non-listing use cases (e.g. count badges). New listings should
 * prefer `usePosConflictsInfinite` to follow the project's infinite-scroll
 * convention (see frontend-patterns.md §1).
 */
export function usePosConflicts(params: ListConflictsParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => posConflictsService.list(params),
  });
}

/**
 * Infinite-scroll variant of `usePosConflicts`. Drives the
 * `/sales/pos/conflicts` listing — fetches the next page based on
 * `meta.page < meta.pages` to follow the project pattern.
 */
export function usePosConflictsInfinite(
  params: Omit<ListConflictsParams, 'page'> = {}
) {
  return useInfiniteQuery<ListConflictsResponse>({
    queryKey: KEYS.infinite(params),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      posConflictsService.list({ ...params, page: pageParam as number }),
    getNextPageParam: lastPage =>
      lastPage.meta.page < lastPage.meta.pages
        ? lastPage.meta.page + 1
        : undefined,
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
