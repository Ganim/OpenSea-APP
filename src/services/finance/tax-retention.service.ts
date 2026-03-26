import { apiClient } from '@/lib/api-client';
import type {
  ApplyRetentionsResponse,
  CalculateRetentionsResponse,
  ListRetentionsResponse,
  RetentionConfig,
} from '@/types/finance';

class TaxRetentionService {
  async calculate(
    entryId: string,
    config: RetentionConfig,
  ): Promise<CalculateRetentionsResponse> {
    return apiClient.post<CalculateRetentionsResponse>(
      `/v1/finance/entries/${entryId}/retentions/calculate`,
      config,
    );
  }

  async apply(
    entryId: string,
    config: RetentionConfig,
  ): Promise<ApplyRetentionsResponse> {
    return apiClient.post<ApplyRetentionsResponse>(
      `/v1/finance/entries/${entryId}/retentions/apply`,
      config,
    );
  }

  async list(entryId: string): Promise<ListRetentionsResponse> {
    return apiClient.get<ListRetentionsResponse>(
      `/v1/finance/entries/${entryId}/retentions`,
    );
  }
}

export const taxRetentionService = new TaxRetentionService();
