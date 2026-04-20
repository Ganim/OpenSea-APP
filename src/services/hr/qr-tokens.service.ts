/**
 * OpenSea OS - QR Tokens Service
 *
 * Thin client for the Employee.qrToken* endpoints (Phase 5 plan 05-04).
 *
 * - POST /v1/hr/employees/:id/qr-token/rotate        → 200 { token, rotatedAt }
 * - POST /v1/hr/qr-tokens/rotate-bulk                → 202 { jobId, total, generatePdfs }
 * - POST /v1/hr/qr-tokens/rotate-bulk/:jobId/cancel  → 200 { cancelled: true }
 *
 * Individual rotation is synchronous (returns the plaintext token inline once,
 * so the admin can refresh the crachá PDF in the same flow). Bulk rotation
 * always enqueues a BullMQ job on `qr-batch-operations` and exposes live
 * progress via Socket.IO on the `tenant:{id}:hr` room (event
 * `punch.qr_rotation.progress`).
 */

import { apiClient } from '@/lib/api-client';
import type {
  CancelBulkRotationResponse,
  RotateBulkInput,
  RotateBulkResponse,
  RotateQrTokenResponse,
} from '@/types/hr';

export const qrTokensService = {
  /**
   * POST /v1/hr/employees/:id/qr-token/rotate
   * Requires permission `hr.punch-devices.admin`.
   * Returns the new plaintext token once — backend discards it after response.
   */
  async rotate(employeeId: string): Promise<RotateQrTokenResponse> {
    return apiClient.post<RotateQrTokenResponse>(
      `/v1/hr/employees/${employeeId}/qr-token/rotate`,
      {}
    );
  },

  /**
   * POST /v1/hr/qr-tokens/rotate-bulk
   * Requires permission `hr.punch-devices.admin`.
   * 202 → { jobId, total, generatePdfs }. When scope resolves to zero
   * employees, `jobId` is `null` (nothing to do — no ghost job).
   */
  async rotateBulk(input: RotateBulkInput): Promise<RotateBulkResponse> {
    return apiClient.post<RotateBulkResponse>(
      '/v1/hr/qr-tokens/rotate-bulk',
      input
    );
  },

  /**
   * POST /v1/hr/qr-tokens/rotate-bulk/:jobId/cancel
   * Requires permission `hr.punch-devices.admin`.
   * Cooperative cancellation — in-flight chunks complete; subsequent chunks
   * do not start.
   */
  async cancelBulk(jobId: string): Promise<CancelBulkRotationResponse> {
    return apiClient.post<CancelBulkRotationResponse>(
      `/v1/hr/qr-tokens/rotate-bulk/${jobId}/cancel`,
      {}
    );
  },
};

export const rotateQrToken = qrTokensService.rotate;
export const rotateQrTokensBulk = qrTokensService.rotateBulk;
export const cancelQrRotationBulk = qrTokensService.cancelBulk;
