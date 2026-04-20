'use client';

/**
 * OpenSea OS — Kiosk Setup Wizard (/kiosk/setup).
 *
 * UI-SPEC §/kiosk/setup — 3-step pairing flow:
 *   1. Seleção — admin picks a KIOSK_PUBLIC PunchDevice from the list.
 *   2. Código — admin enters a 6-digit TOTP pairing code.
 *   3. Pronto — "Kiosk pareado"; final CTA jumps to /kiosk.
 *
 * Pre-flight gate: if no admin is logged in (or no tenant is selected), we
 * redirect to /fast-login with `redirect=/kiosk/setup` so the user comes
 * back to the wizard after auth. The kiosk runtime itself doesn't need a
 * user session — only setup does.
 *
 * When a kiosk is already paired on this device, an AlertDialog lets the
 * admin "Desvincular este kiosk" (local wipe only; server revocation is
 * a separate Phase 7 flow per UI-SPEC Destructive list).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Monitor } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
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
import { toast } from 'sonner';

import {
  listKioskDevices,
  pairKioskDevice,
  type KioskDeviceListItem,
} from '@/services/hr/kiosk.service';
import { useKioskDevice } from '@/hooks/hr/use-kiosk-device';
import { useAuth } from '@/contexts/auth-context';
import { useTenant } from '@/contexts/tenant-context';

export function SetupWizard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { currentTenant, isLoading: isTenantLoading } = useTenant();
  const { isPaired, deviceName, setPairing, clearPairing } = useKioskDevice();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [devices, setDevices] = useState<KioskDeviceListItem[] | null>(null);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState('');
  const [pairing, setPairing2] = useState(false);
  const [pairError, setPairError] = useState<string | null>(null);

  const authReady = !isAuthLoading && !isTenantLoading;
  const needsLogin = authReady && (!isAuthenticated || !currentTenant);

  // Pre-flight: if unauthenticated or no tenant, bounce to /fast-login.
  useEffect(() => {
    if (!authReady) return;
    if (needsLogin) {
      router.replace('/fast-login?redirect=/kiosk/setup');
    }
  }, [authReady, needsLogin, router]);

  // Load pairable devices on Step 1 once auth is ready.
  useEffect(() => {
    if (!authReady || needsLogin) return;
    if (step !== 1) return;
    let cancelled = false;
    (async () => {
      try {
        setDevicesError(null);
        const items = await listKioskDevices();
        if (cancelled) return;
        setDevices(items);
      } catch (err) {
        if (cancelled) return;
        setDevicesError(
          err instanceof Error ? err.message : 'Erro ao carregar dispositivos.'
        );
        setDevices([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, needsLogin, step]);

  const selectedDevice = useMemo(
    () => devices?.find(d => d.id === selectedDeviceId) ?? null,
    [devices, selectedDeviceId]
  );

  const handlePair = useCallback(async () => {
    if (!selectedDeviceId || pairingCode.length !== 6) return;
    setPairing2(true);
    setPairError(null);
    try {
      const result = await pairKioskDevice(selectedDeviceId, pairingCode);
      setPairing(result.deviceToken, result.deviceName);
      setStep(3);
    } catch (err) {
      setPairError(
        err instanceof Error
          ? err.message
          : 'Não foi possível parear. Verifique o código e tente novamente.'
      );
    } finally {
      setPairing2(false);
    }
  }, [selectedDeviceId, pairingCode, setPairing]);

  if (!authReady) {
    return (
      <Card className="mx-auto mt-24 flex max-w-md items-center justify-center gap-3 p-8">
        <Loader2 className="size-5 animate-spin" />
        <span>Carregando…</span>
      </Card>
    );
  }
  if (needsLogin) {
    return (
      <Card className="mx-auto mt-24 max-w-md p-8 text-center">
        <p>Redirecionando para login…</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Configurar kiosk</h1>
          <p className="text-sm text-muted-foreground">Passo {step} de 3</p>
        </div>
        {isPaired && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Desvincular este kiosk
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Desvincular este kiosk do sistema?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Será preciso um novo código de pareamento para voltar a bater
                  ponto neste dispositivo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clearPairing();
                    toast.success('Kiosk desvinculado.');
                    setStep(1);
                    setSelectedDeviceId(null);
                    setPairingCode('');
                  }}
                >
                  Desvincular
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </header>

      {isPaired && step === 1 && (
        <Card className="bg-muted/30 p-4 text-sm">
          Este dispositivo já está pareado como{' '}
          <strong>{deviceName ?? 'kiosk'}</strong>. Você pode{' '}
          <button
            type="button"
            className="text-primary underline"
            onClick={() => router.push('/kiosk')}
          >
            iniciar o kiosk
          </button>{' '}
          ou parear um novo dispositivo abaixo.
        </Card>
      )}

      {step === 1 && (
        <Card className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-lg font-semibold">Selecione o dispositivo</h2>
            <p className="text-sm text-muted-foreground">
              Escolha o PunchDevice cadastrado para este kiosk.
            </p>
          </div>

          {devices === null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Carregando dispositivos…
            </div>
          )}
          {devicesError && (
            <p className="text-sm text-destructive">{devicesError}</p>
          )}
          {devices !== null && devices.length === 0 && !devicesError && (
            <p className="text-sm text-muted-foreground">
              Nenhum dispositivo KIOSK_PUBLIC cadastrado. Cadastre um em
              /hr/punch-devices antes de continuar.
            </p>
          )}

          {devices && devices.length > 0 && (
            <ul className="flex flex-col gap-2">
              {devices.map(d => {
                const selected = d.id === selectedDeviceId;
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedDeviceId(d.id)}
                      className={`w-full rounded-lg border p-3 text-left transition ${
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Monitor className="size-5" />
                        <div className="flex-1">
                          <div className="font-medium">{d.displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            {d.hostname ?? 'sem hostname'} · {d.deviceKind}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedDeviceId}
              size="sm"
            >
              Continuar
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-lg font-semibold">
              Informe o código de pareamento
            </h2>
            <p className="text-sm text-muted-foreground">
              Digite o código de 6 dígitos gerado pelo administrador. O código
              expira em 60 segundos.
            </p>
          </div>

          {selectedDevice && (
            <p className="text-sm">
              Dispositivo: <strong>{selectedDevice.displayName}</strong>
            </p>
          )}

          <div className="flex flex-col items-center gap-3">
            <InputOTP
              maxLength={6}
              value={pairingCode}
              onChange={setPairingCode}
              disabled={pairing}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {pairError && (
              <p className="text-sm text-destructive">{pairError}</p>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
              disabled={pairing}
            >
              Voltar
            </Button>
            <Button
              size="sm"
              onClick={handlePair}
              disabled={pairingCode.length !== 6 || pairing}
            >
              {pairing && <Loader2 className="mr-2 size-4 animate-spin" />}
              Continuar
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="rounded-full bg-green-500/10 p-4 text-green-600">
            <Monitor className="size-10" />
          </div>
          <h2 className="text-xl font-semibold">Kiosk pareado</h2>
          <p className="text-sm text-muted-foreground">
            Este dispositivo está pronto para registrar pontos.
          </p>
          <Button size="sm" onClick={() => router.push('/kiosk')}>
            Iniciar kiosk
          </Button>
        </Card>
      )}
    </div>
  );
}
