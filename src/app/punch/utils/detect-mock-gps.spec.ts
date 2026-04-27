// Wave 0 stub → Plan 09-03 implementation.
// D-04 — Mock GPS detection client-side via 2 fixes + 3 heuristics.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectMockGps } from './detect-mock-gps';

describe('detectMockGps (Plan 09-03 implementation)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('coords idênticas em 2 fixes → retorna true', async () => {
    let callCount = 0;
    const mockGetCurrentPosition = vi.fn((success: PositionCallback) => {
      const fix = {
        coords: {
          latitude: 23.5505,
          longitude: -46.6333,
          accuracy: 15.5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as unknown as GeolocationPosition;
      callCount++;
      success(fix);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
      configurable: true,
    });

    const result = await detectMockGps();
    expect(result).toBe(true);
    expect(callCount).toBe(2);
  });

  it('accuracy=0 em uma das fixes → retorna true', async () => {
    let callCount = 0;
    const mockGetCurrentPosition = vi.fn((success: PositionCallback) => {
      const fix = {
        coords: {
          latitude: 23.5505,
          longitude: -46.6333,
          accuracy: callCount === 0 ? 0 : 15.5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as unknown as GeolocationPosition;
      callCount++;
      success(fix);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
      configurable: true,
    });

    const result = await detectMockGps();
    expect(result).toBe(true);
  });

  it('accuracy idêntica exata em 2 fixes → retorna true', async () => {
    let callCount = 0;
    const mockGetCurrentPosition = vi.fn((success: PositionCallback) => {
      const fix = {
        coords: {
          latitude: callCount === 0 ? 23.5505 : 23.5506,
          longitude: callCount === 0 ? -46.6333 : -46.6334,
          accuracy: 15.5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as unknown as GeolocationPosition;
      callCount++;
      success(fix);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
      configurable: true,
    });

    const result = await detectMockGps();
    expect(result).toBe(true);
  });

  it('coords variando + accuracy variando → retorna false', async () => {
    let callCount = 0;
    const mockGetCurrentPosition = vi.fn((success: PositionCallback) => {
      const fix = {
        coords: {
          latitude: callCount === 0 ? 23.5505 : 23.5506,
          longitude: callCount === 0 ? -46.6333 : -46.6334,
          accuracy: callCount === 0 ? 15.5 : 16.2,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as unknown as GeolocationPosition;
      callCount++;
      success(fix);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
      configurable: true,
    });

    const result = await detectMockGps();
    expect(result).toBe(false);
  });

  it('erro/timeout → retorna false (graceful fallback)', async () => {
    const mockGetCurrentPosition = vi.fn(
      (success: PositionCallback, error?: PositionErrorCallback) => {
        error?.(new Error('Timeout') as unknown as GeolocationPositionError);
      }
    );

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
      configurable: true,
    });

    const result = await detectMockGps();
    expect(result).toBe(false);
  });
});
