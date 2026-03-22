// Pipeline Types

import type { PaginatedQuery } from '../pagination';

export type PipelineType = 'SALES' | 'SUPPORT' | 'CUSTOM';

export type PipelineStageType =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WON'
  | 'LOST'
  | 'CUSTOM';

export const PIPELINE_TYPE_LABELS: Record<PipelineType, string> = {
  SALES: 'Vendas',
  SUPPORT: 'Suporte',
  CUSTOM: 'Personalizado',
};

export const PIPELINE_STAGE_TYPE_LABELS: Record<PipelineStageType, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em Andamento',
  WON: 'Ganho',
  LOST: 'Perdido',
  CUSTOM: 'Personalizado',
};

export interface PipelineStage {
  id: string;
  pipelineId: string;
  name: string;
  color?: string;
  icon?: string;
  position: number;
  type: PipelineStageType;
  probability: number;
  rottenAfterDays?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type: PipelineType;
  isDefault: boolean;
  position: number;
  isActive: boolean;
  stages: PipelineStage[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePipelineRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type?: PipelineType;
  isDefault?: boolean;
}

export interface UpdatePipelineRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  type?: PipelineType;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface CreatePipelineStageRequest {
  name: string;
  color?: string;
  icon?: string;
  type?: PipelineStageType;
  probability?: number;
  rottenAfterDays?: number;
}

export interface UpdatePipelineStageRequest {
  name?: string;
  color?: string;
  icon?: string;
  type?: PipelineStageType;
  probability?: number;
  rottenAfterDays?: number;
}

export interface ReorderPipelineStagesRequest {
  stageIds: string[];
}

export interface PipelineResponse {
  pipeline: Pipeline;
}

export interface PipelinesResponse {
  pipelines: Pipeline[];
}

export interface PipelineStageResponse {
  stage: PipelineStage;
}

export interface PipelineStagesResponse {
  stages: PipelineStage[];
}

export interface PipelinesQuery extends PaginatedQuery {
  search?: string;
  type?: PipelineType;
  isActive?: boolean;
}
