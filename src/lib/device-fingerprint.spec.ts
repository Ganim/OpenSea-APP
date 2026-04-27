// Wave 0 stub — Phase 9 / Plan 09-01. Implementation arrives in Plan 09-03. See 09-VALIDATION.md.
//
// PUNCH-FRAUD-03 — Device fingerprint util (~40 LOC, in-house, zero deps).
// Plan 09-03 implements `computeDeviceFingerprint` collecting 5 fields
// (canvasHash, userAgent, screen, timezone, language — D-14 / D-15) and
// returning { hash: sha256-hex, raw: { ... } } per the LIA documented in ADR-027.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  computeDeviceFingerprint,
  type DeviceFingerprint,
} from './device-fingerprint';

describe('computeDeviceFingerprint (Plan 09-03 implementation)', () => {
  beforeEach(() => {
    // Mock canvas context
    const mockContext = {
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      fillStyle: '',
      fillRect: vi.fn(),
      font: '',
      fillText: vi.fn(),
    };

    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: vi.fn(() => mockContext),
      writable: true,
    });

    Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
      value: vi.fn(() => 'data:image/png;base64,mockcanvas'),
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('retorna { hash, raw } com shape correto', async () => {
    const result = await computeDeviceFingerprint();
    expect(result).toHaveProperty('hash');
    expect(result).toHaveProperty('raw');
    expect(result.hash).toBeDefined();
    expect(result.raw).toBeDefined();
  });

  it('hash é sha256 hex de 64 chars', async () => {
    const result = await computeDeviceFingerprint();
    expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('raw inclui 5 campos: canvasHash, userAgent, screen, timezone, language', async () => {
    const result = await computeDeviceFingerprint();
    expect(result.raw).toHaveProperty('canvasHash');
    expect(result.raw).toHaveProperty('userAgent');
    expect(result.raw).toHaveProperty('screen');
    expect(result.raw).toHaveProperty('timezone');
    expect(result.raw).toHaveProperty('language');
  });

  it('canvas ausente (ctx=null) não throws; raw.canvasHash é hash de string vazia', async () => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: vi.fn(() => null),
      writable: true,
    });

    const result = await computeDeviceFingerprint();
    expect(result.hash).toBeDefined();
    expect(result.raw.canvasHash).toBeDefined();
    // SHA-256 de string vazia = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    expect(result.raw.canvasHash).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
  });

  it('é determinístico: mesmos inputs → mesmo hash', async () => {
    const result1 = await computeDeviceFingerprint();
    const result2 = await computeDeviceFingerprint();
    expect(result1.hash).toBe(result2.hash);
    expect(result1.raw.userAgent).toBe(result2.raw.userAgent);
  });
});
