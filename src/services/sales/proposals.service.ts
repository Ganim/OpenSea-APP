import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

export interface ProposalsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProposalsResponse {
  proposals: Record<string, unknown>[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface ProposalResponse {
  proposal: Record<string, unknown>;
}

export const proposalsService = {
  async list(params?: ProposalsQuery): Promise<ProposalsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.customerId) searchParams.set('customerId', params.customerId);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.PROPOSALS.LIST}?${query}`
      : API_ENDPOINTS.PROPOSALS.LIST;
    return apiClient.get<ProposalsResponse>(url);
  },

  async get(id: string): Promise<ProposalResponse> {
    return apiClient.get<ProposalResponse>(API_ENDPOINTS.PROPOSALS.GET(id));
  },

  async create(data: Record<string, unknown>): Promise<ProposalResponse> {
    return apiClient.post<ProposalResponse>(
      API_ENDPOINTS.PROPOSALS.CREATE,
      data
    );
  },

  async update(
    id: string,
    data: Record<string, unknown>
  ): Promise<ProposalResponse> {
    return apiClient.put<ProposalResponse>(
      API_ENDPOINTS.PROPOSALS.UPDATE(id),
      data
    );
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.PROPOSALS.DELETE(id));
  },

  async send(id: string): Promise<ProposalResponse> {
    return apiClient.post<ProposalResponse>(
      API_ENDPOINTS.PROPOSALS.SEND(id),
      {}
    );
  },

  async approve(id: string): Promise<ProposalResponse> {
    return apiClient.post<ProposalResponse>(
      API_ENDPOINTS.PROPOSALS.APPROVE(id),
      {}
    );
  },

  async reject(
    id: string,
    data?: Record<string, unknown>
  ): Promise<ProposalResponse> {
    return apiClient.post<ProposalResponse>(
      API_ENDPOINTS.PROPOSALS.REJECT(id),
      data ?? {}
    );
  },

  async duplicate(id: string): Promise<ProposalResponse> {
    return apiClient.post<ProposalResponse>(
      API_ENDPOINTS.PROPOSALS.DUPLICATE(id),
      {}
    );
  },
};
