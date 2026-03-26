import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  FiscalConfigDTO,
  FiscalCertificateDTO,
  FiscalDocumentDTO,
  FiscalDocumentDetailDTO,
  FiscalDocumentsQuery,
  UpdateFiscalConfigData,
  EmitNfeData,
  EmitNfceData,
  CancelDocumentData,
  CorrectionLetterData,
} from '@/types/fiscal';
import type { PaginationMeta } from '@/types/pagination';

export interface FiscalConfigResponse {
  config: FiscalConfigDTO;
}

export interface FiscalCertificateResponse {
  certificate: FiscalCertificateDTO;
}

export interface FiscalDocumentsResponse {
  documents: FiscalDocumentDTO[];
  meta: PaginationMeta;
}

export interface FiscalDocumentResponse {
  document: FiscalDocumentDetailDTO;
}

export const fiscalService = {
  // ============================================================================
  // CONFIG
  // ============================================================================

  async getConfig(): Promise<FiscalConfigResponse> {
    return apiClient.get<FiscalConfigResponse>(API_ENDPOINTS.FISCAL.CONFIG);
  },

  async updateConfig(
    data: UpdateFiscalConfigData
  ): Promise<FiscalConfigResponse> {
    return apiClient.put<FiscalConfigResponse>(
      API_ENDPOINTS.FISCAL.CONFIG,
      data
    );
  },

  // ============================================================================
  // CERTIFICATES
  // ============================================================================

  async uploadCertificate(
    file: File,
    password: string
  ): Promise<FiscalCertificateResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    return apiClient.post<FiscalCertificateResponse>(
      API_ENDPOINTS.FISCAL.CERTIFICATES,
      formData
    );
  },

  // ============================================================================
  // DOCUMENTS
  // ============================================================================

  async listDocuments(
    params?: FiscalDocumentsQuery
  ): Promise<FiscalDocumentsResponse> {
    const query = new URLSearchParams({
      page: String(params?.page ?? 1),
      limit: String(params?.perPage ?? 20),
    });

    if (params?.search) query.append('search', params.search);
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

    return apiClient.get<FiscalDocumentsResponse>(
      `${API_ENDPOINTS.FISCAL.DOCUMENTS.LIST}?${query.toString()}`
    );
  },

  async getDocument(id: string): Promise<FiscalDocumentResponse> {
    return apiClient.get<FiscalDocumentResponse>(
      API_ENDPOINTS.FISCAL.DOCUMENTS.GET(id)
    );
  },

  // ============================================================================
  // EMIT
  // ============================================================================

  async emitNfe(data: EmitNfeData): Promise<FiscalDocumentResponse> {
    return apiClient.post<FiscalDocumentResponse>(
      API_ENDPOINTS.FISCAL.EMIT_NFE,
      data
    );
  },

  async emitNfce(data: EmitNfceData): Promise<FiscalDocumentResponse> {
    return apiClient.post<FiscalDocumentResponse>(
      API_ENDPOINTS.FISCAL.EMIT_NFCE,
      data
    );
  },

  // ============================================================================
  // ACTIONS
  // ============================================================================

  async cancelDocument(
    id: string,
    data: CancelDocumentData
  ): Promise<FiscalDocumentResponse> {
    return apiClient.post<FiscalDocumentResponse>(
      API_ENDPOINTS.FISCAL.DOCUMENTS.CANCEL(id),
      data
    );
  },

  async correctionLetter(
    id: string,
    data: CorrectionLetterData
  ): Promise<FiscalDocumentResponse> {
    return apiClient.post<FiscalDocumentResponse>(
      API_ENDPOINTS.FISCAL.DOCUMENTS.CORRECTION(id),
      data
    );
  },
};
