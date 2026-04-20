/**
 * OpenSea OS - Liveness State Machine
 *
 * Client-side liveness heuristic for the kiosk selfie capture (D-04):
 *
 * 1. **Blink detection** via Eye Aspect Ratio (EAR).
 *    - EAR below {@link EAR_THRESHOLD} for {@link BLINK_MIN_FRAMES}
 *      consecutive frames marks a blink.
 *
 * 2. **Micro-movement tracking** via bounding-box delta.
 *    - First observed bbox is anchored; subsequent frames whose bbox drifts
 *      by at least {@link BBOX_DELTA_PX} increment `trackingFrames`.
 *
 * The kiosk UI accepts liveness once `blinkDetected` AND `trackingFrames >= 1`
 * (or the machine's `durationMs` exceeds the extend window and we fall back).
 *
 * This file is a pure state machine — it does NOT read from a video element,
 * it does NOT render. Plan 05-10 (kiosk) feeds it landmarks+box per frame.
 *
 * Thresholds are calibrated to face-api.js landmark precision on a 640×480
 * feed at ~10fps; adjust with physical kiosk testing (RESEARCH §Pattern 5).
 */

import type * as faceapi from '@vladmandic/face-api';

export const EAR_THRESHOLD = 0.21;
export const BLINK_MIN_FRAMES = 2;
export const BBOX_DELTA_PX = 5;

type Point = { x: number; y: number };

/**
 * Compute EAR for one eye given the face-api 6-point landmark array.
 *
 * Eye point indices (face-api.js convention):
 *   p0 = outer corner, p1 = top-outer, p2 = top-inner,
 *   p3 = inner corner, p4 = bottom-inner, p5 = bottom-outer.
 *
 * EAR = (|p1-p5| + |p2-p4|) / (2 * |p0-p3|)
 * Open eye ≈ 0.3+. Closed eye → 0.
 */
function earFromEye(pts: readonly Point[]): number {
  const d = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
  return (d(pts[1], pts[5]) + d(pts[2], pts[4])) / (2 * d(pts[0], pts[3]));
}

/**
 * Compute the averaged EAR across both eyes. Averaging makes the signal
 * symmetric in case one eye is partially occluded.
 */
export function computeEAR(landmarks: faceapi.FaceLandmarks68): number {
  const left = landmarks.getLeftEye();
  const right = landmarks.getRightEye();
  return (earFromEye(left) + earFromEye(right)) / 2;
}

export interface LivenessState {
  /** True once EAR has dipped below threshold for ≥ BLINK_MIN_FRAMES frames. */
  blinkDetected: boolean;
  /** Number of frames where bbox drifted by ≥ BBOX_DELTA_PX from the anchor. */
  trackingFrames: number;
  /** Minimum EAR observed so far (for debug / antifraude logging). */
  earMin: number;
  /** Elapsed ms since machine was created or reset. */
  durationMs: number;
  /** Creation / last-reset epoch (ms). */
  startedAt: number;
}

export interface LivenessMachine {
  /** Feed one new frame. Returns a snapshot of the post-update state. */
  update(
    landmarks: faceapi.FaceLandmarks68,
    box: { x: number; y: number; width: number; height: number }
  ): LivenessState;
  /** Read-only view of current state (same object used internally). */
  readonly state: LivenessState;
  /** Reset every counter; clears the bbox anchor; resets startedAt. */
  reset(): void;
}

/**
 * Create a new liveness machine. Call once per capture session; feed
 * `update()` with landmarks + box per frame; read `state.blinkDetected` and
 * `state.trackingFrames` to decide acceptance.
 *
 * Deterministic and free of side effects (no timers, no I/O).
 */
export function createLivenessMachine(): LivenessMachine {
  const state: LivenessState = {
    blinkDetected: false,
    trackingFrames: 0,
    earMin: 1,
    durationMs: 0,
    startedAt: Date.now(),
  };
  let consecutiveBelow = 0;
  let firstBox: { x: number; y: number } | null = null;

  const machine: LivenessMachine = {
    state,
    reset() {
      state.blinkDetected = false;
      state.trackingFrames = 0;
      state.earMin = 1;
      state.durationMs = 0;
      state.startedAt = Date.now();
      consecutiveBelow = 0;
      firstBox = null;
    },
    update(landmarks, box) {
      const ear = computeEAR(landmarks);
      state.earMin = Math.min(state.earMin, ear);
      state.durationMs = Date.now() - state.startedAt;

      // Blink FSM: dip below threshold for ≥ N consecutive frames.
      if (ear < EAR_THRESHOLD) {
        consecutiveBelow++;
        if (consecutiveBelow >= BLINK_MIN_FRAMES) {
          state.blinkDetected = true;
        }
      } else {
        consecutiveBelow = 0;
      }

      // Bounding-box tracking: accumulate frames whose top-left corner
      // drifted ≥ BBOX_DELTA_PX from the anchor.
      if (!firstBox) {
        firstBox = { x: box.x, y: box.y };
      } else {
        const dx = Math.abs(box.x - firstBox.x);
        const dy = Math.abs(box.y - firstBox.y);
        if (dx >= BBOX_DELTA_PX || dy >= BBOX_DELTA_PX) {
          state.trackingFrames++;
        }
      }
      // Return a snapshot (caller should not mutate).
      return { ...state };
    },
  };

  return machine;
}
