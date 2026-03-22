export type IntegrationType =
  | 'CUSTOMER'
  | 'PRODUCT'
  | 'FINANCE_ENTRY'
  | 'EMAIL'
  | 'DEPARTMENT'
  | 'CALENDAR_EVENT';

export interface CardIntegration {
  id: string;
  cardId: string;
  type: IntegrationType;
  entityId: string;
  entityLabel: string;
  createdAt: string;
  createdBy: string;
}

export interface CreateIntegrationRequest {
  type: IntegrationType;
  entityId: string;
  entityLabel: string;
}

export const INTEGRATION_CONFIG: Record<
  IntegrationType,
  {
    label: string;
    icon: string;
    color: string;
    interaction: 'combobox' | 'modal';
  }
> = {
  CUSTOMER: {
    label: 'Cliente',
    icon: '👤',
    color: '217,91%,60%',
    interaction: 'combobox',
  },
  PRODUCT: {
    label: 'Produto',
    icon: '📦',
    color: '280,67%,60%',
    interaction: 'combobox',
  },
  FINANCE_ENTRY: {
    label: 'Financeiro',
    icon: '💰',
    color: '142,71%,45%',
    interaction: 'modal',
  },
  EMAIL: {
    label: 'Email',
    icon: '✉️',
    color: '45,93%,47%',
    interaction: 'modal',
  },
  DEPARTMENT: {
    label: 'Departamento',
    icon: '🏢',
    color: '350,89%,60%',
    interaction: 'combobox',
  },
  CALENDAR_EVENT: {
    label: 'Calendário',
    icon: '📅',
    color: '142,71%,45%',
    interaction: 'combobox',
  },
};
