import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  Volume,
  VolumeResponse,
  VolumesResponse,
  VolumeRomaneio,
  CreateVolumeRequest,
  UpdateVolumeRequest,
  AddItemToVolumeRequest,
  VolumeActionRequest,
  VolumesQuery,
  ScanResult,
} from '@/types/stock';

function buildQueryString(query?: VolumesQuery): string {
  if (!query) return '';
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);
  if (query.status) params.append('status', query.status);
  if (query.search) params.append('search', query.search);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const volumesService = {
  // GET /v1/volumes
  async listVolumes(query?: VolumesQuery): Promise<VolumesResponse> {
    const url = `${API_ENDPOINTS.VOLUMES.LIST}${buildQueryString(query)}`;
    return apiClient.get<VolumesResponse>(url);
  },

  // GET /v1/volumes/:id
  async getVolume(id: string): Promise<VolumeResponse> {
    return apiClient.get<VolumeResponse>(API_ENDPOINTS.VOLUMES.GET(id));
  },

  // POST /v1/volumes
  async createVolume(data: CreateVolumeRequest): Promise<VolumeResponse> {
    return apiClient.post<VolumeResponse>(API_ENDPOINTS.VOLUMES.CREATE, data);
  },

  // PATCH /v1/volumes/:id
  async updateVolume(
    id: string,
    data: UpdateVolumeRequest
  ): Promise<VolumeResponse> {
    return apiClient.patch<VolumeResponse>(
      API_ENDPOINTS.VOLUMES.UPDATE(id),
      data
    );
  },

  // DELETE /v1/volumes/:id
  async deleteVolume(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.VOLUMES.DELETE(id));
  },

  // POST /v1/volumes/:id/items
  async addItemToVolume(
    volumeId: string,
    data: AddItemToVolumeRequest
  ): Promise<VolumeResponse> {
    return apiClient.post<VolumeResponse>(
      API_ENDPOINTS.VOLUMES.ADD_ITEM(volumeId),
      data
    );
  },

  // DELETE /v1/volumes/:volumeId/items/:itemId
  async removeItemFromVolume(
    volumeId: string,
    itemId: string
  ): Promise<VolumeResponse> {
    return apiClient.delete<VolumeResponse>(
      API_ENDPOINTS.VOLUMES.REMOVE_ITEM(volumeId, itemId)
    );
  },

  // POST /v1/volumes/:id/close
  async closeVolume(
    id: string,
    data?: VolumeActionRequest
  ): Promise<VolumeResponse> {
    return apiClient.post<VolumeResponse>(
      API_ENDPOINTS.VOLUMES.CLOSE(id),
      data || {}
    );
  },

  // POST /v1/volumes/:id/reopen
  async reopenVolume(
    id: string,
    data?: VolumeActionRequest
  ): Promise<VolumeResponse> {
    return apiClient.post<VolumeResponse>(
      API_ENDPOINTS.VOLUMES.REOPEN(id),
      data || {}
    );
  },

  // POST /v1/volumes/:id/deliver
  async deliverVolume(
    id: string,
    data?: VolumeActionRequest
  ): Promise<VolumeResponse> {
    return apiClient.post<VolumeResponse>(
      API_ENDPOINTS.VOLUMES.DELIVER(id),
      data || {}
    );
  },

  // POST /v1/volumes/:id/return
  async returnVolume(
    id: string,
    data?: VolumeActionRequest
  ): Promise<VolumeResponse> {
    return apiClient.post<VolumeResponse>(
      API_ENDPOINTS.VOLUMES.RETURN(id),
      data || {}
    );
  },

  // GET /v1/volumes/:id/romaneio
  async getRomaneio(id: string): Promise<VolumeRomaneio> {
    return apiClient.get<VolumeRomaneio>(API_ENDPOINTS.VOLUMES.ROMANEIO(id));
  },

  // POST /v1/volumes/scan
  async scanVolume(code: string): Promise<ScanResult> {
    return apiClient.post<ScanResult>(API_ENDPOINTS.VOLUMES.SCAN, { code });
  },
};
