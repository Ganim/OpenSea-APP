// Workflow Types

import type { PaginatedQuery } from '../pagination';

export type WorkflowTrigger =
  | 'ORDER_CREATED'
  | 'ORDER_CONFIRMED'
  | 'DEAL_WON'
  | 'DEAL_LOST'
  | 'CUSTOMER_CREATED'
  | 'QUOTE_SENT'
  | 'QUOTE_ACCEPTED';
export type WorkflowStepType =
  | 'SEND_EMAIL'
  | 'SEND_NOTIFICATION'
  | 'UPDATE_STATUS'
  | 'CREATE_TASK';

export const WORKFLOW_TRIGGER_LABELS: Record<WorkflowTrigger, string> = {
  ORDER_CREATED: 'Pedido Criado',
  ORDER_CONFIRMED: 'Pedido Confirmado',
  DEAL_WON: 'Negócio Ganho',
  DEAL_LOST: 'Negócio Perdido',
  CUSTOMER_CREATED: 'Cliente Criado',
  QUOTE_SENT: 'Orçamento Enviado',
  QUOTE_ACCEPTED: 'Orçamento Aceito',
};

export const WORKFLOW_STEP_TYPE_LABELS: Record<WorkflowStepType, string> = {
  SEND_EMAIL: 'Enviar E-mail',
  SEND_NOTIFICATION: 'Enviar Notificação',
  UPDATE_STATUS: 'Atualizar Status',
  CREATE_TASK: 'Criar Tarefa',
};

export interface WorkflowStep {
  id: string;
  order: number;
  type: WorkflowStepType;
  config: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  isActive?: boolean;
  steps?: Array<{
    order: number;
    type: WorkflowStepType;
    config: Record<string, unknown>;
  }>;
}

export interface UpdateWorkflowRequest extends Partial<CreateWorkflowRequest> {}

export interface WorkflowsQuery extends PaginatedQuery {
  trigger?: WorkflowTrigger;
  isActive?: boolean;
}
