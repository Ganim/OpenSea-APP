import { apiClient } from '@/lib/api-client';
import type {
  GetPosFiscalConfigResponse,
  UpdatePosFiscalConfigRequest,
  UpdatePosFiscalConfigResponse,
} from '@/types/sales';

/**
 * Service for the per-tenant POS fiscal configuration (Emporion Fase 1).
 * Singleton row keyed by JWT-derived tenantId — no `:id` parameter on either
 * endpoint. Backed by `/v1/admin/pos/fiscal-config`.
 */
export const posFiscalConfigService = {
  async get(): Promise<GetPosFiscalConfigResponse> {
    return apiClient.get<GetPosFiscalConfigResponse>(
      `/v1/admin/pos/fiscal-config`
    );
  },

  async update(
    payload: UpdatePosFiscalConfigRequest
  ): Promise<UpdatePosFiscalConfigResponse> {
    return apiClient.put<UpdatePosFiscalConfigResponse>(
      `/v1/admin/pos/fiscal-config`,
      payload
    );
  },
};
