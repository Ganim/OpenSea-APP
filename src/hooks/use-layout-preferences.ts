'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

const ULTRAWIDE_KEY = 'opensea:ultrawide';
const LAYOUT_CHANGE_EVENT = 'opensea:layout-change';

function getUltrawideSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ULTRAWIDE_KEY) === 'true';
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(LAYOUT_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(LAYOUT_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function useUltrawide() {
  const isUltrawide = useSyncExternalStore(
    subscribe,
    getUltrawideSnapshot,
    getServerSnapshot
  );

  const toggleUltrawide = useCallback(() => {
    const next = !getUltrawideSnapshot();
    localStorage.setItem(ULTRAWIDE_KEY, String(next));
    window.dispatchEvent(new Event(LAYOUT_CHANGE_EVENT));
  }, []);

  return { isUltrawide, toggleUltrawide };
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Browser may block fullscreen if not triggered by user gesture
    }
  }, []);

  return { isFullscreen, toggleFullscreen };
}
