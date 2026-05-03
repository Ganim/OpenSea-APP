'use client';

/**
 * /hr/punch-devices — Listing + pareamento de dispositivos de ponto Horus.
 *
 * Permite ao admin:
 *   1. Visualizar dispositivos pareados (status ONLINE/OFFLINE) — reusa
 *      `usePunchDevicesHealth` da página `/hr/punch/health`.
 *   2. Registrar um novo dispositivo (POST /v1/hr/punch-devices) e obter
 *      o código TOTP corrente (6 chars, rotaciona 60s) que o admin digita
 *      na tela de pairing do Horus.
 *
 * Permissões:
 *   - View listing: hr.punch-devices.access
 *   - Register: hr.punch-devices.register
 *   - Get pairing code: hr.punch-devices.admin
 */

import { Suspense, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Cpu,
  Download,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { GridLoading } from '@/components/handlers/grid-loading';
import { GridError } from '@/components/handlers/grid-error';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { usePunchDevicesHealth } from '@/hooks/hr/use-punch-devices-health';
import type { PunchDeviceHealthItem } from '@/services/hr/punch-dashboard.service';
import {
  punchDevicesService,
  type PunchDeviceKind,
} from '@/services/hr/punch-devices.service';
import { translateError } from '@/lib/errors';
import { cn } from '@/lib/utils';

const DEVICE_KIND_LABELS: Record<PunchDeviceKind, string> = {
  KIOSK_PUBLIC: 'Quiosque (compartilhado)',
  PWA_PERSONAL: 'PWA pessoal',
  BIOMETRIC_READER: 'Leitor biométrico',
  WEBAUTHN_PC: 'PC com Windows Hello',
};

// ── Listing item ────────────────────────────────────────────────────────────

function DeviceRow({ device }: { device: PunchDeviceHealthItem }) {
  const isOnline = device.status === 'ONLINE';
  return (
    <Card className="flex items-center gap-4 p-4">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          isOnline
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-slate-500/10 text-slate-500'
        )}
      >
        <Cpu className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{device.name ?? 'Sem nome'}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {device.deviceKind ?? '—'} ·{' '}
          {device.lastSeenAt
            ? new Date(device.lastSeenAt).toLocaleString('pt-BR')
            : 'Sem comunicação'}
        </p>
      </div>
      <Badge variant={isOnline ? 'default' : 'secondary'} className="gap-1">
        {isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
    </Card>
  );
}

// ── Pairing code modal ──────────────────────────────────────────────────────

interface PairingCodeViewProps {
  deviceId: string;
  deviceName: string;
  onClose: () => void;
}

function PairingCodeView({
  deviceId,
  deviceName,
  onClose,
}: PairingCodeViewProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['punch-device', deviceId, 'pairing-code'],
    queryFn: () => punchDevicesService.getPairingCode(deviceId),
    refetchInterval: 30_000, // Server rotates every 60s; refresh at half-cycle.
  });

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!data?.expiresAt) {
      setSecondsLeft(null);
      return;
    }
    const tick = () => {
      const left = Math.max(
        0,
        Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(left);
    };
    tick();
    const handle = setInterval(tick, 1000);
    return () => clearInterval(handle);
  }, [data?.expiresAt]);

  async function handleCopy() {
    if (!data?.code) return;
    try {
      await navigator.clipboard.writeText(data.code);
      toast.success('Código copiado');
    } catch {
      toast.error('Não foi possível copiar — selecione manualmente');
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <p className="text-sm text-muted-foreground text-center">
        Digite este código de 6 caracteres no aplicativo Horus instalado em{' '}
        <span className="font-medium text-foreground">{deviceName}</span>.
        <br />O código rotaciona automaticamente a cada 60 segundos.
      </p>

      {isLoading && (
        <div className="font-mono text-5xl tracking-[0.5em] text-muted-foreground">
          ······
        </div>
      )}
      {isError && (
        <div className="text-sm text-destructive">
          Não foi possível carregar o código.{' '}
          <button onClick={() => refetch()} className="underline">
            Tentar novamente
          </button>
        </div>
      )}
      {data && (
        <>
          <div className="font-mono text-6xl font-bold tracking-[0.4em] tabular-nums">
            {data.code}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Atualizar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {secondsLeft !== null && secondsLeft > 0
              ? `Expira em ${secondsLeft}s`
              : 'Aguardando rotação…'}
          </p>
        </>
      )}

      <DialogFooter className="w-full mt-2">
        <Button variant="default" onClick={onClose}>
          Concluído
        </Button>
      </DialogFooter>
    </div>
  );
}

// ── Register dialog ─────────────────────────────────────────────────────────

interface RegisterDialogState {
  open: boolean;
  // After successful register, we keep the deviceId + name to show the code.
  paired?: { deviceId: string; name: string };
}

function RegisterDeviceDialog({
  state,
  onClose,
}: {
  state: RegisterDialogState;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState<PunchDeviceKind>('KIOSK_PUBLIC');
  const queryClient = useQueryClient();

  const register = useMutation({
    mutationFn: () =>
      punchDevicesService.register({ name: name.trim(), deviceKind: kind }),
    onSuccess: res => {
      toast.success('Dispositivo cadastrado');
      // Refresh the listing in background.
      queryClient.invalidateQueries({ queryKey: ['punch-devices-health'] });
      // Switch to the pairing-code view in-place.
      onClose();
      // Small dance: parent re-opens with paired set.
      setTimeout(() => {
        const evt = new CustomEvent('open-pairing-code', {
          detail: { deviceId: res.deviceId, name: name.trim() },
        });
        window.dispatchEvent(evt);
      }, 50);
    },
    onError: err => {
      toast.error(translateError(err) ?? 'Erro ao cadastrar dispositivo');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 1) {
      toast.error('Informe um nome para o dispositivo');
      return;
    }
    register.mutate();
  }

  return (
    <Dialog open={state.open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular novo dispositivo</DialogTitle>
          <DialogDescription>
            Cadastre o dispositivo aqui; depois você receberá um código de 6
            caracteres para digitar na tela de pareamento do Horus.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="device-name">Nome do dispositivo</Label>
            <Input
              id="device-name"
              placeholder="Ex.: Kiosk Recepção"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              disabled={register.isPending}
              maxLength={128}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="device-kind">Tipo</Label>
            <Select
              value={kind}
              onValueChange={v => setKind(v as PunchDeviceKind)}
              disabled={register.isPending}
            >
              <SelectTrigger id="device-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DEVICE_KIND_LABELS) as PunchDeviceKind[]).map(
                  k => (
                    <SelectItem key={k} value={k}>
                      {DEVICE_KIND_LABELS[k]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={register.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={register.isPending}>
              {register.isPending ? 'Cadastrando…' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Page content ────────────────────────────────────────────────────────────

function Content() {
  const { hasPermission } = usePermissions();
  const canView =
    hasPermission('hr.punch-devices.access') ||
    hasPermission('hr.punch-devices.admin');
  const canRegister = hasPermission('hr.punch-devices.register');

  const { data, isLoading, isError, error, refetch } = usePunchDevicesHealth();

  const [registerState, setRegisterState] = useState<RegisterDialogState>({
    open: false,
  });
  const [pairingView, setPairingView] = useState<{
    deviceId: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail as {
        deviceId: string;
        name: string;
      };
      setPairingView(detail);
    }
    window.addEventListener('open-pairing-code', handler as EventListener);
    return () =>
      window.removeEventListener('open-pairing-code', handler as EventListener);
  }, []);

  if (!canView) return null;

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Ponto', href: '/hr/punch/dashboard' },
            { label: 'Dispositivos', href: '/hr/punch-devices' },
          ]}
        />
        <div className="flex items-start justify-between gap-4">
          <Header
            title="Dispositivos de ponto"
            description="Gerencie kiosks Horus, PWAs pessoais e leitores biométricos da sua frota."
          />
          <div className="flex shrink-0 gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/hr/punch-devices/downloads">
                <Download className="h-4 w-4" />
                Baixar Horus
              </Link>
            </Button>
            {canRegister && (
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setRegisterState({ open: true })}
              >
                <Plus className="h-4 w-4" />
                Vincular novo dispositivo
              </Button>
            )}
          </div>
        </div>
      </PageHeader>

      <PageBody>
        {isLoading && <GridLoading count={3} />}
        {isError && (
          <GridError
            message={
              translateError(error) ?? 'Não foi possível carregar dispositivos.'
            }
            onRetry={() => refetch()}
          />
        )}
        {!isLoading && !isError && data && (
          <div className="space-y-3">
            {data.length === 0 ? (
              <Card className="flex flex-col items-center gap-3 p-12 text-center">
                <Cpu className="h-12 w-12 text-muted-foreground/50" />
                <div>
                  <h2 className="text-lg font-semibold">
                    Nenhum dispositivo pareado
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Clique em "Vincular novo dispositivo" para gerar um código
                    de pareamento.
                  </p>
                </div>
                {canRegister && (
                  <Button
                    onClick={() => setRegisterState({ open: true })}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Vincular novo dispositivo
                  </Button>
                )}
              </Card>
            ) : (
              data.map(device => <DeviceRow key={device.id} device={device} />)
            )}
          </div>
        )}
      </PageBody>

      <RegisterDeviceDialog
        state={registerState}
        onClose={() => setRegisterState({ open: false })}
      />

      <Dialog
        open={!!pairingView}
        onOpenChange={o => !o && setPairingView(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Dispositivo cadastrado
            </DialogTitle>
            <DialogDescription>
              Use este código no Horus para concluir o pareamento.
            </DialogDescription>
          </DialogHeader>
          {pairingView && (
            <PairingCodeView
              deviceId={pairingView.deviceId}
              deviceName={pairingView.name}
              onClose={() => setPairingView(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

export default function PunchDevicesPage() {
  return (
    <Suspense fallback={<GridLoading count={3} />}>
      <Content />
    </Suspense>
  );
}
