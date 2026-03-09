import { activityService } from '@/services/tasks';
import type { ActivitiesQuery } from '@/types/tasks';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

export const ACTIVITY_QUERY_KEYS = {
  BOARD_ACTIVITY: (boardId: string) => ['task-activity', boardId],
  CARD_ACTIVITY: (boardId: string, cardId: string) => [
    'task-activity',
    boardId,
    cardId,
  ],
} as const;

export function useBoardActivity(boardId: string, params?: ActivitiesQuery) {
  return useQuery({
    queryKey: [...ACTIVITY_QUERY_KEYS.BOARD_ACTIVITY(boardId), params],
    queryFn: () => activityService.boardActivity(boardId, params),
    enabled: !!boardId,
    placeholderData: keepPreviousData,
  });
}

export function useCardActivity(
  boardId: string,
  cardId: string,
  params?: ActivitiesQuery
) {
  return useQuery({
    queryKey: [...ACTIVITY_QUERY_KEYS.CARD_ACTIVITY(boardId, cardId), params],
    queryFn: () => activityService.cardActivity(boardId, cardId, params),
    enabled: !!boardId && !!cardId,
    placeholderData: keepPreviousData,
  });
}

export function useCardActivityInfinite(
  boardId: string,
  cardId: string,
  limit = 20
) {
  return useInfiniteQuery({
    queryKey: [
      ...ACTIVITY_QUERY_KEYS.CARD_ACTIVITY(boardId, cardId),
      'infinite',
      limit,
    ],
    queryFn: ({ pageParam }) =>
      activityService.cardActivity(boardId, cardId, { page: pageParam, limit }),
    getNextPageParam: lastPage =>
      lastPage.meta.page < lastPage.meta.pages
        ? lastPage.meta.page + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!boardId && !!cardId,
  });
}
