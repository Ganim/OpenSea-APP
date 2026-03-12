import { apiClient } from '@/lib/api-client';
import type { TimeBank } from '@/types/hr';

export interface TimeBankResponse {
  timeBank: TimeBank;
}

export interface TimeBanksResponse {
  timeBanks: TimeBank[];
}

export interface CreditDebitTimeBankRequest {
  employeeId: string;
  hours: number;
  year?: number;
}

export interface AdjustTimeBankRequest {
  employeeId: string;
  newBalance: number;
  year?: number;
}

export interface ListTimeBanksParams {
  employeeId?: string;
  year?: number;
}

export const timeBankService = {
  async credit(data: CreditDebitTimeBankRequest): Promise<TimeBankResponse> {
    return apiClient.post<TimeBankResponse>('/v1/hr/time-bank/credit', data);
  },

  async debit(data: CreditDebitTimeBankRequest): Promise<TimeBankResponse> {
    return apiClient.post<TimeBankResponse>('/v1/hr/time-bank/debit', data);
  },

  async adjust(data: AdjustTimeBankRequest): Promise<TimeBankResponse> {
    return apiClient.post<TimeBankResponse>('/v1/hr/time-bank/adjust', data);
  },

  async getByEmployee(
    employeeId: string,
    year?: number
  ): Promise<TimeBankResponse> {
    const query = year ? `?year=${year}` : '';
    return apiClient.get<TimeBankResponse>(
      `/v1/hr/time-bank/${employeeId}${query}`
    );
  },

  async list(params?: ListTimeBanksParams): Promise<TimeBanksResponse> {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.year) query.append('year', String(params.year));
    const qs = query.toString();
    return apiClient.get<TimeBanksResponse>(
      `/v1/hr/time-bank${qs ? `?${qs}` : ''}`
    );
  },
};
