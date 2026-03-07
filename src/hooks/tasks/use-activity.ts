import { activityService } from '@/services/tasks';
import type { ActivitiesQuery } from '@/types/tasks';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const ACTIVITY_QUERY_KEYS = {
  BOARD_ACTIVITY: (boardId: string) => ['task-activity', boardId],
  CARD_ACTIVITY: (boardId: string, cardId: string) => ['task-activity', boardId, cardId],
} as const;

export function useBoardActivity(boardId: string, params?: ActivitiesQuery) {
  return useQuery({
    queryKey: [...ACTIVITY_QUERY_KEYS.BOARD_ACTIVITY(boardId), params],
    queryFn: () => activityService.boardActivity(boardId, params),
    enabled: !!boardId,
    placeholderData: keepPreviousData,
  });
}

export function useCardActivity(boardId: string, cardId: string, params?: ActivitiesQuery) {
  return useQuery({
    queryKey: [...ACTIVITY_QUERY_KEYS.CARD_ACTIVITY(boardId, cardId), params],
    queryFn: () => activityService.cardActivity(boardId, cardId, params),
    enabled: !!boardId && !!cardId,
    placeholderData: keepPreviousData,
  });
}
