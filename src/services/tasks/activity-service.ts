import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CardActivity,
  ActivitiesQuery,
} from '@/types/tasks';

export interface ActivitiesResponse {
  activities: CardActivity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

function buildActivityQuery(params?: ActivitiesQuery): string {
  if (!params) return '';

  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.cardId) query.append('cardId', params.cardId);
  if (params.type) query.append('type', params.type);

  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export const activityService = {
  async boardActivity(
    boardId: string,
    params?: ActivitiesQuery,
  ): Promise<ActivitiesResponse> {
    const qs = buildActivityQuery(params);
    return apiClient.get<ActivitiesResponse>(
      `${API_ENDPOINTS.TASKS.ACTIVITY.BOARD(boardId)}${qs}`,
    );
  },

  async cardActivity(
    boardId: string,
    cardId: string,
    params?: ActivitiesQuery,
  ): Promise<ActivitiesResponse> {
    const qs = buildActivityQuery(params);
    return apiClient.get<ActivitiesResponse>(
      `${API_ENDPOINTS.TASKS.ACTIVITY.CARD(boardId, cardId)}${qs}`,
    );
  },
};
