/**
 * OpenSea OS - HR Crachás Types
 *
 * Types for the /hr/crachas admin page (Phase 5 plan 05-09).
 * Mirror the backend contracts delivered by:
 *
 * - GET  /v1/hr/crachas                                → plan 05-04 (findAllForCrachas)
 * - POST /v1/hr/employees/:id/qr-token/rotate          → plan 05-04
 * - POST /v1/hr/qr-tokens/rotate-bulk                  → plan 05-04 (BullMQ enqueue)
 * - POST /v1/hr/qr-tokens/rotate-bulk/:jobId/cancel    → plan 05-04
 * - POST /v1/hr/employees/:id/badge-pdf                → plan 05-06 (binary)
 * - POST /v1/hr/qr-tokens/bulk-pdf                     → plan 05-06 (BullMQ enqueue)
 * - GET  /v1/hr/qr-tokens/bulk-pdf/:jobId/download     → plan 05-06 (Redis-fallback)
 *
 * Socket.IO `tenant:{tenantId}:hr` room emits:
 *
 * - punch.qr_rotation.progress  = { jobId, processed, total, percent }
 */

/* -------------------------------------------------------------------------- */
/* Badge listing (crachás)                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Rotation status derived server-side from `qrTokenSetAt`:
 *
 *  - `active`  — rotated more than 7 days ago (normal operating state)
 *  - `recent`  — rotated within the last 7 days
 *  - `never`   — QR token has never been emitted for this employee
 *
 * Backend plan 05-04 computes this in the controller (never re-derive in the
 * client).
 */
export type CrachaRotationStatus = 'active' | 'recent' | 'never';

export interface BadgeListRow {
  /** Employee id (tenant-scoped). */
  employeeId: string;
  fullName: string;
  /** Matrícula. `null` only for seeded fixtures. */
  registration: string | null;
  /** Profile picture URL (S3). Falls back to initials tile in the UI. */
  photoUrl: string | null;
  departmentName: string | null;
  /** ISO-8601 timestamp of the last QR rotation, or null when never rotated. */
  lastQrRotatedAt: string | null;
  rotationStatus: CrachaRotationStatus;
}

export interface ListCrachasParams {
  search?: string;
  departmentId?: string;
  rotationStatus?: CrachaRotationStatus;
  page?: number;
  pageSize?: number;
}

export interface ListCrachasResponse {
  items: BadgeListRow[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

/* -------------------------------------------------------------------------- */
/* QR rotation                                                                */
/* -------------------------------------------------------------------------- */

export interface RotateQrTokenResponse {
  /** Plaintext 32-byte hex token — returned ONCE so the admin can download
   * the refreshed PDF immediately. Backend discards it after response. */
  token: string;
  /** ISO-8601 timestamp matching the new Employee.qrTokenSetAt. */
  rotatedAt: string;
}

export type RotateBulkScope = 'ALL' | 'DEPARTMENT' | 'CUSTOM';

export interface RotateBulkInput {
  scope: RotateBulkScope;
  employeeIds?: string[];
  departmentIds?: string[];
  /** When true, the worker enqueues a BADGE_PDF sub-job after rotation. */
  generatePdfs: boolean;
}

export interface RotateBulkResponse {
  /** BullMQ job id (sha256 prefix). `null` when the scope resolves to zero
   * employees — the client shows a friendly "nothing to do" toast. */
  jobId: string | null;
  total: number;
  generatePdfs: boolean;
}

export interface CancelBulkRotationResponse {
  cancelled: true;
}

/* -------------------------------------------------------------------------- */
/* Badge PDF                                                                  */
/* -------------------------------------------------------------------------- */

export interface BulkBadgePdfInput {
  scope: RotateBulkScope;
  employeeIds?: string[];
  departmentIds?: string[];
}

export interface BulkBadgePdfResponse {
  jobId: string | null;
  total: number;
}

/* -------------------------------------------------------------------------- */
/* Socket.IO live progress                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Emitted by the backend `qr-batch-worker` on every chunk (every ~100
 * employees) to the `tenant:{tenantId}:hr` room.
 */
export interface QrRotationProgress {
  jobId: string;
  processed: number;
  total: number;
  /** Integer 0..100. */
  percent: number;
}
