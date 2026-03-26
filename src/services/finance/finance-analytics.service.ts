import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  FinanceDashboard,
  CashflowResponse,
  ForecastResponse,
  AnomalyReport,
  PaymentTimingResponse,
  ExchangeRateResponse,
  ThreeWayMatchResponse,
} from '@/types/finance';

export const financeAnalyticsService = {
  async getDashboard(): Promise<FinanceDashboard> {
    return apiClient.get<FinanceDashboard>(
      API_ENDPOINTS.FINANCE_DASHBOARD.OVERVIEW
    );
  },

  async getCashflow(params: {
    startDate: string;
    endDate: string;
    groupBy?: 'day' | 'week' | 'month';
    bankAccountId?: string;
  }): Promise<CashflowResponse> {
    const query = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    if (params.groupBy) query.append('groupBy', params.groupBy);
    if (params.bankAccountId)
      query.append('bankAccountId', params.bankAccountId);

    return apiClient.get<CashflowResponse>(
      `${API_ENDPOINTS.FINANCE_DASHBOARD.CASHFLOW}?${query.toString()}`
    );
  },

  async getForecast(params: {
    startDate: string;
    endDate: string;
    groupBy: 'day' | 'week' | 'month';
    type?: string;
  }): Promise<ForecastResponse> {
    const query = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      groupBy: params.groupBy,
    });
    if (params.type) query.append('type', params.type);

    return apiClient.get<ForecastResponse>(
      `${API_ENDPOINTS.FINANCE_DASHBOARD.FORECAST}?${query.toString()}`
    );
  },

  async getAnomalies(months = 6): Promise<AnomalyReport> {
    const query = new URLSearchParams({ months: String(months) });
    return apiClient.get<AnomalyReport>(
      `${API_ENDPOINTS.FINANCE_DASHBOARD.ANOMALIES}?${query.toString()}`
    );
  },

  async getPaymentTiming(daysAhead = 30): Promise<PaymentTimingResponse> {
    const query = new URLSearchParams({ daysAhead: String(daysAhead) });
    return apiClient.get<PaymentTimingResponse>(
      `${API_ENDPOINTS.FINANCE_DASHBOARD.PAYMENT_TIMING}?${query.toString()}`
    );
  },

  async getExchangeRate(currency: string, date?: string): Promise<ExchangeRateResponse> {
    const query = new URLSearchParams({ currency });
    if (date) query.append('date', date);
    return apiClient.get<ExchangeRateResponse>(
      `${API_ENDPOINTS.EXCHANGE_RATES.GET}?${query.toString()}`
    );
  },

  async threeWayMatch(entryId: string): Promise<ThreeWayMatchResponse> {
    return apiClient.post<ThreeWayMatchResponse>(
      API_ENDPOINTS.FINANCE_ENTRIES.THREE_WAY_MATCH(entryId),
      {}
    );
  },
};
