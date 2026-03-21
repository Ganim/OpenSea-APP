import { timelineService } from '@/services/sales';
import { useInfiniteQuery } from '@tanstack/react-query';

const QUERY_KEYS = {
  TIMELINE: (entityId: string, entityType: string) => [
    'timeline',
    entityId,
    entityType,
  ],
} as const;

const PAGE_SIZE = 20;

// GET /v1/timeline - Timeline com infinite scroll
export function useTimeline(
  entityId: string,
  entityType: 'deal' | 'contact' | 'customer'
) {
  const result = useInfiniteQuery({
    queryKey: QUERY_KEYS.TIMELINE(entityId, entityType),
    queryFn: async ({ pageParam = 1 }) => {
      return await timelineService.getTimeline({
        entityId,
        entityType,
        page: pageParam,
        limit: PAGE_SIZE,
      });
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      if (lastPage.meta.page < lastPage.meta.pages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    enabled: !!entityId && !!entityType,
    staleTime: 30_000,
  });

  const items = result.data?.pages.flatMap(p => p.items) ?? [];
  const total = result.data?.pages[0]?.meta.total ?? 0;

  return {
    ...result,
    items,
    total,
  };
}
