import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  BoardAutomation,
  CreateAutomationRequest,
  UpdateAutomationRequest,
} from '@/types/tasks';

export interface AutomationsResponse {
  automations: BoardAutomation[];
}

export interface AutomationResponse {
  automation: BoardAutomation;
}

export const automationsService = {
  async list(boardId: string): Promise<AutomationsResponse> {
    return apiClient.get<AutomationsResponse>(
      API_ENDPOINTS.TASKS.AUTOMATIONS.LIST(boardId)
    );
  },

  async create(
    boardId: string,
    data: CreateAutomationRequest
  ): Promise<AutomationResponse> {
    return apiClient.post<AutomationResponse>(
      API_ENDPOINTS.TASKS.AUTOMATIONS.CREATE(boardId),
      data
    );
  },

  async update(
    boardId: string,
    automationId: string,
    data: UpdateAutomationRequest
  ): Promise<AutomationResponse> {
    return apiClient.patch<AutomationResponse>(
      API_ENDPOINTS.TASKS.AUTOMATIONS.UPDATE(boardId, automationId),
      data
    );
  },

  async delete(boardId: string, automationId: string): Promise<void> {
    await apiClient.delete<void>(
      API_ENDPOINTS.TASKS.AUTOMATIONS.DELETE(boardId, automationId)
    );
  },

  async toggle(
    boardId: string,
    automationId: string
  ): Promise<AutomationResponse> {
    return apiClient.patch<AutomationResponse>(
      API_ENDPOINTS.TASKS.AUTOMATIONS.TOGGLE(boardId, automationId)
    );
  },
};
