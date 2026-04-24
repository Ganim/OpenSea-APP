/**
 * OpenSea OS — Punch Dashboard Service (Phase 7 / Plan 07-06).
 *
 * Thin client over the read endpoints shipped by Plan 07-05b:
 *   GET /v1/hr/punch/dashboard/heatmap
 *   GET /v1/hr/punch/dashboard/summary
 *   GET /v1/hr/punch/missing
 *   GET /v1/hr/punch/cell-detail
 *
 * Plus the Phase-4 listing reused for the realtime feed:
 *   GET /v1/hr/time-entries (today scope)
 *   GET /v1/hr/punch-approvals (filtered list)
 *   GET /v1/hr/punch-devices (health overview)
 *
 * No silent fallbacks (CLAUDE.md APP §2). Errors propagate to React Query.
 */

import { apiClient } from '@/lib/api-client';
import type { HeatmapStatus } from '@/components/ui/heatmap/employee-day-heatmap';

// ============================================================================
// Heatmap
// ============================================================================

export interface FetchHeatmapParams {
  /** YYYY-MM month string. Required. */
  month: string;
  /** Optional employeeIds filter (admin only). */
  employeeIds?: string[];
}

export interface HeatmapRowDTO {
  id: string;
  label: string;
  subLabel?: string;
}

export interface HeatmapColumnDTO {
  id: string;
  label: string;
  isWeekend?: boolean;
  isHoliday?: boolean;
}

export interface HeatmapCellDTO {
  rowId: string;
  colId: string;
  statuses: HeatmapStatus[];
  tooltip?: string;
  payload?: {
    employeeId?: string;
    date?: string;
    timeEntryIds?: string[];
  };
}

export interface HeatmapResponse {
  rows: HeatmapRowDTO[];
  columns: HeatmapColumnDTO[];
  cells: HeatmapCellDTO[];
}

// ============================================================================
// Summary
// ============================================================================

export interface DashboardSummaryResponse {
  pendingApprovals: number;
  approvedToday: number;
  missingToday: number;
  devicesOnline: number;
  devicesOffline: number;
}

// ============================================================================
// Missing punches (PunchMissedLog)
// ============================================================================

export interface FetchMissingParams {
  /** YYYY-MM-DD reference date. Defaults server-side to today. */
  date?: string;
  page?: number;
  pageSize?: number;
}

export interface MissingPunchItem {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string | null;
  date: string;
  shiftLabel: string | null;
  detectedAt: string;
  resolvedAt: string | null;
}

export interface MissingPunchesResponse {
  items: MissingPunchItem[];
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

// ============================================================================
// Cell detail
// ============================================================================

export interface FetchCellDetailParams {
  employeeId: string;
  date: string;
}

export interface CellDetailTimeEntry {
  id: string;
  occurredAt: string;
  type: string;
}

export interface CellDetailApproval {
  id: string;
  status: string;
  reason: string | null;
  createdAt: string;
}

export interface CellDetailRequest {
  id: string;
  type: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
}

export interface CellDetailResponse {
  timeEntries: CellDetailTimeEntry[];
  activeApproval: CellDetailApproval | null;
  activeRequests: CellDetailRequest[];
}

// ============================================================================
// Devices health
// ============================================================================

export type PunchDeviceStatus = 'ONLINE' | 'OFFLINE';

export interface PunchDeviceHealthItem {
  id: string;
  name: string;
  location: string | null;
  status: PunchDeviceStatus;
  lastSeenAt: string | null;
}

export interface DevicesHealthResponse {
  online: number;
  offline: number;
  devices: PunchDeviceHealthItem[];
}

// ============================================================================
// Today feed (TimeEntry list)
// ============================================================================

export interface TodayFeedEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  occurredAt: string;
  type: string;
  deviceLabel: string | null;
}

export interface TodayFeedResponse {
  entries: TodayFeedEntry[];
  hasMore: boolean;
}

// ============================================================================
// Punch approvals (existing Phase 4 endpoint reused)
// ============================================================================

export type PunchApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface PunchApprovalItem {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string | null;
  status: PunchApprovalStatus;
  reason: string | null;
  occurredAt: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface PunchApprovalsResponse {
  items: PunchApprovalItem[];
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

export interface FetchApprovalsParams {
  status?: PunchApprovalStatus;
  employeeId?: string;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// Helpers
// ============================================================================

function buildQuery(params?: object): string {
  if (!params) return '';
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(
    params as Record<string, unknown>
  )) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) usp.append(key, String(v));
    } else {
      usp.append(key, String(value));
    }
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

// ============================================================================
// Service
// ============================================================================

export const punchDashboardService = {
  async fetchHeatmap(params: FetchHeatmapParams): Promise<HeatmapResponse> {
    return apiClient.get<HeatmapResponse>(
      `/v1/hr/punch/dashboard/heatmap${buildQuery({ ...params })}`
    );
  },

  async fetchSummary(): Promise<DashboardSummaryResponse> {
    return apiClient.get<DashboardSummaryResponse>(
      '/v1/hr/punch/dashboard/summary'
    );
  },

  async fetchMissing(
    params: FetchMissingParams = {}
  ): Promise<MissingPunchesResponse> {
    return apiClient.get<MissingPunchesResponse>(
      `/v1/hr/punch/missing${buildQuery(params)}`
    );
  },

  async fetchCellDetail(
    params: FetchCellDetailParams
  ): Promise<CellDetailResponse> {
    return apiClient.get<CellDetailResponse>(
      `/v1/hr/punch/cell-detail${buildQuery(params)}`
    );
  },

  async fetchDevicesHealth(): Promise<DevicesHealthResponse> {
    return apiClient.get<DevicesHealthResponse>('/v1/hr/punch-devices');
  },

  async fetchTodayEntries(params: {
    offset: number;
    limit: number;
  }): Promise<TodayFeedResponse> {
    const today = new Date().toISOString().slice(0, 10);
    return apiClient.get<TodayFeedResponse>(
      `/v1/hr/time-entries${buildQuery({
        date: today,
        offset: params.offset,
        limit: params.limit,
      })}`
    );
  },

  async fetchApprovals(
    params: FetchApprovalsParams = {}
  ): Promise<PunchApprovalsResponse> {
    return apiClient.get<PunchApprovalsResponse>(
      `/v1/hr/punch-approvals${buildQuery(params)}`
    );
  },
};
