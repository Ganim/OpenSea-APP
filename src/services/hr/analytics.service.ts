import { apiClient } from '@/lib/api-client';
import type { HRAnalyticsData } from '@/app/(dashboard)/(modules)/hr/_shared/hooks/use-hr-analytics';

export const hrAnalyticsService = {
  async getAnalytics(): Promise<HRAnalyticsData> {
    return apiClient.get<HRAnalyticsData>('/v1/hr/analytics');
  },
};
