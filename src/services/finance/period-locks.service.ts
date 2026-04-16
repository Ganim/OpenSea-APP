import { apiClient } from '@/lib/api-client';

export interface PeriodLock {
  id: string;
  tenantId: string;
  year: number;
  month: number;
  lockedBy: string;
  lockedAt: string;
  releasedBy: string | null;
  releasedAt: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export const periodLocksService = {
  async list(params: {
    year?: number;
    activeOnly?: boolean;
  }): Promise<{ locks: PeriodLock[] }> {
    const query = new URLSearchParams();
    if (params.year !== undefined) query.append('year', String(params.year));
    if (params.activeOnly) query.append('activeOnly', 'true');
    const qs = query.toString();
    return apiClient.get(`/v1/finance/period-locks${qs ? `?${qs}` : ''}`);
  },

  async create(body: {
    year: number;
    month: number;
    reason?: string;
  }): Promise<{ lock: PeriodLock }> {
    return apiClient.post('/v1/finance/period-locks', body);
  },

  async release(id: string): Promise<{ released: true }> {
    return apiClient.delete(`/v1/finance/period-locks/${id}`);
  },
};
