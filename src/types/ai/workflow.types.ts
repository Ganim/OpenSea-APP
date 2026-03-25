export type AiWorkflowTrigger = 'SCHEDULE' | 'EVENT' | 'MANUAL' | 'CONDITION';
export type AiWorkflowStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ERROR';
export type AiWorkflowExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED';

export interface AiWorkflowCondition {
  field: string;
  operator: string;
  value: string;
}

export interface AiWorkflowAction {
  id: string;
  type: string;
  displayName: string;
  module: string;
  params: Record<string, unknown>;
}

export interface AiWorkflow {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  naturalPrompt: string;
  trigger: AiWorkflowTrigger;
  triggerConfig: Record<string, unknown> | null;
  conditions: AiWorkflowCondition[];
  actions: AiWorkflowAction[];
  status: AiWorkflowStatus;
  runCount: number;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AiWorkflowExecution {
  id: string;
  workflowId: string;
  status: AiWorkflowExecutionStatus;
  trigger: AiWorkflowTrigger;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  actionsExecuted: number;
  actionsFailed: number;
  results: Record<string, unknown>[];
  error: string | null;
  createdAt: string;
}
