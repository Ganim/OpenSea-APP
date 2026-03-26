import { apiClient } from '@/lib/api-client';
import type {
  WorkplaceRisk,
  CreateWorkplaceRiskData,
  UpdateWorkplaceRiskData,
} from '@/types/hr';

export interface WorkplaceRiskResponse {
  workplaceRisk: WorkplaceRisk;
}

export interface WorkplaceRisksResponse {
  workplaceRisks: WorkplaceRisk[];
}

export interface ListWorkplaceRisksParams {
  category?: string;
  severity?: string;
  isActive?: boolean;
  page?: number;
  perPage?: number;
}

export const workplaceRisksService = {
  async list(
    programId: string,
    params?: ListWorkplaceRisksParams
  ): Promise<WorkplaceRisksResponse> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.isActive !== undefined)
      query.append('isActive', String(params.isActive));
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    const qs = query.toString();
    return apiClient.get<WorkplaceRisksResponse>(
      `/v1/hr/safety-programs/${programId}/risks${qs ? `?${qs}` : ''}`
    );
  },

  async create(
    programId: string,
    data: CreateWorkplaceRiskData
  ): Promise<WorkplaceRiskResponse> {
    return apiClient.post<WorkplaceRiskResponse>(
      `/v1/hr/safety-programs/${programId}/risks`,
      data
    );
  },

  async update(
    programId: string,
    riskId: string,
    data: UpdateWorkplaceRiskData
  ): Promise<WorkplaceRiskResponse> {
    return apiClient.patch<WorkplaceRiskResponse>(
      `/v1/hr/safety-programs/${programId}/risks/${riskId}`,
      data
    );
  },

  async delete(programId: string, riskId: string): Promise<void> {
    return apiClient.delete<void>(
      `/v1/hr/safety-programs/${programId}/risks/${riskId}`
    );
  },
};
