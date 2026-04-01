/**
 * OKRs Service (HR)
 * Serviço para gerenciamento de Objetivos e Resultados-Chave
 */

import { apiClient } from '@/lib/api-client';
import type {
  OKRObjective,
  OKRKeyResult,
  OKRCheckIn,
  CreateObjectiveData,
  UpdateObjectiveData,
  CreateKeyResultData,
  CreateCheckInData,
} from '@/types/hr';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ObjectivesResponse {
  objectives: OKRObjective[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
}

export interface ObjectiveResponse {
  objective: OKRObjective;
}

export interface KeyResultResponse {
  keyResult: OKRKeyResult;
}

export interface CheckInResponse {
  checkIn: OKRCheckIn;
}

// ============================================================================
// PARAMS
// ============================================================================

export interface ListObjectivesParams {
  page?: number;
  perPage?: number;
  ownerId?: string;
  parentId?: string;
  level?: string;
  status?: string;
  period?: string;
}

// ============================================================================
// SERVICE
// ============================================================================

export const okrsService = {
  async listObjectives(
    params?: ListObjectivesParams
  ): Promise<ObjectivesResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    if (params?.ownerId) query.append('ownerId', params.ownerId);
    if (params?.parentId) query.append('parentId', params.parentId);
    if (params?.level) query.append('level', params.level);
    if (params?.status) query.append('status', params.status);
    if (params?.period) query.append('period', params.period);
    const qs = query.toString();
    return apiClient.get<ObjectivesResponse>(
      `/v1/hr/okrs/objectives${qs ? `?${qs}` : ''}`
    );
  },

  async getObjective(id: string): Promise<ObjectiveResponse> {
    return apiClient.get<ObjectiveResponse>(`/v1/hr/okrs/objectives/${id}`);
  },

  async createObjective(data: CreateObjectiveData): Promise<ObjectiveResponse> {
    return apiClient.post<ObjectiveResponse>('/v1/hr/okrs/objectives', data);
  },

  async updateObjective(
    id: string,
    data: UpdateObjectiveData
  ): Promise<ObjectiveResponse> {
    return apiClient.put<ObjectiveResponse>(
      `/v1/hr/okrs/objectives/${id}`,
      data
    );
  },

  async deleteObjective(id: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/okrs/objectives/${id}`);
  },

  async createKeyResult(
    objectiveId: string,
    data: CreateKeyResultData
  ): Promise<KeyResultResponse> {
    return apiClient.post<KeyResultResponse>(
      `/v1/hr/okrs/objectives/${objectiveId}/key-results`,
      data
    );
  },

  async checkInKeyResult(
    keyResultId: string,
    data: CreateCheckInData
  ): Promise<CheckInResponse> {
    return apiClient.post<CheckInResponse>(
      `/v1/hr/okrs/key-results/${keyResultId}/check-ins`,
      data
    );
  },
};
