/**
 * Behavior tests for `usePwaInstall`.
 *
 * The hook deferrs the browser-fired `beforeinstallprompt` event so the UI
 * can present its own "Install" CTA (Android Chrome / Desktop). Calling
 * `install()` triggers the deferred prompt and resolves with the user's
 * choice. iOS Safari does NOT fire this event — callers must fall back to
 * the A2HS modal (handled by `PWAInstallBanner`).
 *
 * @vitest-environment happy-dom
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __resetPwaInstallStateForTests,
  usePwaInstall,
} from './use-pwa-install';

interface FakePromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function makePromptEvent(outcome: 'accepted' | 'dismissed'): FakePromptEvent {
  const event = new Event('beforeinstallprompt') as FakePromptEvent;
  event.prompt = vi.fn(() => Promise.resolve());
  event.userChoice = Promise.resolve({ outcome });
  return event;
}

describe('usePwaInstall', () => {
  beforeEach(() => {
    __resetPwaInstallStateForTests();
  });

  it('starts with isInstallable=false', () => {
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.isInstallable).toBe(false);
  });

  it('flips isInstallable to true when beforeinstallprompt fires', () => {
    const { result } = renderHook(() => usePwaInstall());
    act(() => {
      window.dispatchEvent(makePromptEvent('accepted'));
    });
    expect(result.current.isInstallable).toBe(true);
  });

  it('install() returns the user outcome and resets the deferred prompt', async () => {
    const { result } = renderHook(() => usePwaInstall());
    const event = makePromptEvent('accepted');
    act(() => {
      window.dispatchEvent(event);
    });
    expect(result.current.isInstallable).toBe(true);

    let outcome: 'accepted' | 'dismissed' | null = null;
    await act(async () => {
      outcome = await result.current.install();
    });
    expect(outcome).toBe('accepted');
    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(result.current.isInstallable).toBe(false);
  });

  it('install() returns null when no deferred prompt is available', async () => {
    const { result } = renderHook(() => usePwaInstall());
    let outcome: 'accepted' | 'dismissed' | null = 'sentinel' as never;
    await act(async () => {
      outcome = await result.current.install();
    });
    expect(outcome).toBeNull();
  });
});
