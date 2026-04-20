/**
 * OpenSea OS - face-api.js Model Loader
 *
 * Loads the three models needed for the OpenSea kiosk + enrollment flows:
 * - TinyFaceDetector (fast localization, input size 320)
 * - FaceLandmark68Net (68 landmarks used for liveness/blink)
 * - FaceRecognitionNet (128-d descriptor used for match)
 *
 * Idempotent: concurrent callers share the same in-flight Promise. Models
 * are cached in-process for the lifetime of the page/service-worker session.
 *
 * Phase 05 — D-01, D-04.
 */

import * as faceapi from '@vladmandic/face-api';

let loadPromise: Promise<void> | null = null;

/**
 * Ensures the three face-api models are loaded from the given base URL.
 * Returns the same Promise across concurrent callers (no redundant fetches).
 *
 * @param baseUrl default `/models/v1`. Bump to `/v2` when upgrading weights.
 */
export function ensureModelsLoaded(baseUrl = '/models/v1'): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(baseUrl),
    faceapi.nets.faceLandmark68Net.loadFromUri(baseUrl),
    faceapi.nets.faceRecognitionNet.loadFromUri(baseUrl),
  ])
    .then(() => undefined)
    .catch(error => {
      // Reset so subsequent callers can retry after transient failures.
      loadPromise = null;
      throw error;
    });
  return loadPromise;
}

/**
 * Test-only helper. Resets the in-memory load cache so each test can
 * exercise the loader independently.
 */
export function __resetModelsLoadedForTests(): void {
  loadPromise = null;
}
