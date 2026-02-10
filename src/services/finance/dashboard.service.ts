import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  FinanceDashboard,
  CashflowResponse,
  ForecastQuery,
  ForecastResponse,
} from '@/types/finance';

export interface FinanceDashboardResponse {
  dashboard: FinanceDashboard;
}

export const financeDashboardService = {
  async getDashboard(): Promise<FinanceDashboardResponse> {
    return apiClient.get<FinanceDashboardResponse>(
      API_ENDPOINTS.FINANCE_DASHBOARD.OVERVIEW
    );
  },

  async getForecast(params: ForecastQuery): Promise<ForecastResponse> {
    const query = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      groupBy: params.groupBy,
    });

    if (params.type) query.append('type', params.type);
    if (params.costCenterId) query.append('costCenterId', params.costCenterId);
    if (params.categoryId) query.append('categoryId', params.categoryId);

    return apiClient.get<ForecastResponse>(
      `${API_ENDPOINTS.FINANCE_DASHBOARD.FORECAST}?${query.toString()}`
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

  async exportAccounting(params: {
    startDate: string;
    endDate: string;
    format?: 'csv' | 'sped';
  }): Promise<Blob> {
    const query = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    if (params.format) query.append('format', params.format);

    return apiClient.post<Blob>(
      `${API_ENDPOINTS.FINANCE_DASHBOARD.EXPORT_ACCOUNTING}?${query.toString()}`,
      {}
    );
  },
};
