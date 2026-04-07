import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreateStoreCreditRequest,
  PaginatedStoreCreditsResponse,
  StoreCreditBalanceResponse,
  StoreCreditDTO,
  StoreCreditResponse,
  StoreCreditsQuery,
} from '@/types/sales';

export const storeCreditsService = {
  async list(
    query?: StoreCreditsQuery
  ): Promise<PaginatedStoreCreditsResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.source) params.append('source', query.source);
    if (query?.isActive) params.append('isActive', query.isActive);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const url = params.toString()
      ? `${API_ENDPOINTS.STORE_CREDITS.LIST}?${params.toString()}`
      : API_ENDPOINTS.STORE_CREDITS.LIST;

    return apiClient.get<PaginatedStoreCreditsResponse>(url);
  },

  async get(id: string): Promise<StoreCreditResponse> {
    return apiClient.get<StoreCreditResponse>(
      API_ENDPOINTS.STORE_CREDITS.GET(id)
    );
  },

  async getBalance(customerId: string): Promise<StoreCreditBalanceResponse> {
    return apiClient.get<StoreCreditBalanceResponse>(
      `${API_ENDPOINTS.STORE_CREDITS.BALANCE}?customerId=${customerId}`
    );
  },

  async create(
    data: CreateStoreCreditRequest
  ): Promise<{ storeCredit: StoreCreditDTO }> {
    return apiClient.post<{ storeCredit: StoreCreditDTO }>(
      API_ENDPOINTS.STORE_CREDITS.CREATE,
      data
    );
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.STORE_CREDITS.DELETE(id));
  },
};
