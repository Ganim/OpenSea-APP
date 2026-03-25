import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type { DocumentAnalysisResult } from '@/types/ai';

export const aiDocumentsService = {
  async analyzeDocument(data: {
    content: string;
    documentType?: string;
  }): Promise<DocumentAnalysisResult> {
    return apiClient.post<DocumentAnalysisResult>(
      API_ENDPOINTS.AI.DOCUMENTS.ANALYZE,
      data
    );
  },
};
