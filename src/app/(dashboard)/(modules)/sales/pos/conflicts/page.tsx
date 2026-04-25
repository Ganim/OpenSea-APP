'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { GridError } from '@/components/handlers/grid-error';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { usePosConflictsInfinite } from '@/hooks/sales/use-pos-conflicts';
import type { PosOrderConflictStatus } from '@/types/sales';
import { ConflictCard } from './_components/conflict-card';
import { ConflictDetailsPanel } from './_components/conflict-details-panel';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<{ value: PosOrderConflictStatus; label: string }> =
  [
    { value: 'PENDING_RESOLUTION', label: 'Pendente' },
    { value: 'AUTO_SUBSTITUTED', label: 'Substituição automática' },
    { value: 'AUTO_ADJUSTED', label: 'Ajuste automático' },
    { value: 'CANCELED_REFUNDED', label: 'Cancelado com estorno' },
    { value: 'FORCED_ADJUSTMENT', label: 'Ajuste manual forçado' },
    { value: 'ITEM_SUBSTITUTED_MANUAL', label: 'Substituição manual' },
    { value: 'EXPIRED', label: 'Expirado' },
  ];

export default function ConflictsPage() {
  const [statusFilter, setStatusFilter] = useState<PosOrderConflictStatus[]>([
    'PENDING_RESOLUTION',
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosConflictsInfinite({
    limit: PAGE_SIZE,
    status: statusFilter.length > 0 ? statusFilter : undefined,
  });

  const items = useMemo(
    () => data?.pages.flatMap(p => p.data) ?? [],
    [data?.pages]
  );
  const total = data?.pages[0]?.meta.total ?? 0;

  // IntersectionObserver-based auto-load for the next page when the sentinel
  // enters the viewport.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const filterOptions = useMemo(
    () => STATUS_OPTIONS.map(o => ({ id: o.value, label: o.label })),
    []
  );

  const breadcrumbItems = [
    { label: 'Vendas', href: '/sales' },
    { label: 'PDV', href: '/sales/pos' },
    { label: 'Conflitos' },
  ];

  return (
    <PageLayout data-testid="pos-conflicts-page">
      <PageHeader>
        <PageActionBar breadcrumbItems={breadcrumbItems} />
      </PageHeader>
      <PageBody>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Conflitos de venda POS
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Conflitos surgem quando uma venda registrada no POS desktop não pode
            ser aplicada como informada no servidor (estoque insuficiente, regra
            de fração, item ausente). Resolva pendências o quanto antes para não
            atrasar o fechamento de caixa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Status"
            options={filterOptions}
            selected={statusFilter}
            onSelectionChange={ids => {
              setStatusFilter(ids as PosOrderConflictStatus[]);
            }}
            activeColor="violet"
          />
          <span className="text-sm text-muted-foreground">
            {total === 0
              ? 'Nenhum conflito encontrado'
              : `${total} ${total === 1 ? 'conflito' : 'conflitos'}`}
          </span>
        </div>

        {error ? (
          <GridError
            title="Erro ao carregar conflitos"
            message={
              error instanceof Error
                ? error.message
                : 'Não foi possível buscar os conflitos.'
            }
            action={{
              label: 'Tentar novamente',
              onClick: () => {
                void refetch();
              },
            }}
          />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div
            className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground"
            data-testid="conflicts-empty-state"
          >
            Nenhum conflito com os filtros selecionados.
          </div>
        ) : (
          <>
            <div className="space-y-3" data-testid="conflicts-list">
              {items.map(conflict => (
                <ConflictCard
                  key={conflict.id}
                  conflict={conflict}
                  onSelect={() => setSelectedId(conflict.id)}
                />
              ))}
            </div>

            <div ref={sentinelRef} aria-hidden className="h-1" />

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!hasNextPage && items.length > 0 && (
              <p
                className="py-4 text-center text-xs text-muted-foreground"
                data-testid="conflicts-end-of-list"
              >
                Fim da lista — {items.length} de {total} conflitos exibidos.
              </p>
            )}
          </>
        )}

        <ConflictDetailsPanel
          conflictId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      </PageBody>
    </PageLayout>
  );
}
