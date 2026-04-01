import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type { PaymentOrder } from '@/types/finance';

export interface PaymentOrdersResponse {
  orders: PaymentOrder[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface CreatePaymentOrderData {
  entryId: string;
  bankAccountId: string;
  method: string;
  amount: number;
  recipientData: Record<string, unknown>;
}

export const paymentOrdersService = {
  async list(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaymentOrdersResponse> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    return apiClient.get<PaymentOrdersResponse>(
      `${API_ENDPOINTS.PAYMENT_ORDERS.LIST}?${query.toString()}`
    );
  },

  async get(id: string): Promise<{ order: PaymentOrder }> {
    return apiClient.get<{ order: PaymentOrder }>(
      API_ENDPOINTS.PAYMENT_ORDERS.GET(id)
    );
  },

  async create(data: CreatePaymentOrderData): Promise<{ order: PaymentOrder }> {
    return apiClient.post<{ order: PaymentOrder }>(
      API_ENDPOINTS.PAYMENT_ORDERS.CREATE,
      data
    );
  },

  async approve(id: string): Promise<{ order: PaymentOrder }> {
    return apiClient.post<{ order: PaymentOrder }>(
      API_ENDPOINTS.PAYMENT_ORDERS.APPROVE(id),
      {}
    );
  },

  async reject(id: string, reason: string): Promise<{ order: PaymentOrder }> {
    return apiClient.post<{ order: PaymentOrder }>(
      API_ENDPOINTS.PAYMENT_ORDERS.REJECT(id),
      { reason }
    );
  },
};
