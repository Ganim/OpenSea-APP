import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  BankAccount,
  BankAccountsQuery,
  BankApiConfigData,
  CreateBankAccountData,
  UpdateBankAccountData,
} from '@/types/finance';
import type { PaginationMeta } from '@/types/pagination';

// P1-43: every paginated finance endpoint now returns `{ data, meta }`.
// Backend still sends the legacy key (`bankAccounts`) in parallel so we
// tolerate either response during the migration window.
export interface BankAccountsResponse {
  data: BankAccount[];
  bankAccounts: BankAccount[];
  meta: PaginationMeta;
}

export interface BankAccountResponse {
  bankAccount: BankAccount;
}

export const bankAccountsService = {
  async list(params?: BankAccountsQuery): Promise<BankAccountsResponse> {
    const query = new URLSearchParams({
      page: String(params?.page ?? 1),
      limit: String(params?.perPage ?? 20),
    });

    if (params?.search) query.append('search', params.search);
    if (params?.companyId) query.append('companyId', params.companyId);
    if (params?.accountType) query.append('accountType', params.accountType);
    if (params?.status) query.append('status', params.status);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

    // P1-43: normalize legacy/standard shapes so callers can safely read
    // `.data` going forward. If the backend ever drops the legacy alias
    // we keep working; if a stale bundle still reads `.bankAccounts` it
    // keeps working too.
    const raw = await apiClient.get<
      Partial<BankAccountsResponse> & {
        data?: BankAccount[];
        bankAccounts?: BankAccount[];
      }
    >(`${API_ENDPOINTS.BANK_ACCOUNTS.LIST}?${query.toString()}`);
    const list = raw.data ?? raw.bankAccounts ?? [];
    return {
      data: list,
      bankAccounts: list,
      meta: raw.meta as PaginationMeta,
    };
  },

  async get(id: string): Promise<BankAccountResponse> {
    return apiClient.get<BankAccountResponse>(
      API_ENDPOINTS.BANK_ACCOUNTS.GET(id)
    );
  },

  async create(data: CreateBankAccountData): Promise<BankAccountResponse> {
    return apiClient.post<BankAccountResponse>(
      API_ENDPOINTS.BANK_ACCOUNTS.CREATE,
      data
    );
  },

  async update(
    id: string,
    data: UpdateBankAccountData
  ): Promise<BankAccountResponse> {
    return apiClient.patch<BankAccountResponse>(
      API_ENDPOINTS.BANK_ACCOUNTS.UPDATE(id),
      data
    );
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(API_ENDPOINTS.BANK_ACCOUNTS.DELETE(id));
  },

  async updateApiConfig(id: string, data: BankApiConfigData): Promise<void> {
    await apiClient.patch<void>(
      `/v1/finance/bank-accounts/${id}/api-config`,
      data
    );
  },

  async getBalance(id: string): Promise<{
    balance: {
      available: number;
      current: number;
      currency: string;
      updatedAt: string;
    };
  }> {
    return apiClient.get(`/v1/finance/bank-accounts/${id}/balance`);
  },

  /**
   * @deprecated Use getBalance. Typed shape was wrong; retained temporarily
   * para facilitar migracao de callers externos.
   */
  async testBankApiConnection(id: string): Promise<{
    balance: {
      available: number;
      current: number;
      currency: string;
      updatedAt: string;
    };
  }> {
    return this.getBalance(id);
  },

  async healthCheck(id: string): Promise<{
    health: {
      provider: string;
      status: 'healthy' | 'degraded' | 'unhealthy';
      latencyMs: number;
      checks: {
        auth: { ok: boolean; error?: string };
        balance: { ok: boolean; error?: string };
        timestamp: string;
      };
      sandbox: boolean;
    };
  }> {
    return apiClient.get(`/v1/finance/bank-accounts/${id}/health`);
  },
};
