import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

export interface MessageTemplatesQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  channel?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MessageTemplatesResponse {
  messageTemplates: Record<string, unknown>[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface MessageTemplateResponse {
  messageTemplate: Record<string, unknown>;
}

export const messageTemplatesService = {
  async list(
    params?: MessageTemplatesQuery
  ): Promise<MessageTemplatesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.channel) searchParams.set('channel', params.channel);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.MESSAGE_TEMPLATES.LIST}?${query}`
      : API_ENDPOINTS.MESSAGE_TEMPLATES.LIST;
    return apiClient.get<MessageTemplatesResponse>(url);
  },

  async get(id: string): Promise<MessageTemplateResponse> {
    return apiClient.get<MessageTemplateResponse>(
      API_ENDPOINTS.MESSAGE_TEMPLATES.GET(id)
    );
  },

  async create(
    data: Record<string, unknown>
  ): Promise<MessageTemplateResponse> {
    return apiClient.post<MessageTemplateResponse>(
      API_ENDPOINTS.MESSAGE_TEMPLATES.CREATE,
      data
    );
  },

  async update(
    id: string,
    data: Record<string, unknown>
  ): Promise<MessageTemplateResponse> {
    return apiClient.put<MessageTemplateResponse>(
      API_ENDPOINTS.MESSAGE_TEMPLATES.UPDATE(id),
      data
    );
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.MESSAGE_TEMPLATES.DELETE(id));
  },

  async preview(
    id: string,
    data?: Record<string, unknown>
  ): Promise<{ preview: string }> {
    return apiClient.post<{ preview: string }>(
      API_ENDPOINTS.MESSAGE_TEMPLATES.PREVIEW(id),
      data ?? {}
    );
  },

  async duplicate(id: string): Promise<MessageTemplateResponse> {
    return apiClient.post<MessageTemplateResponse>(
      API_ENDPOINTS.MESSAGE_TEMPLATES.DUPLICATE(id),
      {}
    );
  },
};
