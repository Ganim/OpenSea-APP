// Form Types

import type { PaginatedQuery } from '../pagination';

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type FormFieldType =
  | 'TEXT'
  | 'NUMBER'
  | 'EMAIL'
  | 'PHONE'
  | 'SELECT'
  | 'CHECKBOX'
  | 'TEXTAREA'
  | 'DATE';

export const FORM_STATUS_LABELS: Record<FormStatus, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
};

export const FORM_FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  TEXT: 'Texto',
  NUMBER: 'Número',
  EMAIL: 'E-mail',
  PHONE: 'Telefone',
  SELECT: 'Seleção',
  CHECKBOX: 'Checkbox',
  TEXTAREA: 'Área de Texto',
  DATE: 'Data',
};

export interface FormField {
  id: string;
  formId: string;
  label: string;
  type: FormFieldType;
  options?: string[];
  isRequired: boolean;
  order: number;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  submittedBy?: string;
  createdAt: string;
}

export interface Form {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  status: FormStatus;
  submissionCount: number;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  fields?: FormField[];
}

export interface CreateFormRequest {
  title: string;
  description?: string;
  fields?: Array<{
    label: string;
    type: FormFieldType;
    options?: string[];
    isRequired?: boolean;
    order: number;
  }>;
}

export interface UpdateFormRequest {
  title?: string;
  description?: string;
  fields?: Array<{
    label: string;
    type: FormFieldType;
    options?: string[];
    isRequired?: boolean;
    order: number;
  }>;
}

export interface FormsQuery extends PaginatedQuery {
  status?: FormStatus;
}
