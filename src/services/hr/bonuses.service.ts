import { apiClient } from '@/lib/api-client';
import type { Bonus } from '@/types/hr';

export interface BonusResponse {
  bonus: Bonus;
}

export interface BonusesResponse {
  bonuses: Bonus[];
}

export interface CreateBonusRequest {
  employeeId: string;
  name: string;
  amount: number;
  reason: string;
  date: string;
}

export interface ListBonusesParams {
  employeeId?: string;
  isPaid?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

export const bonusesService = {
  async create(data: CreateBonusRequest): Promise<BonusResponse> {
    return apiClient.post<BonusResponse>('/v1/hr/bonuses', data);
  },

  async get(bonusId: string): Promise<BonusResponse> {
    return apiClient.get<BonusResponse>(`/v1/hr/bonuses/${bonusId}`);
  },

  async list(params?: ListBonusesParams): Promise<BonusesResponse> {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.isPaid !== undefined)
      query.append('isPaid', String(params.isPaid));
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    const qs = query.toString();
    return apiClient.get<BonusesResponse>(
      `/v1/hr/bonuses${qs ? `?${qs}` : ''}`
    );
  },

  async delete(bonusId: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/bonuses/${bonusId}`);
  },
};
