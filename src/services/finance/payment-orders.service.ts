import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type { PaymentOrder } from '@/types/finance';

// P1-43: standard `{ data, meta }` shape with legacy `orders` alias kept
// during the migration window.
export interface PaymentOrdersResponse {
  data: PaymentOrder[];
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
    // P1-43: tolerate both the new `data` key and the legacy `orders`.
    const raw = await apiClient.get<
      Partial<PaymentOrdersResponse> & {
        data?: PaymentOrder[];
        orders?: PaymentOrder[];
      }
    >(`${API_ENDPOINTS.PAYMENT_ORDERS.LIST}?${query.toString()}`);
    const list = raw.data ?? raw.orders ?? [];
    return {
      data: list,
      orders: list,
      meta: raw.meta as PaymentOrdersResponse['meta'],
    };
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
