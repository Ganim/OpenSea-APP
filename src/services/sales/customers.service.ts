import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreateCustomerRequest,
  CustomerResponse,
  CustomersResponse,
  UpdateCustomerRequest,
} from '@/types/sales';

export const customersService = {
  // GET /v1/customers
  async listCustomers(): Promise<CustomersResponse> {
    return apiClient.get<CustomersResponse>(API_ENDPOINTS.CUSTOMERS.LIST);
  },

  // GET /v1/customers/:customerId
  async getCustomer(customerId: string): Promise<CustomerResponse> {
    return apiClient.get<CustomerResponse>(
      API_ENDPOINTS.CUSTOMERS.GET(customerId)
    );
  },

  // POST /v1/customers
  async createCustomer(data: CreateCustomerRequest): Promise<CustomerResponse> {
    return apiClient.post<CustomerResponse>(
      API_ENDPOINTS.CUSTOMERS.CREATE,
      data
    );
  },

  // PATCH /v1/customers/:customerId
  async updateCustomer(
    customerId: string,
    data: UpdateCustomerRequest
  ): Promise<CustomerResponse> {
    return apiClient.put<CustomerResponse>(
      API_ENDPOINTS.CUSTOMERS.UPDATE(customerId),
      data
    );
  },

  // DELETE /v1/customers/:customerId
  async deleteCustomer(customerId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.CUSTOMERS.DELETE(customerId));
  },
};
