/**
 * Print Queue Storage Utilities
 * Funções para persistência da fila no LocalStorage
 */

import {
  DEFAULT_PAGE_SETTINGS,
  DEFAULT_TEMPLATE_ID,
  PRINT_QUEUE_STORAGE_KEY,
} from '../constants';
import type { PrintQueueItem, PrintQueueState } from '../types';

/**
 * Estado padrão da fila de impressão
 */
export const DEFAULT_PRINT_QUEUE_STATE: PrintQueueState = {
  items: [],
  selectedTemplateId: DEFAULT_TEMPLATE_ID,
  pageSettings: DEFAULT_PAGE_SETTINGS,
  updatedAt: new Date(),
};

/**
 * Verifica se está no ambiente do navegador
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Serializa o estado para JSON
 */
function serializeState(state: PrintQueueState): string {
  return JSON.stringify({
    ...state,
    items: state.items.map(item => ({
      ...item,
      addedAt: item.addedAt.toISOString(),
    })),
    updatedAt: state.updatedAt.toISOString(),
  });
}

/**
 * Deserializa o estado do JSON
 */
function deserializeState(json: string): PrintQueueState {
  const parsed = JSON.parse(json);

  return {
    ...parsed,
    items: (parsed.items || []).map(
      (item: PrintQueueItem & { addedAt: string }) => ({
        ...item,
        addedAt: new Date(item.addedAt),
      })
    ),
    updatedAt: new Date(parsed.updatedAt),
    pageSettings: {
      ...DEFAULT_PAGE_SETTINGS,
      ...parsed.pageSettings,
    },
  };
}

/**
 * Carrega o estado do LocalStorage
 */
export function loadFromStorage(): PrintQueueState {
  if (!isBrowser()) {
    return DEFAULT_PRINT_QUEUE_STATE;
  }

  try {
    const stored = localStorage.getItem(PRINT_QUEUE_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PRINT_QUEUE_STATE;
    }

    return deserializeState(stored);
  } catch (error) {
    console.error('[PrintQueue] Erro ao carregar do localStorage:', error);
    return DEFAULT_PRINT_QUEUE_STATE;
  }
}

/**
 * Salva o estado no LocalStorage
 */
export function saveToStorage(state: PrintQueueState): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const serialized = serializeState(state);
    localStorage.setItem(PRINT_QUEUE_STORAGE_KEY, serialized);
  } catch (error) {
    console.error('[PrintQueue] Erro ao salvar no localStorage:', error);

    // Se o erro for de quota, tentar limpar itens antigos
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.code === 22)
    ) {
      console.warn(
        '[PrintQueue] Quota excedida, tentando limpar itens antigos...'
      );
      tryCleanupAndSave(state);
    }
  }
}

/**
 * Tenta limpar itens antigos e salvar novamente
 */
function tryCleanupAndSave(state: PrintQueueState): void {
  // Remove os itens mais antigos (metade)
  const halfLength = Math.floor(state.items.length / 2);
  const newItems = state.items.slice(-halfLength);

  const cleanedState: PrintQueueState = {
    ...state,
    items: newItems,
    updatedAt: new Date(),
  };

  try {
    const serialized = serializeState(cleanedState);
    localStorage.setItem(PRINT_QUEUE_STORAGE_KEY, serialized);
    console.info(
      `[PrintQueue] Removidos ${halfLength} itens antigos para liberar espaço`
    );
  } catch {
    // Se ainda falhar, limpar tudo
    console.error('[PrintQueue] Não foi possível salvar, limpando toda a fila');
    clearStorage();
  }
}

/**
 * Limpa o estado do LocalStorage
 */
export function clearStorage(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(PRINT_QUEUE_STORAGE_KEY);
  } catch (error) {
    console.error('[PrintQueue] Erro ao limpar localStorage:', error);
  }
}

/**
 * Verifica se há dados salvos
 */
export function hasStoredData(): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    return localStorage.getItem(PRINT_QUEUE_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
