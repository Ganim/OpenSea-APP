/**
 * OpenSea OS - Absences Query Keys (HR)
 *
 * Chaves de query centralizadas para o módulo de Ausências.
 */

import type { AbsenceType, AbsenceStatus } from '@/types/hr';

/* ===========================================
   FILTER TYPES
   =========================================== */

export interface AbsenceFilters {
  /** ID do funcionário */
  employeeId?: string;
  /** Tipo da ausência */
  type?: AbsenceType;
  /** Status da ausência */
  status?: AbsenceStatus;
  /** Data inicial do período */
  startDate?: string;
  /** Data final do período */
  endDate?: string;
  /** Número da página (1-indexed) */
  page?: number;
  /** Itens por página */
  perPage?: number;
}

/* ===========================================
   QUERY KEYS
   =========================================== */

export const absenceKeys = {
  all: ['absences'] as const,

  lists: () => [...absenceKeys.all, 'list'] as const,

  list: (filters?: AbsenceFilters) =>
    [...absenceKeys.lists(), filters ?? {}] as const,

  details: () => [...absenceKeys.all, 'detail'] as const,

  detail: (id: string) => [...absenceKeys.details(), id] as const,
} as const;

/* ===========================================
   TYPE EXPORTS
   =========================================== */

type AbsenceKeyFunctions = {
  [K in keyof typeof absenceKeys]: (typeof absenceKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof absenceKeys)[K];
};

export type AbsenceQueryKey = AbsenceKeyFunctions[keyof AbsenceKeyFunctions];

export default absenceKeys;
