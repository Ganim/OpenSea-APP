/**
 * Behavior tests for `usePwaStandaloneDetect`.
 *
 * Returns `{ isStandalone }` — true when the page runs without browser
 * chrome (installed PWA). Reactive: subscribes to the `(display-mode:
 * standalone)` MediaQueryList so the value updates when the user installs
 * or uninstalls the PWA mid-session.
 *
 * @vitest-environment happy-dom
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { usePwaStandaloneDetect } from './use-pwa-standalone-detect';

type ChangeHandler = (event: { matches: boolean }) => void;

interface FakeMediaQueryList {
  matches: boolean;
  media: string;
  onchange: null;
  addEventListener: (type: string, handler: ChangeHandler) => void;
  removeEventListener: (type: string, handler: ChangeHandler) => void;
  addListener: () => void;
  removeListener: () => void;
  dispatchEvent: () => boolean;
  __triggerChange: (matches: boolean) => void;
}

let installedHandlers: ChangeHandler[] = [];

function installFakeMatchMedia(initialMatches: boolean): FakeMediaQueryList {
  installedHandlers = [];
  const mql: FakeMediaQueryList = {
    matches: initialMatches,
    media: '(display-mode: standalone)',
    onchange: null,
    addEventListener: (_type, handler) => {
      installedHandlers.push(handler);
    },
    removeEventListener: (_type, handler) => {
      installedHandlers = installedHandlers.filter(h => h !== handler);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    __triggerChange(matches: boolean) {
      this.matches = matches;
      installedHandlers.forEach(h => h({ matches }));
    },
  };
  window.matchMedia = (() => mql) as unknown as typeof window.matchMedia;
  return mql;
}

afterEach(() => {
  installedHandlers = [];
  Object.defineProperty(navigator, 'standalone', {
    value: undefined,
    configurable: true,
  });
});

describe('usePwaStandaloneDetect', () => {
  it('returns isStandalone=true when matchMedia matches at mount', () => {
    installFakeMatchMedia(true);
    const { result } = renderHook(() => usePwaStandaloneDetect());
    expect(result.current.isStandalone).toBe(true);
  });

  it('returns isStandalone=false when matchMedia does not match', () => {
    installFakeMatchMedia(false);
    const { result } = renderHook(() => usePwaStandaloneDetect());
    expect(result.current.isStandalone).toBe(false);
  });

  it('reacts to MediaQueryList "change" events', () => {
    const mql = installFakeMatchMedia(false);
    const { result } = renderHook(() => usePwaStandaloneDetect());
    expect(result.current.isStandalone).toBe(false);
    act(() => {
      mql.__triggerChange(true);
    });
    expect(result.current.isStandalone).toBe(true);
  });

  it('detects iOS standalone mode via navigator.standalone', () => {
    installFakeMatchMedia(false);
    Object.defineProperty(navigator, 'standalone', {
      value: true,
      configurable: true,
    });
    const { result } = renderHook(() => usePwaStandaloneDetect());
    expect(result.current.isStandalone).toBe(true);
  });
});
