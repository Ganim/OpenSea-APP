import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  ActivitiesQuery,
  ActivityResponse,
  CreateActivityRequest,
  PaginatedActivitiesResponse,
  UpdateActivityRequest,
} from '@/types/sales';

export const activitiesService = {
  // GET /v1/activities with pagination and filters
  async list(query?: ActivitiesQuery): Promise<PaginatedActivitiesResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query?.search) params.append('search', query.search);
    if (query?.type) params.append('type', query.type);
    if (query?.dealId) params.append('dealId', query.dealId);
    if (query?.contactId) params.append('contactId', query.contactId);
    if (query?.customerId) params.append('customerId', query.customerId);
    if (query?.assignedToUserId)
      params.append('assignedToUserId', query.assignedToUserId);
    if (query?.isCompleted !== undefined)
      params.append('isCompleted', String(query.isCompleted));

    const url = params.toString()
      ? `${API_ENDPOINTS.ACTIVITIES.LIST}?${params.toString()}`
      : API_ENDPOINTS.ACTIVITIES.LIST;

    return apiClient.get<PaginatedActivitiesResponse>(url);
  },

  // POST /v1/activities
  async create(data: CreateActivityRequest): Promise<ActivityResponse> {
    return apiClient.post<ActivityResponse>(
      API_ENDPOINTS.ACTIVITIES.CREATE,
      data
    );
  },

  // PUT /v1/activities/:activityId
  async update(
    activityId: string,
    data: UpdateActivityRequest
  ): Promise<ActivityResponse> {
    return apiClient.put<ActivityResponse>(
      API_ENDPOINTS.ACTIVITIES.UPDATE(activityId),
      data
    );
  },

  // DELETE /v1/activities/:activityId
  async delete(activityId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.ACTIVITIES.DELETE(activityId));
  },
};
