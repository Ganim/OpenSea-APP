/**
 * NotificationsTab — preferences persistence + RBAC gating.
 *
 * The tab consumes ~10 hooks (settings, preferences, manifest, devices,
 * mutations, push subscription, permissions). Each is mocked at module
 * level; a per-test setter overrides return values to drive the scenario.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const updateSettingsMutate = vi.fn();
const updatePrefsMutate = vi.fn();
const sendTestMutate = vi.fn();
const revokeMutate = vi.fn();
const subscribePush = vi.fn();

let permsState = {
  canRead: true,
  canModify: true,
  canManageDevices: true,
};

let settingsState: {
  isLoading: boolean;
  data: Record<string, unknown> | undefined;
} = {
  isLoading: false,
  data: {
    doNotDisturb: false,
    dndStart: null,
    dndEnd: null,
    timezone: 'America/Sao_Paulo',
    digestSchedule: null,
    soundEnabled: true,
    masterInApp: true,
    masterEmail: true,
    masterPush: false,
    masterSms: false,
    masterWhatsapp: false,
  },
};

let manifestState: { isLoading: boolean; data: { modules: unknown[] } } = {
  isLoading: false,
  data: { modules: [] },
};

let preferencesState: {
  isLoading: boolean;
  data: { modules: unknown[]; preferences: unknown[] };
} = {
  isLoading: false,
  data: { modules: [], preferences: [] },
};

let devicesState: { data: { devices: unknown[] } } = {
  data: { devices: [] },
};

vi.mock('@/hooks/use-permissions', () => ({
  useMultiplePermissions: () => permsState,
  usePermissions: () => ({ hasPermission: () => true }),
}));

vi.mock('@/features/notifications/hooks/use-notification-preferences', () => ({
  useNotificationSettings: () => settingsState,
  useNotificationPreferencesBundle: () => preferencesState,
  useNotificationModulesManifest: () => manifestState,
  usePushDevices: () => devicesState,
  useUpdateNotificationSettings: () => ({
    mutate: updateSettingsMutate,
    isPending: false,
  }),
  useUpdateNotificationPreferences: () => ({
    mutate: updatePrefsMutate,
    isPending: false,
  }),
  useSendTestNotification: () => ({
    mutate: sendTestMutate,
    isPending: false,
  }),
  useRevokePushDevice: () => ({ mutate: revokeMutate, isPending: false }),
  useResolveNotification: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/features/notifications/hooks/use-push-subscription', () => ({
  usePushSubscription: () => ({
    permission: 'default',
    subscribing: false,
    subscribe: subscribePush,
  }),
}));

// Avoid pulling the real ModulePreferencesGrid (renders nothing relevant
// for these tests; we already cover its behavior in dedicated specs).
vi.mock(
  '@/features/notifications/components/preferences/module-preferences-grid',
  () => ({
    ModulePreferencesGrid: () => <div data-testid="module-prefs-grid-mock" />,
  })
);

import { NotificationsTab } from '@/app/(dashboard)/(user)/profile/_components/notifications-tab';

afterEach(() => {
  updateSettingsMutate.mockClear();
  updatePrefsMutate.mockClear();
  sendTestMutate.mockClear();
  revokeMutate.mockClear();
  subscribePush.mockClear();
  permsState = { canRead: true, canModify: true, canManageDevices: true };
});

describe('NotificationsTab — RBAC gating', () => {
  it('shows the access denied card when canRead is false', () => {
    permsState = { canRead: false, canModify: false, canManageDevices: false };
    render(<NotificationsTab />);
    expect(
      screen.getByText(/Você não tem permissão para visualizar preferências/i)
    ).toBeInTheDocument();
  });

  it('renders the tab when canRead is true', () => {
    render(<NotificationsTab />);
    expect(screen.getByText('Gerais')).toBeInTheDocument();
    expect(screen.getByText('Canais')).toBeInTheDocument();
    expect(screen.getByText('Por módulo')).toBeInTheDocument();
  });
});

describe('NotificationsTab — persistence', () => {
  it('toggling Do Not Disturb calls updateSettings.mutate with doNotDisturb', () => {
    render(<NotificationsTab />);
    const switches = document.querySelectorAll('button[role="switch"]');
    expect(switches.length).toBeGreaterThan(0);
    // First switch in the DOM is the Do Not Disturb toggle (Gerais card,
    // first row).
    fireEvent.click(switches[0]);
    expect(updateSettingsMutate).toHaveBeenCalledWith(
      expect.objectContaining({ doNotDisturb: expect.any(Boolean) })
    );
  });

  it('clicking "Enviar notificações de teste" triggers sendTest.mutate', () => {
    render(<NotificationsTab />);
    fireEvent.click(
      screen.getByRole('button', { name: /enviar notificações de teste/i })
    );
    expect(sendTestMutate).toHaveBeenCalledTimes(1);
  });

  it('renders the push devices card when canManageDevices and devices exist', () => {
    devicesState = {
      data: {
        devices: [
          {
            id: 'd-1',
            deviceName: 'Chrome MacOS',
            userAgent: 'Mozilla...',
            lastSeenAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
    };
    render(<NotificationsTab />);
    expect(screen.getByText(/Dispositivos com push/i)).toBeInTheDocument();
    expect(screen.getByText('Chrome MacOS')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: /Remover dispositivo/i })
    );
    expect(revokeMutate).toHaveBeenCalledWith('d-1');
    devicesState = { data: { devices: [] } };
  });

  it('hides the push devices card when canManageDevices is false', () => {
    permsState = { canRead: true, canModify: true, canManageDevices: false };
    devicesState = {
      data: {
        devices: [
          {
            id: 'd-1',
            deviceName: 'Chrome',
            userAgent: 'ua',
            lastSeenAt: null,
            createdAt: new Date().toISOString(),
          },
        ],
      },
    };
    render(<NotificationsTab />);
    expect(
      screen.queryByText(/Dispositivos com push/i)
    ).not.toBeInTheDocument();
    devicesState = { data: { devices: [] } };
  });

  it('disables the master channel switches when canModify is false', () => {
    permsState = { canRead: true, canModify: false, canManageDevices: false };
    render(<NotificationsTab />);
    const switches = document.querySelectorAll('button[role="switch"]');
    // Every switch in the document should be disabled.
    expect(switches.length).toBeGreaterThan(0);
    switches.forEach(s =>
      expect(s.getAttribute('data-disabled')).not.toBeNull()
    );
  });

  it('shows the loading skeletons while any of the hooks is loading', () => {
    settingsState = { isLoading: true, data: undefined };
    const { container } = render(<NotificationsTab />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
    settingsState = {
      isLoading: false,
      data: {
        doNotDisturb: false,
        dndStart: null,
        dndEnd: null,
        timezone: 'America/Sao_Paulo',
        digestSchedule: null,
        soundEnabled: true,
        masterInApp: true,
        masterEmail: true,
        masterPush: false,
        masterSms: false,
        masterWhatsapp: false,
      },
    };
  });
});
