import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreateLocationRequest,
  LocationResponse,
  LocationsResponse,
  UpdateLocationRequest,
} from '@/types/stock';

/**
 * Serviço de Locations
 * Gerencia todas as operações relacionadas a localizações de estoque
 */
export const locationsService = {
  /**
   * Lista todas as localizações com filtros opcionais
   */
  async listLocations(query?: {
    type?: string;
    parentId?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<LocationsResponse> {
    const params = new URLSearchParams();
    if (query?.type) params.append('type', query.type);
    if (query?.parentId) params.append('parentId', query.parentId);
    if (query?.isActive !== undefined)
      params.append('isActive', query.isActive.toString());
    if (query?.search) params.append('search', query.search);

    const url = params.toString()
      ? `${API_ENDPOINTS.LOCATIONS.LIST}?${params.toString()}`
      : API_ENDPOINTS.LOCATIONS.LIST;

    return apiClient.get<LocationsResponse>(url);
  },

  /**
   * Busca uma localização por ID
   */
  async getLocation(id: string): Promise<LocationResponse> {
    return apiClient.get<LocationResponse>(API_ENDPOINTS.LOCATIONS.GET(id));
  },

  /**
   * Cria uma nova localização
   * IMPORTANTE: Backend espera 'locationType' no formato camelCase
   */
  async createLocation(data: CreateLocationRequest): Promise<LocationResponse> {
    console.group('[LOCATIONS SERVICE] createLocation');
    console.log('📤 Dados recebidos do frontend:', data);

    // Log detalhado do campo type
    console.log('🔍 Campo type:', {
      value: data.type,
      type: typeof data.type,
      exists: 'type' in data,
      isDefined: data.type !== undefined,
      isNull: data.type === null,
    });

    // Criar objeto limpo apenas com campos definidos
    const cleanData: Record<string, unknown> = {};

    // IMPORTANTE: Adiciona titulo (campo esperado pelo backend)
    if (data.titulo !== undefined && data.titulo !== null) {
      cleanData.titulo = data.titulo;
    }

    // IMPORTANTE: Adiciona type se existir
    if (data.type !== undefined && data.type !== null) {
      cleanData.type = data.type;
      console.log('✅ type será enviado:', cleanData.type);
    } else {
      console.warn('⚠️ type não está definido - não será enviado');
    }

    // Adiciona parentId se existir
    if (data.parentId !== undefined && data.parentId !== null) {
      cleanData.parentId = data.parentId;
    }

    // Adiciona capacity se existir
    if (data.capacity !== undefined && data.capacity !== null) {
      cleanData.capacity = data.capacity;
    }

    // Adiciona currentOccupancy se existir
    if (data.currentOccupancy !== undefined && data.currentOccupancy !== null) {
      cleanData.currentOccupancy = data.currentOccupancy;
    }

    // Adiciona isActive se existir
    if (data.isActive !== undefined && data.isActive !== null) {
      cleanData.isActive = data.isActive;
    }

    console.log(
      '📦 Payload final a ser enviado:',
      JSON.stringify(cleanData, null, 2)
    );
    console.log('🔑 Chaves do payload:', Object.keys(cleanData));
    console.groupEnd();

    try {
      const result = await apiClient.post<LocationResponse>(
        API_ENDPOINTS.LOCATIONS.CREATE,
        cleanData
      );

      console.group('[LOCATIONS SERVICE] createLocation - Response');
      console.log('✅ Resposta recebida:', result);
      console.log('📍 Location criado:', {
        id: result.location.id,
        code: result.location.code,
        type: result.location.type,
        hasType: !!result.location.type,
      });
      console.groupEnd();

      return result;
    } catch (error) {
      console.group('[LOCATIONS SERVICE] createLocation - Error');
      console.error('❌ Erro ao criar location:', error);
      console.error('📦 Dados que foram enviados:', cleanData);
      console.groupEnd();
      throw error;
    }
  },

  /**
   * Atualiza uma localização existente
   */
  async updateLocation(
    id: string,
    data: UpdateLocationRequest
  ): Promise<LocationResponse> {
    console.group('[LOCATIONS SERVICE] updateLocation');
    console.log('📝 ID:', id);
    console.log('📤 Dados recebidos do frontend:', data);

    // Log detalhado do campo type
    console.log('🔍 Campo type:', {
      value: data.type,
      type: typeof data.type,
      exists: 'type' in data,
      isDefined: data.type !== undefined,
      isNull: data.type === null,
    });

    // Criar objeto limpo apenas com campos definidos
    const cleanData: Record<string, unknown> = {};

    // Adiciona apenas campos que foram fornecidos
    if (data.titulo !== undefined && data.titulo !== null) {
      cleanData.titulo = data.titulo;
    }

    // IMPORTANTE: Adiciona type se existir
    if (data.type !== undefined && data.type !== null) {
      cleanData.type = data.type;
      console.log('✅ type será enviado:', cleanData.type);
    } else if ('type' in data) {
      console.warn('⚠️ type está presente mas é undefined/null');
    }

    if (data.parentId !== undefined && data.parentId !== null) {
      cleanData.parentId = data.parentId;
    }

    if (data.capacity !== undefined && data.capacity !== null) {
      cleanData.capacity = data.capacity;
    }

    if (data.currentOccupancy !== undefined && data.currentOccupancy !== null) {
      cleanData.currentOccupancy = data.currentOccupancy;
    }

    if (data.isActive !== undefined && data.isActive !== null) {
      cleanData.isActive = data.isActive;
    }

    console.log(
      '📦 Payload final a ser enviado:',
      JSON.stringify(cleanData, null, 2)
    );
    console.log('🔑 Chaves do payload:', Object.keys(cleanData));
    console.groupEnd();

    try {
      const result = await apiClient.put<LocationResponse>(
        API_ENDPOINTS.LOCATIONS.UPDATE(id),
        cleanData
      );

      console.group('[LOCATIONS SERVICE] updateLocation - Response');
      console.log('✅ Resposta recebida:', result);
      console.log('📍 Location atualizado:', {
        id: result.location.id,
        code: result.location.code,
        type: result.location.type,
        hasType: !!result.location.type,
      });
      console.groupEnd();

      return result;
    } catch (error) {
      console.group('[LOCATIONS SERVICE] updateLocation - Error');
      console.error('❌ Erro ao atualizar location:', error);
      console.error('📦 Dados que foram enviados:', cleanData);
      console.groupEnd();
      throw error;
    }
  },

  /**
   * Deleta uma localização
   */
  async deleteLocation(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.LOCATIONS.DELETE(id));
  },
};
