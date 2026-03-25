import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type { AiWorkflow, AiWorkflowExecution } from '@/types/ai';

export interface WorkflowsResponse {
  workflows: AiWorkflow[];
  total: number;
}

export const aiWorkflowsService = {
  async list(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<WorkflowsResponse> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    const url = queryString
      ? `${API_ENDPOINTS.AI.WORKFLOWS.LIST}?${queryString}`
      : API_ENDPOINTS.AI.WORKFLOWS.LIST;

    return apiClient.get<WorkflowsResponse>(url);
  },

  async create(data: { naturalPrompt: string }): Promise<AiWorkflow> {
    return apiClient.post<AiWorkflow>(API_ENDPOINTS.AI.WORKFLOWS.CREATE, data);
  },

  async getById(
    id: string
  ): Promise<AiWorkflow & { executions: AiWorkflowExecution[] }> {
    return apiClient.get<AiWorkflow & { executions: AiWorkflowExecution[] }>(
      API_ENDPOINTS.AI.WORKFLOWS.GET(id)
    );
  },

  async update(
    id: string,
    data: Partial<Pick<AiWorkflow, 'name' | 'description' | 'status'>>
  ): Promise<AiWorkflow> {
    return apiClient.patch<AiWorkflow>(
      API_ENDPOINTS.AI.WORKFLOWS.UPDATE(id),
      data
    );
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.AI.WORKFLOWS.DELETE(id));
  },

  async run(id: string): Promise<AiWorkflowExecution> {
    return apiClient.post<AiWorkflowExecution>(
      API_ENDPOINTS.AI.WORKFLOWS.RUN(id)
    );
  },

  async getExecutions(id: string): Promise<AiWorkflowExecution[]> {
    return apiClient.get<AiWorkflowExecution[]>(
      API_ENDPOINTS.AI.WORKFLOWS.EXECUTIONS(id)
    );
  },
};
