'use client';

/**
 * OpenSea OS - Absences List Page (HR)
 *
 * Página de listagem de ausências com filtros, cards e ações.
 */

import { useMemo, useState } from 'react';
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
import type { Absence, AbsenceType, AbsenceStatus } from '@/types/hr';
import {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Plus,
  UserX,
  XCircle,
  Ban,
} from 'lucide-react';
import {
  useListAbsences,
  useApproveAbsence,
  useCancelAbsence,
} from './src/api';
import {
  getTypeLabel,
  getStatusLabel,
  getStatusColor,
  getTypeColor,
} from './src/utils';
import { RequestSickLeaveModal } from './src/modals/request-sick-leave-modal';
import { RejectModal } from './src/modals/reject-modal';
import { ViewModal } from './src/modals/view-modal';

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const ABSENCE_TYPE_OPTIONS: { value: AbsenceType; label: string }[] = [
  { value: 'VACATION', label: 'Férias' },
  { value: 'SICK_LEAVE', label: 'Atestado Médico' },
  { value: 'PERSONAL_LEAVE', label: 'Licença Pessoal' },
  { value: 'MATERNITY_LEAVE', label: 'Licença Maternidade' },
  { value: 'PATERNITY_LEAVE', label: 'Licença Paternidade' },
  { value: 'BEREAVEMENT_LEAVE', label: 'Licença Nojo' },
  { value: 'WEDDING_LEAVE', label: 'Licença Casamento' },
  { value: 'MEDICAL_APPOINTMENT', label: 'Consulta Médica' },
  { value: 'JURY_DUTY', label: 'Júri/Convocação' },
  { value: 'UNPAID_LEAVE', label: 'Licença não Remunerada' },
  { value: 'OTHER', label: 'Outro' },
];

const ABSENCE_STATUS_OPTIONS: { value: AbsenceStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'APPROVED', label: 'Aprovada' },
  { value: 'REJECTED', label: 'Rejeitada' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'IN_PROGRESS', label: 'Em Andamento' },
  { value: 'COMPLETED', label: 'Concluída' },
];

// =============================================================================
// PAGE
// =============================================================================

export default function AbsencesPage() {
  // Filters
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<AbsenceType | ''>('');
  const [statusFilter, setStatusFilter] = useState<AbsenceStatus | ''>('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectAbsenceId, setRejectAbsenceId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);

  // Query
  const filters = useMemo(
    () => ({
      employeeId: employeeFilter || undefined,
      type: (typeFilter as AbsenceType) || undefined,
      status: (statusFilter as AbsenceStatus) || undefined,
      startDate: startDateFilter || undefined,
      endDate: endDateFilter || undefined,
      perPage: 50,
    }),
    [employeeFilter, typeFilter, statusFilter, startDateFilter, endDateFilter]
  );

  const { data, isLoading, error, refetch } = useListAbsences(filters);
  const approveAbsence = useApproveAbsence();
  const cancelAbsence = useCancelAbsence();

  const absences = data?.absences ?? [];

  function handleView(absence: Absence) {
    setSelectedAbsence(absence);
    setShowViewModal(true);
  }

  function handleApprove(id: string) {
    approveAbsence.mutate(id);
  }

  function handleReject(id: string) {
    setRejectAbsenceId(id);
    setShowRejectModal(true);
  }

  function handleCancel(id: string) {
    cancelAbsence.mutate(id);
  }

  // Breadcrumbs
  const breadcrumbs = [{ label: 'RH', href: '/hr' }, { label: 'Ausências' }];

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={breadcrumbs}
          buttons={[
            {
              id: 'create-absence',
              title: 'Registrar Atestado',
              icon: Plus,
              onClick: () => setShowCreateModal(true),
              variant: 'default',
            },
          ]}
        />
        <Header
          title="Ausências"
          description="Faltas, atestados e afastamentos"
        />
      </PageHeader>

      <PageBody>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Filtrar por funcionário..."
            value={employeeFilter}
            onChange={e => setEmployeeFilter(e.target.value)}
            className="w-56"
          />

          <Select
            value={typeFilter}
            onValueChange={v =>
              setTypeFilter(v === 'ALL' ? '' : (v as AbsenceType))
            }
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Tipos</SelectItem>
              {ABSENCE_TYPE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={v =>
              setStatusFilter(v === 'ALL' ? '' : (v as AbsenceStatus))
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Status</SelectItem>
              {ABSENCE_STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
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
        {error && <GridError type="server" title="Erro ao carregar ausências" message={error.message} action={{ label: 'Tentar Novamente', onClick: () => { refetch(); } }} />}

        {/* Empty */}
        {!isLoading && !error && absences.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <UserX className="h-12 w-12 mb-4 opacity-40" />
            <p className="text-lg font-medium">Nenhuma ausência encontrada</p>
            <p className="text-sm mt-1">
              Ajuste os filtros ou registre um novo atestado.
            </p>
          </div>
        )}

        {/* Cards Grid */}
        {!isLoading && !error && absences.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {absences.map(absence => (
              <Card
                key={absence.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleView(absence)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-rose-500 to-rose-600 p-1.5 rounded-md">
                      <UserX className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium truncate max-w-[140px]">
                      {getTypeLabel(absence.type)}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Badges */}
                <div className="flex gap-1.5 flex-wrap mb-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getTypeColor(absence.type)}`}
                  >
                    {getTypeLabel(absence.type)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(absence.status)}`}
                  >
                    {getStatusLabel(absence.status)}
                  </Badge>
                </div>

                {/* Dates & Days */}
                <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formatDate(absence.startDate)} &mdash;{' '}
                      {formatDate(absence.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {absence.totalDays}{' '}
                      {absence.totalDays === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>
                </div>

                {/* CID */}
                {absence.cid && (
                  <p className="text-xs text-muted-foreground mb-3">
                    CID: <span className="font-mono">{absence.cid}</span>
                  </p>
                )}

                {/* Actions for PENDING */}
                {absence.status === 'PENDING' && (
                  <div
                    className="flex gap-2 pt-2 border-t"
                    onClick={e => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs text-emerald-600 hover:bg-emerald-50"
                      onClick={() => handleApprove(absence.id)}
                      disabled={approveAbsence.isPending}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => handleReject(absence.id)}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Rejeitar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-slate-500 hover:bg-slate-50"
                      onClick={() => handleCancel(absence.id)}
                      disabled={cancelAbsence.isPending}
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Total count */}
        {!isLoading && !error && absences.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            {data?.total ?? absences.length} ausência(s) encontrada(s)
          </div>
        )}
      </PageBody>

      {/* Modals */}
      <RequestSickLeaveModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectAbsenceId(null);
        }}
        absenceId={rejectAbsenceId}
      />

      <ViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAbsence(null);
        }}
        absence={selectedAbsence}
      />
    </PageLayout>
  );
}
