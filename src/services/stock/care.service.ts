import { apiClient } from '@/lib/api-client';
import type {
  CareOptionsResponse,
  SetProductCareRequest,
  SetProductCareResponse,
} from '@/types/stock';

export const careService = {
  /**
   * GET /v1/care/options
   * Listar todas as opções de instruções de cuidado (ISO 3758)
   */
  async listCareOptions(): Promise<CareOptionsResponse> {
    return apiClient.get<CareOptionsResponse>('/v1/care/options');
  },

  /**
   * PUT /v1/products/:productId/care
   * Definir instruções de cuidado para um produto
   */
  async setProductCare(
    productId: string,
    data: SetProductCareRequest
  ): Promise<SetProductCareResponse> {
    return apiClient.put<SetProductCareResponse>(
      `/v1/products/${productId}/care`,
      data
    );
  },
};
