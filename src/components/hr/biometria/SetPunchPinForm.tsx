'use client';

/**
 * OpenSea OS - Set Punch PIN Form
 *
 * Inline card on the Biometria tab that lets an admin set / change the
 * employee's punch PIN (D-08). Enforces the same client-side checks that
 * the backend WEAK_PINS_BLOCKLIST enforces (11 entries), plus length
 * (exactly 6) and digits-only. Sensitive — PIN-gate via VerifyActionPinModal
 * per CLAUDE.md §7 ("ALL destructive actions use VerifyActionPinModal").
 *
 * This component does not read the current PIN (hash-only on the backend);
 * it always treats the operation as "definir" or "alterar" based on whether
 * the employee has one set (controlled by the parent via `hasExistingPin`).
 */

import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { useSetPunchPin } from '@/hooks/hr/use-punch-pin';
import { cn } from '@/lib/utils';
import { Check, Loader2, Lock, X } from 'lucide-react';
import { useMemo, useState } from 'react';

/**
 * Client-side blocklist — mirrors the 11 entries enforced by the backend
 * Plan 05-05 WEAK_PINS_BLOCKLIST. Kept as a Set for O(1) lookup.
 */
const WEAK_PINS = new Set([
  '000000',
  '111111',
  '222222',
  '333333',
  '444444',
  '555555',
  '666666',
  '777777',
  '888888',
  '999999',
  '123456',
]);

interface PinValidation {
  length: boolean;
  digits: boolean;
  notWeak: boolean;
  matches: boolean;
}

function validatePin(pin: string, confirm: string): PinValidation {
  const length = pin.length === 6;
  const digits = /^\d*$/.test(pin);
  const notWeak = pin.length === 6 && !WEAK_PINS.has(pin);
  const matches = pin.length === 6 && pin === confirm;
  return { length, digits, notWeak, matches };
}

export interface SetPunchPinFormProps {
  employeeId: string;
  employeeName: string;
  hasExistingPin?: boolean;
}

export function SetPunchPinForm({
  employeeId,
  employeeName,
  hasExistingPin = false,
}: SetPunchPinFormProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [verifyOpen, setVerifyOpen] = useState(false);

  const mutation = useSetPunchPin(employeeId);
  const validation = useMemo(
    () => validatePin(pin, confirmPin),
    [pin, confirmPin]
  );
  const isReady =
    validation.length &&
    validation.digits &&
    validation.notWeak &&
    validation.matches;

  const handleOpenConfirm = () => {
    if (!isReady) return;
    setVerifyOpen(true);
  };

  const handleConfirmed = async () => {
    try {
      await mutation.mutateAsync({ pin });
      setPin('');
      setConfirmPin('');
    } catch {
      // Inline + toast handled by hook.
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            {hasExistingPin
              ? 'Altere o PIN de 6 dígitos usado pelo funcionário no kiosk.'
              : 'Defina um PIN de 6 dígitos para uso do funcionário no kiosk.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="punch-pin">PIN de 6 dígitos</Label>
            <InputOTP
              id="punch-pin"
              maxLength={6}
              value={pin}
              onChange={setPin}
              inputMode="numeric"
              pattern="^[0-9]*$"
              data-testid="punch-pin-input"
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-2">
            <Label htmlFor="punch-pin-confirm">Confirme o PIN</Label>
            <InputOTP
              id="punch-pin-confirm"
              maxLength={6}
              value={confirmPin}
              onChange={setConfirmPin}
              inputMode="numeric"
              pattern="^[0-9]*$"
              data-testid="punch-pin-confirm-input"
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-1.5">
          <Rule ok={validation.length}>
            O PIN precisa ter exatamente 6 dígitos.
          </Rule>
          <Rule ok={validation.digits}>O PIN pode conter apenas números.</Rule>
          <Rule ok={validation.notWeak}>
            PIN não pode ser uma sequência óbvia (ex: 123456, 111111).
          </Rule>
          <Rule ok={validation.matches}>
            Confirme o PIN digitando novamente.
          </Rule>
        </div>

        {/* Backend error (WeakPinError etc.) */}
        {mutation.isError && mutation.error?.message && (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleOpenConfirm}
            disabled={!isReady || mutation.isPending}
            data-testid="punch-pin-submit"
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {hasExistingPin ? 'Alterar PIN' : 'Definir PIN'}
          </Button>
        </div>
      </div>

      <VerifyActionPinModal
        isOpen={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onSuccess={handleConfirmed}
        title="Confirmar alteração de PIN"
        description={`Digite seu PIN de ação para definir o PIN de ponto de ${employeeName}.`}
      />
    </>
  );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs transition-colors',
        ok ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
      )}
    >
      {ok ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span>{children}</span>
    </div>
  );
}
