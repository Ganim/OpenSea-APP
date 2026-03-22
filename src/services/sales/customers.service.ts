import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreateCustomerRequest,
  CustomerResponse,
  CustomersQuery,
  CustomersResponse,
  PaginatedCustomersResponse,
  UpdateCustomerRequest,
} from '@/types/sales';

export const customersService = {
  // GET /v1/customers (legacy - no pagination)
  async listCustomers(): Promise<CustomersResponse> {
    return apiClient.get<CustomersResponse>(API_ENDPOINTS.CUSTOMERS.LIST);
  },

  // GET /v1/customers with pagination and filters
  async list(query?: CustomersQuery): Promise<PaginatedCustomersResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query?.search) params.append('search', query.search);
    if (query?.type) params.append('type', query.type);
    if (query?.source) params.append('source', query.source);
    if (query?.isActive !== undefined)
      params.append('isActive', String(query.isActive));
    if (query?.assignedToUserId)
      params.append('assignedToUserId', query.assignedToUserId);

    const url = params.toString()
      ? `${API_ENDPOINTS.CUSTOMERS.LIST}?${params.toString()}`
      : API_ENDPOINTS.CUSTOMERS.LIST;

    return apiClient.get<PaginatedCustomersResponse>(url);
  },

  // GET /v1/customers/:customerId
  async get(customerId: string): Promise<CustomerResponse> {
    return apiClient.get<CustomerResponse>(
      API_ENDPOINTS.CUSTOMERS.GET(customerId)
    );
  },

  // POST /v1/customers
  async create(data: CreateCustomerRequest): Promise<CustomerResponse> {
    return apiClient.post<CustomerResponse>(
      API_ENDPOINTS.CUSTOMERS.CREATE,
      data
    );
  },

  // PUT /v1/customers/:customerId
  async update(
    customerId: string,
    data: UpdateCustomerRequest
  ): Promise<CustomerResponse> {
    return apiClient.put<CustomerResponse>(
      API_ENDPOINTS.CUSTOMERS.UPDATE(customerId),
      data
    );
  },

  // DELETE /v1/customers/:customerId
  async delete(customerId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.CUSTOMERS.DELETE(customerId));
  },
};
