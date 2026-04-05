import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type { CashierSessionReport } from '@/types/sales';

export interface CashierSessionsQuery {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CashierSessionsResponse {
  sessions: Record<string, unknown>[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface CashierSessionResponse {
  session: Record<string, unknown>;
}

export interface CashierTransactionsQuery {
  page?: number;
  limit?: number;
  sessionId?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CashierTransactionsResponse {
  transactions: Record<string, unknown>[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface CashierTransactionResponse {
  transaction: Record<string, unknown>;
}

export const cashierService = {
  // Sessions
  async openSession(
    data: Record<string, unknown>
  ): Promise<CashierSessionResponse> {
    return apiClient.post<CashierSessionResponse>(
      API_ENDPOINTS.SALES_CASHIER.SESSIONS.OPEN,
      data
    );
  },

  async closeSession(
    id: string,
    data?: Record<string, unknown>
  ): Promise<CashierSessionResponse> {
    return apiClient.post<CashierSessionResponse>(
      API_ENDPOINTS.SALES_CASHIER.SESSIONS.CLOSE(id),
      data ?? {}
    );
  },

  async getActiveSession(): Promise<CashierSessionResponse> {
    return apiClient.get<CashierSessionResponse>(
      API_ENDPOINTS.SALES_CASHIER.SESSIONS.GET_ACTIVE
    );
  },

  async listSessions(
    params?: CashierSessionsQuery
  ): Promise<CashierSessionsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.SALES_CASHIER.SESSIONS.LIST}?${query}`
      : API_ENDPOINTS.SALES_CASHIER.SESSIONS.LIST;
    return apiClient.get<CashierSessionsResponse>(url);
  },

  async getSession(id: string): Promise<CashierSessionResponse> {
    return apiClient.get<CashierSessionResponse>(
      API_ENDPOINTS.SALES_CASHIER.SESSIONS.GET(id)
    );
  },

  async getSessionReport(sessionId: string): Promise<CashierSessionReport> {
    return apiClient.get<CashierSessionReport>(
      API_ENDPOINTS.SALES_CASHIER.SESSIONS.REPORT(sessionId)
    );
  },

  // Transactions
  async createTransaction(
    data: Record<string, unknown>
  ): Promise<CashierTransactionResponse> {
    return apiClient.post<CashierTransactionResponse>(
      API_ENDPOINTS.SALES_CASHIER.TRANSACTIONS.CREATE,
      data
    );
  },

  async listTransactions(
    params?: CashierTransactionsQuery
  ): Promise<CashierTransactionsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.sessionId) searchParams.set('sessionId', params.sessionId);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.SALES_CASHIER.TRANSACTIONS.LIST}?${query}`
      : API_ENDPOINTS.SALES_CASHIER.TRANSACTIONS.LIST;
    return apiClient.get<CashierTransactionsResponse>(url);
  },

  // Cash Movement
  async cashMovement(
    data: Record<string, unknown>
  ): Promise<CashierTransactionResponse> {
    return apiClient.post<CashierTransactionResponse>(
      API_ENDPOINTS.SALES_CASHIER.CASH.MOVEMENT,
      data
    );
  },

  // Reconcile
  async reconcile(
    sessionId: string,
    data?: Record<string, unknown>
  ): Promise<CashierSessionResponse> {
    return apiClient.post<CashierSessionResponse>(
      API_ENDPOINTS.SALES_CASHIER.SESSIONS.RECONCILE(sessionId),
      data ?? {}
    );
  },
};
