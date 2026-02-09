/**
 * OpenSea OS - Volumes Hooks
 * Hooks React Query para gerenciar volumes usando CRUD Factory
 */

import { volumesService } from '@/services/stock';
import type {
  Volume,
  CreateVolumeRequest,
  UpdateVolumeRequest,
} from '@/types/stock';
import { createCrudHooks } from '../create-crud-hooks';

// =============================================================================
// ADAPTER SERVICE
// =============================================================================

const volumesCrudService = {
  list: async (): Promise<Volume[]> => {
    const response = await volumesService.listVolumes();
    return response.volumes;
  },

  get: async (id: string): Promise<Volume> => {
    const response = await volumesService.getVolume(id);
    return response.volume;
  },

  create: async (data: CreateVolumeRequest): Promise<Volume> => {
    const response = await volumesService.createVolume(data);
    return response.volume;
  },

  update: async (id: string, data: UpdateVolumeRequest): Promise<Volume> => {
    const response = await volumesService.updateVolume(id, data);
    return response.volume;
    await volumesService.deleteVolume(id);
  },
};

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Factory de hooks CRUD para volumes
 */
const volumesHooks = createCrudHooks<
  Volume,
  CreateVolumeRequest,
  UpdateVolumeRequest
>({
  entityName: 'volume',
  pluralEntityName: 'volumes',
  service: volumesCrudService,
});

// Exportar hooks individuais (compatibilidade com código existente)
export const useVolumes = volumesHooks.useList;
export const useVolume = volumesHooks.useGet;
export const useCreateVolume = volumesHooks.useCreate;
export const useUpdateVolume = volumesHooks.useUpdate;
export const useDeleteVolume = volumesHooks.useDelete;

// Exportar factory completo
export const volumesCrudHooks = volumesHooks;

// Exportar query keys
export const VOLUMES_QUERY_KEYS = volumesHooks.queryKeys;
