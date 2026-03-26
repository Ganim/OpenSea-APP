// Quote Types

import type { PaginatedQuery } from '../pagination';

export type QuoteStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  ACCEPTED: 'Aceito',
  REJECTED: 'Rejeitado',
  EXPIRED: 'Expirado',
};

export interface QuoteItem {
  id: string;
  quoteId: string;
  variantId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  createdAt: string;
}

export interface Quote {
  id: string;
  tenantId: string;
  customerId: string;
  customerName?: string;
  title: string;
  status: QuoteStatus;
  validUntil?: string;
  notes?: string;
  subtotal: number;
  discount: number;
  total: number;
  sentAt?: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  items?: QuoteItem[];
}

export interface CreateQuoteRequest {
  customerId: string;
  title: string;
  validUntil?: string;
  notes?: string;
  items: Array<{
    variantId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
}

export interface UpdateQuoteRequest {
  title?: string;
  validUntil?: string;
  notes?: string;
  items?: Array<{
    variantId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
}

export interface QuotesQuery extends PaginatedQuery {
  status?: QuoteStatus;
  customerId?: string;
}
