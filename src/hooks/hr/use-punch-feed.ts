'use client';

/**
 * usePunchFeed — realtime feed of today's TimeEntries.
 * Phase 7 / Plan 07-06 / Task 1.
 *
 * Hybrid: useInfiniteQuery for HTTP backfill (today, 50 per page) +
 * Socket.IO `punch.time-entry.scoped` listener that PREPENDS new entries
 * via `queryClient.setQueryData` (Pitfall 6 — incremental update, not
 * `invalidateQueries`, to avoid refetch storm and preserve scroll).
 */

import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/use-socket';
import {
  punchDashboardService,
  type TodayFeedEntry,
  type TodayFeedResponse,
} from '@/services/hr/punch-dashboard.service';

export const PUNCH_FEED_QUERY_KEY = ['punch', 'feed', 'today'] as const;

const PAGE_SIZE = 50;

interface InfinitePagesShape {
  pages: TodayFeedResponse[];
  pageParams: number[];
}

export function usePunchFeed() {
  const { on } = useSocket();
  const qc = useQueryClient();

  const query = useInfiniteQuery<TodayFeedResponse, Error>({
    queryKey: PUNCH_FEED_QUERY_KEY,
    queryFn: ({ pageParam }) =>
      punchDashboardService.fetchTodayEntries({
        offset: (pageParam as number) ?? 0,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length * PAGE_SIZE : undefined,
    staleTime: 30_000,
  });

  useEffect(() => {
    const off = on<TodayFeedEntry>(
      'punch.time-entry.scoped',
      (payload: TodayFeedEntry) => {
        qc.setQueryData<InfinitePagesShape>(PUNCH_FEED_QUERY_KEY, old => {
          if (!old) return old;
          const newPages = [...old.pages];
          const first = newPages[0];
          if (!first) return old;
          newPages[0] = {
            ...first,
            entries: [payload, ...first.entries],
          };
          return { ...old, pages: newPages };
        });
      }
    );
    return () => {
      off();
    };
  }, [on, qc]);

  return query;
}
