/**
 * Punch Terminals Management Page
 * Gerenciamento de terminais de ponto Horus (kiosks, PCs pessoais e leitores biométricos)
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { PageActionBar } from '@/components/layout/page-action-bar';
import { PageHeroBanner } from '@/components/layout/page-hero-banner';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { usePunchDevicesHealth } from '@/hooks/hr/use-punch-devices-health';
import {
  punchDevicesService,
  type PunchDeviceKind,
} from '@/services/hr/punch-devices.service';
import type { PunchDeviceHealthItem } from '@/services/hr/punch-dashboard.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { translateError } from '@/lib/errors';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Cpu,
  Copy,
  Download,
  Fingerprint,
  Link2Off,
  Monitor,
  MoreVertical,
  Plus,
  QrCode,
  RefreshCw,
  Smartphone,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_DEVICE_NAME_LENGTH = 64;

const DEVICE_KIND_CONFIG: Record<
  PunchDeviceKind,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    badgeBg: string;
    badgeText: string;
    border: string;
  }
> = {
  KIOSK_PUBLIC: {
    label: 'Quiosque (compartilhado)',
    description: 'Tela cheia em local comum, vários colaboradores batem ponto.',
    icon: Monitor,
    color: 'text-indigo-600 dark:text-indigo-300',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-500/30',
  },
  WEBAUTHN_PC: {
    label: 'PC pessoal (Windows Hello)',
    description: 'Computador individual com leitor biométrico integrado.',
    icon: Cpu,
    color: 'text-violet-600 dark:text-violet-300',
    badgeBg: 'bg-violet-50 dark:bg-violet-500/10',
    badgeText: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-500/30',
  },
  BIOMETRIC_READER: {
    label: 'Leitor biométrico',
    description: 'Estação dedicada com leitor DigitalPersona U.are.U 4500.',
    icon: Fingerprint,
    color: 'text-emerald-600 dark:text-emerald-300',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-500/30',
  },
  PWA_PERSONAL: {
    label: 'PWA pessoal',
    description: 'App web instalável no celular do colaborador.',
    icon: Smartphone,
    color: 'text-sky-600 dark:text-sky-300',
    badgeBg: 'bg-sky-50 dark:bg-sky-500/10',
    badgeText: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-500/30',
  },
};

const KIND_OPTIONS: PunchDeviceKind[] = [
  'KIOSK_PUBLIC',
  'WEBAUTHN_PC',
  'BIOMETRIC_READER',
  'PWA_PERSONAL',
];

interface RegisterState {
  name: string;
  kind: PunchDeviceKind;
}

const INITIAL_REGISTER_STATE: RegisterState = {
  name: '',
  kind: 'KIOSK_PUBLIC',
};

function formatRelative(iso: string | null): string {
  if (!iso) return 'Sem comunicação';
  try {
    return formatDistanceToNow(new Date(iso), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return 'Há instantes';
  }
}

export default function PunchTerminalsPage() {
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const canRegister = hasPermission('hr.punch-devices.register');
  const canAdmin = hasPermission('hr.punch-devices.admin');

  const { data, isLoading, error, refetch } = usePunchDevicesHealth();

  const devices = data?.devices ?? [];

  // Wizard
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [registerState, setRegisterState] = useState<RegisterState>(
    INITIAL_REGISTER_STATE
  );
  const [newDeviceId, setNewDeviceId] = useState<string | null>(null);

  // Pairing code dialog (existing devices)
  const [pairingDeviceId, setPairingDeviceId] = useState<string | null>(null);
  const [pairingDeviceName, setPairingDeviceName] = useState<string | null>(
    null
  );

  // Unpair confirmation
  const [unpairDeviceId, setUnpairDeviceId] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: () =>
      punchDevicesService.register({
        name: registerState.name.trim().slice(0, MAX_DEVICE_NAME_LENGTH),
        deviceKind: registerState.kind,
      }),
    onSuccess: res => {
      setNewDeviceId(res.deviceId);
      setRegisterStep(2);
      queryClient.invalidateQueries({ queryKey: ['punch', 'devices-health'] });
    },
    onError: err => {
      toast.error(translateError(err) ?? 'Erro ao cadastrar dispositivo');
    },
  });

  const handleUnpair = useCallback(
    async (deviceId: string) => {
      try {
        await punchDevicesService.unpair(deviceId);
        queryClient.invalidateQueries({
          queryKey: ['punch', 'devices-health'],
        });
        toast.success('Dispositivo desvinculado');
      } catch (err) {
        toast.error(translateError(err) ?? 'Erro ao desvincular dispositivo');
      } finally {
        setUnpairDeviceId(null);
      }
    },
    [queryClient]
  );

  function closeRegister() {
    setRegisterOpen(false);
    setRegisterStep(1);
    setRegisterState(INITIAL_REGISTER_STATE);
    setNewDeviceId(null);
  }

  const registerSteps: WizardStep[] = [
    {
      title: 'Identificação',
      description: 'Nome e tipo do terminal de ponto',
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
          <Cpu className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
      ),
      content: (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="device-name">Nome do dispositivo</Label>
            <Input
              id="device-name"
              placeholder="Ex.: Recepção · Quiosque 01"
              value={registerState.name}
              onChange={e =>
                setRegisterState(prev => ({
                  ...prev,
                  name: e.target.value.slice(0, MAX_DEVICE_NAME_LENGTH),
                }))
              }
              maxLength={MAX_DEVICE_NAME_LENGTH}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Identifique o local ou usuário do dispositivo.
              </p>
              <span className="text-xs text-muted-foreground tabular-nums">
                {registerState.name.length}/{MAX_DEVICE_NAME_LENGTH}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="device-kind">Tipo</Label>
            <Select
              value={registerState.kind}
              onValueChange={v =>
                setRegisterState(prev => ({
                  ...prev,
                  kind: v as PunchDeviceKind,
                }))
              }
            >
              <SelectTrigger id="device-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KIND_OPTIONS.map(kind => {
                  const cfg = DEVICE_KIND_CONFIG[kind];
                  return (
                    <SelectItem key={kind} value={kind}>
                      {cfg.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {DEVICE_KIND_CONFIG[registerState.kind].description}
            </p>
          </div>
        </div>
      ),
      isValid:
        registerState.name.trim().length > 0 && !registerMutation.isPending,
      footer: (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closeRegister}>
            Cancelar
          </Button>
          <Button
            onClick={() => registerMutation.mutate()}
            disabled={!registerState.name.trim() || registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Registrando...' : 'Registrar'}
          </Button>
        </div>
      ),
    },
    {
      title: 'Código de Pareamento',
      description: 'Use o código abaixo no terminal Horus',
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
          <QrCode className="w-8 h-8 text-violet-600 dark:text-violet-400" />
        </div>
      ),
      content: newDeviceId ? (
        <PairingCodeDisplay deviceId={newDeviceId} />
      ) : (
        <div className="text-center text-muted-foreground py-4">
          Registrando dispositivo...
        </div>
      ),
      isValid: true,
      footer: (
        <div className="flex justify-end">
          <Button onClick={closeRegister}>Concluir</Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Dispositivos', href: '/devices' },
            { label: 'Terminais de Ponto' },
          ]}
          actions={
            canRegister ? (
              <Button
                size="sm"
                className="h-9 px-2.5"
                onClick={() => setRegisterOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Vincular Dispositivo
              </Button>
            ) : undefined
          }
        />
      </PageHeader>

      <PageBody spacing="gap-6">
        {/* Hero Banner */}
        <PageHeroBanner
          title="Terminais de Ponto"
          description="Gerencie terminais Horus, leitores biométricos e PWAs pessoais. Cada dispositivo registra batidas com geolocalização e auditoria."
          icon={Fingerprint}
          iconGradient="from-indigo-500 to-violet-600"
          buttons={[
            {
              id: 'download-horus',
              label: 'Download Horus',
              icon: Download,
              href: '/downloads/horus',
              gradient: 'from-indigo-500 to-violet-600',
            },
          ]}
          hasPermission={hasPermission}
        />

        {/* Devices Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dispositivos pareados
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Terminais conectados que registram batidas em tempo real
              </p>
            </div>
            {data && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {data.online} online
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  {data.offline} offline
                </span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="p-5 bg-white dark:bg-slate-800/60 border border-border animate-pulse"
                >
                  <div className="h-16" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-8 bg-white dark:bg-slate-800/60 border border-border text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {translateError(error) ??
                  'Não foi possível carregar dispositivos.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetch();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Tentar novamente
              </Button>
            </Card>
          ) : devices.length === 0 ? (
            <Card className="p-12 bg-white dark:bg-slate-800/60 border border-border text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Nenhum terminal pareado
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Vincule um dispositivo para começar a registrar pontos.
              </p>
              {canRegister && (
                <Button onClick={() => setRegisterOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Vincular Dispositivo
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4">
              {devices.map(device => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  canAdmin={canAdmin}
                  onUnpair={() => setUnpairDeviceId(device.id)}
                  onShowCode={() => {
                    setPairingDeviceId(device.id);
                    setPairingDeviceName(device.name);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </PageBody>

      {/* Register Wizard */}
      <StepWizardDialog
        open={registerOpen}
        onOpenChange={open => {
          if (!open) closeRegister();
        }}
        steps={registerSteps}
        currentStep={registerStep}
        onStepChange={setRegisterStep}
        onClose={closeRegister}
      />

      {/* Pairing Code Dialog (existing devices) */}
      {pairingDeviceId && (
        <PairingCodeDialog
          deviceId={pairingDeviceId}
          deviceName={pairingDeviceName ?? ''}
          open={!!pairingDeviceId}
          onOpenChange={open => {
            if (!open) {
              setPairingDeviceId(null);
              setPairingDeviceName(null);
            }
          }}
        />
      )}

      {/* Unpair confirmation (PIN gated) */}
      {unpairDeviceId && (
        <VerifyActionPinModal
          isOpen={!!unpairDeviceId}
          onClose={() => setUnpairDeviceId(null)}
          onSuccess={() => handleUnpair(unpairDeviceId)}
          title="Confirmar Desvinculação"
          description="Digite seu PIN de ação para desvincular este dispositivo. Ele precisará ser pareado novamente para voltar a registrar pontos."
        />
      )}
    </PageLayout>
  );
}

// ============================================
// Device Card
// ============================================

interface DeviceCardProps {
  device: PunchDeviceHealthItem;
  canAdmin: boolean;
  onUnpair: () => void;
  onShowCode: () => void;
}

function DeviceCard({
  device,
  canAdmin,
  onUnpair,
  onShowCode,
}: DeviceCardProps) {
  const isOnline = device.status === 'ONLINE';

  return (
    <Card className="p-4 sm:p-5 bg-white dark:bg-slate-800/60 border border-border">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-0 sm:justify-between">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          {/* Status Icon */}
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              isOnline
                ? 'bg-emerald-100 dark:bg-emerald-500/10'
                : 'bg-gray-100 dark:bg-gray-500/10'
            )}
          >
            <Cpu
              className={cn(
                'w-5 h-5',
                isOnline
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            />
          </div>

          {/* Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[260px]">
                {device.name ?? 'Sem nome'}
              </h3>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] font-medium border',
                  isOnline
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                    : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20'
                )}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-2.5 h-2.5 mr-1 inline" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="w-2.5 h-2.5 mr-1 inline" />
                    Offline
                  </>
                )}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
              {device.location && <span>{device.location}</span>}
              <span>Visto {formatRelative(device.lastSeenAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {canAdmin && (
          <div className="flex items-center gap-1 shrink-0 self-start sm:self-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={onShowCode}
            >
              <QrCode className="w-3 h-3 mr-1" />
              Reparear
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="text-rose-600 dark:text-rose-400 focus:text-rose-600"
                  onClick={onUnpair}
                >
                  <Link2Off className="w-4 h-4 mr-2" />
                  Desvincular
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================
// Pairing Code Dialog
// ============================================

interface PairingCodeDialogProps {
  deviceId: string;
  deviceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PairingCodeDialog({
  deviceId,
  deviceName,
  open,
  onOpenChange,
}: PairingCodeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Código de Pareamento</DialogTitle>
          <DialogDescription>
            Digite este código no Horus instalado em{' '}
            <span className="font-medium text-foreground">{deviceName}</span>. O
            código rotaciona a cada 60 segundos.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <PairingCodeDisplay deviceId={deviceId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Pairing Code Display (shared)
// ============================================

function PairingCodeDisplay({ deviceId }: { deviceId: string }) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['punch-device', deviceId, 'pairing-code'],
    queryFn: () => punchDevicesService.getPairingCode(deviceId),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!data?.expiresAt) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(left);
      if (left === 0) refetch();
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data?.expiresAt, refetch]);

  async function handleCopy() {
    if (!data?.code) return;
    try {
      await navigator.clipboard.writeText(data.code);
      toast.success('Código copiado para a área de transferência');
    } catch {
      toast.error('Não foi possível copiar');
    }
  }

  if (isLoading && !data) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Gerando código de pareamento...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Erro ao gerar código. Feche e tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20">
        <div className="flex items-start gap-2">
          <QrCode className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
          <p className="text-sm text-violet-800 dark:text-violet-300">
            Abra o Horus no terminal e digite este código quando solicitado.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 py-2">
        <button
          type="button"
          className="group px-8 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer relative"
          onClick={handleCopy}
        >
          <span className="text-4xl font-mono font-bold tracking-[0.3em] text-gray-900 dark:text-white select-all">
            {data.code}
          </span>
          <Copy className="w-4 h-4 absolute top-2 right-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              secondsLeft > 30
                ? 'bg-green-500'
                : secondsLeft > 10
                  ? 'bg-amber-500'
                  : 'bg-rose-500 animate-pulse'
            )}
          />
          <span>
            Expira em{' '}
            <span className="font-medium tabular-nums">{secondsLeft}s</span>
          </span>
        </div>
      </div>
    </div>
  );
}
