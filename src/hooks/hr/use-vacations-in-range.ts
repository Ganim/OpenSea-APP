'use client';

/**
 * OpenSea OS - useVacationsInRange (HR)
 *
 * Hook para carregar todos os períodos de férias agendados/em andamento
 * que tocam um intervalo de datas (típico de uma view de calendário).
 *
 * Estratégia:
 * - Busca via vacationsService.list em modo paginado.
 * - Acumula todas as páginas (até maxPages) e filtra por interseção
 *   client-side com base em scheduledStart/scheduledEnd.
 *
 * O backend hoje não expõe filtros nativos por janela de datas, então
 * o filtro local é necessário. Quando o endpoint suportar `windowStart`
 * / `windowEnd`, a função queryFn deve passar a delegar isso ao servidor.
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { vacationsService } from '@/services/hr/vacations.service';
import type { VacationPeriod, VacationStatus } from '@/types/hr';

/* ===========================================
   TYPES
   =========================================== */

export interface UseVacationsInRangeParams {
  /** Início do intervalo (inclusivo). */
  rangeStart: Date;
  /** Fim do intervalo (inclusivo). */
  rangeEnd: Date;
  /** Filtro opcional por funcionário. */
  employeeId?: string;
  /** Status considerados ativos para o calendário. */
  statuses?: VacationStatus[];
  /** Número máximo de páginas a buscar. */
  maxPages?: number;
  /** Tamanho da página (default 100). */
  perPage?: number;
  /** Habilita/desabilita o fetch. */
  enabled?: boolean;
}

export interface UseVacationsInRangeResult {
  vacations: VacationPeriod[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/* ===========================================
   HELPERS
   =========================================== */

const DEFAULT_STATUSES: VacationStatus[] = [
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
];

function vacationIntersectsRange(
  vacation: VacationPeriod,
  rangeStart: Date,
  rangeEnd: Date
): boolean {
  if (!vacation.scheduledStart || !vacation.scheduledEnd) return false;
  const start = new Date(vacation.scheduledStart).getTime();
  const end = new Date(vacation.scheduledEnd).getTime();
  return end >= rangeStart.getTime() && start <= rangeEnd.getTime();
}

/* ===========================================
   HOOK
   =========================================== */

export function useVacationsInRange(
  params: UseVacationsInRangeParams
): UseVacationsInRangeResult {
  const {
    rangeStart,
    rangeEnd,
    employeeId,
    statuses = DEFAULT_STATUSES,
    maxPages = 5,
    perPage = 100,
    enabled = true,
  } = params;

  const rangeStartIso = rangeStart.toISOString().slice(0, 10);
  const rangeEndIso = rangeEnd.toISOString().slice(0, 10);

  const query = useQuery({
    queryKey: [
      'vacations',
      'in-range',
      { rangeStartIso, rangeEndIso, employeeId, statuses, perPage },
    ] as const,
    queryFn: async () => {
      const collected: VacationPeriod[] = [];

      for (const status of statuses) {
        for (let page = 1; page <= maxPages; page += 1) {
          const response = await vacationsService.list({
            page,
            perPage,
            status,
            employeeId,
          });

          collected.push(...(response.vacationPeriods ?? []));

          const totalPages = response.meta?.totalPages ?? 1;
          if (page >= totalPages) break;
        }
      }

      return collected;
    },
    enabled,
    staleTime: 60_000,
  });

  const vacations = useMemo(() => {
    if (!query.data) return [];
    const seen = new Set<string>();
    const filtered: VacationPeriod[] = [];
    for (const vacation of query.data) {
      if (seen.has(vacation.id)) continue;
      if (!vacationIntersectsRange(vacation, rangeStart, rangeEnd)) continue;
      seen.add(vacation.id);
      filtered.push(vacation);
    }
    return filtered;
  }, [query.data, rangeStart, rangeEnd]);

  return {
    vacations,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
