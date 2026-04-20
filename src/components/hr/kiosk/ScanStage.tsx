'use client';

/**
 * OpenSea OS — Kiosk ScanStage (IDLE + active scanning).
 *
 * UI-SPEC §K1 — idle state:
 *   - Live camera preview active continuously, scanning for QR at ≤10fps
 *     via the native BarcodeDetector (jsQR fallback on Safari / iOS / FF).
 *   - 480×480 primary card with a pulsing 2px accent ring (respects
 *     `prefers-reduced-motion` → static ring).
 *   - Clock top-center; tenant logo / device name top-left; footer link
 *     "Esqueceu o crachá? Use seu PIN" that triggers onPinFallback().
 *
 * Phase 5 — Plan 05-10.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ScanLine } from 'lucide-react';

import { detectQr } from '@/lib/barcode/detect-qr';

interface ScanStageProps {
  deviceName?: string | null;
  onQrDetected: (token: string) => void;
  onPinFallback: () => void;
}

/** Tick interval in ms for the QR detection loop. ≤10fps per UI-SPEC K1. */
const SCAN_INTERVAL_MS = 100;

export function ScanStage({
  deviceName,
  onQrDetected,
  onPinFallback,
}: ScanStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tickingRef = useRef(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Start / stop the camera on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
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
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        setCameraError(
          msg.toLowerCase().includes('permission')
            ? 'Permita o uso da câmera nas configurações deste dispositivo.'
            : 'Não foi possível acessar a câmera.'
        );
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, []);

  // Live clock.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // QR detection loop — grabs a frame every SCAN_INTERVAL_MS, routes
  // through detectQr (BarcodeDetector → jsQR fallback). Self-reentrant
  // guard prevents overlapping decodes when the fallback path is slow.
  const tick = useCallback(async () => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      if (video.readyState < 2) return; // HAVE_CURRENT_DATA
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);
      const token = await detectQr(canvas);
      if (token) onQrDetected(token);
    } finally {
      tickingRef.current = false;
    }
  }, [onQrDetected]);

  useEffect(() => {
    const id = setInterval(tick, SCAN_INTERVAL_MS);
    return () => clearInterval(id);
  }, [tick]);

  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between py-12">
      {/* Top bar */}
      <header className="flex w-full items-start justify-between px-12">
        <div className="text-sm font-medium text-muted-foreground">
          {deviceName ?? 'Kiosk'}
        </div>
        <div
          className="text-5xl font-semibold tabular-nums tracking-tight"
          aria-live="off"
        >
          {timeStr}
        </div>
        <div aria-hidden className="w-[180px]" />
      </header>

      {/* Primary card — 480×480 with pulsing ring */}
      <div className="relative flex h-[480px] w-[480px] flex-col items-center justify-center">
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-primary motion-safe:animate-pulse motion-reduce:animate-none"
          aria-hidden
        />
        <video
          ref={videoRef}
          className="h-full w-full rounded-3xl object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" aria-hidden />

        {/* Overlay headline */}
        <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-3 rounded-b-3xl bg-background/80 px-6 py-3 backdrop-blur-sm">
          <ScanLine className="size-6 text-primary" aria-hidden />
          <span className="text-[20px] font-semibold">
            Aponte seu crachá para a câmera
          </span>
        </div>
      </div>

      {cameraError && (
        <p className="px-6 text-center text-destructive">{cameraError}</p>
      )}

      {/* Footer — PIN fallback link */}
      <footer className="flex w-full justify-center">
        <button
          type="button"
          onClick={onPinFallback}
          className="rounded-md px-4 py-2 text-base font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Esqueceu o crachá? Use seu PIN
        </button>
      </footer>
    </div>
  );
}
