/**
 * OpenSea OS - Face Descriptor Extractor
 *
 * Runs the full face-api.js pipeline (TinyFaceDetector → Landmark68 →
 * Descriptor) on a live video / canvas / image source and returns the
 * 128-d embedding plus landmarks and bounding box.
 *
 * Three return values are modeled explicitly (NOT errors):
 * - DescriptorResult — exactly one face detected with a valid descriptor.
 * - null             — zero faces detected.
 * - { multipleFaces: true } — more than one face in frame (enrollment
 *   rejects this; punch flow shows a warning).
 *
 * Phase 05 — D-01 (client-side extraction), D-05 (enrollment pipeline).
 */

import * as faceapi from '@vladmandic/face-api';
import { ensureModelsLoaded } from './load-models';

export interface DescriptorResult {
  /** 128 floats. JSON-safe `number[]` — not `Float32Array`. */
  embedding: number[];
  /** 68 facial landmarks (used by the liveness machine). */
  landmarks: faceapi.FaceLandmarks68;
  /** Bounding box in source pixel coordinates (used by bbox tracking). */
  box: { x: number; y: number; width: number; height: number };
}

export type MultipleFacesResult = { multipleFaces: true };

export type ComputeDescriptorReturn =
  | DescriptorResult
  | null
  | MultipleFacesResult;

/**
 * TinyFaceDetector options tuned for webcam capture (640×480).
 * - inputSize 320 — good latency/accuracy trade-off on mid-range laptops.
 * - scoreThreshold 0.5 — default; higher values reject partial faces.
 */
const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.5,
});

/**
 * Extract a face descriptor from a live source.
 *
 * Always calls `ensureModelsLoaded()` first — cheap on warm cache. The caller
 * is expected to prewarm once (on modal/kiosk mount) to avoid paying the
 * model-download cost inside the capture loop.
 */
export async function computeFaceDescriptor(
  source: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
): Promise<ComputeDescriptorReturn> {
  await ensureModelsLoaded();

  // First pass: count faces. This is cheap because we skip landmarks on the
  // all-faces path — but face-api's API requires withFaceLandmarks() before
  // withFaceDescriptor(), so we do a lightweight detectAllFaces(no landmarks)
  // to distinguish 0 / 1 / N.
  const detections = await faceapi.detectAllFaces(source, DETECTOR_OPTIONS);
  if (detections.length === 0) return null;
  if (detections.length > 1) return { multipleFaces: true };

  // Second pass on the single face: landmarks + descriptor.
  const result = await faceapi
    .detectSingleFace(source, DETECTOR_OPTIONS)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) return null;

  return {
    embedding: Array.from(result.descriptor),
    landmarks: result.landmarks,
    box: {
      x: result.detection.box.x,
      y: result.detection.box.y,
      width: result.detection.box.width,
      height: result.detection.box.height,
    },
  };
}
