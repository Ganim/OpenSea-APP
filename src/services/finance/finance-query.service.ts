import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

export interface FinanceQueryRequest {
  query: string;
}

export interface FinanceQueryResponse {
  answer: string;
  data?: Record<string, unknown>;
  intent: string;
  confidence: number;
}

export const financeQueryService = {
  async query(request: FinanceQueryRequest): Promise<FinanceQueryResponse> {
    return apiClient.post<FinanceQueryResponse>(
      API_ENDPOINTS.AI.FINANCE_QUERY,
      request
    );
  },
};
