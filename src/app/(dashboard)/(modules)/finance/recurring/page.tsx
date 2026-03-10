'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { SearchBar } from '@/components/layout/search-bar';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { RecurringList } from '@/components/finance/recurring/recurring-list';
import { RecurringWizard } from '@/components/finance/recurring/recurring-wizard';
import {
  useRecurringConfigs,
  usePauseRecurring,
  useResumeRecurring,
  useCancelRecurring,
} from '@/hooks/finance';
import { usePermissions } from '@/hooks/use-permissions';
import type {
  FinanceEntryType,
  RecurringStatus,
  RecurringConfigsQuery,
  RecurringConfig,
} from '@/types/finance';
import { Filter, Plus, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

const STATUS_OPTIONS: { value: RecurringStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Ativa' },
  { value: 'PAUSED', label: 'Pausada' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

const TYPE_OPTIONS: { value: FinanceEntryType; label: string }[] = [
  { value: 'PAYABLE', label: 'A Pagar' },
  { value: 'RECEIVABLE', label: 'A Receber' },
];

export default function RecurringPage() {
  const { hasPermission } = usePermissions();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FinanceEntryType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<RecurringStatus | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Modal state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  // Mutations
  const pauseMutation = usePauseRecurring();
  const resumeMutation = useResumeRecurring();
  const cancelMutation = useCancelRecurring();

  // Query params
  const queryParams = useMemo<RecurringConfigsQuery>(() => {
    const params: RecurringConfigsQuery = { page, limit: 20 };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (typeFilter !== 'ALL') params.type = typeFilter;
    if (statusFilter !== 'ALL') params.status = statusFilter;
    return params;
  }, [searchQuery, typeFilter, statusFilter, page]);

  const { data, isLoading, error, refetch } = useRecurringConfigs(queryParams);
  const configs = data?.configs ?? [];

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'ALL') count++;
    if (statusFilter !== 'ALL') count++;
    return count;
  }, [typeFilter, statusFilter]);

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setPage(1);
  }, []);

  const handlePause = useCallback(
    async (id: string) => {
      try {
        await pauseMutation.mutateAsync(id);
        toast.success('Recorrencia pausada.');
      } catch {
        toast.error('Erro ao pausar recorrencia.');
      }
    },
    [pauseMutation]
  );

  const handleResume = useCallback(
    async (id: string) => {
      try {
        await resumeMutation.mutateAsync(id);
        toast.success('Recorrencia retomada.');
      } catch {
        toast.error('Erro ao retomar recorrencia.');
      }
    },
    [resumeMutation]
  );

  const handleCancelRequest = useCallback((id: string) => {
    setCancelTargetId(id);
    setPinModalOpen(true);
  }, []);

  const handleCancelConfirmed = useCallback(async () => {
    if (!cancelTargetId) return;
    try {
      await cancelMutation.mutateAsync(cancelTargetId);
      toast.success('Recorrencia cancelada.');
      setCancelTargetId(null);
    } catch {
      toast.error('Erro ao cancelar recorrencia.');
    }
  }, [cancelTargetId, cancelMutation]);

  const handleEdit = useCallback((_config: RecurringConfig) => {
    // Future: open edit modal
    toast.info('Edicao de recorrencia sera implementada em breve.');
  }, []);

  const isPending =
    pauseMutation.isPending ||
    resumeMutation.isPending ||
    cancelMutation.isPending;

  const actionButtons = useMemo(
    () => [
      {
        id: 'create-recurring',
        title: 'Nova Recorrencia',
        icon: Plus,
        variant: 'default' as const,
        onClick: () => setWizardOpen(true),
      },
    ],
    []
  );

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Financeiro', href: '/finance' },
            { label: 'Recorrencias', href: '/finance/recurring' },
          ]}
          buttons={actionButtons}
        />
        <Header
          title="Recorrencias"
          description="Gerencie lancamentos recorrentes automaticos"
        />
      </PageHeader>

      <PageBody>
        {/* Search */}
        <SearchBar
          value={searchQuery}
          placeholder="Buscar por descricao..."
          onSearch={handleSearch}
          onClear={() => handleSearch('')}
          showClear={true}
          size="md"
        />

        {/* Filter Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-1 text-muted-foreground"
            >
              <X className="h-3 w-3" />
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="filter-type"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Tipo
                </label>
                <Select
                  value={typeFilter}
                  onValueChange={(v) => {
                    setTypeFilter(v as FinanceEntryType | 'ALL');
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="filter-status"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Status
                </label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v as RecurringStatus | 'ALL');
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Table */}
        <Card>
          {isLoading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Erro ao carregar recorrencias
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <RecurringList
              configs={configs}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancelRequest}
              onEdit={handleEdit}
              isPending={isPending}
            />
          )}
        </Card>

        {/* Wizard */}
        <RecurringWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          onCreated={() => refetch()}
        />

        {/* Cancel PIN Modal */}
        <VerifyActionPinModal
          isOpen={pinModalOpen}
          onClose={() => {
            setPinModalOpen(false);
            setCancelTargetId(null);
          }}
          onSuccess={handleCancelConfirmed}
          title="Confirmar Cancelamento"
          description="Digite seu PIN de Acao para confirmar o cancelamento desta recorrencia."
        />
      </PageBody>
    </PageLayout>
  );
}
