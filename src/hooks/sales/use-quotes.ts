import { quotesService } from '@/services/sales';
import type { QuotesQuery } from '@/services/sales/quotes.service';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export type QuotesFilters = Omit<QuotesQuery, 'page' | 'limit'>;

const QUOTE_KEYS = {
  all: ['quotes'] as const,
  list: (filters?: QuotesFilters) => ['quotes', 'list', filters] as const,
  detail: (id: string) => ['quotes', 'detail', id] as const,
} as const;

export function useQuotesInfinite(filters?: QuotesFilters, limit = 20) {
  return useInfiniteQuery({
    queryKey: QUOTE_KEYS.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await quotesService.list({
        ...filters,
        page: pageParam,
        limit,
      });
    },
    getNextPageParam: lastPage =>
      lastPage.meta.page < lastPage.meta.pages
        ? lastPage.meta.page + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: QUOTE_KEYS.detail(id),
    queryFn: () => quotesService.get(id),
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => quotesService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUOTE_KEYS.all });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      quotesService.update(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: QUOTE_KEYS.all });
      await queryClient.invalidateQueries({
        queryKey: QUOTE_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotesService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUOTE_KEYS.all });
    },
  });
}

export function useSendQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotesService.send(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUOTE_KEYS.all });
    },
  });
}

export function useConvertQuoteToOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotesService.convertToOrder(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUOTE_KEYS.all });
    },
  });
}

export function useDuplicateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotesService.duplicate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUOTE_KEYS.all });
    },
  });
}
