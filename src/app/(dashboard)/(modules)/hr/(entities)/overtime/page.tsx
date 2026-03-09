'use client';

/**
 * OpenSea OS - Overtime List Page (HR)
 *
 * Página de listagem de horas extras com filtros, cards e ações.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Overtime } from '@/types/hr';
import { Check, ChevronRight, Clock, Coffee, Plus } from 'lucide-react';
import {
  useListOvertime,
  useCreateOvertime,
  useApproveOvertime,
} from './src/api';
import {
  formatDate,
  formatHours,
  getApprovalLabel,
  getApprovalColor,
} from './src/utils';
import { CreateModal } from './src/modals/create-modal';
import { ApproveModal } from './src/modals/approve-modal';
import { ViewModal } from './src/modals/view-modal';

// =============================================================================
// PAGE
// =============================================================================

export default function OvertimePage() {
  // Filters
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [approvedFilter, setApprovedFilter] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOvertime, setSelectedOvertime] = useState<Overtime | null>(
    null
  );

  // Query
  const filters = useMemo(
    () => ({
      employeeId: employeeFilter || undefined,
      approved:
        approvedFilter === 'true'
          ? true
          : approvedFilter === 'false'
            ? false
            : undefined,
      startDate: startDateFilter || undefined,
      endDate: endDateFilter || undefined,
      perPage: 100,
    }),
    [employeeFilter, approvedFilter, startDateFilter, endDateFilter]
  );

  const { data, isLoading, error, refetch } = useListOvertime(filters);
  const createOvertime = useCreateOvertime({
    onSuccess: () => setShowCreateModal(false),
  });
  const approveOvertime = useApproveOvertime({
    onSuccess: () => {
      setShowApproveModal(false);
      setSelectedOvertime(null);
    },
  });

  const overtimeList = data?.overtime ?? [];

  function handleView(overtime: Overtime) {
    setSelectedOvertime(overtime);
    setShowViewModal(true);
  }

  function handleApproveClick(overtime: Overtime) {
    setSelectedOvertime(overtime);
    setShowApproveModal(true);
  }

  // Breadcrumbs
  const breadcrumbs = [{ label: 'RH', href: '/hr' }, { label: 'Horas Extras' }];

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={breadcrumbs}
          buttons={[
            {
              id: 'create-overtime',
              title: 'Registrar Hora Extra',
              icon: Plus,
              onClick: () => setShowCreateModal(true),
              variant: 'default',
            },
          ]}
        />
        <Header
          title="Horas Extras"
          description="Registros e aprovação de horas extras"
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
            value={approvedFilter}
            onValueChange={v => setApprovedFilter(v === 'ALL' ? '' : v)}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="true">Aprovada</SelectItem>
              <SelectItem value="false">Rejeitada</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={startDateFilter}
            onChange={e => setStartDateFilter(e.target.value)}
            className="w-40"
            placeholder="Data início"
          />
          <Input
            type="date"
            value={endDateFilter}
            onChange={e => setEndDateFilter(e.target.value)}
            className="w-40"
            placeholder="Data fim"
          />
        </div>

        {/* Loading */}
        {isLoading && <GridLoading />}

        {/* Error */}
        {error && (
          <GridError
            type="server"
            title="Erro ao carregar horas extras"
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
        {!isLoading && !error && overtimeList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Coffee className="h-12 w-12 mb-4 opacity-40" />
            <p className="text-lg font-medium">Nenhuma hora extra encontrada</p>
            <p className="text-sm mt-1">
              Ajuste os filtros ou registre uma nova hora extra.
            </p>
          </div>
        )}

        {/* Cards Grid */}
        {!isLoading && !error && overtimeList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {overtimeList.map(overtime => (
              <Card
                key={overtime.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleView(overtime)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-orange-500 to-orange-600 p-1.5 rounded-md">
                      <Coffee className="h-3.5 w-3.5" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatHours(overtime.hours)}
                    </Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Date */}
                <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDate(overtime.date)}</span>
                  </div>
                </div>

                {/* Reason */}
                <p className="text-sm text-foreground mb-3 line-clamp-2">
                  {overtime.reason}
                </p>

                {/* Status Badge */}
                <div className="flex gap-1.5 flex-wrap mb-3">
                  <Badge
                    variant={getApprovalColor(overtime)}
                    className="text-xs"
                  >
                    {getApprovalLabel(overtime)}
                  </Badge>
                </div>

                {/* Actions for PENDING */}
                {overtime.approved === null && (
                  <div
                    className="flex gap-2 pt-2 border-t"
                    onClick={e => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs text-emerald-600 hover:bg-emerald-50"
                      onClick={() => handleApproveClick(overtime)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Aprovar
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Total count */}
        {!isLoading && !error && overtimeList.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            {data?.total ?? overtimeList.length} hora(s) extra(s) encontrada(s)
          </div>
        )}
      </PageBody>

      {/* Modals */}
      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={data => createOvertime.mutate(data)}
        isSubmitting={createOvertime.isPending}
      />

      <ApproveModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedOvertime(null);
        }}
        overtime={selectedOvertime}
        onApprove={(id, data) => approveOvertime.mutate({ id, data })}
        isApproving={approveOvertime.isPending}
      />

      <ViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedOvertime(null);
        }}
        overtime={selectedOvertime}
      />
    </PageLayout>
  );
}
