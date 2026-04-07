import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export interface EmailToEntryConfig {
  id: string;
  tenantId: string;
  emailAccountId: string;
  monitoredFolder: string;
  isActive: boolean;
  autoCreate: boolean;
  defaultType: string;
  defaultCategoryId: string | null;
  processedCount: number;
  lastProcessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertEmailToEntryConfigData {
  emailAccountId: string;
  monitoredFolder: string;
  isActive: boolean;
  autoCreate: boolean;
  defaultType: 'PAYABLE' | 'RECEIVABLE';
  defaultCategoryId?: string | null;
}

export interface ProcessEmailToEntryResult {
  processed: number;
  created: number;
  failed: number;
  skipped: number;
  entries: Array<{
    messageId: string;
    subject: string;
    status: 'created' | 'draft' | 'skipped' | 'failed';
    error?: string;
    entryId?: string;
  }>;
}

// ============================================================================
// SERVICE
// ============================================================================

export const emailToEntryService = {
  async getConfig(): Promise<{ config: EmailToEntryConfig | null }> {
    return apiClient.get<{ config: EmailToEntryConfig | null }>(
      API_ENDPOINTS.EMAIL_TO_ENTRY.CONFIG
    );
  },

  async upsertConfig(
    data: UpsertEmailToEntryConfigData
  ): Promise<{ config: EmailToEntryConfig }> {
    return apiClient.post<{ config: EmailToEntryConfig }>(
      API_ENDPOINTS.EMAIL_TO_ENTRY.CONFIG,
      data
    );
  },

  async processEmails(): Promise<ProcessEmailToEntryResult> {
    return apiClient.post<ProcessEmailToEntryResult>(
      API_ENDPOINTS.EMAIL_TO_ENTRY.PROCESS,
      {}
    );
  },
};
