import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreatePipelineRequest,
  CreatePipelineStageRequest,
  PipelineResponse,
  PipelineStageResponse,
  PipelineStagesResponse,
  PipelinesQuery,
  PipelinesResponse,
  ReorderPipelineStagesRequest,
  UpdatePipelineRequest,
  UpdatePipelineStageRequest,
} from '@/types/sales';

export const pipelinesService = {
  // GET /v1/pipelines
  async list(query?: PipelinesQuery): Promise<PipelinesResponse> {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.type) params.append('type', query.type);
    if (query?.isActive !== undefined)
      params.append('isActive', String(query.isActive));

    const url = params.toString()
      ? `${API_ENDPOINTS.PIPELINES.LIST}?${params.toString()}`
      : API_ENDPOINTS.PIPELINES.LIST;

    return apiClient.get<PipelinesResponse>(url);
  },

  // GET /v1/pipelines/:pipelineId
  async get(pipelineId: string): Promise<PipelineResponse> {
    return apiClient.get<PipelineResponse>(
      API_ENDPOINTS.PIPELINES.GET(pipelineId)
    );
  },

  // POST /v1/pipelines
  async create(data: CreatePipelineRequest): Promise<PipelineResponse> {
    return apiClient.post<PipelineResponse>(
      API_ENDPOINTS.PIPELINES.CREATE,
      data
    );
  },

  // PUT /v1/pipelines/:pipelineId
  async update(
    pipelineId: string,
    data: UpdatePipelineRequest
  ): Promise<PipelineResponse> {
    return apiClient.put<PipelineResponse>(
      API_ENDPOINTS.PIPELINES.UPDATE(pipelineId),
      data
    );
  },

  // DELETE /v1/pipelines/:pipelineId
  async delete(pipelineId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.PIPELINES.DELETE(pipelineId));
  },

  // --- Pipeline Stages ---

  // GET /v1/pipelines/:pipelineId/stages
  async listStages(pipelineId: string): Promise<PipelineStagesResponse> {
    return apiClient.get<PipelineStagesResponse>(
      API_ENDPOINTS.PIPELINES.STAGES.LIST(pipelineId)
    );
  },

  // POST /v1/pipelines/:pipelineId/stages
  async createStage(
    pipelineId: string,
    data: CreatePipelineStageRequest
  ): Promise<PipelineStageResponse> {
    return apiClient.post<PipelineStageResponse>(
      API_ENDPOINTS.PIPELINES.STAGES.CREATE(pipelineId),
      data
    );
  },

  // PUT /v1/pipelines/:pipelineId/stages/:stageId
  async updateStage(
    pipelineId: string,
    stageId: string,
    data: UpdatePipelineStageRequest
  ): Promise<PipelineStageResponse> {
    return apiClient.put<PipelineStageResponse>(
      API_ENDPOINTS.PIPELINES.STAGES.UPDATE(pipelineId, stageId),
      data
    );
  },

  // DELETE /v1/pipelines/:pipelineId/stages/:stageId
  async deleteStage(pipelineId: string, stageId: string): Promise<void> {
    return apiClient.delete<void>(
      API_ENDPOINTS.PIPELINES.STAGES.DELETE(pipelineId, stageId)
    );
  },

  // PUT /v1/pipelines/:pipelineId/stages/reorder
  async reorderStages(
    pipelineId: string,
    data: ReorderPipelineStagesRequest
  ): Promise<PipelineStagesResponse> {
    return apiClient.put<PipelineStagesResponse>(
      API_ENDPOINTS.PIPELINES.STAGES.REORDER(pipelineId),
      data
    );
  },
};
