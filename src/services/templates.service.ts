/**
 * Templates Service
 * Serviço para gerenciar templates de estoque
 */

import { apiClient } from '@/lib/api-client';
import type {
  CreateTemplateRequest,
  Template,
  TemplateResponse,
  TemplatesResponse,
  UpdateTemplateRequest,
} from '@/types/stock';

export const templatesService = {
  getAll: async (): Promise<Template[]> => {
    const response = await apiClient.get<TemplatesResponse>('/stock/templates');
    return response.templates;
  },

  getById: async (id: string): Promise<Template> => {
    const response = await apiClient.get<TemplateResponse>(
      `/stock/templates/${id}`
    );
    return response.template;
  },

  create: async (data: CreateTemplateRequest): Promise<Template> => {
    const response = await apiClient.post<TemplateResponse>(
      '/stock/templates',
      data
    );
    return response.template;
  },

  update: async (
    id: string,
    data: UpdateTemplateRequest
  ): Promise<Template> => {
    const response = await apiClient.put<TemplateResponse>(
      `/stock/templates/${id}`,
      data
    );
    return response.template;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/stock/templates/${id}`);
  },
};
