import { apiClient } from '@/lib/api-client';

export interface CompanyDocument {
  id: string;
  tenantId: string;
  companyId: string;
  documentType: string;
  fileName: string | null;
  fileKey: string | null;
  fileSize: number | null;
  mimeType: string | null;
  expiresAt: string | null;
  notes: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ListDocumentsResponse {
  documents: CompanyDocument[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
}

export const companyDocumentsApi = {
  async list(companyId: string): Promise<CompanyDocument[]> {
    const response = await apiClient.get<ListDocumentsResponse>(
      `/v1/admin/companies/${companyId}/documents?perPage=100`
    );
    return response.documents;
  },

  async create(
    companyId: string,
    data: {
      file: File;
      documentType: string;
      expiresAt?: string;
      notes?: string;
    }
  ): Promise<CompanyDocument> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('documentType', data.documentType);
    if (data.expiresAt) formData.append('expiresAt', data.expiresAt);
    if (data.notes) formData.append('notes', data.notes);

    const response = await apiClient.post<{ document: CompanyDocument }>(
      `/v1/admin/companies/${companyId}/documents`,
      formData
    );
    return response.document;
  },

  async delete(companyId: string, documentId: string): Promise<void> {
    await apiClient.delete<void>(
      `/v1/admin/companies/${companyId}/documents/${documentId}`
    );
  },

  getFileUrl(companyId: string, documentId: string, download = false): string {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    return `${base}/v1/admin/companies/${companyId}/documents/${documentId}/file${download ? '?download=true' : ''}`;
  },
};
