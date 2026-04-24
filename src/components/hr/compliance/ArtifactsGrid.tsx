'use client';

/**
 * OpenSea OS - ArtifactsGrid (Phase 06 / Plan 06-06)
 *
 * Lista os artefatos de compliance filtrando por tipo (AFD / AFDT /
 * FOLHA_ESPELHO / RECIBO / S1200_XML) com:
 *   - Infinite scroll (CLAUDE.md APP §1)
 *   - Filters inside grid via toolbar (CLAUDE.md APP §3)
 *   - Zero silent fallback (CLAUDE.md APP §2)
 *   - Skeleton + Empty + Error states (UI quality bar)
 *   - Calendar DateRangePicker (nunca <input type="date">)
 *   - Download button permission-gated em hr.compliance.artifact.download
 */

import { useMemo, useRef, useCallback } from 'react';
import { Download, FileText, CalendarDays, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { PermissionGate } from '@/components/auth/permission-gate';
import { GridError } from '@/components/handlers/grid-error';
import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { useComplianceArtifacts } from '@/hooks/hr/use-compliance-artifacts';
import { useDownloadArtifact } from '@/hooks/hr/use-download-artifact';
import type {
  ComplianceArtifactDto,
  ComplianceArtifactType,
  ListComplianceArtifactsParams,
} from '@/types/hr';
import { toast } from 'sonner';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDateBR(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function describeArtifact(a: ComplianceArtifactDto): string {
  switch (a.type) {
    case 'AFD':
    case 'AFDT':
      if (a.periodStart && a.periodEnd) {
        return `Período ${formatDateBR(a.periodStart).split(' ')[0]} a ${formatDateBR(a.periodEnd).split(' ')[0]}`;
      }
      return 'Período completo';
    case 'FOLHA_ESPELHO': {
      const comp = a.competencia ?? 'Sem competência';
      const empId = (a.filters?.employeeId as string | undefined) ?? '';
      return empId
        ? `Competência ${comp} · funcionário ${empId.slice(0, 8)}…`
        : `Competência ${comp}`;
    }
    case 'RECIBO':
      return a.competencia ?? 'Recibo de ponto';
    case 'S1200_XML':
      return `Competência ${a.competencia ?? '—'} (eSocial S-1200)`;
    default:
      return '';
  }
}

function typeLabel(type: ComplianceArtifactType): string {
  switch (type) {
    case 'AFD':
      return 'AFD';
    case 'AFDT':
      return 'AFDT';
    case 'FOLHA_ESPELHO':
      return 'Folha Espelho';
    case 'RECIBO':
      return 'Recibo';
    case 'S1200_XML':
      return 'S-1200';
  }
}

export interface ArtifactsGridProps {
  type: ComplianceArtifactType;
}

function ArtifactsGridSkeleton() {
  return (
    <div className="space-y-3" data-testid="artifacts-grid-loading">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card
          key={i}
          className="border-border bg-white p-4 dark:bg-slate-800/60"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyArtifacts({ type }: { type: ComplianceArtifactType }) {
  const cta = useMemo(() => {
    switch (type) {
      case 'AFD':
        return 'Clique em "Gerar AFD" acima para criar o primeiro arquivo oficial do período.';
      case 'AFDT':
        return 'Clique em "Gerar AFDT" acima para criar um arquivo de conferência interna.';
      case 'FOLHA_ESPELHO':
        return 'Clique em "Folha Espelho" acima para gerar a folha de um funcionário ou de um departamento inteiro.';
      case 'RECIBO':
        return 'Os recibos são gerados automaticamente após cada batida aprovada — não há ação manual aqui.';
      case 'S1200_XML':
        return 'Clique em "eSocial S-1200" acima para montar os eventos de remuneração da competência.';
    }
  }, [type]);
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-white/50 p-12 text-center dark:bg-slate-800/30"
      data-testid="artifacts-grid-empty"
    >
      <FileText className="h-12 w-12 text-muted-foreground/40" />
      <h3 className="text-base font-medium">
        Nenhum artefato {typeLabel(type)} gerado ainda
      </h3>
      <p className="max-w-md text-sm text-muted-foreground">{cta}</p>
    </div>
  );
}

export function ArtifactsGrid({ type }: ArtifactsGridProps) {
  const [filters, setFilters] = useFiltersState(type);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useComplianceArtifacts(filters);

  const download = useDownloadArtifact();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Intersection observer para infinite scroll.
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useIntersectionObserver(sentinelRef, handleIntersection);

  const items = useMemo(() => data?.pages.flatMap(p => p.items) ?? [], [data]);

  const handleDownload = async (artifactId: string) => {
    try {
      await download.mutateAsync(artifactId);
      toast.success('Abrindo artefato em nova aba…');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao baixar';
      toast.error(msg);
    }
  };

  const toolbar = (
    <div
      className="flex flex-wrap items-center gap-2 pb-3"
      data-testid="artifacts-grid-toolbar"
    >
      <Input
        placeholder="Buscar por período ou ID de funcionário"
        value={filters.search ?? ''}
        onChange={e => setFilters({ ...filters, search: e.target.value })}
        className="max-w-xs"
        data-testid="artifacts-grid-search"
      />
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">De:</span>
        <DatePicker
          value={filters.periodStart}
          onChange={value =>
            setFilters({
              ...filters,
              periodStart: typeof value === 'string' ? value : undefined,
            })
          }
          placeholder="Início"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Até:</span>
        <DatePicker
          value={filters.periodEnd}
          onChange={value =>
            setFilters({
              ...filters,
              periodEnd: typeof value === 'string' ? value : undefined,
            })
          }
          placeholder="Fim"
        />
      </div>
      {(type === 'FOLHA_ESPELHO' ||
        type === 'RECIBO' ||
        type === 'S1200_XML') && (
        <Input
          placeholder="Competência (AAAA-MM)"
          value={filters.competencia ?? ''}
          onChange={e =>
            setFilters({
              ...filters,
              competencia: e.target.value || undefined,
            })
          }
          className="max-w-[160px]"
          pattern="\d{4}-\d{2}"
        />
      )}
      {(filters.search ||
        filters.periodStart ||
        filters.periodEnd ||
        filters.competencia) && (
        <Button variant="ghost" size="sm" onClick={() => setFilters({ type })}>
          Limpar filtros
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div>
        {toolbar}
        <ArtifactsGridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {toolbar}
        <GridError
          type="server"
          title="Erro ao carregar artefatos"
          message={
            error instanceof Error
              ? error.message
              : 'Erro ao carregar artefatos'
          }
          action={{
            label: 'Tentar novamente',
            onClick: () => {
              void refetch();
            },
          }}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        {toolbar}
        <EmptyArtifacts type={type} />
      </div>
    );
  }

  return (
    <div>
      {toolbar}
      <div className="space-y-2" data-testid="artifacts-grid-list">
        {items.map(artifact => (
          <Card
            key={artifact.id}
            className="flex items-center justify-between border-border bg-white p-4 transition-colors hover:bg-slate-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800"
            data-testid={`artifact-row-${artifact.id}`}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <p className="truncate text-sm font-medium">
                  {describeArtifact(artifact)}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  Gerado em {formatDateBR(artifact.generatedAt)}
                </span>
                <span>· {formatBytes(artifact.sizeBytes)}</span>
                <span className="font-mono text-[10px]">
                  · hash {artifact.contentHash.slice(0, 10)}…
                </span>
              </div>
            </div>
            <PermissionGate
              permission={HR_PERMISSIONS.COMPLIANCE.ARTIFACT_DOWNLOAD}
            >
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(artifact.id)}
                disabled={download.isPending}
                data-testid={`artifact-download-${artifact.id}`}
              >
                {download.isPending && download.variables === artifact.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Baixar
              </Button>
            </PermissionGate>
          </Card>
        ))}
        <div ref={sentinelRef} className="h-6" aria-hidden />
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* helpers                                                                    */
/* -------------------------------------------------------------------------- */

import { useEffect, useState } from 'react';

function useFiltersState(
  type: ComplianceArtifactType
): [
  ListComplianceArtifactsParams,
  (next: ListComplianceArtifactsParams) => void,
] {
  const [filters, setFilters] = useState<ListComplianceArtifactsParams>({
    type,
  });

  // Reset completo quando a tab muda de tipo.
  useEffect(() => {
    setFilters({ type });
  }, [type]);

  return [filters, setFilters];
}

function useIntersectionObserver(
  ref: React.RefObject<HTMLElement | null>,
  callback: (entries: IntersectionObserverEntry[]) => void
) {
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(callback, {
      rootMargin: '120px',
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, callback]);
}
