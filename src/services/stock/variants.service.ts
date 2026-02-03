import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreateVariantRequest,
  PaginatedVariantsResponse,
  UpdateVariantRequest,
  VariantResponse,
  VariantsQuery,
  VariantsResponse,
} from '@/types/stock';

export const variantsService = {
  // GET /v1/variants/by-product/:productId or /v1/variants (all)
  async listVariants(productId?: string): Promise<VariantsResponse> {
    const url = productId
      ? API_ENDPOINTS.VARIANTS.BY_PRODUCT(productId)
      : API_ENDPOINTS.VARIANTS.LIST;
    return apiClient.get<VariantsResponse>(url);
  },

  // GET /v1/variants with pagination and filters
  async list(query?: VariantsQuery): Promise<PaginatedVariantsResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query?.productId) params.append('productId', query.productId);
    if (query?.search) params.append('search', query.search);
    if (query?.minPrice) params.append('minPrice', query.minPrice.toString());
    if (query?.maxPrice) params.append('maxPrice', query.maxPrice.toString());
    if (query?.hasStock !== undefined)
      params.append('hasStock', String(query.hasStock));

    const url = params.toString()
      ? `${API_ENDPOINTS.VARIANTS.LIST}?${params.toString()}`
      : API_ENDPOINTS.VARIANTS.LIST;

    return apiClient.get<PaginatedVariantsResponse>(url);
  },

  // POST /v1/variants/batch - Bulk creation
  async createBatch(
    data: CreateVariantRequest[]
  ): Promise<{ variants: VariantResponse['variant'][] }> {
    return apiClient.post(`${API_ENDPOINTS.VARIANTS.CREATE}/batch`, {
      variants: data,
    });
  },

  // GET /v1/variants/:id
  async getVariant(id: string): Promise<VariantResponse> {
    return apiClient.get<VariantResponse>(API_ENDPOINTS.VARIANTS.GET(id));
  },

  // POST /v1/variants
  async createVariant(data: CreateVariantRequest): Promise<VariantResponse> {
    return apiClient.post<VariantResponse>(API_ENDPOINTS.VARIANTS.CREATE, data);
  },

  // PATCH /v1/variants/:id
  async updateVariant(
    id: string,
    data: UpdateVariantRequest
  ): Promise<VariantResponse> {
    return apiClient.put<VariantResponse>(
      API_ENDPOINTS.VARIANTS.UPDATE(id),
      data
    );
  },

  // DELETE /v1/variants/:id
  async deleteVariant(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.VARIANTS.DELETE(id));
  },
};
