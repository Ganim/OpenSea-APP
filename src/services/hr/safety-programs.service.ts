import { apiClient } from '@/lib/api-client';
import type {
  SafetyProgram,
  CreateSafetyProgramData,
  UpdateSafetyProgramData,
  WorkplaceRisk,
  CreateWorkplaceRiskData,
  UpdateWorkplaceRiskData,
} from '@/types/hr';

export interface SafetyProgramResponse {
  safetyProgram: SafetyProgram;
}

export interface SafetyProgramsResponse {
  safetyPrograms: SafetyProgram[];
}

export interface WorkplaceRiskResponse {
  risk: WorkplaceRisk;
}

export interface WorkplaceRisksResponse {
  risks: WorkplaceRisk[];
}

export interface ListSafetyProgramsParams {
  type?: string;
  status?: string;
  page?: number;
  perPage?: number;
}

export const safetyProgramsService = {
  async list(params?: ListSafetyProgramsParams): Promise<SafetyProgramsResponse> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    const qs = query.toString();
    return apiClient.get<SafetyProgramsResponse>(
      `/v1/hr/safety-programs${qs ? `?${qs}` : ''}`
    );
  },

  async get(id: string): Promise<SafetyProgramResponse> {
    return apiClient.get<SafetyProgramResponse>(`/v1/hr/safety-programs/${id}`);
  },

  async create(data: CreateSafetyProgramData): Promise<SafetyProgramResponse> {
    return apiClient.post<SafetyProgramResponse>('/v1/hr/safety-programs', data);
  },

  async update(
    id: string,
    data: UpdateSafetyProgramData
  ): Promise<SafetyProgramResponse> {
    return apiClient.patch<SafetyProgramResponse>(
      `/v1/hr/safety-programs/${id}`,
      data
    );
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/safety-programs/${id}`);
  },

  // Risks
  async listRisks(programId: string): Promise<WorkplaceRisksResponse> {
    return apiClient.get<WorkplaceRisksResponse>(
      `/v1/hr/safety-programs/${programId}/risks`
    );
  },

  async createRisk(
    programId: string,
    data: CreateWorkplaceRiskData
  ): Promise<WorkplaceRiskResponse> {
    return apiClient.post<WorkplaceRiskResponse>(
      `/v1/hr/safety-programs/${programId}/risks`,
      data
    );
  },

  async updateRisk(
    programId: string,
    riskId: string,
    data: UpdateWorkplaceRiskData
  ): Promise<WorkplaceRiskResponse> {
    return apiClient.patch<WorkplaceRiskResponse>(
      `/v1/hr/safety-programs/${programId}/risks/${riskId}`,
      data
    );
  },

  async deleteRisk(programId: string, riskId: string): Promise<void> {
    return apiClient.delete<void>(
      `/v1/hr/safety-programs/${programId}/risks/${riskId}`
    );
  },
};
