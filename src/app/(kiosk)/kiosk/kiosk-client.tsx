'use client';

/**
 * OpenSea OS — /kiosk client-only state machine.
 *
 * Owns the IDLE → SCAN/FACE → [server] → RESULT → IDLE flow (D-17 3s
 * auto-reset). Branches into the PIN fallback (K4) on the home footer
 * link. Every terminal state flows through FaceCaptureStage — PIN NEVER
 * skips face (D-10 contract).
 *
 * Viewport guard: UI-SPEC Device-target Matrix requires ≥1366×768. Below
 * 1280px wide we render a setup-required screen asking to use a larger
 * display.
 *
 * Isolated from page.tsx so face-api / tfjs (which break SSR prerender
 * because tfjs-backend pulls in TextEncoder at module eval time) never
 * loads on the server — the server entry in page.tsx uses `next/dynamic`
 * with `ssr: false`.
 *
 * Phase 5 — Plan 05-10.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, WifiOff } from 'lucide-react';

import { ScanStage } from '@/components/hr/kiosk/ScanStage';
import { FaceCaptureStage } from '@/components/hr/kiosk/FaceCaptureStage';
import {
  ResultStage,
  type ResultStatus,
} from '@/components/hr/kiosk/ResultStage';
import { PinFallbackStage } from '@/components/hr/kiosk/PinFallbackStage';
import { useKioskDevice } from '@/hooks/hr/use-kiosk-device';
import { useKioskPunch } from '@/hooks/hr/use-kiosk-punch';
import type { LivenessState } from '@/lib/face-api/liveness';
import { ApiError } from '@/lib/api-client.types';

type Stage =
  | 'IDLE'
  | 'FACE' // face capture after QR
  | 'PIN_1' // matrícula entry
  | 'PIN_2' // PIN entry
  | 'PIN_FACE' // face capture after PIN
  | 'SYNCING' // POST in flight
  | 'RESULT';

interface Identity {
  qrToken?: string;
  matricula?: string;
  pin?: string;
  employeeName?: string;
}

interface ResultPayload {
  status: ResultStatus;
  message?: string;
  entryTypeLabel?: string;
  timeLabel?: string;
  firstName?: string;
  errorCode?: string;
}

const MIN_VIEWPORT_WIDTH = 1280;

export function KioskClient() {
  const router = useRouter();
  const { hydrated, isPaired, deviceName } = useKioskDevice();
  const { submit, pendingCount } = useKioskPunch();

  const [stage, setStage] = useState<Stage>('IDLE');
  const [identity, setIdentity] = useState<Identity>({});
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [viewportOk, setViewportOk] = useState(true);
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Viewport guard.
  useEffect(() => {
    const check = () => setViewportOk(window.innerWidth >= MIN_VIEWPORT_WIDTH);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Online state (drives the offline banner).
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Redirect unpaired kiosks to /kiosk/setup.
  useEffect(() => {
    if (!hydrated) return;
    if (!isPaired) router.replace('/kiosk/setup');
  }, [hydrated, isPaired, router]);

  const reset = useCallback(() => {
    setIdentity({});
    setResult(null);
    setPinError(null);
    setStage('IDLE');
  }, []);

  const handleQrDetected = useCallback(
    (token: string) => {
      if (stage !== 'IDLE') return;
      setIdentity({ qrToken: token });
      setStage('FACE');
    },
    [stage]
  );

  const handleFaceReady = useCallback(
    async (embedding: number[], liveness: LivenessState) => {
      setStage('SYNCING');
      try {
        const outcome = await submit({
          qrToken: identity.qrToken,
          pin: identity.pin,
          matricula: identity.matricula,
          faceEmbedding: embedding,
          liveness,
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        });

        if (outcome.kind === 'offline') {
          setResult({ status: 'OFFLINE' });
          setStage('RESULT');
          return;
        }

        const res = outcome.response;
        const timeEntry = res.timeEntry ?? {
          id: res.id ?? '',
          entryType: res.entryType,
          occurredAt: res.occurredAt,
        };
        const entryTypeLabel = (() => {
          switch (timeEntry.entryType) {
            case 'CLOCK_IN':
              return 'Entrada';
            case 'CLOCK_OUT':
              return 'Saída';
            case 'BREAK_START':
              return 'Início de pausa';
            case 'BREAK_END':
              return 'Fim de pausa';
            default:
              return 'Registro';
          }
        })();
        const occurred = timeEntry.occurredAt
          ? new Date(timeEntry.occurredAt)
          : new Date();
        const timeLabel = occurred.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setResult({
          status: res.approval ? 'APPROVAL_REQUIRED' : 'ACCEPT',
          entryTypeLabel,
          timeLabel,
          firstName: identity.employeeName?.split(' ')[0],
        });
        setStage('RESULT');
      } catch (err) {
        const code = err instanceof ApiError ? err.code : undefined;
        const message =
          err instanceof Error
            ? err.message
            : 'Não foi possível registrar o ponto.';
        setResult({ status: 'REJECT', message, errorCode: code });
        setStage('RESULT');
      }
    },
    [identity, submit]
  );

  const handlePinFallback = () => {
    setIdentity({});
    setPinError(null);
    setStage('PIN_1');
  };
  const handleMatriculaEntered = (matricula: string) => {
    setIdentity(i => ({ ...i, matricula }));
    setPinError(null);
    setStage('PIN_2');
  };
  const handlePinEntered = (pin: string) => {
    setIdentity(i => ({ ...i, pin }));
    setPinError(null);
    setStage('PIN_FACE');
  };

  // Pre-hydration splash (prevents flash on paired→route).
  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!viewportOk) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-8 text-center">
        <div>
          <h1 className="text-[32px] font-semibold">
            Kiosk requer resolução mínima de 1366×768
          </h1>
          <p className="mt-4 text-[20px] text-muted-foreground">
            Use um monitor maior ou gire a tela para paisagem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh">
      {/* Offline banner (UI-SPEC §K8) */}
      {(!online || pendingCount > 0) && (
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center gap-2 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-900">
          <WifiOff className="size-4" aria-hidden />
          {online
            ? `${pendingCount} batida(s) aguardando sincronização.`
            : 'Sem conexão. Batidas serão enviadas ao reconectar.'}
        </div>
      )}

      {stage === 'IDLE' && (
        <ScanStage
          deviceName={deviceName}
          onQrDetected={handleQrDetected}
          onPinFallback={handlePinFallback}
        />
      )}

      {stage === 'FACE' && (
        <FaceCaptureStage
          employeeName={identity.employeeName}
          onSubmit={handleFaceReady}
        />
      )}

      {stage === 'PIN_1' && (
        <PinFallbackStage
          step="matricula"
          errorMessage={pinError}
          onCancel={reset}
          onSubmit={handleMatriculaEntered}
        />
      )}
      {stage === 'PIN_2' && (
        <PinFallbackStage
          step="pin"
          errorMessage={pinError}
          onCancel={reset}
          onSubmit={handlePinEntered}
        />
      )}
      {stage === 'PIN_FACE' && (
        <FaceCaptureStage
          employeeName={identity.employeeName}
          onSubmit={handleFaceReady}
        />
      )}

      {stage === 'SYNCING' && (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-[20px] font-medium text-muted-foreground">
            Registrando ponto…
          </p>
        </div>
      )}

      {stage === 'RESULT' && result && (
        <ResultStage {...result} onReset={reset} />
      )}
    </div>
  );
}
