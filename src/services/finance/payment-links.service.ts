import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreatePaymentLinkInput,
  PaymentLink,
  PaymentLinkDetail,
} from '@/types/finance';
import type { PaginationMeta } from '@/types/pagination';

export interface PaymentLinksResponse {
  paymentLinks: PaymentLink[];
  meta: PaginationMeta;
}

export interface CreatePaymentLinkResponse {
  paymentLink: PaymentLinkDetail;
  url: string;
}

export interface PublicPaymentLinkResponse {
  paymentLink: PaymentLinkDetail;
}

export const paymentLinksService = {
  async list(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaymentLinksResponse> {
    const query = new URLSearchParams({
      page: String(params?.page ?? 1),
      limit: String(params?.limit ?? 20),
    });

    if (params?.status) query.append('status', params.status);

    return apiClient.get<PaymentLinksResponse>(
      `${API_ENDPOINTS.PAYMENT_LINKS.LIST}?${query.toString()}`
    );
  },

  async create(
    data: CreatePaymentLinkInput
  ): Promise<CreatePaymentLinkResponse> {
    return apiClient.post<CreatePaymentLinkResponse>(
      API_ENDPOINTS.PAYMENT_LINKS.CREATE,
      data
    );
  },

  async getPublic(slug: string): Promise<PublicPaymentLinkResponse> {
    // Use a separate fetch since this is public (no auth token)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    const response = await fetch(
      `${baseUrl}${API_ENDPOINTS.PAYMENT_LINKS.PUBLIC(slug)}`
    );

    if (!response.ok) {
      throw new Error(`Payment link not found`);
    }

    return response.json();
  },
};
