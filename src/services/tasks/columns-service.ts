import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  Column,
  CreateColumnRequest,
  UpdateColumnRequest,
  ReorderColumnsRequest,
} from '@/types/tasks';

export interface ColumnResponse {
  column: Column;
}

export const columnsService = {
  async create(
    boardId: string,
    data: CreateColumnRequest
  ): Promise<ColumnResponse> {
    return apiClient.post<ColumnResponse>(
      API_ENDPOINTS.TASKS.COLUMNS.CREATE(boardId),
      data
    );
  },

  async update(
    boardId: string,
    columnId: string,
    data: UpdateColumnRequest
  ): Promise<ColumnResponse> {
    return apiClient.patch<ColumnResponse>(
      API_ENDPOINTS.TASKS.COLUMNS.UPDATE(boardId, columnId),
      data
    );
  },

  async delete(boardId: string, columnId: string): Promise<void> {
    await apiClient.delete<void>(
      API_ENDPOINTS.TASKS.COLUMNS.DELETE(boardId, columnId)
    );
  },

  async reorder(boardId: string, data: ReorderColumnsRequest): Promise<void> {
    await apiClient.patch<void>(
      API_ENDPOINTS.TASKS.COLUMNS.REORDER(boardId),
      data
    );
  },
};
