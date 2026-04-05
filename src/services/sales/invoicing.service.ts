import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
    CancelInvoiceRequest,
    CancelInvoiceResponse,
    ConfigureFocusNfeRequest,
    ConfigureFocusNfeResponse,
    InvoiceDetail,
    IssueInvoiceRequest,
    IssueInvoiceResponse,
    ListInvoicesQuery,
    ListInvoicesResponse,
} from '@/types/sales';

export const invoicingService = {
  async listInvoices(
    params?: ListInvoicesQuery
  ): Promise<ListInvoicesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.orderId) searchParams.set('orderId', params.orderId);
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params?.toDate) searchParams.set('toDate', params.toDate);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.INVOICING.LIST}?${query}`
      : API_ENDPOINTS.INVOICING.LIST;

    return apiClient.get<ListInvoicesResponse>(url);
  },

  async getInvoice(invoiceId: string): Promise<InvoiceDetail> {
    return apiClient.get<InvoiceDetail>(API_ENDPOINTS.INVOICING.GET(invoiceId));
  },

  async issueInvoice(
    orderId: string,
    data?: IssueInvoiceRequest
  ): Promise<IssueInvoiceResponse> {
    return apiClient.post<IssueInvoiceResponse>(
      API_ENDPOINTS.INVOICING.ISSUE(orderId),
      data ?? {}
    );
  },

  async cancelInvoice(
    invoiceId: string,
    data: CancelInvoiceRequest
  ): Promise<CancelInvoiceResponse> {
    return apiClient.delete<CancelInvoiceResponse>(
      API_ENDPOINTS.INVOICING.CANCEL(invoiceId),
      { body: JSON.stringify(data) }
    );
  },

  async configureFocusNfe(
    data: ConfigureFocusNfeRequest
  ): Promise<ConfigureFocusNfeResponse> {
    return apiClient.patch<ConfigureFocusNfeResponse>(
      API_ENDPOINTS.INVOICING.CONFIGURE_FOCUS_NFE,
      data
    );
  },
};
