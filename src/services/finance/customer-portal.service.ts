import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  InviteCustomerPortalInput,
  InviteCustomerPortalResponse,
  ListCustomerPortalAccessesResponse,
  PortalValidation,
  ListPortalInvoicesResponse,
  GetPortalInvoiceResponse,
  GeneratePortalPaymentInput,
  GeneratePortalPaymentResponse,
} from '@/types/finance';

// ============================================================================
// Authenticated admin endpoints
// ============================================================================

export const customerPortalService = {
  async invite(
    data: InviteCustomerPortalInput
  ): Promise<InviteCustomerPortalResponse> {
    return apiClient.post<InviteCustomerPortalResponse>(
      API_ENDPOINTS.CUSTOMER_PORTAL.INVITE,
      data
    );
  },

  async listAccesses(): Promise<ListCustomerPortalAccessesResponse> {
    return apiClient.get<ListCustomerPortalAccessesResponse>(
      API_ENDPOINTS.CUSTOMER_PORTAL.LIST_ACCESSES
    );
  },

  async revokeAccess(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CUSTOMER_PORTAL.REVOKE(id));
  },
};

// ============================================================================
// Public portal endpoints (no auth token — uses fetch directly)
// ============================================================================

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

async function publicFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${url}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message ?? `Request failed with status ${response.status}`
    );
  }

  return response.json();
}

export const customerPortalPublicService = {
  async validate(token: string): Promise<PortalValidation> {
    return publicFetch<PortalValidation>(
      API_ENDPOINTS.CUSTOMER_PORTAL_PUBLIC.VALIDATE(token)
    );
  },

  async listInvoices(
    token: string,
    params?: {
      status?: 'pending' | 'paid' | 'all';
      page?: number;
      limit?: number;
    }
  ): Promise<ListPortalInvoicesResponse> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    const url = API_ENDPOINTS.CUSTOMER_PORTAL_PUBLIC.INVOICES(token);
    return publicFetch<ListPortalInvoicesResponse>(
      queryString ? `${url}?${queryString}` : url
    );
  },

  async getInvoice(
    token: string,
    invoiceId: string
  ): Promise<GetPortalInvoiceResponse> {
    return publicFetch<GetPortalInvoiceResponse>(
      API_ENDPOINTS.CUSTOMER_PORTAL_PUBLIC.INVOICE(token, invoiceId)
    );
  },

  async generatePayment(
    token: string,
    invoiceId: string,
    data: GeneratePortalPaymentInput
  ): Promise<GeneratePortalPaymentResponse> {
    return publicFetch<GeneratePortalPaymentResponse>(
      API_ENDPOINTS.CUSTOMER_PORTAL_PUBLIC.PAY(token, invoiceId),
      { method: 'POST', body: JSON.stringify(data) }
    );
  },
};
