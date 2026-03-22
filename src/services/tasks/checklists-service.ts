import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  Checklist,
  ChecklistItem,
  CreateChecklistRequest,
  UpdateChecklistRequest,
  CreateChecklistItemRequest,
} from '@/types/tasks';

export interface ChecklistResponse {
  checklist: Checklist;
}

export interface ChecklistItemResponse {
  item: ChecklistItem;
}

export interface ChecklistsResponse {
  checklists: Checklist[];
}

export const checklistsService = {
  async list(boardId: string, cardId: string): Promise<ChecklistsResponse> {
    return apiClient.get<ChecklistsResponse>(
      API_ENDPOINTS.TASKS.CHECKLISTS.LIST(boardId, cardId)
    );
  },

  async create(
    boardId: string,
    cardId: string,
    data: CreateChecklistRequest
  ): Promise<ChecklistResponse> {
    return apiClient.post<ChecklistResponse>(
      API_ENDPOINTS.TASKS.CHECKLISTS.CREATE(boardId, cardId),
      data
    );
  },

  async update(
    boardId: string,
    cardId: string,
    checklistId: string,
    data: UpdateChecklistRequest
  ): Promise<ChecklistResponse> {
    return apiClient.patch<ChecklistResponse>(
      API_ENDPOINTS.TASKS.CHECKLISTS.UPDATE(boardId, cardId, checklistId),
      data
    );
  },

  async delete(
    boardId: string,
    cardId: string,
    checklistId: string
  ): Promise<void> {
    await apiClient.delete<void>(
      API_ENDPOINTS.TASKS.CHECKLISTS.DELETE(boardId, cardId, checklistId)
    );
  },

  async addItem(
    boardId: string,
    cardId: string,
    checklistId: string,
    data: CreateChecklistItemRequest
  ): Promise<ChecklistItemResponse> {
    return apiClient.post<ChecklistItemResponse>(
      API_ENDPOINTS.TASKS.CHECKLISTS.ADD_ITEM(boardId, cardId, checklistId),
      data
    );
  },

  async toggleItem(
    boardId: string,
    cardId: string,
    checklistId: string,
    itemId: string,
    isCompleted: boolean
  ): Promise<ChecklistItemResponse> {
    return apiClient.patch<ChecklistItemResponse>(
      API_ENDPOINTS.TASKS.CHECKLISTS.TOGGLE_ITEM(
        boardId,
        cardId,
        checklistId,
        itemId
      ),
      { isCompleted }
    );
  },

  async deleteItem(
    boardId: string,
    cardId: string,
    checklistId: string,
    itemId: string
  ): Promise<void> {
    await apiClient.delete<void>(
      API_ENDPOINTS.TASKS.CHECKLISTS.DELETE_ITEM(
        boardId,
        cardId,
        checklistId,
        itemId
      )
    );
  },
};
