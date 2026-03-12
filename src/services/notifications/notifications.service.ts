/**
 * Notifications Service
 * Serviço para gerenciamento de notificações do usuário
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  NotificationFilters,
  NotificationListResponse,
} from '@/types/admin';

// ============================================
// LIST NOTIFICATIONS
// ============================================

export async function listNotifications(
  filters?: NotificationFilters
): Promise<NotificationListResponse> {
  const params: Record<string, string> = {};

  if (filters) {
    if (filters.page !== undefined) params.page = String(filters.page);
    if (filters.limit !== undefined) params.limit = String(filters.limit);
    if (filters.isRead !== undefined) params.isRead = String(filters.isRead);
    if (filters.type) params.type = filters.type;
    if (filters.channel) params.channel = filters.channel;
    if (filters.priority) params.priority = filters.priority;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
  }

  return apiClient.get<NotificationListResponse>(
    API_ENDPOINTS.NOTIFICATIONS.LIST,
    { params }
  );
}

// ============================================
// MARK AS READ
// ============================================

export async function markNotificationAsRead(id: string): Promise<void> {
  await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id));
}

// ============================================
// MARK ALL AS READ
// ============================================

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
}

// ============================================
// DELETE NOTIFICATION
// ============================================

export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
}
