'use client';

/**
 * OpenSea OS — Kiosk FaceCaptureStage.
 *
 * UI-SPEC §K2 — face capture + liveness:
 *   - greeting "Olá, {primeiroNome}" (Display 48px) once parent knows it
 *     (propagate via props)
 *   - circular 360px camera preview; 280px circular mask overlay
 *   - runs face-api pipeline at ≤10fps; feeds landmarks+bbox into the
 *     liveness machine (D-04)
 *   - 2s window; overlay "Pisque para confirmar" after 2s without blink;
 *     extends up to 4s total
 *   - on blink + tracking ≥ 1 (or the extend window expires with a
 *     valid descriptor) → emit `onSubmit(embedding, liveness)` to parent
 *
 * The parent `/kiosk/page` wires the result into POST /v1/hr/punch/clock.
 *
 * Phase 5 — Plan 05-10.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { computeFaceDescriptor } from '@/lib/face-api/compute-descriptor';
import { ensureModelsLoaded } from '@/lib/face-api/load-models';
import {
  createLivenessMachine,
  type LivenessMachine,
  type LivenessState,
} from '@/lib/face-api/liveness';

interface FaceCaptureStageProps {
  /** Optional — display "Olá, {primeiroNome}" when known (post-QR). */
  employeeName?: string | null;
  onSubmit: (embedding: number[], liveness: LivenessState) => void;
}

const PIPELINE_INTERVAL_MS = 120; // ~8fps — under the 10fps cap per K1
const LIVENESS_INITIAL_MS = 2_000;
const LIVENESS_EXTEND_MS = 4_000;

export function FaceCaptureStage({
  employeeName,
  onSubmit,
}: FaceCaptureStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const machineRef = useRef<LivenessMachine | null>(null);
  const firedRef = useRef(false);
  const lastEmbeddingRef = useRef<number[] | null>(null);

  const [phase, setPhase] = useState<'initial' | 'extend'>('initial');
  const [blinkHint, setBlinkHint] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Bootstrap: camera + models.
  useEffect(() => {
    let cancelled = false;
    machineRef.current = createLivenessMachine();
    (async () => {
      try {
        await ensureModelsLoaded();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch (e) {
        if (cancelled) return;
        setErr(
          e instanceof Error && e.message.toLowerCase().includes('permission')
            ? 'Permita o uso da câmera nas configurações deste dispositivo.'
            : 'Não foi possível iniciar a câmera ou os modelos.'
        );
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      machineRef.current = null;
    };
  }, []);

  // Phase timers: after 2s without blink → extend + show "Pisque para
  // confirmar". After 4s total → fall back with whatever we have (per D-04:
  // server never rejects on liveness alone in Phase 5).
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      const m = machineRef.current;
      if (!m) return;
      if (!m.state.blinkDetected) {
        setPhase('extend');
        setBlinkHint(true);
      }
    }, LIVENESS_INITIAL_MS);
    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    const hardTimer = setTimeout(() => {
      if (firedRef.current) return;
      const m = machineRef.current;
      const embedding = lastEmbeddingRef.current;
      if (m && embedding) {
        firedRef.current = true;
        onSubmit(embedding, { ...m.state });
      }
      // If no embedding yet, leave `firedRef` false — pipeline tick may
      // still land one on the next frame.
    }, LIVENESS_EXTEND_MS);
    return () => clearTimeout(hardTimer);
  }, [onSubmit]);

  // face-api pipeline loop.
  const tick = useCallback(async () => {
    if (firedRef.current) return;
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    try {
      const result = await computeFaceDescriptor(video);
      if (!result) {
        setMultipleFaces(false);
        return;
      }
      if ('multipleFaces' in result) {
        setMultipleFaces(true);
        return;
      }
      setMultipleFaces(false);
      lastEmbeddingRef.current = result.embedding;
      const m = machineRef.current;
      if (!m) return;
      const snap = m.update(result.landmarks, result.box);
      // Accept criteria: blink + at least 1 tracking frame. Mirrors D-04.
      if (snap.blinkDetected && snap.trackingFrames >= 1) {
        firedRef.current = true;
        onSubmit(result.embedding, snap);
      }
    } catch {
      // Transient tfjs glitches — next tick retries.
    }
  }, [onSubmit]);

  useEffect(() => {
    const id = setInterval(tick, PIPELINE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      {employeeName && (
        <h2 className="text-[48px] font-semibold leading-[1.15]">
          Olá, {employeeName}
        </h2>
      )}
      <p className="text-[20px] font-normal text-muted-foreground">
        Olhe para a câmera
      </p>

      <div
        className="relative flex items-center justify-center"
        aria-live="polite"
      >
        <div className="relative h-[360px] w-[360px] overflow-hidden rounded-full ring-4 ring-primary/40">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
          />
          {/* 280px circular mask overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-primary"
          />
        </div>
        {blinkHint && phase === 'extend' && (
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 rounded-lg bg-background/90 px-5 py-2 text-[32px] font-semibold shadow-sm">
            Pisque para confirmar
          </div>
        )}
      </div>

      {multipleFaces && (
        <p className="text-base text-warning">
          Mais de uma pessoa no enquadramento. Deixe apenas o funcionário.
        </p>
      )}
      {err && <p className="text-base text-destructive">{err}</p>}
    </div>
  );
}
