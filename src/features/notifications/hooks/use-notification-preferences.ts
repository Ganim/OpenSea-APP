'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchModulesManifest,
  fetchNotificationSettings,
  fetchPreferences,
  listPushDevices,
  resolveNotification,
  revokePushDevice,
  sendTestNotification,
  updateNotificationSettings,
  updatePreferences,
} from '../services/notifications-v2.service';
import type {
  NotificationPreferencesBundle,
  UserNotificationSettings,
} from '../types';

const KEYS = {
  manifest: ['notifications-v2', 'manifest'] as const,
  settings: ['notifications-v2', 'settings'] as const,
  preferences: ['notifications-v2', 'preferences'] as const,
  devices: ['notifications-v2', 'devices'] as const,
};

export function useNotificationModulesManifest() {
  return useQuery({
    queryKey: KEYS.manifest,
    queryFn: fetchModulesManifest,
    staleTime: 5 * 60 * 1000,
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: KEYS.settings,
    queryFn: fetchNotificationSettings,
  });
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (partial: Partial<UserNotificationSettings>) =>
      updateNotificationSettings(partial),
    onMutate: async partial => {
      await qc.cancelQueries({ queryKey: KEYS.settings });
      const prev = qc.getQueryData<UserNotificationSettings>(KEYS.settings);
      if (prev) {
        qc.setQueryData(KEYS.settings, { ...prev, ...partial });
      }
      return { prev };
    },
    onError: (_err, _partial, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEYS.settings, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.settings }),
  });
}

export function useNotificationPreferencesBundle() {
  return useQuery({
    queryKey: KEYS.preferences,
    queryFn: fetchPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<NotificationPreferencesBundle>) =>
      updatePreferences(payload),
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.preferences }),
  });
}

export function usePushDevices() {
  return useQuery({
    queryKey: KEYS.devices,
    queryFn: listPushDevices,
  });
}

export function useRevokePushDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokePushDevice(id),
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.devices }),
  });
}

export function useResolveNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resolveNotification,
    onSettled: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useSendTestNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type?: string) => sendTestNotification(type),
    onSettled: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
