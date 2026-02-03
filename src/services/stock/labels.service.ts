import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  SerializedLabel,
  SerializedLabelResponse,
  SerializedLabelsResponse,
  GenerateSerializedLabelsRequest,
  LinkLabelRequest,
  LabelsQuery,
  GenerateLabelRequest,
  GenerateLabelResponse,
} from '@/types/stock';

function buildQueryString(query?: LabelsQuery): string {
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

export const labelsService = {
  // ============================================
  // SERIALIZED LABELS
  // ============================================

  // GET /v1/serialized-labels
  async listSerializedLabels(
    query?: LabelsQuery
  ): Promise<SerializedLabelsResponse> {
    const url = `${API_ENDPOINTS.SERIALIZED_LABELS.LIST}${buildQueryString(query)}`;
    return apiClient.get<SerializedLabelsResponse>(url);
  },

  // GET /v1/serialized-labels/:code
  async getSerializedLabel(code: string): Promise<SerializedLabelResponse> {
    return apiClient.get<SerializedLabelResponse>(
      API_ENDPOINTS.SERIALIZED_LABELS.GET(code)
    );
  },

  // POST /v1/serialized-labels/generate
  async generateSerializedLabels(
    data: GenerateSerializedLabelsRequest
  ): Promise<SerializedLabelsResponse> {
    return apiClient.post<SerializedLabelsResponse>(
      API_ENDPOINTS.SERIALIZED_LABELS.GENERATE,
      data
    );
  },

  // POST /v1/serialized-labels/:code/link
  async linkSerializedLabel(
    code: string,
    data: LinkLabelRequest
  ): Promise<SerializedLabelResponse> {
    return apiClient.post<SerializedLabelResponse>(
      API_ENDPOINTS.SERIALIZED_LABELS.LINK(code),
      data
    );
  },

  // POST /v1/serialized-labels/:code/void
  async voidSerializedLabel(code: string): Promise<SerializedLabelResponse> {
    return apiClient.post<SerializedLabelResponse>(
      API_ENDPOINTS.SERIALIZED_LABELS.VOID(code),
      {}
    );
  },

  // ============================================
  // LABEL GENERATION (for printing)
  // ============================================

  // POST /v1/labels/generate
  async generateLabels(
    data: GenerateLabelRequest
  ): Promise<GenerateLabelResponse> {
    return apiClient.post<GenerateLabelResponse>(
      API_ENDPOINTS.LABELS.GENERATE,
      data
    );
  },

  // Convenience methods for common label types
  async generateItemLabels(
    itemIds: string[],
    options?: GenerateLabelRequest['options']
  ): Promise<GenerateLabelResponse> {
    return this.generateLabels({
      entityType: 'ITEM',
      entityIds: itemIds,
      labelType: 'COMBINED',
      format: 'PDF',
      options,
    });
  },

  async generateVariantLabels(
    variantIds: string[],
    options?: GenerateLabelRequest['options']
  ): Promise<GenerateLabelResponse> {
    return this.generateLabels({
      entityType: 'VARIANT',
      entityIds: variantIds,
      labelType: 'BARCODE',
      format: 'PDF',
      options,
    });
  },

  async generateLocationLabels(
    locationIds: string[],
    options?: GenerateLabelRequest['options']
  ): Promise<GenerateLabelResponse> {
    return this.generateLabels({
      entityType: 'LOCATION',
      entityIds: locationIds,
      labelType: 'QR',
      format: 'PDF',
      options,
    });
  },

  async generateVolumeLabels(
    volumeIds: string[],
    options?: GenerateLabelRequest['options']
  ): Promise<GenerateLabelResponse> {
    return this.generateLabels({
      entityType: 'VOLUME',
      entityIds: volumeIds,
      labelType: 'QR',
      format: 'PDF',
      options,
    });
  },
};
