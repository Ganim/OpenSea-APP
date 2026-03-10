import { financeAnalyticsService } from '@/services/finance/finance-analytics.service';
import { useQuery } from '@tanstack/react-query';

const QUERY_KEYS = {
  ANALYTICS_DASHBOARD: ['finance-analytics-dashboard'],
  ANALYTICS_CASHFLOW: ['finance-analytics-cashflow'],
  ANALYTICS_FORECAST: ['finance-analytics-forecast'],
} as const;

export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS_DASHBOARD,
    queryFn: () => financeAnalyticsService.getDashboard(),
  });
}

export function useAnalyticsCashflow(params: {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS_CASHFLOW, params],
    queryFn: () => financeAnalyticsService.getCashflow(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useAnalyticsForecast(params: {
  startDate: string;
  endDate: string;
  groupBy: 'day' | 'week' | 'month';
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS_FORECAST, params],
    queryFn: () => financeAnalyticsService.getForecast(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}
