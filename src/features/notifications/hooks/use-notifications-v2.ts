'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';

import type { NotificationRecord } from '../types';

interface ListResponse {
  notifications: NotificationRecord[];
  nextCursor: string | null;
  total: number;
  totalUnread: number;
}

interface ListFilters {
  isRead?: boolean;
  kind?: string;
  state?: string;
  limit?: number;
  cursor?: string;
}

const KEYS = {
  list: (filters?: ListFilters) =>
    ['notifications', 'v2', 'list', filters ?? {}] as const,
  unread: ['notifications', 'v2', 'unread-count'] as const,
};

export function useNotificationsListV2(filters?: ListFilters) {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn: async (): Promise<ListResponse> => {
      const params = new URLSearchParams();
      if (filters?.isRead !== undefined)
        params.set('isRead', String(filters.isRead));
      if (filters?.kind) params.set('kind', filters.kind);
      if (filters?.state) params.set('state', filters.state);
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.cursor) params.set('cursor', filters.cursor);
      const query = params.toString();
      return apiClient.get<ListResponse>(
        `/v1/notifications/me${query ? `?${query}` : ''}`
      );
    },
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useMarkNotificationReadV2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch<void>(`/v1/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllReadV2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.patch<void>('/v1/notifications/mark-all-read'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotificationV2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<void>(`/v1/notifications/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
