import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreateVariantRequest,
  UpdateVariantRequest,
  VariantResponse,
  VariantsResponse,
} from '@/types/stock';

export const variantsService = {
  // GET /v1/variants or /v1/variants?productId=:productId
  async listVariants(productId?: string): Promise<VariantsResponse> {
    const url = productId
      ? `${API_ENDPOINTS.VARIANTS.LIST}?productId=${productId}`
      : API_ENDPOINTS.VARIANTS.LIST;
    return apiClient.get<VariantsResponse>(url);
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
    return apiClient.patch<VariantResponse>(
      API_ENDPOINTS.VARIANTS.UPDATE(id),
      data
    );
  },

  // DELETE /v1/variants/:id
  async deleteVariant(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.VARIANTS.DELETE(id));
  },
};
