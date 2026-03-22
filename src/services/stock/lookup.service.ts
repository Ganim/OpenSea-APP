import { apiClient } from '@/lib/api-client';

export interface LookupResult {
  entityType: 'ITEM' | 'VARIANT' | 'PRODUCT' | 'BIN';
  entityId: string;
  entity: Record<string, unknown>;
}

export const lookupService = {
  async lookupByCode(code: string): Promise<LookupResult> {
    return apiClient.get<LookupResult>(
      `/v1/stock/lookup/${encodeURIComponent(code)}`
    );
  },
};
