// Contact Types

import type { PaginatedQuery } from '../pagination';
import type { ContactSource } from './customer.types';

export type LifecycleStage =
  | 'LEAD'
  | 'MQL'
  | 'SQL'
  | 'OPPORTUNITY'
  | 'CUSTOMER'
  | 'EVANGELIST'
  | 'CHURNED';

export type ContactRole =
  | 'DECISION_MAKER'
  | 'INFLUENCER'
  | 'CHAMPION'
  | 'END_USER'
  | 'GATEKEEPER'
  | 'OTHER';

export type LeadTemperature = 'HOT' | 'WARM' | 'COLD';

export const LIFECYCLE_STAGE_LABELS: Record<LifecycleStage, string> = {
  LEAD: 'Lead',
  MQL: 'Lead Qualificado (Marketing)',
  SQL: 'Lead Qualificado (Vendas)',
  OPPORTUNITY: 'Oportunidade',
  CUSTOMER: 'Cliente',
  EVANGELIST: 'Evangelista',
  CHURNED: 'Perdido',
};

export const CONTACT_ROLE_LABELS: Record<ContactRole, string> = {
  DECISION_MAKER: 'Decisor',
  INFLUENCER: 'Influenciador',
  CHAMPION: 'Defensor',
  END_USER: 'Usuario Final',
  GATEKEEPER: 'Guardiao',
  OTHER: 'Outro',
};

export const LEAD_TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  HOT: 'Quente',
  WARM: 'Morno',
  COLD: 'Frio',
};

export interface Contact {
  id: string;
  tenantId: string;
  customerId?: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  role?: ContactRole;
  jobTitle?: string;
  department?: string;
  lifecycleStage: LifecycleStage;
  leadScore?: number;
  leadTemperature?: LeadTemperature;
  source: ContactSource;
  tags: string[];
  avatarUrl?: string;
  isMainContact: boolean;
  assignedToUserId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateContactRequest {
  customerId?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  role?: ContactRole;
  jobTitle?: string;
  department?: string;
  lifecycleStage?: LifecycleStage;
  leadScore?: number;
  leadTemperature?: LeadTemperature;
  source?: ContactSource;
  tags?: string[];
  avatarUrl?: string;
  isMainContact?: boolean;
  assignedToUserId?: string;
}

export interface UpdateContactRequest {
  customerId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  role?: ContactRole;
  jobTitle?: string;
  department?: string;
  lifecycleStage?: LifecycleStage;
  leadScore?: number;
  leadTemperature?: LeadTemperature;
  source?: ContactSource;
  tags?: string[];
  avatarUrl?: string;
  isMainContact?: boolean;
  assignedToUserId?: string;
}

export interface ContactResponse {
  contact: Contact;
}

export interface PaginatedContactsResponse {
  contacts: Contact[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ContactsQuery extends PaginatedQuery {
  search?: string;
  customerId?: string;
  lifecycleStage?: LifecycleStage;
  leadTemperature?: LeadTemperature;
  source?: ContactSource;
  assignedToUserId?: string;
}
