import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

export interface WorkflowsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WorkflowsResponse {
  workflows: Record<string, unknown>[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface WorkflowResponse {
  workflow: Record<string, unknown>;
}

export const workflowsService = {
  async list(params?: WorkflowsQuery): Promise<WorkflowsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.WORKFLOWS.LIST}?${query}`
      : API_ENDPOINTS.WORKFLOWS.LIST;
    return apiClient.get<WorkflowsResponse>(url);
  },

  async get(id: string): Promise<WorkflowResponse> {
    return apiClient.get<WorkflowResponse>(API_ENDPOINTS.WORKFLOWS.GET(id));
  },

  async create(data: Record<string, unknown>): Promise<WorkflowResponse> {
    return apiClient.post<WorkflowResponse>(
      API_ENDPOINTS.WORKFLOWS.CREATE,
      data
    );
  },

  async update(
    id: string,
    data: Record<string, unknown>
  ): Promise<WorkflowResponse> {
    return apiClient.put<WorkflowResponse>(
      API_ENDPOINTS.WORKFLOWS.UPDATE(id),
      data
    );
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.WORKFLOWS.DELETE(id));
  },

  async activate(id: string): Promise<WorkflowResponse> {
    return apiClient.post<WorkflowResponse>(
      API_ENDPOINTS.WORKFLOWS.ACTIVATE(id),
      {}
    );
  },

  async deactivate(id: string): Promise<WorkflowResponse> {
    return apiClient.post<WorkflowResponse>(
      API_ENDPOINTS.WORKFLOWS.DEACTIVATE(id),
      {}
    );
  },

  async execute(
    id: string,
    data?: Record<string, unknown>
  ): Promise<WorkflowResponse> {
    return apiClient.post<WorkflowResponse>(
      API_ENDPOINTS.WORKFLOWS.EXECUTE(id),
      data ?? {}
    );
  },
};
