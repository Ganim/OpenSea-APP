export type InvoiceType = 'NFE' | 'NFCE';

export type InvoiceStatus = 'PENDING' | 'ISSUED' | 'CANCELLED' | 'ERROR';

export interface InvoiceSummary {
  id: string;
  orderId: string;
  type: InvoiceType;
  number: string;
  series: string;
  accessKey: string;
  status: InvoiceStatus;
  issuedAt?: string;
  createdAt: string;
}

export interface InvoiceDetail {
  id: string;
  tenantId: string;
  orderId: string;
  type: InvoiceType;
  number: string;
  series: string;
  accessKey: string;
  focusIdRef?: string;
  status: InvoiceStatus;
  statusDetails?: string;
  xmlUrl?: string;
  pdfUrl?: string;
  issuedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ListInvoicesQuery {
  status?: InvoiceStatus;
  orderId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface ListInvoicesResponse {
  data: InvoiceSummary[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface IssueInvoiceRequest {
  invoiceType?: InvoiceType;
}

export interface IssueInvoiceResponse {
  invoiceId: string;
  accessKey: string;
  status: InvoiceStatus;
  issuedAt: string;
  xmlUrl?: string;
  pdfUrl?: string;
}

export interface CancelInvoiceRequest {
  reason: string;
}

export interface CancelInvoiceResponse {
  invoiceId: string;
  status: InvoiceStatus;
  cancelledAt: string;
  cancelReason: string;
}

export interface ConfigureFocusNfeRequest {
  apiKey: string;
  productionMode?: boolean;
  autoIssueOnConfirm?: boolean;
  defaultSeries?: string;
}

export interface ConfigureFocusNfeResponse {
  id: string;
  configured: boolean;
  message: string;
  productionMode: boolean;
  isEnabled: boolean;
}
