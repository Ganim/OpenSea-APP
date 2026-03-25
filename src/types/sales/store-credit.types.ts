// Store Credit Types

export type StoreCreditSource = 'RETURN' | 'MANUAL' | 'CAMPAIGN' | 'LOYALTY';

export const STORE_CREDIT_SOURCE_LABELS: Record<StoreCreditSource, string> = {
  RETURN: 'Devolucao',
  MANUAL: 'Manual',
  CAMPAIGN: 'Campanha',
  LOYALTY: 'Fidelidade',
};

export interface StoreCreditBalanceResponse {
  balance: number;
}

export interface CreateStoreCreditRequest {
  customerId: string;
  amount: number;
  expiresAt?: string;
}

export interface StoreCreditDTO {
  id: string;
  customerId: string;
  customerName?: string;
  amount: number;
  balance: number;
  source: StoreCreditSource;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface StoreCreditResponse {
  storeCredit: StoreCreditDTO;
}

export interface PaginatedStoreCreditsResponse {
  storeCredits: StoreCreditDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface StoreCreditsQuery {
  page?: number;
  limit?: number;
  search?: string;
  source?: StoreCreditSource;
  isActive?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
