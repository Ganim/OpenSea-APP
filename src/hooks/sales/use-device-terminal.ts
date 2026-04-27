'use client';

import { usePathname } from 'next/navigation';
import { useMyDevice } from './use-pos';

const DEVICE_TOKEN_KEY = 'pos_device_token';

/**
 * Hook que encapsula todo o estado do device PDV.
 * Lê o token do localStorage e busca o estado completo do terminal pareado.
 *
 * Escopo: pareamento POS é uma preocupação do modo POS (Emporion ou rotas
 * /sales/pos/*). Em qualquer outra rota do ERP a query de /v1/pos/devices/me
 * fica desabilitada — um pos_device_token obsoleto no localStorage estava
 * disparando 401 → refresh JWT → logout em cascata em telas administrativas.
 */
export function useDeviceTerminal() {
  const pathname = usePathname();
  const isPosContext = pathname?.startsWith('/sales/pos') ?? false;

  const hasToken =
    typeof window !== 'undefined' &&
    !!window.localStorage.getItem(DEVICE_TOKEN_KEY);

  const { data, isLoading, error, refetch } = useMyDevice({
    enabled: isPosContext,
  });

  const terminal = data?.terminal ?? null;
  const currentSession = data?.currentSession ?? null;
  const isPaired = hasToken && !!terminal;
  const requiresSession = terminal?.requiresSession ?? false;

  return {
    isPaired,
    terminal,
    currentSession,
    isLoading: hasToken && isLoading,
    error,
    refetch,
    needsPairing: !hasToken,
    needsSession: isPaired && requiresSession && !currentSession,
    isReady: isPaired && (!requiresSession || !!currentSession),
    mode: terminal?.mode ?? null,
  };
}

export function clearDeviceToken() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(DEVICE_TOKEN_KEY);
  }
}
