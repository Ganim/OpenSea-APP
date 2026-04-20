'use client';

/**
 * OpenSea OS — Kiosk PinFallbackStage.
 *
 * UI-SPEC §K4 — PIN fallback:
 *   - Step 1: numpad 3×4 @ 72px buttons, 20px gap, title "Digite sua matrícula"
 *   - Step 2: same numpad, PIN display as filled circles "● ● ● ● ● ●"
 *   - Cancelar returns home; Confirmar advances.
 *   - On wrong PIN: parent drives shake + attempts-remaining copy; this
 *     component just exposes `errorMessage` + a `shake` key re-render.
 *
 * After both steps → parent transitions to FaceCaptureStage (never skips
 * face — D-10 contract).
 *
 * Phase 5 — Plan 05-10.
 */

import { useCallback, useEffect, useState } from 'react';
import { Delete } from 'lucide-react';

export type PinStep = 'matricula' | 'pin';

interface PinFallbackStageProps {
  step: PinStep;
  /** Error message to display under the input (e.g. "PIN incorreto. Tentativa 2 de 5."). */
  errorMessage?: string | null;
  onCancel: () => void;
  onSubmit: (digits: string) => void;
}

const MATRICULA_MAX = 10; // ample — backend allows up to 32 but UX stays on 1 row
const PIN_LENGTH = 6;

export function PinFallbackStage({
  step,
  errorMessage,
  onCancel,
  onSubmit,
}: PinFallbackStageProps) {
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(0);

  // Reset on step change.
  useEffect(() => {
    setValue('');
  }, [step]);

  // External errorMessage toggles the shake animation.
  useEffect(() => {
    if (errorMessage) setShake(s => s + 1);
  }, [errorMessage]);

  const maxLen = step === 'pin' ? PIN_LENGTH : MATRICULA_MAX;

  const pushDigit = useCallback(
    (d: string) => {
      setValue(v => (v.length >= maxLen ? v : v + d));
    },
    [maxLen]
  );
  const backspace = useCallback(() => {
    setValue(v => v.slice(0, -1));
  }, []);

  const canSubmit =
    step === 'pin' ? value.length === PIN_LENGTH : value.length >= 1;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(value);
  };

  const title =
    step === 'matricula' ? 'Digite sua matrícula' : 'Digite seu PIN';
  const display =
    step === 'pin'
      ? Array.from({ length: PIN_LENGTH })
          .map((_, i) => (i < value.length ? '●' : '○'))
          .join(' ')
      : value.padEnd(Math.max(value.length, 4), ' ');

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-10">
      <h2 className="text-[32px] font-semibold leading-[1.25]">{title}</h2>

      <div
        key={shake}
        aria-live="polite"
        className="motion-safe:animate-[kiosk-shake_0.2s_ease-in-out_3] min-h-[64px] rounded-xl bg-muted px-8 py-4 text-[32px] font-semibold tabular-nums tracking-[0.5em]"
      >
        {display}
      </div>

      {errorMessage && (
        <p className="text-[20px] font-normal text-destructive">
          {errorMessage}
        </p>
      )}

      {/* 3×4 keypad, 72px buttons, 20px gap */}
      <div
        className="grid grid-cols-3 gap-5"
        role="group"
        aria-label="Teclado numérico"
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <KeypadButton key={d} onClick={() => pushDigit(d)}>
            {d}
          </KeypadButton>
        ))}
        <KeypadButton onClick={onCancel} variant="ghost" aria-label="Cancelar">
          Cancelar
        </KeypadButton>
        <KeypadButton onClick={() => pushDigit('0')}>0</KeypadButton>
        <KeypadButton onClick={backspace} variant="ghost" aria-label="Apagar">
          <Delete className="size-6" aria-hidden />
        </KeypadButton>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-6 py-3 text-base font-semibold hover:bg-muted/40"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground disabled:opacity-50"
        >
          Confirmar
        </button>
      </div>

      <style jsx>{`
        @keyframes kiosk-shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-8px);
          }
          75% {
            transform: translateX(8px);
          }
        }
      `}</style>
    </div>
  );
}

function KeypadButton({
  children,
  onClick,
  variant = 'default',
  ...props
}: React.ComponentProps<'button'> & {
  variant?: 'default' | 'ghost';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="button"
      className={`flex h-[72px] w-[72px] items-center justify-center rounded-xl text-[24px] font-semibold transition active:scale-95 ${
        variant === 'default'
          ? 'bg-muted text-foreground hover:bg-muted/70'
          : 'text-muted-foreground hover:bg-muted/40'
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
