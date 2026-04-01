import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreateJournalEntryData,
  JournalEntriesQuery,
  JournalEntriesResponse,
  JournalEntryResponse,
  LedgerResponse,
  TrialBalanceResponse,
} from '@/types/finance';

export const journalEntriesService = {
  async list(params?: JournalEntriesQuery): Promise<JournalEntriesResponse> {
    const query = new URLSearchParams({
      page: String(params?.page ?? 1),
      limit: String(params?.limit ?? 50),
    });

    if (params?.chartOfAccountId)
      query.append('chartOfAccountId', params.chartOfAccountId);
    if (params?.sourceType) query.append('sourceType', params.sourceType);
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);

    return apiClient.get<JournalEntriesResponse>(
      `${API_ENDPOINTS.JOURNAL_ENTRIES.LIST}?${query.toString()}`
    );
  },

  async getById(id: string): Promise<JournalEntryResponse> {
    return apiClient.get<JournalEntryResponse>(
      API_ENDPOINTS.JOURNAL_ENTRIES.GET(id)
    );
  },

  async create(data: CreateJournalEntryData): Promise<JournalEntryResponse> {
    return apiClient.post<JournalEntryResponse>(
      API_ENDPOINTS.JOURNAL_ENTRIES.CREATE,
      data
    );
  },

  async reverse(id: string): Promise<JournalEntryResponse> {
    return apiClient.post<JournalEntryResponse>(
      API_ENDPOINTS.JOURNAL_ENTRIES.REVERSE(id),
      {}
    );
  },

  async getLedger(params: {
    chartOfAccountId: string;
    from: string;
    to: string;
  }): Promise<LedgerResponse> {
    const query = new URLSearchParams({
      chartOfAccountId: params.chartOfAccountId,
      from: params.from,
      to: params.to,
    });

    return apiClient.get<LedgerResponse>(
      `${API_ENDPOINTS.FINANCE_REPORTS.LEDGER}?${query.toString()}`
    );
  },

  async getTrialBalance(params: {
    from: string;
    to: string;
  }): Promise<TrialBalanceResponse> {
    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
    });

    return apiClient.get<TrialBalanceResponse>(
      `${API_ENDPOINTS.FINANCE_REPORTS.TRIAL_BALANCE}?${query.toString()}`
    );
  },
};
