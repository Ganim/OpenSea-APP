import { apiClient } from '@/lib/api-client';

import type {
  NotificationModuleManifest,
  NotificationPreferencesBundle,
  PushDeviceRow,
  UserNotificationSettings,
} from '../types';

export async function fetchModulesManifest(): Promise<{
  modules: NotificationModuleManifest[];
}> {
  return apiClient.get('/v1/notifications/modules-manifest');
}

export async function fetchNotificationSettings(): Promise<UserNotificationSettings> {
  return apiClient.get('/v1/notifications/settings');
}

export async function updateNotificationSettings(
  partial: Partial<UserNotificationSettings>
): Promise<void> {
  await apiClient.put('/v1/notifications/settings', partial);
}

export async function fetchPreferences(): Promise<NotificationPreferencesBundle> {
  return apiClient.get('/v1/notifications/preferences');
}

export async function updatePreferences(
  payload: Partial<NotificationPreferencesBundle>
): Promise<void> {
  await apiClient.put('/v1/notifications/preferences', payload);
}

export async function resolveNotification(params: {
  notificationId: string;
  actionKey: string;
  payload?: Record<string, unknown>;
  reason?: string;
}): Promise<{ state: 'RESOLVED' | 'DECLINED'; callbackQueued: boolean }> {
  const { notificationId, ...body } = params;
  return apiClient.post(`/v1/notifications/${notificationId}/resolve`, body);
}

export async function listPushDevices(): Promise<{ devices: PushDeviceRow[] }> {
  return apiClient.get('/v1/notifications/push-subscriptions');
}

export async function registerPushDevice(params: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  deviceName?: string;
  userAgent?: string;
}): Promise<{ id: string }> {
  return apiClient.post('/v1/notifications/push-subscriptions', params);
}

export async function revokePushDevice(id: string): Promise<void> {
  await apiClient.delete(`/v1/notifications/push-subscriptions/${id}`);
}

export async function sendTestNotification(type?: string): Promise<{
  dispatched: string[];
}> {
  return apiClient.post('/v1/notifications/test-send', { type });
}
