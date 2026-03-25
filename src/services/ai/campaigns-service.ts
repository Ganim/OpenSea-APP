import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type { CampaignSuggestion } from '@/types/ai';

export interface CampaignSuggestionsResponse {
  suggestions: CampaignSuggestion[];
}

export interface ApplyCampaignResponse {
  success: boolean;
  results: Record<string, unknown>[];
}

export const aiCampaignsService = {
  async generateSuggestions(): Promise<CampaignSuggestionsResponse> {
    return apiClient.post<CampaignSuggestionsResponse>(
      API_ENDPOINTS.AI.CAMPAIGNS.GENERATE
    );
  },

  async applyCampaign(insightId: string): Promise<ApplyCampaignResponse> {
    return apiClient.post<ApplyCampaignResponse>(
      API_ENDPOINTS.AI.CAMPAIGNS.APPLY(insightId)
    );
  },
};
