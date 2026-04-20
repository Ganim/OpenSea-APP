'use client';

/**
 * OpenSea OS - Unlock Punch PIN Button
 *
 * AlertDialog → VerifyActionPinModal → POST /unlock-punch-pin (D-11 override).
 * Only rendered when the caller deems the employee's PIN locked. Also
 * expects the caller to gate on `hr.punch-devices.admin` — this component
 * re-asserts the admin-override copy.
 *
 * Follows UI-SPEC §Destructive confirmations row "Desbloquear PIN antes dos
 * 15min" — AlertDialog + VerifyActionPinModal (override of security control).
 */

import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useUnlockPunchPin } from '@/hooks/hr/use-punch-pin';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export interface UnlockPinButtonProps {
  employeeId: string;
  employeeName: string;
  /** Optional ISO-8601 for the locked-until timestamp to show in the banner. */
  lockedUntil?: string;
}

export function UnlockPinButton({
  employeeId,
  employeeName,
  lockedUntil,
}: UnlockPinButtonProps) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const mutation = useUnlockPunchPin(employeeId);

  const handleConfirmAlert = () => {
    setAlertOpen(false);
    setPinModalOpen(true);
  };

  const handlePinSuccess = async () => {
    await mutation.mutateAsync();
  };

  return (
    <>
      {lockedUntil && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm dark:border-orange-500/30 dark:bg-orange-500/10"
        >
          <ShieldAlert
            className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400"
            aria-hidden="true"
          />
          <p className="text-orange-900 dark:text-orange-200">
            PIN bloqueado até{' '}
            {new Date(lockedUntil).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            . Desbloqueio automático em alguns minutos.
          </p>
        </div>
      )}

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            disabled={mutation.isPending}
            data-testid="unlock-pin-button"
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Desbloquear PIN
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desbloquear PIN de ponto</AlertDialogTitle>
            <AlertDialogDescription>
              Isto permitirá que {employeeName} bata ponto com PIN
              imediatamente. Confirme sua identidade para continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAlert}>
              Desbloquear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VerifyActionPinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        title="Confirmar desbloqueio de PIN"
        description={`Digite seu PIN de ação para desbloquear o PIN de ponto de ${employeeName}.`}
      />
    </>
  );
}
