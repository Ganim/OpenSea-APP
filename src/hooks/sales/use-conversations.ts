import { conversationsService } from '@/services/sales';
import type { ConversationsQuery } from '@/services/sales/conversations.service';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export type ConversationsFilters = Omit<ConversationsQuery, 'page' | 'limit'>;

const CONVERSATION_KEYS = {
  all: ['conversations'] as const,
  list: (filters?: ConversationsFilters) =>
    ['conversations', 'list', filters] as const,
  detail: (id: string) => ['conversations', 'detail', id] as const,
} as const;

export function useConversationsInfinite(
  filters?: ConversationsFilters,
  limit = 20
) {
  return useInfiniteQuery({
    queryKey: CONVERSATION_KEYS.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await conversationsService.list({
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

export function useConversation(id: string) {
  return useQuery({
    queryKey: CONVERSATION_KEYS.detail(id),
    queryFn: () => conversationsService.get(id),
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      conversationsService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CONVERSATION_KEYS.all,
      });
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      conversationsService.update(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: CONVERSATION_KEYS.all,
      });
      await queryClient.invalidateQueries({
        queryKey: CONVERSATION_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conversationsService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CONVERSATION_KEYS.all,
      });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      conversationsService.sendMessage(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: CONVERSATION_KEYS.detail(variables.id),
      });
    },
  });
}

export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conversationsService.markAsRead(id),
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({
        queryKey: CONVERSATION_KEYS.detail(id),
      });
    },
  });
}

export function useCloseConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conversationsService.close(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CONVERSATION_KEYS.all,
      });
    },
  });
}

export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conversationsService.archive(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CONVERSATION_KEYS.all,
      });
    },
  });
}
