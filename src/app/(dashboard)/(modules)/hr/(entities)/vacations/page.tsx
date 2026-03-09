'use client';

/**
 * OpenSea OS - Vacations List Page (HR)
 *
 * Página de listagem de férias com filtros, cards e ações.
 */

import { useMemo, useState } from 'react';
import { EmployeeSelector } from '@/components/shared/employee-selector';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VacationPeriod, VacationStatus } from '@/types/hr';
import {
  Ban,
  CalendarDays,
  ChevronRight,
  DollarSign,
  Palmtree,
  Plus,
} from 'lucide-react';
import {
  useListVacations,
  useScheduleVacation,
  useSellVacationDays,
  useCancelVacationSchedule,
} from './src/api';
import {
  formatDate,
  getStatusLabel,
  getStatusColor,
  formatDaysInfo,
} from './src/utils';
import { CreateModal } from './src/modals/create-modal';
import { ScheduleModal } from './src/modals/schedule-modal';
import { SellDaysModal } from './src/modals/sell-days-modal';
import { ViewModal } from './src/modals/view-modal';

// =============================================================================
// STATUS OPTIONS
// =============================================================================

const VACATION_STATUS_OPTIONS: { value: VacationStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'AVAILABLE', label: 'Disponível' },
  { value: 'SCHEDULED', label: 'Agendada' },
  { value: 'IN_PROGRESS', label: 'Em Andamento' },
  { value: 'COMPLETED', label: 'Concluída' },
  { value: 'EXPIRED', label: 'Expirada' },
  { value: 'SOLD', label: 'Vendida' },
];

// =============================================================================
// PAGE
// =============================================================================

export default function VacationsPage() {
  // Filters
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<VacationStatus | ''>('');
  const [yearFilter, setYearFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleVacationId, setScheduleVacationId] = useState<string | null>(
    null
  );
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellVacationId, setSellVacationId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVacation, setSelectedVacation] =
    useState<VacationPeriod | null>(null);

  // Query
  const filters = useMemo(
    () => ({
      employeeId: employeeFilter || undefined,
      status: statusFilter || undefined,
      year: yearFilter ? Number(yearFilter) : undefined,
      perPage: 50,
    }),
    [employeeFilter, statusFilter, yearFilter]
  );

  const { data, isLoading, error, refetch } = useListVacations(filters);
  const scheduleVacation = useScheduleVacation({
    onSuccess: () => {
      setShowScheduleModal(false);
      setScheduleVacationId(null);
    },
  });
  const sellDays = useSellVacationDays({
    onSuccess: () => {
      setShowSellModal(false);
      setSellVacationId(null);
    },
  });
  const cancelSchedule = useCancelVacationSchedule();

  const vacations = data?.vacationPeriods ?? [];

  function handleView(vacation: VacationPeriod) {
    setSelectedVacation(vacation);
    setShowViewModal(true);
  }

  function handleSchedule(vacationId: string) {
    setScheduleVacationId(vacationId);
    setShowScheduleModal(true);
  }

  function handleSellDays(vacationId: string) {
    setSellVacationId(vacationId);
    setShowSellModal(true);
  }

  function handleCancelSchedule(id: string) {
    cancelSchedule.mutate(id);
  }

  // Breadcrumbs
  const breadcrumbs = [{ label: 'RH', href: '/hr' }, { label: 'Férias' }];

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={breadcrumbs}
          buttons={[
            {
              id: 'create-vacation',
              title: 'Novo Período',
              icon: Plus,
              onClick: () => setShowCreateModal(true),
              variant: 'default',
            },
          ]}
        />
        <Header
          title="Férias"
          description="Períodos aquisitivos e agendamento de férias"
        />
      </PageHeader>

      <PageBody>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="w-64">
            <EmployeeSelector
              value={employeeFilter}
              onChange={id => setEmployeeFilter(id)}
              placeholder="Filtrar por funcionário..."
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={v =>
              setStatusFilter(v === 'ALL' ? '' : (v as VacationStatus))
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Status</SelectItem>
              {VACATION_STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Ano"
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="w-28"
            min={2020}
            max={2099}
          />
        </div>

        {/* Loading */}
        {isLoading && <GridLoading />}

        {/* Error */}
        {error && (
          <GridError
            type="server"
            title="Erro ao carregar férias"
            message={error.message}
            action={{
              label: 'Tentar Novamente',
              onClick: () => {
                refetch();
              },
            }}
          />
        )}

        {/* Empty */}
        {!isLoading && !error && vacations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Palmtree className="h-12 w-12 mb-4 opacity-40" />
            <p className="text-lg font-medium">
              Nenhum período de férias encontrado
            </p>
            <p className="text-sm mt-1">
              Ajuste os filtros ou crie um novo período.
            </p>
          </div>
        )}

        {/* Cards Grid */}
        {!isLoading && !error && vacations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vacations.map(vacation => {
              const usedPercent =
                vacation.totalDays > 0
                  ? Math.round(
                      ((vacation.usedDays + vacation.soldDays) /
                        vacation.totalDays) *
                        100
                    )
                  : 0;

              return (
                <Card
                  key={vacation.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleView(vacation)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-green-500 to-green-600 p-1.5 rounded-md">
                        <Palmtree className="h-3.5 w-3.5" />
                      </div>
                      <Badge variant={getStatusColor(vacation.status)}>
                        {getStatusLabel(vacation.status)}
                      </Badge>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Acquisition Period */}
                  <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>
                        {formatDate(vacation.acquisitionStart)} &mdash;{' '}
                        {formatDate(vacation.acquisitionEnd)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-foreground">
                      {formatDaysInfo(
                        vacation.totalDays,
                        vacation.usedDays,
                        vacation.soldDays,
                        vacation.remainingDays
                      )}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <Progress value={usedPercent} className="h-1.5" />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>
                        {vacation.usedDays} usados / {vacation.soldDays}{' '}
                        vendidos
                      </span>
                      <span>{vacation.remainingDays} restantes</span>
                    </div>
                  </div>

                  {/* Scheduled info */}
                  {vacation.scheduledStart && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Agendado: {formatDate(vacation.scheduledStart)} &mdash;{' '}
                      {formatDate(vacation.scheduledEnd)}
                    </p>
                  )}

                  {/* Actions for AVAILABLE */}
                  {vacation.status === 'AVAILABLE' && (
                    <div
                      className="flex gap-2 pt-2 border-t"
                      onClick={e => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs text-green-600 hover:bg-green-50"
                        onClick={() => handleSchedule(vacation.id)}
                      >
                        <CalendarDays className="h-3.5 w-3.5 mr-1" />
                        Agendar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs text-amber-600 hover:bg-amber-50"
                        onClick={() => handleSellDays(vacation.id)}
                      >
                        <DollarSign className="h-3.5 w-3.5 mr-1" />
                        Vender Dias
                      </Button>
                    </div>
                  )}

                  {/* Actions for SCHEDULED */}
                  {vacation.status === 'SCHEDULED' && (
                    <div
                      className="flex gap-2 pt-2 border-t"
                      onClick={e => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs text-red-600 hover:bg-red-50"
                        onClick={() => handleCancelSchedule(vacation.id)}
                        disabled={cancelSchedule.isPending}
                      >
                        <Ban className="h-3.5 w-3.5 mr-1" />
                        Cancelar Agendamento
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Total count */}
        {!isLoading && !error && vacations.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            {data?.total ?? vacations.length} período(s) de férias encontrado(s)
          </div>
        )}
      </PageBody>

      {/* Modals */}
      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setScheduleVacationId(null);
        }}
        vacationId={scheduleVacationId}
        onSchedule={(id, data) => scheduleVacation.mutate({ id, data })}
        isSubmitting={scheduleVacation.isPending}
      />

      <SellDaysModal
        isOpen={showSellModal}
        onClose={() => {
          setShowSellModal(false);
          setSellVacationId(null);
        }}
        vacationId={sellVacationId}
        onSell={(id, data) => sellDays.mutate({ id, data })}
        isSubmitting={sellDays.isPending}
      />

      <ViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedVacation(null);
        }}
        vacation={selectedVacation}
      />
    </PageLayout>
  );
}
