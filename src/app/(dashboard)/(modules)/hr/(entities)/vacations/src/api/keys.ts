/**
 * OpenSea OS - Vacations Query Keys (HR)
 *
 * Chaves de query centralizadas para o módulo de Férias.
 */

/* ===========================================
   FILTER TYPES
   =========================================== */

export interface VacationFilters {
  /** ID do funcionário */
  employeeId?: string;
  /** Status do período de férias */
  status?: string;
  /** Ano do período aquisitivo */
  year?: number;
  /** Número da página (1-indexed) */
  page?: number;
  /** Itens por página */
  perPage?: number;
}

/* ===========================================
   QUERY KEYS
   =========================================== */

export const vacationKeys = {
  all: ['vacations'] as const,

  lists: () => [...vacationKeys.all, 'list'] as const,

  list: (filters?: VacationFilters) =>
    [...vacationKeys.lists(), filters ?? {}] as const,

  details: () => [...vacationKeys.all, 'detail'] as const,

  detail: (id: string) => [...vacationKeys.details(), id] as const,

  balance: (employeeId: string) =>
    [...vacationKeys.all, 'balance', employeeId] as const,
} as const;

/* ===========================================
   TYPE EXPORTS
   =========================================== */

type VacationKeyFunctions = {
  [K in keyof typeof vacationKeys]: (typeof vacationKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof vacationKeys)[K];
};

export type VacationQueryKey = VacationKeyFunctions[keyof VacationKeyFunctions];

export default vacationKeys;
