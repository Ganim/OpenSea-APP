/**
 * OpenSea OS - Audit Logs Page
 * Pagina de visualizacao de logs de auditoria do sistema
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { AccessDenied } from '@/components/rbac/access-denied';
import { Card } from '@/components/ui/card';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { usePermissions } from '@/hooks/use-permissions';
import { auditLogService } from '@/services/audit/audit-log.service';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import {
  AuditEventsList,
  AuditLegend,
  auditLogsConfig,
  DetailModal,
  FiltersBar,
} from './src';
import type { AuditLog, AuditLogFilters } from './src/types';

export default function AuditLogsPage() {
  const router = useRouter();
  const { hasPermission, isLoading: isLoadingPermissions } = usePermissions();

  // Verificar se o usuario tem permissao para visualizar logs de auditoria
  const canViewAuditLogs =
    hasPermission('audit.logs.view') || hasPermission('audit.logs.search');

  // ============================================================================
  // STATE
  // ============================================================================

  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 50,
  });

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const {
    data: logsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditLogService.listAuditLogs(filters),
    enabled: canViewAuditLogs,
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFiltersChange = (newFilters: AuditLogFilters) => {
    setFilters({
      ...newFilters,
      page: 1, // Reset to first page when filters change
    });
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
    });
  };

  const handleLogClick = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = () => {
    setFilters(prev => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const logs = logsData?.logs || [];
  const pagination = logsData?.pagination;

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  // ============================================================================
  // HEADER BUTTONS CONFIGURATION
  // ============================================================================

  const actionButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'refresh-audit-logs',
        title: 'Atualizar',
        icon: RefreshCw,
        onClick: handleRefresh,
        variant: 'outline',
        disabled: isLoading,
      },
    ],
    [handleRefresh, isLoading]
  );

  // ============================================================================
  // ACCESS CHECK
  // ============================================================================

  if (isLoadingPermissions) {
    return (
      <PageLayout>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" gap="gap-4" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!canViewAuditLogs) {
    return (
      <AccessDenied
        title="Acesso Restrito"
        message="Voce nao tem permissao para visualizar os logs de auditoria."
      />
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          buttons={actionButtons}
          onBack={() => router.back()}
          backLabel="Administracao"
          backIcon={ArrowLeft}
        />

        <Header
          title="Logs de Auditoria"
          description="Visualização e análise de logs de auditoria do sistema"
        />
      </PageHeader>

      <PageBody>
        {/* Filters */}
        <FiltersBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Stats */}
        {pagination && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-white/90 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total de Logs
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {pagination.total.toLocaleString('pt-BR')}
              </div>
            </Card>

            <Card className="p-4 bg-white/90 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Pagina Atual
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {pagination.page} de {pagination.totalPages}
              </div>
            </Card>

            <Card className="p-4 bg-white/90 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Logs Exibidos
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {logs.length}
              </div>
            </Card>
          </div>
        )}

        {/* Event List */}
        {isLoading ? (
          <GridLoading count={6} layout="list" size="md" gap="gap-4" />
        ) : error ? (
          <GridError
            type="server"
            title="Erro ao carregar logs de auditoria"
            message="Ocorreu um erro ao tentar carregar os logs. Por favor, tente novamente ou ajuste os filtros."
            action={{
              label: 'Tentar Novamente',
              onClick: () => void refetch(),
            }}
          />
        ) : (
          <Card className="p-6 bg-white/90 dark:bg-white/5 border-gray-200/50 dark:border-white/10 space-y-4">
            <AuditLegend />
            <AuditEventsList
              logs={logs}
              isLoading={isLoading}
              onSelectLog={handleLogClick}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </Card>
        )}

        {/* Detail Modal */}
        <DetailModal
          isOpen={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          log={selectedLog}
        />
      </PageBody>
    </PageLayout>
  );
}
