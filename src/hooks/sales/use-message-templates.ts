import { messageTemplatesService } from '@/services/sales';
import type { MessageTemplatesQuery } from '@/services/sales/message-templates.service';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export type MessageTemplatesFilters = Omit<
  MessageTemplatesQuery,
  'page' | 'limit'
>;

const MSG_TEMPLATE_KEYS = {
  all: ['message-templates'] as const,
  list: (filters?: MessageTemplatesFilters) =>
    ['message-templates', 'list', filters] as const,
  detail: (id: string) => ['message-templates', 'detail', id] as const,
} as const;

export function useMessageTemplatesInfinite(
  filters?: MessageTemplatesFilters,
  limit = 20
) {
  return useInfiniteQuery({
    queryKey: MSG_TEMPLATE_KEYS.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return await messageTemplatesService.list({
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

export function useMessageTemplate(id: string) {
  return useQuery({
    queryKey: MSG_TEMPLATE_KEYS.detail(id),
    queryFn: () => messageTemplatesService.get(id),
    enabled: !!id,
  });
}

export function useCreateMessageTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      messageTemplatesService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: MSG_TEMPLATE_KEYS.all,
      });
    },
  });
}

export function useUpdateMessageTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      messageTemplatesService.update(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: MSG_TEMPLATE_KEYS.all,
      });
      await queryClient.invalidateQueries({
        queryKey: MSG_TEMPLATE_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeleteMessageTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => messageTemplatesService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: MSG_TEMPLATE_KEYS.all,
      });
    },
  });
}

export function usePreviewMessageTemplate() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: Record<string, unknown>;
    }) => messageTemplatesService.preview(id, data),
  });
}

export function useDuplicateMessageTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => messageTemplatesService.duplicate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: MSG_TEMPLATE_KEYS.all,
      });
    },
  });
}
