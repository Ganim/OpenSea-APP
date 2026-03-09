import { apiClient } from '@/lib/api-client';
import type { Deduction } from '@/types/hr';

export interface DeductionResponse {
  deduction: Deduction;
}

export interface DeductionsResponse {
  deductions: Deduction[];
}

export interface CreateDeductionRequest {
  employeeId: string;
  name: string;
  amount: number;
  reason: string;
  date: string;
  isRecurring?: boolean;
  installments?: number;
}

export interface ListDeductionsParams {
  employeeId?: string;
  isApplied?: boolean;
  isRecurring?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

export const deductionsService = {
  async create(data: CreateDeductionRequest): Promise<DeductionResponse> {
    return apiClient.post<DeductionResponse>('/v1/hr/deductions', data);
  },

  async get(deductionId: string): Promise<DeductionResponse> {
    return apiClient.get<DeductionResponse>(`/v1/hr/deductions/${deductionId}`);
  },

  async list(params?: ListDeductionsParams): Promise<DeductionsResponse> {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.isApplied !== undefined) query.append('isApplied', String(params.isApplied));
    if (params?.isRecurring !== undefined) query.append('isRecurring', String(params.isRecurring));
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    const qs = query.toString();
    return apiClient.get<DeductionsResponse>(`/v1/hr/deductions${qs ? `?${qs}` : ''}`);
  },

  async delete(deductionId: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/deductions/${deductionId}`);
  },
};
