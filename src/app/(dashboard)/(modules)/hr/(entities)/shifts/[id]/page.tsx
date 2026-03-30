'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  Coffee,
  Moon,
  Pencil,
  Timer,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { shiftsApi, shiftKeys, SHIFT_TYPE_LABELS, SHIFT_TYPE_COLORS } from '../src';

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

export default function ShiftDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shiftId = params.id as string;

  const {
    data: shiftData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: shiftKeys.detail(shiftId),
    queryFn: async () => {
      return shiftsApi.get(shiftId);
    },
    enabled: !!shiftId,
  });

  const {
    data: assignmentsData,
  } = useQuery({
    queryKey: shiftKeys.assignments(shiftId),
    queryFn: async () => {
      const response = await shiftsApi.listAssignments(shiftId);
      return response.shiftAssignments;
    },
    enabled: !!shiftId,
  });

  const shift = shiftData?.shift;
  const assignmentCount = shiftData?.assignmentCount ?? 0;
  const assignments = assignmentsData ?? [];

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Turnos', href: '/hr/shifts' },
              { label: 'Carregando...' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={1} layout="grid" size="lg" />
        </PageBody>
      </PageLayout>
    );
  }

  if (error || !shift) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Turnos', href: '/hr/shifts' },
              { label: 'Erro' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="server"
            title="Turno não encontrado"
            message="Não foi possível carregar os detalhes deste turno."
            action={{ label: 'Tentar Novamente', onClick: () => { refetch(); } }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  const typeBadgeClass = SHIFT_TYPE_COLORS[shift.type] || '';

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Turnos', href: '/hr/shifts' },
            { label: shift.name },
          ]}
          buttons={[
            {
              id: 'edit-shift',
              title: 'Editar',
              icon: Pencil,
              onClick: () => router.push(`/hr/shifts/${shiftId}/edit`),
              variant: 'outline',
            },
          ]}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={
                shift.color
                  ? {
                      background: `linear-gradient(135deg, ${shift.color}, ${shift.color}cc)`,
                    }
                  : undefined
              }
            >
              {shift.isNightShift ? (
                <Moon className="h-7 w-7 text-white" />
              ) : (
                <Clock className="h-7 w-7 text-white" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">{shift.name}</h1>
                {shift.code && (
                  <span className="text-sm text-muted-foreground">
                    ({shift.code})
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Criado em{' '}
                {new Date(shift.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={typeBadgeClass}>
                {SHIFT_TYPE_LABELS[shift.type]}
              </Badge>
              {shift.isNightShift && (
                <Badge variant="secondary">Noturno</Badge>
              )}
              {!shift.isActive && (
                <Badge variant="destructive">Inativo</Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Schedule Details */}
        <Card className="bg-white/5 p-5">
          <h2 className="mb-4 text-lg font-semibold">Detalhes do Horário</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/10">
                <Clock className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Início</p>
                <p className="font-semibold">{shift.startTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/10">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Término</p>
                <p className="font-semibold">{shift.endTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/10">
                <Timer className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duração</p>
                <p className="font-semibold">
                  {formatDuration(shift.durationHours)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/10">
                <Coffee className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Intervalo</p>
                <p className="font-semibold">{shift.breakMinutes} min</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Assignments */}
        <Card className="bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">
                Funcionários Atribuídos
              </h2>
              <Badge variant="secondary">{assignmentCount}</Badge>
            </div>
          </div>

          {assignments.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Nenhum funcionário atribuído a este turno
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map(assignment => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Funcionário: {assignment.employeeId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Desde{' '}
                      {new Date(assignment.startDate).toLocaleDateString(
                        'pt-BR'
                      )}
                      {assignment.endDate &&
                        ` até ${new Date(assignment.endDate).toLocaleDateString('pt-BR')}`}
                    </p>
                    {assignment.notes && (
                      <p className="mt-1 text-xs text-muted-foreground italic">
                        {assignment.notes}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={assignment.isActive ? 'default' : 'secondary'}
                  >
                    {assignment.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </PageBody>
    </PageLayout>
  );
}
