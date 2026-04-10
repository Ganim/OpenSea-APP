import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type { PrintAgentsResponse, RegisterAgentResponse } from '@/types/sales';

export const printAgentsService = {
  async list(): Promise<PrintAgentsResponse> {
    return apiClient.get<PrintAgentsResponse>(
      API_ENDPOINTS.SALES_PRINTING.AGENTS.LIST
    );
  },

  async register(name: string): Promise<RegisterAgentResponse> {
    return apiClient.post<RegisterAgentResponse>(
      API_ENDPOINTS.SALES_PRINTING.AGENTS.CREATE,
      { name }
    );
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(
      API_ENDPOINTS.SALES_PRINTING.AGENTS.DELETE(id)
    );
  },

  async regenerateKey(
    id: string
  ): Promise<{ apiKey: string; message: string }> {
    return apiClient.post(
      API_ENDPOINTS.SALES_PRINTING.AGENTS.REGENERATE_KEY(id)
    );
  },
};
