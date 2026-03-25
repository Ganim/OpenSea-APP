// Customer Price Types

import type { PaginatedQuery } from '../pagination';

export interface CustomerPrice {
  id: string;
  tenantId: string;
  customerId: string;
  variantId: string;
  price: number;
  validFrom: string | null;
  validUntil: string | null;
  notes: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerPriceRequest {
  customerId: string;
  variantId: string;
  price: number;
  validFrom?: string;
  validUntil?: string;
  notes?: string;
}

export interface UpdateCustomerPriceRequest {
  price?: number;
  validFrom?: string;
  validUntil?: string;
  notes?: string;
}

export interface CustomerPriceResponse {
  customerPrice: CustomerPrice;
}

export interface PaginatedCustomerPricesResponse {
  customerPrices: CustomerPrice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CustomerPricesQuery extends PaginatedQuery {
  customerId?: string;
  variantId?: string;
}
