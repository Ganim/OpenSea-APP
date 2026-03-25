import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type { ContentGenerationRequest, GeneratedContent } from '@/types/ai';

export const aiContentService = {
  async generateContent(
    data: ContentGenerationRequest
  ): Promise<GeneratedContent> {
    return apiClient.post<GeneratedContent>(
      API_ENDPOINTS.AI.CONTENT.GENERATE,
      data
    );
  },
};
