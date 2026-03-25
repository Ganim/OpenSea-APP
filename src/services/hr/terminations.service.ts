import { apiClient } from '@/lib/api-client';
import type {
  Termination,
  CreateTerminationData,
  UpdateTerminationData,
} from '@/types/hr';

export interface TerminationResponse {
  termination: Termination;
}

export interface TerminationsResponse {
  terminations: Termination[];
}

export interface ListTerminationsParams {
  employeeId?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

export const terminationsService = {
  async list(params?: ListTerminationsParams): Promise<TerminationsResponse> {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    const qs = query.toString();
    return apiClient.get<TerminationsResponse>(
      `/v1/hr/terminations${qs ? `?${qs}` : ''}`
    );
  },

  async get(id: string): Promise<TerminationResponse> {
    return apiClient.get<TerminationResponse>(`/v1/hr/terminations/${id}`);
  },

  async create(data: CreateTerminationData): Promise<TerminationResponse> {
    return apiClient.post<TerminationResponse>('/v1/hr/terminations', data);
  },

  async update(
    id: string,
    data: UpdateTerminationData
  ): Promise<TerminationResponse> {
    return apiClient.patch<TerminationResponse>(
      `/v1/hr/terminations/${id}`,
      data
    );
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/terminations/${id}`);
  },

  async calculate(id: string): Promise<TerminationResponse> {
    return apiClient.post<TerminationResponse>(
      `/v1/hr/terminations/${id}/calculate`
    );
  },

  async markAsPaid(id: string): Promise<TerminationResponse> {
    return apiClient.post<TerminationResponse>(
      `/v1/hr/terminations/${id}/mark-paid`
    );
  },
};
