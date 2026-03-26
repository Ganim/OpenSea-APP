import { apiClient } from '@/lib/api-client';
import type {
  HrTenantConfig,
  UpdateHrTenantConfigData,
} from '@/types/hr';

export interface HrConfigResponse {
  config: HrTenantConfig;
}

export const hrConfigService = {
  async getConfig(): Promise<HrConfigResponse> {
    return apiClient.get<HrConfigResponse>('/v1/hr/config');
  },

  async updateConfig(data: UpdateHrTenantConfigData): Promise<HrConfigResponse> {
    return apiClient.patch<HrConfigResponse>('/v1/hr/config', data);
  },
};
