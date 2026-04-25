/**
 * Behavior tests for iOS / standalone PWA detection helpers.
 *
 * These helpers are the gating logic for `PWAInstallBanner` (which path to
 * trigger: native `beforeinstallprompt` vs iOS A2HS modal) and for
 * `useIosWebPushSupport` (iOS 16.4+ requires standalone PWA install before
 * Web Push APIs become available — Apple Webkit blog Mar 2023).
 *
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it } from 'vitest';

import {
  getIOSVersion,
  isIOS,
  isStandalonePWA,
  supportsIOSWebPush,
} from './ios-detection';

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1';

const IPAD_UA =
  'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';

const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36';

const DESKTOP_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36';

function setUserAgent(ua: string): void {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    configurable: true,
  });
}

function setStandalone(value: boolean | undefined): void {
  Object.defineProperty(navigator, 'standalone', {
    value,
    configurable: true,
  });
}

function setMatchMediaMatches(matches: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('standalone') ? matches : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  setUserAgent(DESKTOP_UA);
  setStandalone(undefined);
  setMatchMediaMatches(false);
});

describe('isIOS', () => {
  it('returns true for iPhone user agent', () => {
    setUserAgent(IPHONE_UA);
    expect(isIOS()).toBe(true);
  });

  it('returns true for iPad user agent', () => {
    setUserAgent(IPAD_UA);
    expect(isIOS()).toBe(true);
  });

  it('returns false for Android user agent', () => {
    setUserAgent(ANDROID_UA);
    expect(isIOS()).toBe(false);
  });

  it('returns false for desktop Linux/Chrome', () => {
    setUserAgent(DESKTOP_UA);
    expect(isIOS()).toBe(false);
  });
});

describe('getIOSVersion', () => {
  it('parses iPhone UA "OS 16_4 like Mac OS X" into { major: 16, minor: 4 }', () => {
    setUserAgent(IPHONE_UA);
    expect(getIOSVersion()).toEqual({ major: 16, minor: 4 });
  });

  it('parses iPad UA "OS 17_2 like Mac OS X" into { major: 17, minor: 2 }', () => {
    setUserAgent(IPAD_UA);
    expect(getIOSVersion()).toEqual({ major: 17, minor: 2 });
  });

  it('returns null for non-iOS user agents', () => {
    setUserAgent(ANDROID_UA);
    expect(getIOSVersion()).toBeNull();
  });
});

describe('isStandalonePWA', () => {
  it('returns true when navigator.standalone === true (iOS)', () => {
    setStandalone(true);
    setMatchMediaMatches(false);
    expect(isStandalonePWA()).toBe(true);
  });

  it('returns true when matchMedia "(display-mode: standalone)" matches (Android/Desktop)', () => {
    setStandalone(undefined);
    setMatchMediaMatches(true);
    expect(isStandalonePWA()).toBe(true);
  });

  it('returns false when neither is set', () => {
    setStandalone(undefined);
    setMatchMediaMatches(false);
    expect(isStandalonePWA()).toBe(false);
  });
});

describe('supportsIOSWebPush', () => {
  it('returns true on non-iOS browsers (assumes capable)', () => {
    setUserAgent(ANDROID_UA);
    expect(supportsIOSWebPush()).toBe(true);
  });

  it('returns false on iOS < 16.4', () => {
    const ua = IPHONE_UA.replace('OS 16_4', 'OS 16_3');
    setUserAgent(ua);
    setStandalone(true);
    expect(supportsIOSWebPush()).toBe(false);
  });

  it('returns true on iOS 16.4+ when running as standalone PWA', () => {
    setUserAgent(IPHONE_UA);
    setStandalone(true);
    expect(supportsIOSWebPush()).toBe(true);
  });

  it('returns false on iOS 16.4+ when NOT running as standalone PWA', () => {
    setUserAgent(IPHONE_UA);
    setStandalone(false);
    setMatchMediaMatches(false);
    expect(supportsIOSWebPush()).toBe(false);
  });
});
