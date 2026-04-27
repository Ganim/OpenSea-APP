import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast } from 'sonner';
import { showRateLimitToast } from '@/components/punch/PunchRateLimitToast';
import {
  showPunchErrorToast,
  type PunchErrorResponse,
} from './punch-error-toasts';

// Mock Sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// Mock showRateLimitToast
vi.mock('@/components/punch/PunchRateLimitToast', () => ({
  showRateLimitToast: vi.fn(),
}));

describe('punch.api error toasts (Phase 9 D-07)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('400 GPS_ACCURACY_LOW → toast.error com "GPS impreciso" + duration 6000', () => {
    const error: PunchErrorResponse = {
      status: 400,
      code: 'GPS_ACCURACY_LOW',
      accuracy: 45.2,
    };

    showPunchErrorToast(error);

    expect(toast.error).toHaveBeenCalledWith(
      'GPS impreciso. Tente novamente',
      expect.objectContaining({
        duration: 6000,
      })
    );
  });

  it('400 CLOCK_DRIFT → toast.error com "Ajuste o relógio do dispositivo" + duration 8000', () => {
    const error: PunchErrorResponse = {
      status: 400,
      code: 'CLOCK_DRIFT',
      driftSec: 120,
    };

    showPunchErrorToast(error);

    expect(toast.error).toHaveBeenCalledWith(
      'Ajuste o relógio do dispositivo. Diferença: 2 min',
      expect.objectContaining({
        duration: 8000,
      })
    );
  });

  it('429 RATE_LIMIT_EXCEEDED → showRateLimitToast chamado com retryAfterSec', () => {
    const error: PunchErrorResponse = {
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfterSec: 60,
    };

    showPunchErrorToast(error);

    expect(showRateLimitToast).toHaveBeenCalledWith(60);
  });

  it('500 erro genérico → nenhum dos 3 toasts especiais disparado', () => {
    const error: PunchErrorResponse = {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
    };

    showPunchErrorToast(error);

    expect(showRateLimitToast).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      'Something went wrong',
      expect.objectContaining({
        duration: 5000,
      })
    );
  });
});
