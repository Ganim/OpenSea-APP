'use client';

import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { InfoField } from '@/components/shared/info-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import type { WorkSchedule } from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Coffee,
  Edit,
  NotebookText,
  Timer,
  Trash,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  deleteWorkSchedule,
  formatDayRange,
  formatWeeklyHours,
  getDayLabel,
  getDaySchedule,
  WEEK_DAYS,
  workSchedulesApi,
} from '../src';

export default function WorkScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const scheduleId = params.id as string;

  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: schedule, isLoading } = useQuery<WorkSchedule>({
    queryKey: ['work-schedules', scheduleId],
    queryFn: () => workSchedulesApi.get(scheduleId),
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleEdit = () => {
    router.push(`/hr/work-schedules/${scheduleId}/edit`);
  };

  const handleDelete = async () => {
    if (!schedule) return;

    if (
      !confirm(
        `Tem certeza que deseja excluir a escala "${schedule.name}"?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteWorkSchedule(schedule.id);
      await queryClient.invalidateQueries({ queryKey: ['work-schedules'] });
      toast.success('Escala de trabalho excluída com sucesso!');
      router.push('/hr/work-schedules');
    } catch (error) {
      logger.error(
        'Erro ao excluir escala de trabalho',
        error instanceof Error ? error : undefined
      );
      toast.error('Erro ao excluir escala de trabalho');
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Escalas de Trabalho', href: '/hr/work-schedules' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!schedule) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Escalas de Trabalho', href: '/hr/work-schedules' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Escala de trabalho não encontrada
            </h2>
            <Button onClick={() => router.push('/hr/work-schedules')}>
              Voltar para Escalas de Trabalho
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Escalas de Trabalho', href: '/hr/work-schedules' },
            { label: schedule.name },
          ]}
          buttons={[
            {
              id: 'delete',
              title: 'Excluir',
              icon: Trash,
              onClick: handleDelete,
              variant: 'outline',
              disabled: isDeleting,
            },
            {
              id: 'edit',
              title: 'Editar',
              icon: Edit,
              onClick: handleEdit,
            },
          ]}
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br from-indigo-500 to-violet-600">
              <Clock className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {schedule.name}
                </h1>
                <Badge variant={schedule.isActive ? 'success' : 'secondary'}>
                  {schedule.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              {schedule.description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {schedule.description}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 shrink-0 text-sm">
              {schedule.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span>
                    {new Date(schedule.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {schedule.updatedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>
                    {new Date(schedule.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* Resumo */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
            <NotebookText className="h-5 w-5" />
            Resumo da Escala
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <InfoField
              label="Nome"
              value={schedule.name}
              showCopyButton
              copyTooltip="Copiar nome"
            />
            <InfoField
              label="Horas Semanais"
              value={formatWeeklyHours(schedule.weeklyHours)}
              badge={
                <Badge variant="outline" className="gap-1">
                  <Timer className="h-3 w-3" />
                  {formatWeeklyHours(schedule.weeklyHours)}
                </Badge>
              }
            />
            <InfoField
              label="Intervalo"
              value={`${schedule.breakDuration} minutos`}
              badge={
                <Badge variant="outline" className="gap-1">
                  <Coffee className="h-3 w-3" />
                  {schedule.breakDuration}min
                </Badge>
              }
            />
          </div>
          {schedule.description && (
            <div className="mt-6">
              <InfoField
                label="Descrição"
                value={schedule.description}
                showCopyButton
                copyTooltip="Copiar descrição"
              />
            </div>
          )}
        </Card>

        {/* Jornada Semanal */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
            <Clock className="h-5 w-5" />
            Jornada Semanal
          </h3>
          <div className="space-y-2">
            {WEEK_DAYS.map(day => {
              const { start, end } = getDaySchedule(schedule, day);
              const isWorking = !!start && !!end;

              return (
                <div
                  key={day}
                  className={`flex items-center gap-4 py-3 px-4 rounded-lg border ${
                    isWorking
                      ? 'bg-background border-border'
                      : 'bg-muted/50 border-transparent'
                  }`}
                >
                  <span className="font-medium w-24 text-sm">
                    {getDayLabel(day)}
                  </span>
                  {isWorking ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {start}
                      </Badge>
                      <span className="text-muted-foreground text-sm">até</span>
                      <Badge variant="outline" className="font-mono">
                        {end}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      Folga
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </PageBody>
    </PageLayout>
  );
}
