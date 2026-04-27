/**
 * Punch Error Toast Mapping (Phase 9 Plan 09-03)
 *
 * Maps backend error codes to user-facing toasts.
 * New Phase 9 codes:
 * - CLOCK_DRIFT (400) → "Ajuste o relógio do dispositivo. Diferença: {N} min"
 * - RATE_LIMIT_EXCEEDED (429) → countdown toast via showRateLimitToast
 * - GPS_ACCURACY_LOW (400) → "GPS impreciso. Tente novamente"
 *
 * Consumed by `executeClock` endpoint handlers in punch.api.ts
 */

import { toast } from 'sonner';
import { showRateLimitToast } from '@/components/punch/PunchRateLimitToast';

export interface PunchErrorResponse {
  status: number;
  code: string;
  message?: string;
  driftSec?: number;
  retryAfterSec?: number;
  accuracy?: number;
}

/**
 * Display error toast based on punch API error response.
 * Handles Phase 9 antifraude codes + generic fallback.
 */
export function showPunchErrorToast(error: PunchErrorResponse): void {
  switch (error.code) {
    case 'GPS_ACCURACY_LOW':
      toast.error('GPS impreciso. Tente novamente', {
        duration: 6000,
        description: `Precisão: ${error.accuracy?.toFixed(1) || 'desconhecida'} metros`,
      });
      break;

    case 'CLOCK_DRIFT':
      const driftMin = error.driftSec ? Math.round(error.driftSec / 60) : 0;
      toast.error(
        `Ajuste o relógio do dispositivo. Diferença: ${driftMin} min`,
        {
          duration: 8000,
        }
      );
      break;

    case 'RATE_LIMIT_EXCEEDED':
      // Countdown toast via specialized component
      showRateLimitToast(error.retryAfterSec || 60);
      break;

    default:
      // Generic error fallback
      toast.error(error.message || 'Erro ao registrar ponto', {
        duration: 5000,
      });
  }
}
