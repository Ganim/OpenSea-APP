/**
 * Liveness State Machine — unit spec
 *
 * Covers the EAR blink detector + bbox-tracking FSM, with synthetic
 * landmarks crafted by `mockEye()` so we control EAR exactly without
 * actually running face-api.js.
 */

import type * as faceapi from '@vladmandic/face-api';
import { describe, expect, it } from 'vitest';
import {
  BLINK_MIN_FRAMES,
  BBOX_DELTA_PX,
  EAR_THRESHOLD,
  computeEAR,
  createLivenessMachine,
} from './liveness';

/**
 * Build 6 eye points with a controllable vertical aperture.
 *
 * Horizontal distance p0..p3 is fixed at 20 (the EAR denominator).
 * Vertical apertures (|p1-p5| and |p2-p4|) are both 2*verticalHalf.
 *
 * So EAR = (2*verticalHalf + 2*verticalHalf) / (2 * 20) = verticalHalf / 10.
 *
 * Examples:
 * - verticalHalf = 3 → EAR = 0.30 (open)
 * - verticalHalf = 1 → EAR = 0.10 (closed-ish, below 0.21 threshold)
 * - verticalHalf = 0 → EAR = 0 (fully closed)
 */
function mockEye(verticalHalf: number): Array<{ x: number; y: number }> {
  // [p0 outer, p1 top-outer, p2 top-inner, p3 inner, p4 bot-inner, p5 bot-outer]
  return [
    { x: 0, y: 10 },
    { x: 5, y: 10 - verticalHalf },
    { x: 15, y: 10 - verticalHalf },
    { x: 20, y: 10 },
    { x: 15, y: 10 + verticalHalf },
    { x: 5, y: 10 + verticalHalf },
  ];
}

function fakeLandmarks(verticalHalf: number): faceapi.FaceLandmarks68 {
  return {
    getLeftEye: () => mockEye(verticalHalf),
    getRightEye: () => mockEye(verticalHalf),
  } as unknown as faceapi.FaceLandmarks68;
}

const anchorBox = { x: 100, y: 100, width: 80, height: 80 };

describe('computeEAR', () => {
  it('returns a value > 0.3 for an open eye', () => {
    const ear = computeEAR(fakeLandmarks(3));
    expect(ear).toBeCloseTo(0.3, 2);
    expect(ear).toBeGreaterThan(EAR_THRESHOLD);
  });

  it('returns a value near zero for a fully closed eye', () => {
    const ear = computeEAR(fakeLandmarks(0));
    expect(ear).toBe(0);
    expect(ear).toBeLessThan(EAR_THRESHOLD);
  });

  it('returns a value below threshold for a closed-ish eye', () => {
    const ear = computeEAR(fakeLandmarks(1));
    // EAR = 0.10 — well below 0.21.
    expect(ear).toBeLessThan(EAR_THRESHOLD);
  });
});

describe('createLivenessMachine', () => {
  it('has a fresh baseline state', () => {
    const m = createLivenessMachine();
    expect(m.state.blinkDetected).toBe(false);
    expect(m.state.trackingFrames).toBe(0);
    expect(m.state.earMin).toBe(1);
  });

  it('detects a blink after BLINK_MIN_FRAMES consecutive closed frames', () => {
    const m = createLivenessMachine();
    // Feed BLINK_MIN_FRAMES closed frames.
    for (let i = 0; i < BLINK_MIN_FRAMES; i++) {
      m.update(fakeLandmarks(0), anchorBox);
    }
    expect(m.state.blinkDetected).toBe(true);
    expect(m.state.earMin).toBe(0);
  });

  it('does NOT flag a blink when closed frames are not consecutive', () => {
    const m = createLivenessMachine();
    m.update(fakeLandmarks(0), anchorBox); // closed
    m.update(fakeLandmarks(3), anchorBox); // open — resets counter
    m.update(fakeLandmarks(0), anchorBox); // closed, only 1 in a row
    expect(m.state.blinkDetected).toBe(false);
  });

  it('increments trackingFrames when bbox drifts ≥ BBOX_DELTA_PX', () => {
    const m = createLivenessMachine();
    // First frame anchors the bbox.
    m.update(fakeLandmarks(3), { ...anchorBox, x: 100 });
    expect(m.state.trackingFrames).toBe(0);

    // Drift by exactly BBOX_DELTA_PX on the x axis.
    m.update(fakeLandmarks(3), { ...anchorBox, x: 100 + BBOX_DELTA_PX });
    expect(m.state.trackingFrames).toBe(1);
  });

  it('does NOT increment trackingFrames when drift is below threshold', () => {
    const m = createLivenessMachine();
    m.update(fakeLandmarks(3), { ...anchorBox, x: 100 });
    // Drift by (BBOX_DELTA_PX - 1) on x.
    m.update(fakeLandmarks(3), { ...anchorBox, x: 100 + BBOX_DELTA_PX - 1 });
    expect(m.state.trackingFrames).toBe(0);
  });

  it('reset() clears blink, tracking, earMin and rearms the anchor', () => {
    const m = createLivenessMachine();
    for (let i = 0; i < BLINK_MIN_FRAMES; i++) {
      m.update(fakeLandmarks(0), anchorBox);
    }
    m.update(fakeLandmarks(3), {
      ...anchorBox,
      x: anchorBox.x + BBOX_DELTA_PX,
    });
    expect(m.state.blinkDetected).toBe(true);
    expect(m.state.trackingFrames).toBeGreaterThan(0);

    m.reset();
    expect(m.state.blinkDetected).toBe(false);
    expect(m.state.trackingFrames).toBe(0);
    expect(m.state.earMin).toBe(1);

    // After reset, the first frame should re-anchor bbox, so a second frame
    // at the same coords should NOT increment trackingFrames.
    m.update(fakeLandmarks(3), anchorBox);
    m.update(fakeLandmarks(3), anchorBox);
    expect(m.state.trackingFrames).toBe(0);
  });

  it('update() returns a snapshot (mutations do not leak back)', () => {
    const m = createLivenessMachine();
    const snap = m.update(fakeLandmarks(3), anchorBox);
    snap.blinkDetected = true;
    snap.trackingFrames = 99;
    // Internal state should not have been touched.
    expect(m.state.blinkDetected).toBe(false);
    expect(m.state.trackingFrames).toBe(0);
  });
});
