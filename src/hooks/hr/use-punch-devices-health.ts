'use client';

/**
 * usePunchDevicesHealth — current device health overview + realtime updates.
 * Phase 7 / Plan 07-06 / Task 1.
 *
 * Initial state via GET /v1/hr/punch-devices, then incremental updates via
 * Socket.IO `tenant.hr.devices.status-change`. Uses `setQueryData` to mutate
 * cache in place — NOT `invalidateQueries` — preserving the user's scroll
 * position and avoiding refetch storm (Pitfall 6).
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/use-socket';
import {
  punchDashboardService,
  type DevicesHealthResponse,
  type PunchDeviceStatus,
} from '@/services/hr/punch-dashboard.service';

export const PUNCH_DEVICES_HEALTH_KEY = ['punch', 'devices-health'] as const;

interface DeviceStatusEvent {
  deviceId: string;
  status: PunchDeviceStatus;
  lastSeenAt: string | null;
}

export function usePunchDevicesHealth() {
  const { on } = useSocket();
  const qc = useQueryClient();

  const query = useQuery<DevicesHealthResponse, Error>({
    queryKey: PUNCH_DEVICES_HEALTH_KEY,
    queryFn: () => punchDashboardService.fetchDevicesHealth(),
    staleTime: 30_000,
  });

  useEffect(() => {
    const off = on<DeviceStatusEvent>(
      'tenant.hr.devices.status-change',
      payload => {
        qc.setQueryData<DevicesHealthResponse>(
          PUNCH_DEVICES_HEALTH_KEY,
          old => {
            if (!old) return old;
            let online = 0;
            let offline = 0;
            const devices = old.devices.map(d => {
              if (d.id === payload.deviceId) {
                const updated = {
                  ...d,
                  status: payload.status,
                  lastSeenAt: payload.lastSeenAt,
                };
                if (updated.status === 'ONLINE') online += 1;
                else offline += 1;
                return updated;
              }
              if (d.status === 'ONLINE') online += 1;
              else offline += 1;
              return d;
            });
            return { ...old, online, offline, devices };
          }
        );
      }
    );
    return () => {
      off();
    };
  }, [on, qc]);

  return query;
}
