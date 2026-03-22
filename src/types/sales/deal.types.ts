// Deal Types

import type { PaginatedQuery } from '../pagination';
import type { Customer } from './customer.types';
import type { Pipeline, PipelineStage } from './pipeline.types';

export type DealStatus = 'OPEN' | 'WON' | 'LOST' | 'ARCHIVED';

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  OPEN: 'Aberto',
  WON: 'Ganho',
  LOST: 'Perdido',
  ARCHIVED: 'Arquivado',
};

export interface Deal {
  id: string;
  title: string;
  customerId?: string;
  customer?: Customer;
  pipelineId: string;
  pipeline?: Pipeline;
  stageId: string;
  stage?: PipelineStage;
  value?: number;
  currency: string;
  expectedCloseDate?: string;
  probability?: number;
  status: DealStatus;
  assignedToUserId?: string;
  tags: string[];
  stageEnteredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDealRequest {
  title: string;
  customerId?: string;
  pipelineId: string;
  stageId: string;
  value?: number;
  currency?: string;
  expectedCloseDate?: string;
  probability?: number;
  assignedToUserId?: string;
  tags?: string[];
}

export interface UpdateDealRequest {
  title?: string;
  customerId?: string;
  value?: number;
  currency?: string;
  expectedCloseDate?: string;
  probability?: number;
  status?: DealStatus;
  assignedToUserId?: string;
  tags?: string[];
}

export interface ChangeDealStageRequest {
  stageId: string;
  pipelineId?: string;
}

export interface DealResponse {
  deal: Deal;
}

export interface PaginatedDealsResponse {
  deals: Deal[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface DealsQuery extends PaginatedQuery {
  search?: string;
  pipelineId?: string;
  stageId?: string;
  status?: DealStatus;
  customerId?: string;
  assignedToUserId?: string;
  minValue?: number;
  maxValue?: number;
}
