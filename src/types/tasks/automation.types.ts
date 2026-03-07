export type AutomationTrigger =
  | 'CARD_MOVED'
  | 'CARD_CREATED'
  | 'DUE_DATE_REACHED'
  | 'LABEL_ADDED';

export type AutomationAction =
  | 'MOVE_CARD'
  | 'ASSIGN_MEMBER'
  | 'ADD_LABEL'
  | 'SET_PRIORITY'
  | 'SEND_NOTIFICATION';

export interface BoardAutomation {
  id: string;
  boardId: string;
  name: string;
  trigger: AutomationTrigger;
  triggerConfig: Record<string, unknown>;
  action: AutomationAction;
  actionConfig: Record<string, unknown>;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateAutomationRequest {
  name: string;
  trigger: AutomationTrigger;
  triggerConfig: Record<string, unknown>;
  action: AutomationAction;
  actionConfig: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateAutomationRequest {
  name?: string;
  trigger?: AutomationTrigger;
  triggerConfig?: Record<string, unknown>;
  action?: AutomationAction;
  actionConfig?: Record<string, unknown>;
  isActive?: boolean;
}

export interface AutomationsQuery {
  page?: number;
  limit?: number;
  trigger?: AutomationTrigger;
  action?: AutomationAction;
  isActive?: boolean;
}
