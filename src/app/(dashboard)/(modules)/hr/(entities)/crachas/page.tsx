/**
 * OpenSea OS - /hr/crachas page
 *
 * Admin listing of every employee with badge emission / QR rotation surface.
 * Phase 5 plan 05-09 deliverable. Consumes backend plans 05-04 (listing +
 * rotation) + 05-06 (badge PDF).
 *
 * UX contract: UI-SPEC §Copywriting §/hr/crachas + §K6 (bulk rotation flow).
 * Copy verbatim; no improvisation.
 */

'use client';

import {
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { SearchBar } from '@/components/layout/search-bar';
import { Button } from '@/components/ui/button';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { usePermissions } from '@/hooks/use-permissions';
import { HR_PERMISSIONS } from '../../_shared/constants/hr-permissions';
import { useBadgesInfinite } from '@/app/(dashboard)/hr/crachas/queries';
import { useEnqueueBulkBadgePdfs } from '@/app/(dashboard)/hr/crachas/mutations';
import { BadgeRow } from '@/components/hr/crachas/BadgeRow';
import { BulkJobProgressDrawer } from '@/components/hr/crachas/BulkJobProgressDrawer';
import { RotateQrBulkDialog } from '@/components/hr/crachas/RotateQrBulkDialog';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { SelectionToolbar } from '@/core/components/selection-toolbar';
import type { CrachaRotationStatus } from '@/types/hr';
import { IdCard, Loader2, Printer, RefreshCw, Users } from 'lucide-react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

type RotationStatusFilter = CrachaRotationStatus | 'all';

function CrachasEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
      <Users className="w-16 h-16 text-muted-foreground/50" />
      <h2 className="text-xl font-semibold">Nenhum funcionário ativo</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Cadastre funcionários em{' '}
        <Link
          href="/hr/employees"
          className="text-primary font-medium hover:underline"
        >
          /hr/employees
        </Link>{' '}
        antes de emitir crachás.
      </p>
    </div>
  );
}

export default function CrachasPage() {
  return (
    <Suspense
      fallback={<GridLoading count={9} layout="list" size="md" gap="gap-4" />}
    >
      <CrachasPageContent />
    </Suspense>
  );
}

function CrachasPageContent() {
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();

  const canAccess = hasPermission(HR_PERMISSIONS.CRACHAS.ACCESS);
  const canPrint = hasPermission(HR_PERMISSIONS.CRACHAS.PRINT);
  const canRotate = hasPermission(HR_PERMISSIONS.PUNCH_PIN.ADMIN);
  // CLAUDE.md §6 — render-nothing when the viewer lacks access to this surface.
  // The sidebar link is already gated on hr.crachas.access so the user should
  // never land here without permission; this is a belt-and-braces check for
  // deep-links from another tab.

  // ------------------------------------------------------------------
  // Search + filter state (debounced via SearchBar)
  // ------------------------------------------------------------------
  const [search, setSearch] = useState('');
  const [rotationStatus, setRotationStatus] =
    useState<RotationStatusFilter>('all');

  // ------------------------------------------------------------------
  // Selection state
  // ------------------------------------------------------------------
  const [selection, setSelection] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((employeeId: string) => {
    setSelection(prev => {
      const next = new Set(prev);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelection(new Set()), []);

  // ------------------------------------------------------------------
  // Bulk dialogs / drawer state
  // ------------------------------------------------------------------
  const [bulkRotateOpen, setBulkRotateOpen] = useState(false);
  const [bulkPdfPinOpen, setBulkPdfPinOpen] = useState(false);
  const [progressJob, setProgressJob] = useState<{
    jobId: string;
    total: number;
    generatePdfs: boolean;
  } | null>(null);

  // ------------------------------------------------------------------
  // Data fetching — infinite scroll
  // ------------------------------------------------------------------
  const {
    data: infiniteData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useBadgesInfinite({ search, rotationStatus, pageSize: 50 });

  const rows = useMemo(
    () => infiniteData?.pages.flatMap(page => page.items) ?? [],
    [infiniteData]
  );
  const totalRows = infiniteData?.pages[0]?.total ?? 0;

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ------------------------------------------------------------------
  // Bulk PDF enqueue (via header CTA OR selection toolbar)
  // ------------------------------------------------------------------
  const enqueueBulkPdfs = useEnqueueBulkBadgePdfs();

  const submitBulkPdfs = useCallback(async () => {
    const selectedIds = Array.from(selection);
    try {
      const result = await enqueueBulkPdfs.mutateAsync(
        selectedIds.length > 0
          ? { scope: 'CUSTOM', employeeIds: selectedIds }
          : { scope: 'ALL' }
      );
      if (result.jobId !== null) {
        setProgressJob({
          jobId: result.jobId,
          total: result.total,
          generatePdfs: true, // this action generates PDFs by definition
        });
        clearSelection();
      }
    } catch {
      // mutation helper toasts; keep UX state intact
    }
  }, [selection, enqueueBulkPdfs, clearSelection]);

  // ------------------------------------------------------------------
  // Permission short-circuit
  // ------------------------------------------------------------------
  if (!canAccess) {
    return (
      <PageLayout>
        <PageBody>
          <GridError
            type="forbidden"
            title="Sem permissão"
            message="Você não tem permissão para acessar a gestão de crachás."
          />
        </PageBody>
      </PageLayout>
    );
  }

  const selectedIds = Array.from(selection);
  const hasSelection = selectedIds.length > 0;

  const headerButtons = canPrint
    ? [
        {
          id: 'emit-bulk',
          title: 'Emitir em lote',
          icon: Printer,
          onClick: () => setBulkPdfPinOpen(true),
          variant: 'default' as const,
        },
      ]
    : [];

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Crachás', href: '/hr/crachas' },
          ]}
          buttons={headerButtons}
        />

        <Header
          title="Crachás"
          description="Gerencie QR codes e emita crachás para impressão."
        />
      </PageHeader>

      <PageBody>
        <div data-testid="crachas-page" className="contents" />

        <div data-testid="crachas-search" className="flex items-center gap-3">
          <div className="flex-1">
            <SearchBar
              placeholder="Buscar por nome ou matrícula..."
              value={search}
              onSearch={setSearch}
              showClear
              size="md"
            />
          </div>
          <FilterDropdown
            label="Status do QR"
            icon={IdCard}
            options={[
              { id: 'active', label: 'Crachá ativo' },
              { id: 'recent', label: 'Rotacionado recentemente' },
              { id: 'never', label: 'Nunca emitido' },
            ]}
            selected={rotationStatus === 'all' ? [] : [rotationStatus]}
            onSelectionChange={ids => {
              const first = ids[0];
              if (!first) {
                setRotationStatus('all');
              } else if (
                first === 'active' ||
                first === 'recent' ||
                first === 'never'
              ) {
                setRotationStatus(first);
              }
            }}
            activeColor="blue"
            searchPlaceholder="Filtrar status..."
            emptyText="Nenhum status disponível"
          />
        </div>

        {isLoading ? (
          <GridLoading count={9} layout="list" size="md" gap="gap-4" />
        ) : error ? (
          <GridError
            type="server"
            title="Erro ao carregar os crachás"
            message="Não foi possível carregar os crachás."
            action={{
              label: 'Tentar novamente',
              onClick: () => {
                queryClient.invalidateQueries({ queryKey: ['crachas'] });
                refetch();
              },
            }}
          />
        ) : rows.length === 0 ? (
          <CrachasEmptyState />
        ) : (
          <div className="flex flex-col gap-2" data-testid="crachas-list">
            {rows.map(row => (
              <BadgeRow
                key={row.employeeId}
                row={row}
                isSelected={selection.has(row.employeeId)}
                onToggleSelect={toggleSelect}
                canPrint={canPrint}
                canRotate={canRotate}
              />
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="h-1" />
        {isFetchingNextPage ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {/* Selection toolbar appears when >0 selected */}
        {hasSelection ? (
          <SelectionToolbar
            selectedIds={selectedIds}
            totalItems={totalRows}
            onClear={clearSelection}
            actions={[
              ...(canPrint
                ? [
                    {
                      id: 'bulk-pdf',
                      label: 'Emitir crachás em lote',
                      icon: Printer,
                      onClick: () => setBulkPdfPinOpen(true),
                      variant: 'default' as const,
                    },
                  ]
                : []),
              ...(canRotate
                ? [
                    {
                      id: 'bulk-rotate',
                      label: 'Rotacionar QR em lote',
                      icon: RefreshCw,
                      onClick: () => setBulkRotateOpen(true),
                      variant: 'outline' as const,
                    },
                  ]
                : []),
            ]}
          />
        ) : null}

        {/* Bulk rotation flow */}
        <RotateQrBulkDialog
          isOpen={bulkRotateOpen}
          selectedEmployeeIds={selectedIds}
          totalEmployees={totalRows}
          onClose={() => setBulkRotateOpen(false)}
          onSuccess={({ jobId, total }) => {
            setProgressJob({ jobId, total, generatePdfs: true });
            clearSelection();
          }}
        />

        {/* Bulk PDF flow — PIN gate then enqueue */}
        <VerifyActionPinModal
          isOpen={bulkPdfPinOpen}
          onClose={() => setBulkPdfPinOpen(false)}
          onSuccess={submitBulkPdfs}
          title="Confirmar emissão em lote"
          description={
            hasSelection
              ? `Digite seu PIN de ação para gerar os crachás em PDF dos ${selectedIds.length} funcionário(s) selecionado(s).`
              : 'Digite seu PIN de ação para gerar os crachás em PDF de TODOS os funcionários.'
          }
        />

        {/* Live progress drawer */}
        <BulkJobProgressDrawer
          jobId={progressJob?.jobId ?? null}
          total={progressJob?.total ?? 0}
          generatePdfs={progressJob?.generatePdfs ?? false}
          onClose={() => setProgressJob(null)}
        />
      </PageBody>
    </PageLayout>
  );
}
