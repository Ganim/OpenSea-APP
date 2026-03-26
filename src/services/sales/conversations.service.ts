import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

export interface ConversationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  channel?: string;
  customerId?: string;
  assignedToUserId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ConversationsResponse {
  conversations: Record<string, unknown>[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface ConversationResponse {
  conversation: Record<string, unknown>;
}

export interface MessageResponse {
  message: Record<string, unknown>;
}

export const conversationsService = {
  async list(params?: ConversationsQuery): Promise<ConversationsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.channel) searchParams.set('channel', params.channel);
    if (params?.customerId) searchParams.set('customerId', params.customerId);
    if (params?.assignedToUserId)
      searchParams.set('assignedToUserId', params.assignedToUserId);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.CONVERSATIONS.LIST}?${query}`
      : API_ENDPOINTS.CONVERSATIONS.LIST;
    return apiClient.get<ConversationsResponse>(url);
  },

  async get(id: string): Promise<ConversationResponse> {
    return apiClient.get<ConversationResponse>(
      API_ENDPOINTS.CONVERSATIONS.GET(id)
    );
  },

  async create(data: Record<string, unknown>): Promise<ConversationResponse> {
    return apiClient.post<ConversationResponse>(
      API_ENDPOINTS.CONVERSATIONS.CREATE,
      data
    );
  },

  async update(
    id: string,
    data: Record<string, unknown>
  ): Promise<ConversationResponse> {
    return apiClient.put<ConversationResponse>(
      API_ENDPOINTS.CONVERSATIONS.UPDATE(id),
      data
    );
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.CONVERSATIONS.DELETE(id));
  },

  async sendMessage(
    id: string,
    data: Record<string, unknown>
  ): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>(
      API_ENDPOINTS.CONVERSATIONS.SEND_MESSAGE(id),
      data
    );
  },

  async markAsRead(id: string): Promise<ConversationResponse> {
    return apiClient.post<ConversationResponse>(
      API_ENDPOINTS.CONVERSATIONS.MARK_AS_READ(id),
      {}
    );
  },

  async close(id: string): Promise<ConversationResponse> {
    return apiClient.post<ConversationResponse>(
      API_ENDPOINTS.CONVERSATIONS.CLOSE(id),
      {}
    );
  },

  async archive(id: string): Promise<ConversationResponse> {
    return apiClient.post<ConversationResponse>(
      API_ENDPOINTS.CONVERSATIONS.ARCHIVE(id),
      {}
    );
  },
};
