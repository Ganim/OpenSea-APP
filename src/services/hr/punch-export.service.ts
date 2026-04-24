/**
 * OpenSea OS — Punch Export Service (Phase 7 / Plan 07-06).
 *
 * Wraps two Phase 7 mutation endpoints:
 *   POST /v1/hr/punch/exports                    (Plan 07-04 — CSV/PDF/AFD/AFDT)
 *   POST /v1/hr/punch-approvals/:id/evidence     (Plan 07-03 — multipart PDF)
 *
 * The export endpoint can answer SYNC (small range, returns downloadUrl) or
 * ASYNC (large range, returns jobId). Evidence upload is always SYNC and
 * requires an action-PIN token in the `x-action-pin-token` header per the
 * sensitive-ops rule (CLAUDE.md APP §7).
 */

import { apiClient } from '@/lib/api-client';

// ============================================================================
// Export
// ============================================================================

export type PunchExportFormat = 'CSV' | 'PDF' | 'AFD' | 'AFDT';

export type PunchExportScope = 'TENANT' | 'DEPARTMENT' | 'EMPLOYEE';

export interface PunchExportInput {
  format: PunchExportFormat;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  scope?: PunchExportScope;
  scopeIds?: string[]; // departmentIds OR employeeIds depending on scope
}

export interface PunchExportSyncResponse {
  mode: 'sync';
  response: {
    downloadUrl: string;
    filename: string;
    expiresAt: string;
  };
}

export interface PunchExportAsyncResponse {
  mode: 'async';
  jobId: string;
  message?: string;
}

export type PunchExportResponse =
  | PunchExportSyncResponse
  | PunchExportAsyncResponse;

// ============================================================================
// Evidence
// ============================================================================

export interface UploadEvidenceResponse {
  storageKey: string;
  size: number;
  filename: string;
}

// ============================================================================
// Service
// ============================================================================

export const punchExportService = {
  async dispatchExport(input: PunchExportInput): Promise<PunchExportResponse> {
    return apiClient.post<PunchExportResponse>('/v1/hr/punch/exports', input);
  },

  /**
   * Multipart PDF upload — sensitive op, requires `x-action-pin-token`.
   * Returns { storageKey } the caller should attach to the approval body.
   */
  async uploadEvidence(
    approvalId: string,
    file: File,
    actionPinToken: string
  ): Promise<UploadEvidenceResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<UploadEvidenceResponse>(
      `/v1/hr/punch-approvals/${approvalId}/evidence`,
      formData,
      {
        headers: {
          'x-action-pin-token': actionPinToken,
        },
      }
    );
  },

  /**
   * POST /v1/hr/punch-approvals/batch-resolve — multi-approval action.
   * Per Plan 07-03: requires `x-action-pin-token` when ids.length > 5.
   */
  async batchResolve(input: {
    ids: string[];
    decision: 'APPROVE' | 'REJECT';
    reason: string;
    requestId?: string | null;
    evidenceKeys?: string[];
    actionPinToken?: string;
  }): Promise<{
    approved: string[];
    rejected: string[];
    failed: Array<{ id: string; reason: string }>;
  }> {
    const headers: Record<string, string> = {};
    if (input.actionPinToken) {
      headers['x-action-pin-token'] = input.actionPinToken;
    }
    return apiClient.post(
      '/v1/hr/punch-approvals/batch-resolve',
      {
        ids: input.ids,
        decision: input.decision,
        reason: input.reason,
        requestId: input.requestId ?? null,
        evidenceKeys: input.evidenceKeys ?? [],
      },
      { headers }
    );
  },
};
