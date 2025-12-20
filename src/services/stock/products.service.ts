import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreateProductRequest,
  ProductResponse,
  ProductsResponse,
  UpdateProductRequest,
} from '@/types/stock';

export const productsService = {
  // GET /v1/products or /v1/products?templateId=:templateId
  async listProducts(templateId?: string): Promise<ProductsResponse> {
    const url = templateId
      ? `${API_ENDPOINTS.PRODUCTS.LIST}?templateId=${templateId}`
      : API_ENDPOINTS.PRODUCTS.LIST;
    return apiClient.get<ProductsResponse>(url);
  },

  // GET /v1/products/:productId
  async getProduct(productId: string): Promise<ProductResponse> {
    return apiClient.get<ProductResponse>(
      API_ENDPOINTS.PRODUCTS.GET(productId)
    );
  },

  // POST /v1/products
  async createProduct(data: CreateProductRequest): Promise<ProductResponse> {
    return apiClient.post<ProductResponse>(API_ENDPOINTS.PRODUCTS.CREATE, data);
  },

  // PATCH /v1/products/:productId
  async updateProduct(
    productId: string,
    data: UpdateProductRequest
  ): Promise<ProductResponse> {
    return apiClient.patch<ProductResponse>(
      API_ENDPOINTS.PRODUCTS.UPDATE(productId),
      data
    );
  },

  // DELETE /v1/products/:productId
  async deleteProduct(productId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.PRODUCTS.DELETE(productId));
  },
};
