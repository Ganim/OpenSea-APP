/**
 * Phase 9 — Punch audit forensics.
 * Types for the GET /v1/hr/punch/audit endpoint and related drill-down views.
 */

export interface AuditSignal {
  type: string;
  severity: 'low' | 'medium' | 'high';
  label: string;
  value: string | number;
}

export interface AuditRow {
  id: string;
  type: 'TimeEntry' | 'PunchApproval';
  employeeId: string;
  employeeName: string;
  matricula: string;
  timestamp: string; // ISO
  entryType: string;
  origin: string;
  signals: AuditSignal[];
  score: number; // 0-100
}

export interface ListAuditFilters {
  faceMatch?: {
    includeLow?: boolean;
    includeFail3x?: boolean;
    minScore?: number;
  };
  gps?: {
    outOfGeofence?: boolean;
    gpsInconsistent?: boolean;
    accuracyAbove100?: boolean;
    velocityAnomaly?: boolean;
    suspectMock?: boolean;
  };
  drift?: {
    minDriftSec?: number;
  };
  fingerprint?: {
    minUniqueCount?: number;
    periodDays?: number;
  };
  dateRange?: {
    from?: string; // ISO
    to?: string; // ISO
  };
  matchMode?: 'or' | 'and';
}

export interface ListAuditResponse {
  items: AuditRow[];
  meta: {
    total: number;
    nextCursor?: string;
  };
}

export interface AuditDetailResponse {
  row: AuditRow;
  prevTimeEntry?: {
    timestamp: string;
    entryType: string;
  };
  gpsCoords?: {
    latitude: number;
    longitude: number;
  };
  ipGeo?: {
    country: string;
    city?: string;
    isp?: string;
  };
  fingerprint?: {
    hash: string;
    raw: Record<string, unknown>;
  };
  livenessRaw?: {
    score: number;
    feedback?: string;
  };
  allSignals: AuditSignal[];
}

export interface DriftRankingItem {
  deviceId: string;
  deviceName: string;
  avgDriftSec: number;
  count: number;
}
