'use client';

import { messagingService } from '@/services/messaging';
import type {
  MessagingContactsResponse,
  MessagingMessagesResponse,
  SendMessageRequest,
} from '@/types/messaging';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const messagingKeys = {
  all: ['messaging'] as const,
  accounts: () => [...messagingKeys.all, 'accounts'] as const,
  contacts: (params?: { channel?: string; search?: string }) =>
    [...messagingKeys.all, 'contacts', params] as const,
  messages: (contactId: string) =>
    [...messagingKeys.all, 'messages', contactId] as const,
};

// ─── Accounts ────────────────────────────────────────────────────────────────

export function useMessagingAccounts() {
  return useQuery({
    queryKey: messagingKeys.accounts(),
    queryFn: () => messagingService.listAccounts(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateMessagingAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: messagingService.createAccount.bind(messagingService),
    onSuccess: async () => {
      toast.success('Conta conectada com sucesso');
      await queryClient.invalidateQueries({
        queryKey: messagingKeys.accounts(),
      });
    },
    onError: () => toast.error('Erro ao conectar conta'),
  });
}

export function useDeleteMessagingAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => messagingService.deleteAccount(id),
    onSuccess: async () => {
      toast.success('Conta removida');
      await queryClient.invalidateQueries({ queryKey: messagingKeys.all });
    },
    onError: () => toast.error('Erro ao remover conta'),
  });
}

// ─── Contacts (Infinite Scroll) ──────────────────────────────────────────────

export function useMessagingContacts(params?: {
  channel?: string;
  search?: string;
}) {
  return useInfiniteQuery<MessagingContactsResponse>({
    queryKey: messagingKeys.contacts(params),
    queryFn: ({ pageParam }) =>
      messagingService.listContacts({
        page: pageParam as number,
        limit: 30,
        channel: params?.channel,
        search: params?.search,
      }),
    initialPageParam: 1 as number,
    getNextPageParam: lastPage =>
      lastPage.meta.page < lastPage.meta.pages
        ? lastPage.meta.page + 1
        : undefined,
    staleTime: 30_000,
    refetchInterval: 15_000,
  });
}

// ─── Messages (Infinite Scroll — load older on scroll up) ────────────────────

export function useMessagingMessages(contactId: string | null) {
  return useInfiniteQuery<MessagingMessagesResponse>({
    queryKey: messagingKeys.messages(contactId ?? ''),
    queryFn: ({ pageParam }) =>
      messagingService.listMessages(contactId!, {
        page: pageParam as number,
        limit: 40,
      }),
    initialPageParam: 1 as number,
    getNextPageParam: lastPage =>
      lastPage.meta.page < lastPage.meta.pages
        ? lastPage.meta.page + 1
        : undefined,
    enabled: Boolean(contactId),
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}

// ─── Send Message ────────────────────────────────────────────────────────────

export function useSendMessagingMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SendMessageRequest) =>
      messagingService.sendMessage(body),
    onSuccess: async (_data, variables) => {
      // Invalidate messages for this contact
      await queryClient.invalidateQueries({
        queryKey: messagingKeys.messages(variables.contactId),
      });
      // Also refresh contacts list to update lastMessageAt/preview
      await queryClient.invalidateQueries({
        queryKey: [...messagingKeys.all, 'contacts'],
      });
    },
    onError: () => toast.error('Erro ao enviar mensagem'),
  });
}
