/**
 * OpenSea OS - List Audit Logs Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { auditLogService } from '@/services/audit/audit-log.service';
import type { AuditLog, AuditLogFilters, AuditLogsResponse } from '../types';
import { auditLogKeys } from './keys';

export type ListAuditLogsParams = AuditLogFilters;

export type ListAuditLogsOptions = Omit<
  UseQueryOptions<AuditLogsResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListAuditLogs(
  params?: ListAuditLogsParams,
  options?: ListAuditLogsOptions
) {
  return useQuery({
    queryKey: auditLogKeys.list(params),

    queryFn: async (): Promise<AuditLogsResponse> => {
      const response = await auditLogService.listAuditLogs(params);
      return response;
    },

    staleTime: 30 * 1000, // 30 seconds for audit logs
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListAuditLogs;
