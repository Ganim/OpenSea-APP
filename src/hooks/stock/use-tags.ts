/**
 * OpenSea OS - Tags Hooks
 * Hooks React Query para gerenciar tags usando CRUD Factory
 * 
 * Este é um exemplo de uso do createCrudHooks factory.
 * Demonstra como reduzir hooks CRUD de ~50 linhas para ~15 linhas.
 */

import { tagsService } from '@/services/stock';
import type { 
  Tag, 
  CreateTagRequest, 
  UpdateTagRequest,
  TagsResponse,
  TagResponse,
} from '@/types/stock';
import { createCrudHooks } from '../create-crud-hooks';

// =============================================================================
// ADAPTER SERVICE
// 
// O factory espera métodos que retornem a entidade diretamente,
// mas os services retornam objetos com { data, status }.
// Criamos um adapter para compatibilidade.
// =============================================================================

const tagsCrudService = {
  list: async (): Promise<Tag[]> => {
    const response = await tagsService.listTags();
    return response.tags;
  },
  
  get: async (id: string): Promise<Tag> => {
    const response = await tagsService.getTag(id);
    return response.tag;
  },
  
  create: async (data: CreateTagRequest): Promise<Tag> => {
    const response = await tagsService.createTag(data);
    return response.tag;
  },
  
  update: async (id: string, data: UpdateTagRequest): Promise<Tag> => {
    const response = await tagsService.updateTag(id, data);
    return response.tag;
  },
  
  delete: async (id: string): Promise<void> => {
    await tagsService.deleteTag(id);
  },
};

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Factory de hooks CRUD para tags
 * 
 * Gera automaticamente:
 * - useList() - Lista todas as tags
 * - useGet(id) - Busca uma tag por ID  
 * - useCreate() - Cria uma nova tag
 * - useUpdate() - Atualiza uma tag
 * - useDelete() - Deleta uma tag
 * - queryKeys - Keys para invalidação manual
 */
const tagsHooks = createCrudHooks<Tag, CreateTagRequest, UpdateTagRequest>({
  entityName: 'tag',
  pluralEntityName: 'tags',
  service: tagsCrudService,
});

// Exportar hooks individuais para manter API compatível com código existente
export const useTags = tagsHooks.useList;
export const useTag = tagsHooks.useGet;
export const useCreateTag = tagsHooks.useCreate;
export const useUpdateTag = tagsHooks.useUpdate;
export const useDeleteTag = tagsHooks.useDelete;

// Exportar factory completo para uso avançado
export const tagsCrudHooks = tagsHooks;

// Exportar query keys para invalidação manual
export const TAGS_QUERY_KEYS = tagsHooks.queryKeys;
