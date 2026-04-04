import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreateChargeRequest,
  PaymentCharge,
  ProviderInfo,
  SavePaymentConfigRequest,
  TenantPaymentConfig,
  TestConnectionResponse,
} from '@/types/sales';

export const paymentConfigService = {
  async getConfig(): Promise<TenantPaymentConfig> {
    return apiClient.get<TenantPaymentConfig>(API_ENDPOINTS.PAYMENT_CONFIG.GET);
  },

  async saveConfig(
    data: SavePaymentConfigRequest
  ): Promise<TenantPaymentConfig> {
    return apiClient.put<TenantPaymentConfig>(
      API_ENDPOINTS.PAYMENT_CONFIG.SAVE,
      data
    );
  },

  async testConnection(
    provider: 'primary' | 'fallback'
  ): Promise<TestConnectionResponse> {
    return apiClient.post<TestConnectionResponse>(
      API_ENDPOINTS.PAYMENT_CONFIG.TEST,
      { provider }
    );
  },

  async getProviders(): Promise<ProviderInfo[]> {
    const response = await apiClient.get<{ providers: ProviderInfo[] }>(
      API_ENDPOINTS.PAYMENT_CONFIG.PROVIDERS
    );
    return response.providers;
  },

  async createCharge(data: CreateChargeRequest): Promise<PaymentCharge> {
    return apiClient.post<PaymentCharge>(
      API_ENDPOINTS.PAYMENT_CHARGES.CREATE,
      data
    );
  },

  async checkChargeStatus(chargeId: string): Promise<PaymentCharge> {
    return apiClient.get<PaymentCharge>(
      API_ENDPOINTS.PAYMENT_CHARGES.STATUS(chargeId)
    );
  },
};
