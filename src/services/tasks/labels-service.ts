import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  Label,
  CreateLabelRequest,
  UpdateLabelRequest,
} from '@/types/tasks';

export interface LabelsResponse {
  labels: Label[];
}

export interface LabelResponse {
  label: Label;
}

export const labelsService = {
  async list(boardId: string): Promise<LabelsResponse> {
    return apiClient.get<LabelsResponse>(
      API_ENDPOINTS.TASKS.LABELS.LIST(boardId)
    );
  },

  async create(
    boardId: string,
    data: CreateLabelRequest
  ): Promise<LabelResponse> {
    return apiClient.post<LabelResponse>(
      API_ENDPOINTS.TASKS.LABELS.CREATE(boardId),
      data
    );
  },

  async update(
    boardId: string,
    labelId: string,
    data: UpdateLabelRequest
  ): Promise<LabelResponse> {
    return apiClient.patch<LabelResponse>(
      API_ENDPOINTS.TASKS.LABELS.UPDATE(boardId, labelId),
      data
    );
  },

  async delete(boardId: string, labelId: string): Promise<void> {
    await apiClient.delete<void>(
      API_ENDPOINTS.TASKS.LABELS.DELETE(boardId, labelId)
    );
  },
};
