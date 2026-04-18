'use client';

import {
  Bell,
  Mail,
  Monitor,
  Moon,
  Send,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

import {
  useNotificationModulesManifest,
  useNotificationPreferencesBundle,
  useNotificationSettings,
  usePushDevices,
  useRevokePushDevice,
  useSendTestNotification,
  useUpdateNotificationPreferences,
  useUpdateNotificationSettings,
} from '@/features/notifications/hooks/use-notification-preferences';
import { usePushSubscription } from '@/features/notifications/hooks/use-push-subscription';
import {
  NotificationChannel,
  NotificationFrequency,
  type NotificationPreferenceRow,
} from '@/features/notifications/types';

type ChannelKey = 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS' | 'WHATSAPP';

const CHANNEL_META: Record<
  ChannelKey,
  { label: string; icon: React.ReactNode }
> = {
  IN_APP: { label: 'No app', icon: <Bell className="h-4 w-4" /> },
  EMAIL: { label: 'E-mail', icon: <Mail className="h-4 w-4" /> },
  PUSH: { label: 'Push', icon: <Monitor className="h-4 w-4" /> },
  SMS: { label: 'SMS', icon: <Smartphone className="h-4 w-4" /> },
  WHATSAPP: { label: 'WhatsApp', icon: <Smartphone className="h-4 w-4" /> },
};

export default function NotificationSettingsPage() {
  const settings = useNotificationSettings();
  const preferences = useNotificationPreferencesBundle();
  const manifest = useNotificationModulesManifest();
  const devices = usePushDevices();

  const updateSettings = useUpdateNotificationSettings();
  const updatePrefs = useUpdateNotificationPreferences();
  const sendTest = useSendTestNotification();
  const revoke = useRevokePushDevice();
  const push = usePushSubscription();

  const prefsMap = useMemo(() => {
    const map = new Map<string, NotificationPreferenceRow>();
    preferences.data?.preferences.forEach(p =>
      map.set(`${p.categoryCode}:${p.channel}`, p)
    );
    return map;
  }, [preferences.data]);

  const moduleEnabledMap = useMemo(() => {
    const map = new Map<string, boolean>();
    preferences.data?.modules.forEach(m => map.set(m.code, m.isEnabled));
    return map;
  }, [preferences.data]);

  const isLoading =
    settings.isLoading || manifest.isLoading || preferences.isLoading;

  return (
    <div className="space-y-6 p-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Preferências de notificações</h1>
        <p className="text-sm text-muted-foreground">
          Configure como e quando receber alertas do sistema.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!isLoading && settings.data && (
        <>
          <Card className="p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Moon className="h-4 w-4" /> Gerais
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Não perturbe</div>
                  <div className="text-xs text-muted-foreground">
                    Bloqueia alertas fora de horário (exceto urgentes).
                  </div>
                </div>
                <Switch
                  checked={settings.data.doNotDisturb}
                  onCheckedChange={v =>
                    updateSettings.mutate({ doNotDisturb: v })
                  }
                />
              </label>

              {settings.data.doNotDisturb && (
                <div className="flex gap-2 items-end">
                  <div>
                    <label className="text-xs text-muted-foreground">Das</label>
                    <input
                      type="time"
                      defaultValue={settings.data.dndStart ?? '22:00'}
                      onBlur={e =>
                        updateSettings.mutate({ dndStart: e.target.value })
                      }
                      className="block border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Às</label>
                    <input
                      type="time"
                      defaultValue={settings.data.dndEnd ?? '07:00'}
                      onBlur={e =>
                        updateSettings.mutate({ dndEnd: e.target.value })
                      }
                      className="block border rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              )}

              <label className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Som</div>
                  <div className="text-xs text-muted-foreground">
                    Toca um pequeno som ao receber.
                  </div>
                </div>
                <Switch
                  checked={settings.data.soundEnabled}
                  onCheckedChange={v =>
                    updateSettings.mutate({ soundEnabled: v })
                  }
                />
              </label>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h2 className="font-semibold">Canais (master)</h2>
            <p className="text-xs text-muted-foreground">
              Desativar aqui desliga o canal para todas as categorias.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(
                [
                  ['masterInApp', 'IN_APP'],
                  ['masterEmail', 'EMAIL'],
                  ['masterPush', 'PUSH'],
                  ['masterSms', 'SMS'],
                  ['masterWhatsapp', 'WHATSAPP'],
                ] as Array<[keyof typeof settings.data, ChannelKey]>
              ).map(([key, channel]) => (
                <label
                  key={channel}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                >
                  <span className="text-sm flex items-center gap-2">
                    {CHANNEL_META[channel].icon}
                    {CHANNEL_META[channel].label}
                  </span>
                  <Switch
                    checked={Boolean(settings.data[key])}
                    onCheckedChange={v =>
                      updateSettings.mutate({ [key]: v } as Record<
                        string,
                        boolean
                      >)
                    }
                  />
                </label>
              ))}
            </div>

            {push.permission !== 'granted' &&
              push.permission !== 'unsupported' && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={push.subscribing}
                  onClick={() => push.subscribe(navigator.userAgent)}
                  className="mt-3"
                >
                  Ativar notificações no navegador
                </Button>
              )}
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="font-semibold">Por módulo</h2>
            <p className="text-xs text-muted-foreground">
              Configure quais eventos de cada módulo devem notificar você.
            </p>

            {manifest.data?.modules.map(mod => {
              const moduleEnabled = moduleEnabledMap.get(mod.code) ?? true;
              return (
                <div key={mod.code} className="rounded-lg border">
                  <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                    <div>
                      <div className="font-medium text-sm">
                        {mod.displayName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {mod.categories.length} categorias
                      </div>
                    </div>
                    <Switch
                      checked={moduleEnabled}
                      onCheckedChange={v =>
                        updatePrefs.mutate({
                          modules: [{ code: mod.code, isEnabled: v }],
                        })
                      }
                    />
                  </div>

                  {moduleEnabled && (
                    <div className="divide-y">
                      {mod.categories.map(cat => (
                        <div
                          key={cat.code}
                          className="flex items-start justify-between gap-3 p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium">
                              {cat.name}
                              {cat.mandatory && (
                                <span className="ml-2 text-[10px] text-amber-600 uppercase">
                                  obrigatório
                                </span>
                              )}
                            </div>
                            {cat.description && (
                              <div className="text-xs text-muted-foreground">
                                {cat.description}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 flex-wrap justify-end">
                            {(
                              ['IN_APP', 'EMAIL', 'PUSH', 'SMS'] as ChannelKey[]
                            ).map(channel => {
                              const key = `${cat.code}:${channel}`;
                              const pref = prefsMap.get(key);
                              const enabled = pref
                                ? pref.isEnabled
                                : cat.defaultChannels.includes(channel);
                              return (
                                <button
                                  type="button"
                                  key={channel}
                                  disabled={cat.mandatory}
                                  onClick={() =>
                                    updatePrefs.mutate({
                                      preferences: [
                                        {
                                          categoryCode: cat.code,
                                          channel:
                                            channel as NotificationChannel,
                                          isEnabled: !enabled,
                                          frequency:
                                            pref?.frequency ??
                                            NotificationFrequency.INSTANT,
                                        },
                                      ],
                                    })
                                  }
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] border transition-colors ${
                                    enabled
                                      ? 'bg-primary/10 border-primary text-primary'
                                      : 'bg-muted/30 border-transparent text-muted-foreground'
                                  }`}
                                  title={
                                    cat.mandatory
                                      ? 'Notificação obrigatória'
                                      : CHANNEL_META[channel].label
                                  }
                                >
                                  {CHANNEL_META[channel].icon}
                                  {CHANNEL_META[channel].label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </Card>

          <Card className="p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Monitor className="h-4 w-4" /> Dispositivos com push
            </h2>
            {devices.data?.devices.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum dispositivo registrado ainda.
              </p>
            )}
            <div className="space-y-2">
              {devices.data?.devices.map(d => (
                <div
                  key={d.id}
                  className="flex items-center justify-between border rounded p-3"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {d.deviceName ??
                        d.userAgent?.slice(0, 60) ??
                        'Dispositivo'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ativo em{' '}
                      {d.lastSeenAt
                        ? new Date(d.lastSeenAt).toLocaleString('pt-BR')
                        : 'nunca'}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => revoke.mutate(d.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Send className="h-4 w-4" /> Testar
            </h2>
            <p className="text-xs text-muted-foreground">
              Envia uma notificação de cada tipo para você, para validar que
              está recebendo corretamente.
            </p>
            <Button
              size="sm"
              onClick={() => sendTest.mutate(undefined)}
              disabled={sendTest.isPending}
            >
              {sendTest.isPending
                ? 'Enviando...'
                : 'Enviar notificações de teste'}
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
