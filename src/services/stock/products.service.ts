import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreateProductRequest,
  PaginatedProductsResponse,
  ProductResponse,
  ProductsQuery,
  ProductsResponse,
  UpdateProductRequest,
} from '@/types/stock';

export const productsService = {
  // GET /v1/products with optional filters
  // Accepts either a string (legacy templateId) or an object with optional filters
  async listProducts(params?: string | { templateId?: string; manufacturerId?: string; categoryId?: string }): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    if (typeof params === 'string') {
      searchParams.append('templateId', params);
    } else if (params) {
      if (params.templateId) searchParams.append('templateId', params.templateId);
      if (params.manufacturerId) searchParams.append('manufacturerId', params.manufacturerId);
      if (params.categoryId) searchParams.append('categoryId', params.categoryId);
    }
    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.PRODUCTS.LIST}?${query}`
      : API_ENDPOINTS.PRODUCTS.LIST;
    return apiClient.get<ProductsResponse>(url);
  },

  // GET /v1/products with pagination and filters
  async list(query?: ProductsQuery): Promise<PaginatedProductsResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query?.templateId) params.append('templateId', query.templateId);
    if (query?.categoryId) params.append('categoryId', query.categoryId);
    if (query?.status) params.append('status', query.status);
    if (query?.search) params.append('search', query.search);
    if (query?.manufacturerId)
      params.append('manufacturerId', query.manufacturerId);
    if (query?.supplierId) params.append('supplierId', query.supplierId);

    const url = params.toString()
      ? `${API_ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`
      : API_ENDPOINTS.PRODUCTS.LIST;

    return apiClient.get<PaginatedProductsResponse>(url);
  },

  // POST /v1/products/batch - Bulk creation
  async createBatch(
    data: CreateProductRequest[]
  ): Promise<{ products: ProductResponse['product'][] }> {
    return apiClient.post(`${API_ENDPOINTS.PRODUCTS.CREATE}/batch`, {
      products: data,
    });
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
    return apiClient.put<ProductResponse>(
      API_ENDPOINTS.PRODUCTS.UPDATE(productId),
      data
    );
  },

  // DELETE /v1/products/:productId
  async deleteProduct(productId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.PRODUCTS.DELETE(productId));
  },
};
