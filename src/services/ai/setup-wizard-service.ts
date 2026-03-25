import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

export interface SetupWizardRequest {
  businessDescription: string;
  industry: string;
  employeeCount: number;
  locationCount: number;
}

export interface SetupWizardResultItem {
  module: string;
  entity: string;
  name: string;
  success: boolean;
  error?: string;
}

export interface SetupWizardResponse {
  results: SetupWizardResultItem[];
  summary: {
    total: number;
    success: number;
    failed: number;
  };
}

export const aiSetupWizardService = {
  async run(data: SetupWizardRequest): Promise<SetupWizardResponse> {
    return apiClient.post<SetupWizardResponse>(
      API_ENDPOINTS.AI.SETUP_WIZARD.RUN,
      data
    );
  },
};
