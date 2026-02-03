/**
 * Label Templates Service
 * Serviço para gerenciar templates de etiquetas
 * @see docs/label-templates.md para documentação da API
 */

import { apiClient } from '@/lib/api-client';
import type {
  CreateLabelTemplateInput,
  LabelTemplateResponse,
  LabelTemplatesResponse,
  UpdateLabelTemplateInput,
} from '@/core/print-queue/editor';

const BASE_URL = '/v1/label-templates';

/**
 * Lista parâmetros para listagem de templates
 */
export interface ListLabelTemplatesParams {
  page?: number;
  limit?: number;
  search?: string;
  includeSystem?: boolean;
}

/**
 * Lista todos os templates de etiqueta (paginado)
 * GET /v1/label-templates
 */
async function listTemplates(
  params?: ListLabelTemplatesParams
): Promise<LabelTemplatesResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page !== undefined) {
    searchParams.set('page', String(params.page));
  }
  if (params?.limit !== undefined) {
    searchParams.set('limit', String(params.limit));
  }
  if (params?.search) {
    searchParams.set('search', params.search);
  }
  if (params?.includeSystem !== undefined) {
    searchParams.set('includeSystem', String(params.includeSystem));
  }

  const url = searchParams.toString()
    ? `${BASE_URL}?${searchParams.toString()}`
    : BASE_URL;

  return apiClient.get<LabelTemplatesResponse>(url);
}

/**
 * Busca um template por ID
 * GET /v1/label-templates/:id
 */
async function getTemplate(id: string): Promise<LabelTemplateResponse> {
  return apiClient.get<LabelTemplateResponse>(`${BASE_URL}/${id}`);
}

/**
 * Cria um novo template
 * POST /v1/label-templates
 */
async function createTemplate(
  data: CreateLabelTemplateInput
): Promise<LabelTemplateResponse> {
  return apiClient.post<LabelTemplateResponse>(BASE_URL, data);
}

/**
 * Atualiza um template existente
 * PUT /v1/label-templates/:id
 */
async function updateTemplate(
  id: string,
  data: UpdateLabelTemplateInput
): Promise<LabelTemplateResponse> {
  return apiClient.put<LabelTemplateResponse>(`${BASE_URL}/${id}`, data);
}

/**
 * Remove um template (soft delete)
 * DELETE /v1/label-templates/:id
 */
async function deleteTemplate(id: string): Promise<void> {
  return apiClient.delete(`${BASE_URL}/${id}`);
}

/**
 * Duplica um template
 * POST /v1/label-templates/:id/duplicate
 */
async function duplicateTemplate(
  id: string,
  newName: string
): Promise<LabelTemplateResponse> {
  return apiClient.post<LabelTemplateResponse>(`${BASE_URL}/${id}/duplicate`, {
    name: newName,
  });
}

/**
 * Lista apenas templates do sistema
 * GET /v1/label-templates/system
 */
async function listSystemTemplates(): Promise<{
  templates: LabelTemplateResponse['template'][];
}> {
  return apiClient.get<{ templates: LabelTemplateResponse['template'][] }>(
    `${BASE_URL}/system`
  );
}

/**
 * Atualiza thumbnail de um template
 * POST /v1/label-templates/:id/thumbnail
 */
async function updateThumbnail(
  id: string,
  thumbnailUrl: string
): Promise<LabelTemplateResponse> {
  return apiClient.post<LabelTemplateResponse>(`${BASE_URL}/${id}/thumbnail`, {
    thumbnailUrl,
  });
}

export const labelTemplatesService = {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  listSystemTemplates,
  updateThumbnail,
};

export default labelTemplatesService;
