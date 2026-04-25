'use client';

/**
 * PunchDeviceStatusCard — compact card with online/offline counts +
 * top critical (longest-offline) devices + link to /hr/punch/health.
 * Phase 7 / Plan 07-06 / Task 2.
 *
 * Powered by `usePunchDevicesHealth()` (REST seed + Socket.IO incremental).
 * NO silent fallbacks — errors render via <GridError/>.
 *
 * data-testid: punch-devices-card (root), punch-devices-card-item-{id}.
 */

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GridError } from '@/components/handlers/grid-error';
import { usePunchDevicesHealth } from '@/hooks/hr/use-punch-devices-health';
import type { PunchDeviceHealthItem } from '@/services/hr/punch-dashboard.service';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Cpu,
  ServerCrash,
  WifiOff,
  Wifi,
  CircleAlert,
} from 'lucide-react';

const TOP_CRITICAL_COUNT = 3;

function timeSince(iso: string | null): string {
  if (!iso) return 'Sem comunicação';
  try {
    const last = new Date(iso).getTime();
    const diffMs = Date.now() - last;
    if (diffMs < 60_000) return 'agora';
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 60) return `há ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    return `há ${days}d`;
  } catch {
    return 'há tempo';
  }
}

/**
 * Sort offline devices by `lastSeenAt` ASC (oldest first → most critical),
 * then any null `lastSeenAt` — those have never been heard from.
 */
function pickCriticalDevices(
  devices: PunchDeviceHealthItem[]
): PunchDeviceHealthItem[] {
  return devices
    .filter(d => d.status === 'OFFLINE')
    .sort((a, b) => {
      if (a.lastSeenAt === b.lastSeenAt) return 0;
      if (a.lastSeenAt === null) return -1;
      if (b.lastSeenAt === null) return 1;
      return (
        new Date(a.lastSeenAt).getTime() - new Date(b.lastSeenAt).getTime()
      );
    })
    .slice(0, TOP_CRITICAL_COUNT);
}

export function PunchDeviceStatusCard() {
  const { data, isLoading, isError, error, refetch } = usePunchDevicesHealth();

  if (isLoading) {
    return (
      <Card data-testid="punch-devices-card" className="p-4">
        <Skeleton className="mb-3 h-5 w-32" />
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <div data-testid="punch-devices-card">
        <GridError
          type="server"
          message={error?.message ?? 'Falha ao carregar saúde de dispositivos'}
          action={{
            label: 'Tentar novamente',
            onClick: () => {
              void refetch();
            },
          }}
        />
      </div>
    );
  }

  if (!data) return null;

  const critical = pickCriticalDevices(data.devices);
  const hasCritical = critical.length > 0;

  return (
    <Card data-testid="punch-devices-card" className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Dispositivos</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            <Wifi className="h-3 w-3" />
            <span data-testid="punch-devices-online-count">{data.online}</span>
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              'gap-1',
              data.offline > 0
                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                : 'text-muted-foreground'
            )}
          >
            <WifiOff className="h-3 w-3" />
            <span data-testid="punch-devices-offline-count">
              {data.offline}
            </span>
          </Badge>
        </div>
      </div>

      <div className="p-3">
        {hasCritical ? (
          <ul className="space-y-2">
            {critical.map(device => (
              <li
                key={device.id}
                data-testid={`punch-devices-card-item-${device.id}`}
                className="flex items-center justify-between gap-3 rounded-md border border-rose-100 bg-rose-50/40 px-3 py-2 text-sm dark:border-rose-500/20 dark:bg-rose-500/5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CircleAlert className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    <span className="truncate">{device.name}</span>
                  </div>
                  {device.location && (
                    <p className="truncate text-xs text-muted-foreground">
                      {device.location}
                    </p>
                  )}
                </div>
                <span className="font-mono text-xs text-rose-700 dark:text-rose-300">
                  {timeSince(device.lastSeenAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-1 py-4 text-center">
            <ServerCrash className="h-8 w-8 text-emerald-500/60" />
            <p className="text-sm text-muted-foreground">
              Todos os dispositivos online.
            </p>
          </div>
        )}
      </div>

      <div className="border-t bg-muted/40 px-4 py-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          data-testid="punch-devices-card-link"
        >
          <Link href="/hr/punch/health">
            Ver todos os dispositivos
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
