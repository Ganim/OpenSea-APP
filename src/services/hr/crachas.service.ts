/**
 * OpenSea OS - Crachás Service
 *
 * Thin client for the badge PDF endpoints (Phase 5 plan 05-06) + the crachás
 * listing (plan 05-04 — GET /v1/hr/crachas). The dedicated route-scoped
 * listing fetcher lives under src/app/(dashboard)/hr/crachas/api/crachas.api.ts
 * so route-level code can collocate queries/mutations; this service hosts the
 * cross-route mutation helpers.
 *
 * - POST /v1/hr/employees/:id/badge-pdf            → binary application/pdf
 * - POST /v1/hr/qr-tokens/bulk-pdf                 → 202 { jobId, total }
 * - GET  /v1/hr/qr-tokens/bulk-pdf/:jobId/download → binary (Redis fallback)
 */

import { apiClient } from '@/lib/api-client';
import { apiConfig } from '@/config/api';
import type {
  BulkBadgePdfInput,
  BulkBadgePdfResponse,
  ListCrachasParams,
  ListCrachasResponse,
} from '@/types/hr';

export const crachasService = {
  /**
   * GET /v1/hr/crachas — paginated admin listing.
   * Requires permission `hr.crachas.print`.
   * `rotationStatus` is derived server-side from `qrTokenSetAt` age
   * (backend plan 05-04 contract). Client MUST NOT re-derive.
   */
  async list(params: ListCrachasParams): Promise<ListCrachasResponse> {
    const query: Record<string, string> = {};
    if (params.search) query.search = params.search;
    if (params.departmentId) query.departmentId = params.departmentId;
    if (params.rotationStatus) query.rotationStatus = params.rotationStatus;
    if (params.page) query.page = String(params.page);
    if (params.pageSize) query.pageSize = String(params.pageSize);

    return apiClient.get<ListCrachasResponse>('/v1/hr/crachas', {
      params: query,
    });
  },

  /**
   * POST /v1/hr/employees/:id/badge-pdf — download an individual crachá.
   * Requires permission `hr.crachas.print`.
   *
   * The endpoint rotates the employee's QR token internally on every call
   * (plan 05-06 / D-14). Returns the generated PDF as a binary stream with
   * `Content-Disposition: attachment; filename="cracha-{registration}.pdf"`.
   *
   * This uses a raw `fetch` because `apiClient` does not expose a
   * POST-that-returns-Blob helper — the `getBlob` helper is GET-only.
   */
  async downloadBadgePdf(
    employeeId: string
  ): Promise<{ blob: Blob; filename: string }> {
    const url = new URL(
      `/v1/hr/employees/${employeeId}/badge-pdf`,
      apiConfig.baseURL
    ).toString();

    const token = apiClient.getTokenManager().getToken();
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'application/pdf',
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `HTTP ${response.status}` }));
      const message =
        (errorData as { message?: string }).message ??
        `HTTP ${response.status}`;
      throw new Error(message);
    }

    const disposition = response.headers.get('Content-Disposition') ?? '';
    let filename = 'cracha.pdf';
    const utf8Match = disposition.match(/filename\*=UTF-8''(.+)/);
    if (utf8Match) {
      filename = decodeURIComponent(utf8Match[1]);
    } else {
      const basicMatch = disposition.match(/filename="?([^";\n]+)"?/);
      if (basicMatch) filename = basicMatch[1];
    }

    const blob = await response.blob();
    return { blob, filename };
  },

  /**
   * POST /v1/hr/qr-tokens/bulk-pdf — enqueue a bulk PDF generation job.
   * Returns 202 with { jobId, total }.
   * Requires permission `hr.crachas.print` + client-side PIN gate.
   */
  async enqueueBulkBadgePdfs(
    input: BulkBadgePdfInput
  ): Promise<BulkBadgePdfResponse> {
    return apiClient.post<BulkBadgePdfResponse>(
      '/v1/hr/qr-tokens/bulk-pdf',
      input
    );
  },
};

// Named function exports (aligns with plan <artifacts> contract).
export const listCrachas = crachasService.list;
export const downloadBadgePdf = crachasService.downloadBadgePdf;
export const enqueueBulkBadgePdfs = crachasService.enqueueBulkBadgePdfs;
