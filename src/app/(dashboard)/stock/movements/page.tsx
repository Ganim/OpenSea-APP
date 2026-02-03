/**
 * OpenSea OS - Movements Page
 * Stock movements history page using the standardized OpenSea OS layout system
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { SearchBar } from '@/components/layout/search-bar';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { useItemMovements } from '@/hooks/stock/use-items';
import type { ItemMovementsQuery, MovementType } from '@/types/stock';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import {
  computeMovementStats,
  filterMovementsByDateRange,
  filterMovementsBySearch,
  groupMovementsByDate,
  MovementFilters,
  MovementStatsGrid,
  MovementTimeline,
} from './src';
import type { DateRangeFilter } from './src';

export default function MovementsPage() {
  const router = useRouter();

  // ============================================================================
  // STATE
  // ============================================================================

  const [movementType, setMovementType] = useState<MovementType | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('week');
  const [search, setSearch] = useState('');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const movementsQuery: ItemMovementsQuery = useMemo(() => {
    const query: ItemMovementsQuery = {};
    if (movementType !== 'all') {
      query.movementType = movementType;
    }
    return query;
  }, [movementType]);

  const { data, isLoading, error, refetch } = useItemMovements(movementsQuery);

  const movements = data?.movements || [];

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredMovements = useMemo(() => {
    const dateFiltered = filterMovementsByDateRange(movements, dateRange);
    return filterMovementsBySearch(dateFiltered, search);
  }, [movements, dateRange, search]);

  const groupedMovements = useMemo(
    () => groupMovementsByDate(filteredMovements),
    [filteredMovements]
  );

  const stats = useMemo(
    () => computeMovementStats(filteredMovements),
    [filteredMovements]
  );

  const hasFilters = movementType !== 'all' || dateRange !== 'week' || !!search;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleResetFilters = useCallback(() => {
    setMovementType('all');
    setDateRange('week');
    setSearch('');
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch('');
  }, []);

  // ============================================================================
  // HEADER BUTTONS CONFIGURATION
  // ============================================================================

  const actionButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'refresh-movements',
        title: 'Atualizar',
        icon: RefreshCw,
        onClick: handleRefresh,
        variant: 'outline',
      },
      {
        id: 'export-movements',
        title: 'Exportar',
        icon: Download,
        onClick: () => {},
        variant: 'outline',
      },
    ],
    [handleRefresh]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          buttons={actionButtons}
          onBack={() => router.back()}
          backLabel="Estoque"
          backIcon={ArrowLeft}
        />

        <Header
          title="Movimentacoes de Estoque"
          description="Historico de entradas, saidas e transferencias"
        />
      </PageHeader>

      <PageBody>
        {/* Search Bar */}
        <SearchBar
          value={search}
          placeholder="Buscar por item, lote, observacao..."
          onSearch={handleSearch}
          onClear={handleClearSearch}
          showClear={true}
          size="md"
        />

        {/* Stats Cards */}
        <MovementStatsGrid stats={stats} />

        {/* Filters */}
        <MovementFilters
          movementType={movementType}
          dateRange={dateRange}
          hasFilters={hasFilters}
          onMovementTypeChange={setMovementType}
          onDateRangeChange={setDateRange}
          onResetFilters={handleResetFilters}
        />

        {/* Movements Timeline */}
        {error ? (
          <GridError
            type="server"
            title="Erro ao carregar movimentacoes"
            message="Ocorreu um erro ao tentar carregar as movimentacoes. Por favor, tente novamente."
            action={{
              label: 'Tentar Novamente',
              onClick: () => void refetch(),
            }}
          />
        ) : (
          <MovementTimeline
            groupedMovements={groupedMovements}
            filteredMovementsCount={filteredMovements.length}
            isLoading={isLoading}
            hasFilters={hasFilters}
            onResetFilters={handleResetFilters}
          />
        )}
      </PageBody>
    </PageLayout>
  );
}
