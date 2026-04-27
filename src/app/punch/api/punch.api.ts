import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { showRateLimitToast } from '@/components/punch/PunchRateLimitToast';
import type {
  TimeEntry,
  PunchConfiguration,
  GeofenceValidationResult,
} from '@/types/hr';
import type { PunchType } from '@/lib/pwa/punch-db';

export interface PunchRequest {
  employeeId: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  notes?: string;
}

/**
 * Metadata for Phase 9 antifraude hardening.
 * Includes device fingerprint (hash + raw) and mock GPS suspicion flag.
 */
export interface PunchMetadata {
  fingerprintHash?: string;
  fingerprintRaw?: Record<string, unknown>;
  suspectMock?: boolean;
}

/**
 * Body for the unified Phase 4-04 endpoint POST /v1/hr/punch/clock when
 * called from the PWA (JWT auth). `requestId` is required for idempotency
 * (server-wins) so retries from the offline queue don't double-record.
 */
export interface ExecuteClockRequest extends PunchRequest {
  entryType: PunchType;
  requestId: string;
  /** ISO timestamp captured at the moment the user tapped the CTA. */
  timestamp?: string;
  /** Phase 9 D-13/D-14/D-15: device fingerprint + mock GPS metadata. */
  metadata?: PunchMetadata;
}

interface ExecuteClockResponseRaw {
  timeEntry: TimeEntry;
}

export const punchApi = {
  /**
   * POST /v1/hr/punch/clock — Phase 4-04 unified endpoint with idempotency
   * via `requestId` (Plan 8-01 truth #3). Replaces the legacy
   * /v1/hr/time-control/clock-(in|out) calls in both the online path and
   * the offline-queue replay path of `useOfflinePunch`.
   *
   * Phase 9 D-13/D-14/D-15: Enhanced with device fingerprint + mock GPS metadata.
   * Phase 9 D-07: Handles 3 new error codes (GPS_ACCURACY_LOW, CLOCK_DRIFT, RATE_LIMIT_EXCEEDED)
   * with specific toasts.
   */
  async executeClock(data: ExecuteClockRequest): Promise<TimeEntry> {
    try {
      const response = await apiClient.post<ExecuteClockResponseRaw>(
        '/v1/hr/punch/clock',
        {
          employeeId: data.employeeId,
          entryType: data.entryType,
          timestamp: data.timestamp,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          notes: data.notes,
          requestId: data.requestId,
          metadata: data.metadata,
        }
      );
      return response.timeEntry;
    } catch (err) {
      // Type-safe error extraction
      const apiError = err as {
        status?: number;
        code?: string;
        message?: string;
        retryAfterSec?: number;
        accuracy?: number;
        driftSec?: number;
      };

      // Phase 9 D-07: dispatch toasts for new error codes
      switch (apiError.code) {
        case 'GPS_ACCURACY_LOW':
          toast.error('GPS impreciso', {
            description: `Mova-se para uma área aberta e tente novamente. Precisão atual: ${apiError.accuracy ?? '?'}m`,
            duration: 6000,
          });
          break;
        case 'CLOCK_DRIFT': {
          const driftMin = Math.ceil((apiError.driftSec ?? 0) / 60);
          toast.error('Relógio do dispositivo desalinhado', {
            description: `Ajuste o relógio do dispositivo. Diferença atual: ${driftMin.toFixed(0)} minutos`,
            duration: 8000,
          });
          break;
        }
        case 'RATE_LIMIT_EXCEEDED':
          showRateLimitToast(apiError.retryAfterSec ?? 90);
          break;
        default:
          // Generic error handling falls through to caller's catch
          break;
      }

      // Re-throw so caller's catch block still fires
      throw err;
    }
  },

  async getConfig(): Promise<PunchConfiguration> {
    return apiClient.get<PunchConfiguration>('/v1/hr/punch-config');
  },

  async validateGeofence(
    lat: number,
    lng: number
  ): Promise<GeofenceValidationResult> {
    return apiClient.post<GeofenceValidationResult>(
      '/v1/hr/geofence-zones/validate',
      { latitude: lat, longitude: lng }
    );
  },
};
