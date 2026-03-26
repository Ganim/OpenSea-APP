import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

export interface ExchangeRateResponse {
  currency: string;
  rate: number;
  date: string;
  source: string;
}

export const exchangeRatesService = {
  async getRate(
    currency: string,
    date?: string
  ): Promise<ExchangeRateResponse> {
    const params = new URLSearchParams({ currency });
    if (date) params.append('date', date);
    return apiClient.get<ExchangeRateResponse>(
      `${API_ENDPOINTS.EXCHANGE_RATES.GET}?${params.toString()}`
    );
  },
};
