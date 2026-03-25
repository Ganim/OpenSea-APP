import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreateCustomerPriceRequest,
  CustomerPriceResponse,
  CustomerPricesQuery,
  PaginatedCustomerPricesResponse,
  UpdateCustomerPriceRequest,
} from '@/types/sales';

export const customerPricesService = {
  async list(
    query?: CustomerPricesQuery
  ): Promise<PaginatedCustomerPricesResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query?.customerId) params.append('customerId', query.customerId);
    if (query?.variantId) params.append('variantId', query.variantId);

    const url = params.toString()
      ? `${API_ENDPOINTS.CUSTOMER_PRICES.LIST}?${params.toString()}`
      : API_ENDPOINTS.CUSTOMER_PRICES.LIST;

    return apiClient.get<PaginatedCustomerPricesResponse>(url);
  },

  async create(
    data: CreateCustomerPriceRequest
  ): Promise<CustomerPriceResponse> {
    return apiClient.post<CustomerPriceResponse>(
      API_ENDPOINTS.CUSTOMER_PRICES.CREATE,
      data
    );
  },

  async update(
    id: string,
    data: UpdateCustomerPriceRequest
  ): Promise<CustomerPriceResponse> {
    return apiClient.put<CustomerPriceResponse>(
      API_ENDPOINTS.CUSTOMER_PRICES.UPDATE(id),
      data
    );
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.CUSTOMER_PRICES.DELETE(id));
  },
};
