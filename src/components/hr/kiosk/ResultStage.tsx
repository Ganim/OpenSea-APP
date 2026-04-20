'use client';

/**
 * OpenSea OS — Kiosk ResultStage.
 *
 * UI-SPEC §K3 — result screen:
 *   - ACCEPT  → green CheckCircle2 + "Ponto registrado"
 *   - APPROVAL_REQUIRED → amber Clock + "Ponto registrado (aguardando aprovação)"
 *   - REJECT → destructive XCircle + error-specific heading
 *   - 3s circular countdown around the icon; tap anywhere dismisses early;
 *     on expiry → onReset() (parent returns to IDLE).
 *   - `prefers-reduced-motion`: countdown shown as text "3… 2… 1…".
 *
 * Phase 5 — Plan 05-10.
 */

import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, CloudOff, XCircle } from 'lucide-react';

export type ResultStatus =
  | 'ACCEPT'
  | 'APPROVAL_REQUIRED'
  | 'REJECT'
  | 'OFFLINE';

export interface ResultStageProps {
  status: ResultStatus;
  /** Optional — server-supplied message, used for REJECT fallback. */
  message?: string;
  /** Entry type label (e.g. "Entrada", "Saída"). */
  entryTypeLabel?: string;
  /** Time of day, pre-formatted (HH:MM). */
  timeLabel?: string;
  /** First name for the ACCEPT greeting. */
  firstName?: string;
  /** ApiError.code from POST /v1/hr/punch/clock — drives REJECT copy. */
  errorCode?: string;
  onReset: () => void;
}

const COUNTDOWN_MS = 3_000;

function rejectHeading(code: string | undefined, fallback: string): string {
  switch (code) {
    case 'INVALID_QR_TOKEN':
      return 'Crachá não reconhecido. Tente novamente ou use seu PIN.';
    case 'PIN_INVALID':
      return 'PIN incorreto.';
    case 'PIN_LOCKED':
      return 'PIN bloqueado. Procure o RH ou tente novamente em instantes.';
    case 'FACE_ENROLLMENT_REQUIRED':
      return 'Cadastre sua biometria com o RH antes de bater ponto.';
    default:
      return (
        fallback ||
        'Não foi possível registrar o ponto. Tente novamente em instantes.'
      );
  }
}

export function ResultStage({
  status,
  message,
  entryTypeLabel,
  timeLabel,
  firstName,
  errorCode,
  onReset,
}: ResultStageProps) {
  const [remaining, setRemaining] = useState(3);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, COUNTDOWN_MS - elapsed);
      setRemaining(Math.ceil(left / 1000));
    }, 200);
    const done = setTimeout(onReset, COUNTDOWN_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [onReset]);

  const greetingSuffix = firstName ? `Obrigado, ${firstName}.` : '';

  let Icon = CheckCircle2;
  let iconClass = 'text-green-600';
  let heading = '';
  let body = '';

  if (status === 'ACCEPT') {
    Icon = CheckCircle2;
    iconClass = 'text-green-600';
    heading = 'Ponto registrado';
    body = `${entryTypeLabel ?? 'Registro'}${
      timeLabel ? ` às ${timeLabel}` : ''
    }. ${greetingSuffix}`.trim();
  } else if (status === 'APPROVAL_REQUIRED') {
    Icon = Clock;
    iconClass = 'text-amber-500';
    heading = 'Ponto registrado (aguardando aprovação)';
    body = 'Seu gestor será notificado para confirmar.';
  } else if (status === 'OFFLINE') {
    Icon = CloudOff;
    iconClass = 'text-amber-500';
    heading = 'Ponto registrado (offline)';
    body = 'Será sincronizado ao reconectar.';
  } else {
    Icon = XCircle;
    iconClass = 'text-destructive';
    heading = rejectHeading(errorCode, message ?? '');
    body = '';
  }

  return (
    <button
      type="button"
      onClick={onReset}
      aria-label="Toque para bater de novo"
      className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 px-6 text-center focus-visible:outline-none"
      aria-live="assertive"
    >
      <Icon className={`size-24 ${iconClass}`} aria-hidden />
      <h2 className="text-[32px] font-semibold leading-[1.25]">{heading}</h2>
      {body && (
        <p className="max-w-xl text-[20px] font-normal text-muted-foreground">
          {body}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        Volta ao início em {remaining}s · Toque para bater de novo
      </p>
    </button>
  );
}
