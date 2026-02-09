/**
 * OpenSea OS - Label Templates Hooks
 * Hooks React Query para gerenciar templates de etiquetas usando CRUD Factory
 */

import type {
  CreateLabelTemplateInput,
  LabelTemplate,
  UpdateLabelTemplateInput,
} from '@/core/print-queue/editor';
import { labelTemplatesService } from '@/services/stock';
import { createCrudHooks } from '../create-crud-hooks';

// =============================================================================
// ADAPTER SERVICE
// =============================================================================

const labelTemplatesCrudService = {
  list: async (): Promise<LabelTemplate[]> => {
    const response = await labelTemplatesService.listTemplates();
    return response.templates;
  },

  get: async (id: string): Promise<LabelTemplate> => {
    const response = await labelTemplatesService.getTemplate(id);
    return response.template;
  },

  create: async (data: CreateLabelTemplateInput): Promise<LabelTemplate> => {
    const response = await labelTemplatesService.createTemplate(data);
    return response.template;
  },

  update: async (
    id: string,
    data: UpdateLabelTemplateInput
  ): Promise<LabelTemplate> => {
    const response = await labelTemplatesService.updateTemplate(id, data);
    return response.template;
  },

  delete: async (id: string): Promise<void> => {
    await labelTemplatesService.deleteTemplate(id);
  },
};

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Factory de hooks CRUD para label templates
 */
const labelTemplatesHooks = createCrudHooks<
  LabelTemplate,
  CreateLabelTemplateInput,
  UpdateLabelTemplateInput
>({
  entityName: 'label-template',
  pluralEntityName: 'label-templates',
  service: labelTemplatesCrudService,
});

// Exportar hooks individuais (compatibilidade com código existente)
export const useLabelTemplates = labelTemplatesHooks.useList;
export const useLabelTemplate = labelTemplatesHooks.useGet;
export const useCreateLabelTemplate = labelTemplatesHooks.useCreate;
export const useUpdateLabelTemplate = labelTemplatesHooks.useUpdate;
export const useDeleteLabelTemplate = labelTemplatesHooks.useDelete;

// Exportar factory completo
export const labelTemplatesCrudHooks = labelTemplatesHooks;

// Exportar query keys
export const LABEL_TEMPLATES_QUERY_KEYS = labelTemplatesHooks.queryKeys;
