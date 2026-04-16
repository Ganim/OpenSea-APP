'use client';

/**
 * OpenSea OS - useAbsencesInRange (HR)
 *
 * Hook para carregar todas as ausências (vacation, sick, parental, etc.)
 * que tocam um intervalo de datas. Usa diretamente os filtros nativos
 * `startDate` e `endDate` do endpoint /v1/hr/absences.
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { absencesService } from '@/services/hr/absences.service';
import type { Absence, AbsenceStatus, AbsenceType } from '@/types/hr';

/* ===========================================
   TYPES
   =========================================== */

export interface UseAbsencesInRangeParams {
  /** Início da janela visível. */
  rangeStart: Date;
  /** Fim da janela visível. */
  rangeEnd: Date;
  /** Filtra por funcionário específico. */
  employeeId?: string;
  /** Tipos de ausência a buscar (opcional). */
  types?: AbsenceType[];
  /** Status a buscar. */
  statuses?: AbsenceStatus[];
  /** Tamanho da página (default 100). */
  perPage?: number;
  /** Máximo de páginas por combinação status×type. */
  maxPages?: number;
  /** Habilita/desabilita o fetch. */
  enabled?: boolean;
}

export interface UseAbsencesInRangeResult {
  absences: Absence[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/* ===========================================
   HELPERS
   =========================================== */

const DEFAULT_STATUSES: AbsenceStatus[] = [
  'APPROVED',
  'IN_PROGRESS',
  'COMPLETED',
];

function toDateOnlyIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/* ===========================================
   HOOK
   =========================================== */

export function useAbsencesInRange(
  params: UseAbsencesInRangeParams
): UseAbsencesInRangeResult {
  const {
    rangeStart,
    rangeEnd,
    employeeId,
    types,
    statuses = DEFAULT_STATUSES,
    perPage = 100,
    maxPages = 5,
    enabled = true,
  } = params;

  const startIso = toDateOnlyIso(rangeStart);
  const endIso = toDateOnlyIso(rangeEnd);

  const typeKey = types?.slice().sort().join(',') ?? 'ALL';
  const statusKey = statuses.slice().sort().join(',');

  const query = useQuery({
    queryKey: [
      'absences',
      'in-range',
      { startIso, endIso, employeeId, typeKey, statusKey, perPage },
    ] as const,
    queryFn: async () => {
      const collected: Absence[] = [];
      const typesToQuery: (AbsenceType | undefined)[] = types?.length
        ? types
        : [undefined];

      for (const type of typesToQuery) {
        for (const status of statuses) {
          for (let page = 1; page <= maxPages; page += 1) {
            const response = await absencesService.list({
              page,
              perPage,
              status,
              type,
              employeeId,
              startDate: startIso,
              endDate: endIso,
            });

            collected.push(...(response.absences ?? []));

            const totalPages = response.meta?.totalPages ?? 1;
            if (page >= totalPages) break;
          }
        }
      }

      return collected;
    },
    enabled,
    staleTime: 60_000,
  });

  const absences = useMemo(() => {
    if (!query.data) return [];
    const seen = new Set<string>();
    const deduped: Absence[] = [];
    for (const absence of query.data) {
      if (seen.has(absence.id)) continue;
      seen.add(absence.id);
      deduped.push(absence);
    }
    return deduped;
  }, [query.data]);

  return {
    absences,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
