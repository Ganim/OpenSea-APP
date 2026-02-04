/**
 * Vitest Setup Configuration
 * Configuração global para testes
 */

import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

// Set NODE_ENV to development for tests
process.env.NODE_ENV = 'development';

/**
 * Mock do localStorage
 */
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

/**
 * Mock do sessionStorage
 */
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

/**
 * Mock do fetch global
 */
global.fetch = vi.fn();

/**
 * Cleanup após cada teste
 */
afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

/**
 * Supress warnings não críticos em testes
 */
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render')
  ) {
    return;
  }
  originalWarn(...args);
};
