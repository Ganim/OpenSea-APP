'use client';

import {
  Bell,
  CheckCheck,
  Filter,
  Loader2,
  RefreshCw,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { PageActionBar } from '@/components/layout/page-action-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useMarkAllNotificationsAsRead,
  useNotificationsList,
} from '@/hooks/notifications';
import type { BackendNotification } from '@/types/admin';

import { NotificationItem } from '@/features/notifications/components/renderers/notification-item';
import type { NotificationRecord } from '@/features/notifications/types';

function toV2Record(n: BackendNotification): NotificationRecord {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    kind: (n as unknown as { kind?: NotificationRecord['kind'] }).kind ?? null,
    priority: n.priority as unknown as NotificationRecord['priority'],
    state:
      (n as unknown as { state?: NotificationRecord['state'] }).state ?? null,
    actionUrl: n.actionUrl ?? null,
    fallbackUrl:
      (n as unknown as { fallbackUrl?: string | null }).fallbackUrl ?? null,
    actions:
      (n as unknown as { actions?: NotificationRecord['actions'] }).actions ??
      null,
    resolvedAction:
      (n as unknown as { resolvedAction?: string | null }).resolvedAction ??
      null,
    entityType: n.entityType ?? null,
    entityId: n.entityId ?? null,
    metadata: n.metadata ?? null,
    isRead: n.isRead,
    progress: (n as unknown as { progress?: number | null }).progress ?? null,
    progressTotal:
      (n as unknown as { progressTotal?: number | null }).progressTotal ?? null,
    expiresAt:
      (n as unknown as { expiresAt?: string | null }).expiresAt ?? null,
    createdAt: n.createdAt,
  };
}

type ReadFilter = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filters = useMemo(() => {
    const f: Record<string, unknown> = { limit: 50 };
    if (readFilter === 'read') f.isRead = true;
    if (readFilter === 'unread') f.isRead = false;
    if (typeFilter !== 'all') f.type = typeFilter;
    return f;
  }, [readFilter, typeFilter]);

  const { data, isLoading, refetch, isFetching } =
    useNotificationsList(filters);
  const markAll = useMarkAllNotificationsAsRead();

  const items = useMemo(
    () => (data?.notifications ?? []).map(toV2Record),
    [data?.notifications]
  );
  const unread = items.filter(n => !n.isRead).length;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageActionBar
        breadcrumbItems={[{ label: 'Notificações', href: '/notifications' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
              />
              Atualizar
            </Button>
            {unread > 0 && (
              <Button
                size="sm"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Marcar todas como lidas
              </Button>
            )}
            <Button asChild size="sm" variant="ghost" className="gap-2">
              <Link href="/profile?tab=notifications">
                <Settings className="w-4 h-4" />
                Preferências
              </Link>
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="p-4 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </div>

          <Select
            value={readFilter}
            onValueChange={v => setReadFilter(v as ReadFilter)}
          >
            <SelectTrigger className="w-40 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unread">Não lidas</SelectItem>
              <SelectItem value="read">Lidas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={v => setTypeFilter(v)}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="INFO">Informativa</SelectItem>
              <SelectItem value="WARNING">Alerta</SelectItem>
              <SelectItem value="ERROR">Erro</SelectItem>
              <SelectItem value="SUCCESS">Sucesso</SelectItem>
              <SelectItem value="REMINDER">Lembrete</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{items.length} listadas</Badge>
            {unread > 0 && (
              <Badge variant="destructive">{unread} não lidas</Badge>
            )}
            <span>· total: {total}</span>
          </div>
        </div>
      </Card>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <div className="flex flex-col items-center justify-center text-center gap-3">
            <div className="p-4 rounded-full bg-muted/50">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Nenhuma notificação
              </p>
              <p className="text-sm text-muted-foreground">
                {readFilter === 'unread'
                  ? 'Você leu tudo. Volte mais tarde.'
                  : 'Você não recebeu notificações ainda.'}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map(n => (
            <NotificationItem key={n.id} notification={n} />
          ))}
          {isFetching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
