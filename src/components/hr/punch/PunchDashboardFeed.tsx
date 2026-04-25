'use client';

/**
 * PunchDashboardFeed — vertical scrollable list of today's punches with
 * realtime updates (Phase 7 / Plan 07-06 / Task 2).
 *
 * Powered by `usePunchFeed()` (useInfiniteQuery + Socket.IO scoped events).
 * NO silent fallbacks — errors render via <GridError/>.
 *
 * data-testid: punch-feed (root), punch-feed-item-{id} (each row).
 */

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GridError } from '@/components/handlers/grid-error';
import { Badge } from '@/components/ui/badge';
import { usePunchFeed } from '@/hooks/hr/use-punch-feed';
import type { TodayFeedEntry } from '@/services/hr/punch-dashboard.service';
import { cn } from '@/lib/utils';
import { Smartphone, MonitorSmartphone, Clock } from 'lucide-react';

const TYPE_LABEL: Record<string, string> = {
  CLOCK_IN: 'Entrada',
  CLOCK_OUT: 'Saída',
  BREAK_START: 'Início pausa',
  BREAK_END: 'Fim pausa',
  OVERTIME_START: 'Início HE',
  OVERTIME_END: 'Fim HE',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

function FeedItem({ entry }: { entry: TodayFeedEntry }) {
  return (
    <div
      data-testid={`punch-feed-item-${entry.id}`}
      className={cn(
        'flex items-start gap-3 rounded-md border p-3 text-sm',
        'bg-card hover:bg-accent/30 transition-colors',
        'animate-in slide-in-from-top-1 fade-in duration-300'
      )}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted">
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium">{entry.employeeName}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {formatTime(entry.occurredAt)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="font-normal">
            {TYPE_LABEL[entry.type] ?? entry.type}
          </Badge>
          {entry.deviceLabel && (
            <span className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              {entry.deviceLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function PunchDashboardFeed() {
  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePunchFeed();

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '120px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <Card data-testid="punch-feed" className="p-3">
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <div data-testid="punch-feed">
        <GridError
          type="server"
          message={error?.message ?? 'Falha ao carregar feed em tempo real'}
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

  const entries = data.pages.flatMap(p => p.entries);

  if (entries.length === 0) {
    return (
      <Card
        data-testid="punch-feed"
        className="flex flex-col items-center gap-2 p-8 text-center"
      >
        <MonitorSmartphone className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Nenhuma batida registrada hoje. Novas batidas aparecerão aqui em tempo
          real.
        </p>
      </Card>
    );
  }

  return (
    <Card data-testid="punch-feed" className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-semibold">Batidas de hoje</h3>
        <Badge variant="secondary" className="font-mono">
          {entries.length}
        </Badge>
      </div>
      <div className="max-h-[640px] space-y-2 overflow-y-auto p-3">
        {entries.map(entry => (
          <FeedItem key={entry.id} entry={entry} />
        ))}
        <div ref={sentinelRef} className="h-px" />
        {isFetchingNextPage && (
          <Skeleton className="h-14 w-full" data-testid="punch-feed-fetching" />
        )}
      </div>
    </Card>
  );
}
