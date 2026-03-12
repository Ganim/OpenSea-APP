'use client';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/lib/logger';
import type { WorkSchedule, UpdateWorkScheduleData } from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Save, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getDayLabel, WEEK_DAYS, workSchedulesApi } from '../../src';

type DayKey = (typeof WEEK_DAYS)[number];

interface DaySchedule {
  start: string;
  end: string;
  enabled: boolean;
}

export default function WorkScheduleEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const scheduleId = params.id as string;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [breakDuration, setBreakDuration] = useState(60);
  const [isActive, setIsActive] = useState(true);
  const [days, setDays] = useState<Record<DayKey, DaySchedule>>(
    {} as Record<DayKey, DaySchedule>
  );
  const [isSaving, setIsSaving] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: schedule, isLoading } = useQuery<WorkSchedule>({
    queryKey: ['work-schedules', scheduleId],
    queryFn: () => workSchedulesApi.get(scheduleId),
  });

  useEffect(() => {
    if (schedule) {
      setName(schedule.name);
      setDescription(schedule.description ?? '');
      setBreakDuration(schedule.breakDuration);
      setIsActive(schedule.isActive);

      const newDays: Record<DayKey, DaySchedule> = {} as Record<
        DayKey,
        DaySchedule
      >;
      for (const day of WEEK_DAYS) {
        const startKey = `${day}Start` as keyof WorkSchedule;
        const endKey = `${day}End` as keyof WorkSchedule;
        const start = (schedule[startKey] as string | null) ?? '';
        const end = (schedule[endKey] as string | null) ?? '';
        newDays[day] = {
          start,
          end,
          enabled: !!start && !!end,
        };
      }
      setDays(newDays);
    }
  }, [schedule]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  function updateDay(
    day: DayKey,
    field: keyof DaySchedule,
    value: string | boolean
  ) {
    setDays(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  const handleSave = async () => {
    if (!schedule || name.trim().length < 2) return;

    setIsSaving(true);
    try {
      const data: UpdateWorkScheduleData = {
        name,
        description: description || undefined,
        breakDuration,
        isActive,
      };

      for (const day of WEEK_DAYS) {
        const d = days[day];
        const startKey = `${day}Start` as keyof UpdateWorkScheduleData;
        const endKey = `${day}End` as keyof UpdateWorkScheduleData;
        if (d?.enabled && d.start && d.end) {
          (data as Record<string, unknown>)[startKey] = d.start;
          (data as Record<string, unknown>)[endKey] = d.end;
        } else {
          (data as Record<string, unknown>)[startKey] = null;
          (data as Record<string, unknown>)[endKey] = null;
        }
      }

      await workSchedulesApi.update(scheduleId, data);
      await queryClient.invalidateQueries({ queryKey: ['work-schedules'] });
      toast.success('Escala de trabalho atualizada com sucesso!');
      router.push(`/hr/work-schedules/${scheduleId}`);
    } catch (error) {
      logger.error(
        'Erro ao salvar escala de trabalho',
        error instanceof Error ? error : undefined
      );
      toast.error('Erro ao salvar escala de trabalho');
    } finally {
      setIsSaving(false);
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

  const canSave = name.trim().length >= 2;

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
            {
              label: schedule.name,
              href: `/hr/work-schedules/${scheduleId}`,
            },
            { label: 'Editar' },
          ]}
          buttons={[
            {
              id: 'cancel',
              title: 'Cancelar',
              icon: X,
              onClick: () => router.push(`/hr/work-schedules/${scheduleId}`),
              variant: 'outline',
              disabled: isSaving,
            },
            {
              id: 'save',
              title: 'Salvar',
              icon: Save,
              onClick: handleSave,
              disabled: isSaving || !canSave,
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
              <h1 className="text-2xl font-bold tracking-tight">
                Editar Escala de Trabalho
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {schedule.name}
              </p>
            </div>
            <Badge variant={schedule.isActive ? 'success' : 'secondary'}>
              {schedule.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </Card>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* Dados Básicos */}
        <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Comercial, Administrativo"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breakDuration">Intervalo (minutos)</Label>
                <Input
                  id="breakDuration"
                  type="number"
                  min={0}
                  max={480}
                  value={breakDuration}
                  onChange={e => setBreakDuration(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva a escala de trabalho"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Status</Label>
                <p className="text-sm text-muted-foreground">
                  {isActive ? 'Escala ativa' : 'Escala inativa'}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
        </Card>

        {/* Jornada Semanal */}
        <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4">Jornada Semanal</h3>
          <div className="space-y-2">
            {WEEK_DAYS.map(day => {
              const d = days[day];
              if (!d) return null;
              return (
                <div
                  key={day}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg border ${
                    d.enabled
                      ? 'bg-background border-border'
                      : 'bg-muted/50 border-transparent'
                  }`}
                >
                  <Switch
                    checked={d.enabled}
                    onCheckedChange={checked =>
                      updateDay(day, 'enabled', checked)
                    }
                  />
                  <span className="font-medium w-20 text-sm">
                    {getDayLabel(day)}
                  </span>
                  {d.enabled ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={d.start}
                        onChange={e => updateDay(day, 'start', e.target.value)}
                        className="w-32 h-8 text-sm"
                      />
                      <span className="text-muted-foreground text-sm">até</span>
                      <Input
                        type="time"
                        value={d.end}
                        onChange={e => updateDay(day, 'end', e.target.value)}
                        className="w-32 h-8 text-sm"
                      />
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
