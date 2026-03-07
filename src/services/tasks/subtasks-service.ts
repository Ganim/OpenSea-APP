import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  Subtask,
  CreateSubtaskRequest,
  CompleteSubtaskRequest,
  UpdateCardRequest,
} from '@/types/tasks';

export interface SubtasksResponse {
  subtasks: Subtask[];
}

export interface SubtaskResponse {
  subtask: Subtask;
}

export const subtasksService = {
  async list(boardId: string, cardId: string): Promise<SubtasksResponse> {
    return apiClient.get<SubtasksResponse>(
      API_ENDPOINTS.TASKS.SUBTASKS.LIST(boardId, cardId),
    );
  },

  async create(
    boardId: string,
    cardId: string,
    data: CreateSubtaskRequest,
  ): Promise<SubtaskResponse> {
    return apiClient.post<SubtaskResponse>(
      API_ENDPOINTS.TASKS.SUBTASKS.CREATE(boardId, cardId),
      data,
    );
  },

  async update(
    boardId: string,
    cardId: string,
    subtaskId: string,
    data: UpdateCardRequest,
  ): Promise<SubtaskResponse> {
    return apiClient.patch<SubtaskResponse>(
      API_ENDPOINTS.TASKS.SUBTASKS.UPDATE(boardId, cardId, subtaskId),
      data,
    );
  },

  async delete(
    boardId: string,
    cardId: string,
    subtaskId: string,
  ): Promise<void> {
    await apiClient.delete<void>(
      API_ENDPOINTS.TASKS.SUBTASKS.DELETE(boardId, cardId, subtaskId),
    );
  },

  async complete(
    boardId: string,
    cardId: string,
    subtaskId: string,
    completed: boolean,
  ): Promise<SubtaskResponse> {
    const data: CompleteSubtaskRequest = { completed };
    return apiClient.patch<SubtaskResponse>(
      API_ENDPOINTS.TASKS.SUBTASKS.COMPLETE(boardId, cardId, subtaskId),
      data,
    );
  },
};
