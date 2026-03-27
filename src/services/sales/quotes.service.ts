import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

export interface QuotesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QuotesResponse {
  quotes: Record<string, unknown>[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface QuoteResponse {
  quote: Record<string, unknown>;
}

export const quotesService = {
  async list(params?: QuotesQuery): Promise<QuotesResponse> {
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
      ? `${API_ENDPOINTS.QUOTES.LIST}?${query}`
      : API_ENDPOINTS.QUOTES.LIST;
    return apiClient.get<QuotesResponse>(url);
  },

  async get(id: string): Promise<QuoteResponse> {
    return apiClient.get<QuoteResponse>(API_ENDPOINTS.QUOTES.GET(id));
  },

  async create(data: Record<string, unknown>): Promise<QuoteResponse> {
    return apiClient.post<QuoteResponse>(API_ENDPOINTS.QUOTES.CREATE, data);
  },

  async update(
    id: string,
    data: Record<string, unknown>
  ): Promise<QuoteResponse> {
    return apiClient.put<QuoteResponse>(API_ENDPOINTS.QUOTES.UPDATE(id), data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.QUOTES.DELETE(id));
  },

  async send(id: string): Promise<QuoteResponse> {
    return apiClient.post<QuoteResponse>(API_ENDPOINTS.QUOTES.SEND(id), {});
  },

  async convertToOrder(id: string): Promise<QuoteResponse> {
    return apiClient.post<QuoteResponse>(
      API_ENDPOINTS.QUOTES.CONVERT_TO_ORDER(id),
      {}
    );
  },

  async duplicate(id: string): Promise<QuoteResponse> {
    return apiClient.post<QuoteResponse>(
      API_ENDPOINTS.QUOTES.DUPLICATE(id),
      {}
    );
  },

  async requestSignature(
    id: string,
    data?: { signerEmail?: string; signerName?: string }
  ): Promise<Record<string, unknown>> {
    return apiClient.post<Record<string, unknown>>(
      API_ENDPOINTS.QUOTES.REQUEST_SIGNATURE(id),
      data ?? {}
    );
  },

  async getSignatureStatus(id: string): Promise<Record<string, unknown>> {
    return apiClient.get<Record<string, unknown>>(
      API_ENDPOINTS.QUOTES.SIGNATURE_STATUS(id)
    );
  },
};
