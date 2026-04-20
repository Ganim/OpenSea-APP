/**
 * Behavior tests for `useQrRotationProgress`.
 *
 * Uses a fake Socket.IO-shaped object mocked via `vi.mock('@/hooks/use-socket')`.
 * Asserts:
 *   1. Initial state is { progress: null, jobDone: false }.
 *   2. Incremental `punch.qr_rotation.progress` events update state, but only
 *      when the event's jobId matches the watched one (events for a different
 *      job are ignored — RoomLeak-01 / two-concurrent-jobs defense).
 *   3. Reaching 100% flips `jobDone=true`.
 *   4. A `punch.qr_rotation.completed` event also flips `jobDone=true` and
 *      backfills progress to 100% in case the final progress ping was lost.
 */

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// ---- Fake socket shared across the tests ----------------------------------
type Handler = (data: unknown) => void;
const handlers = new Map<string, Set<Handler>>();

const fakeSocket = {
  on: vi.fn((event: string, handler: Handler) => {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler);
  }),
  off: vi.fn((event: string, handler: Handler) => {
    handlers.get(event)?.delete(handler);
  }),
  connected: true,
};

function emit(event: string, data: unknown) {
  handlers.get(event)?.forEach(h => h(data));
}

vi.mock('@/hooks/use-socket', () => ({
  useSocket: () => ({
    socket: fakeSocket,
    isConnected: true,
    on: (_event: string, _handler: Handler) => () => {},
  }),
}));

// Import AFTER the mock so the hook picks up the fake.
import { useQrRotationProgress } from '../use-qr-rotation-progress';

describe('useQrRotationProgress', () => {
  beforeEach(() => {
    handlers.clear();
    fakeSocket.on.mockClear();
    fakeSocket.off.mockClear();
  });

  it('starts with progress=null and jobDone=false', () => {
    const { result } = renderHook(() => useQrRotationProgress('job-123'));
    expect(result.current.progress).toBeNull();
    expect(result.current.jobDone).toBe(false);
  });

  it('updates progress as `punch.qr_rotation.progress` events arrive for the watched jobId', () => {
    const { result } = renderHook(() => useQrRotationProgress('job-123'));

    act(() => {
      emit('punch.qr_rotation.progress', {
        jobId: 'job-123',
        processed: 3,
        total: 10,
        percent: 30,
      });
    });

    expect(result.current.progress).toEqual({
      jobId: 'job-123',
      processed: 3,
      total: 10,
      percent: 30,
    });
    expect(result.current.jobDone).toBe(false);

    act(() => {
      emit('punch.qr_rotation.progress', {
        jobId: 'job-123',
        processed: 10,
        total: 10,
        percent: 100,
      });
    });

    expect(result.current.progress).toEqual({
      jobId: 'job-123',
      processed: 10,
      total: 10,
      percent: 100,
    });
    expect(result.current.jobDone).toBe(true);
  });

  it('ignores events targeted at a DIFFERENT jobId', () => {
    const { result } = renderHook(() => useQrRotationProgress('job-123'));

    act(() => {
      emit('punch.qr_rotation.progress', {
        jobId: 'job-OTHER',
        processed: 7,
        total: 10,
        percent: 70,
      });
    });

    expect(result.current.progress).toBeNull();
    expect(result.current.jobDone).toBe(false);
  });

  it('flips jobDone=true on `punch.qr_rotation.completed` even without a final progress ping, and backfills progress to 100%', () => {
    const { result } = renderHook(() => useQrRotationProgress('job-123'));

    // Only two progress pings — the worker happens to publish COMPLETED
    // before the final progress tick (race condition under heavy load).
    act(() => {
      emit('punch.qr_rotation.progress', {
        jobId: 'job-123',
        processed: 5,
        total: 10,
        percent: 50,
      });
    });

    act(() => {
      emit('punch.qr_rotation.completed', {
        jobId: 'job-123',
        processed: 10,
        total: 10,
        generatedPdfs: true,
        bulkPdfDownloadUrl: 'https://example.com/pdf',
      });
    });

    expect(result.current.jobDone).toBe(true);
    expect(result.current.progress?.percent).toBe(100);
    expect(result.current.progress?.processed).toBe(10);
    expect(result.current.progress?.total).toBe(10);
  });

  it('ignores completed events targeted at a DIFFERENT jobId', () => {
    const { result } = renderHook(() => useQrRotationProgress('job-123'));

    act(() => {
      emit('punch.qr_rotation.completed', {
        jobId: 'job-OTHER',
        processed: 10,
        total: 10,
      });
    });

    expect(result.current.jobDone).toBe(false);
    expect(result.current.progress).toBeNull();
  });

  it('does not subscribe when jobId is null', () => {
    renderHook(() => useQrRotationProgress(null));
    expect(fakeSocket.on).not.toHaveBeenCalled();
  });

  it('unsubscribes when the component unmounts', () => {
    const { unmount } = renderHook(() => useQrRotationProgress('job-123'));
    expect(fakeSocket.on).toHaveBeenCalled();
    unmount();
    expect(fakeSocket.off).toHaveBeenCalled();
  });
});
