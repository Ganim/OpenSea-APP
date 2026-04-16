/**
 * Schedule 1:1 Meeting Modal
 *
 * Wizard de 2 passos:
 *  1. Selecionar liderado (autocomplete entre colaboradores supervisionados pelo usuário).
 *  2. Definir data/hora, duração e recorrência (one-time / weekly / biweekly / monthly).
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { useMyEmployee } from '@/hooks/use-me';
import { translateError } from '@/lib/error-messages';
import { employeesService } from '@/services/hr';
import type {
  OneOnOneRecurrence,
  ScheduleOneOnOneData,
} from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarClock,
  Loader2,
  Repeat,
  Search,
  User,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// ============================================================================
// RECURRENCE CONFIG
// ============================================================================

interface RecurrenceMeta {
  id: OneOnOneRecurrence;
  label: string;
  description: string;
}

const RECURRENCE_OPTIONS: RecurrenceMeta[] = [
  {
    id: 'ONE_TIME',
    label: 'Reunião única',
    description: 'Apenas uma ocorrência nesta data.',
  },
  {
    id: 'WEEKLY',
    label: 'Semanal',
    description: 'Repete toda semana no mesmo dia/horário.',
  },
  {
    id: 'BIWEEKLY',
    label: 'Quinzenal',
    description: 'Repete a cada duas semanas.',
  },
  {
    id: 'MONTHLY',
    label: 'Mensal',
    description: 'Repete a cada 30 dias.',
  },
];

const DEFAULT_DURATION_MINUTES = 30;
const DEFAULT_OCCURRENCES = 6;

// ============================================================================
// COMPONENT
// ============================================================================

export interface ScheduleOneOnOneModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (payload: ScheduleOneOnOneData) => Promise<void>;
}

export function ScheduleOneOnOneModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
}: ScheduleOneOnOneModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [reportId, setReportId] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(
    DEFAULT_DURATION_MINUTES
  );
  const [recurrence, setRecurrence] = useState<OneOnOneRecurrence>('ONE_TIME');
  const [occurrences, setOccurrences] = useState<number>(DEFAULT_OCCURRENCES);
  const [wasOpen, setWasOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Reset on open
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setCurrentStep(1);
    setReportId('');
    setEmployeeSearch('');
    setScheduledAt('');
    setDurationMinutes(DEFAULT_DURATION_MINUTES);
    setRecurrence('ONE_TIME');
    setOccurrences(DEFAULT_OCCURRENCES);
  }
  if (!isOpen && wasOpen) setWasOpen(false);

  const { data: myEmployeeData } = useMyEmployee(isOpen);
  const supervisorId = myEmployeeData?.employee?.id;

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['hr-one-on-ones-my-reports', supervisorId],
    queryFn: async () => {
      const response = await employeesService.listEmployees({
        page: 1,
        perPage: 200,
        status: 'ACTIVE',
        supervisorId,
      });
      return response.employees;
    },
    enabled: isOpen && !!supervisorId,
    staleTime: 5 * 60 * 1000,
  });

  const reports = reportsData ?? [];

  const filteredReports = useMemo(() => {
    if (!employeeSearch.trim()) return reports;
    const needle = employeeSearch.toLowerCase();
    return reports.filter(
      employee =>
        employee.fullName.toLowerCase().includes(needle) ||
        employee.position?.name?.toLowerCase().includes(needle) ||
        employee.department?.name?.toLowerCase().includes(needle)
    );
  }, [reports, employeeSearch]);

  const selectedReport = useMemo(
    () => reports.find(employee => employee.id === reportId),
    [reports, reportId]
  );

  // Focus the right control on each step
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (currentStep === 1) searchInputRef.current?.focus();
      if (currentStep === 2) dateInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep, isOpen]);

  const handleSubmit = async () => {
    if (!reportId || !scheduledAt) return;
    try {
      await onSubmit({
        reportId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes,
        recurrence,
        occurrences: recurrence === 'ONE_TIME' ? 1 : occurrences,
      });
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      toast.error(translateError(message));
    }
  };

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Selecionar liderado',
        description: 'Escolha o colaborador para a reunião 1:1.',
        icon: <Users className="h-16 w-16 text-violet-500/60" />,
        isValid: !!reportId,
        content: (
          <div className="flex flex-col h-full space-y-3 overflow-hidden">
            <div className="space-y-2">
              <Label>
                Liderado <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Buscar por nome, cargo ou departamento..."
                  value={employeeSearch}
                  onChange={event => setEmployeeSearch(event.target.value)}
                  className="pl-9"
                  data-testid="schedule-one-on-one-search"
                />
              </div>
            </div>

            <div
              className="flex-1 min-h-0 overflow-y-auto border rounded-md divide-y"
              data-testid="schedule-one-on-one-reports-list"
            >
              {!supervisorId ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Vincule seu usuário a um colaborador para agendar 1:1.
                </div>
              ) : reportsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Carregando seus liderados...
                  </span>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum liderado encontrado.
                </div>
              ) : (
                filteredReports.map(employee => (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => setReportId(employee.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent/50 ${
                      reportId === employee.id
                        ? 'bg-accent border-l-2 border-l-primary'
                        : ''
                    }`}
                    data-testid={`schedule-one-on-one-report-${employee.id}`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {employee.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[employee.position?.name, employee.department?.name]
                          .filter(Boolean)
                          .join(' - ') || 'Sem cargo / departamento'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ),
      },
      {
        title: 'Data, duração e recorrência',
        description: 'Defina quando e com qual frequência a reunião acontecerá.',
        icon: <CalendarClock className="h-16 w-16 text-violet-500/60" />,
        isValid:
          !!scheduledAt &&
          durationMinutes > 0 &&
          (recurrence === 'ONE_TIME' || occurrences > 0) &&
          !isSubmitting,
        onBack: () => setCurrentStep(1),
        content: (
          <div className="flex flex-col h-full space-y-4 overflow-y-auto">
            {selectedReport && (
              <div className="rounded-lg border bg-accent/30 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Liderado:</span>{' '}
                <span className="font-medium">{selectedReport.fullName}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="schedule-one-on-one-datetime">
                  Data e hora <span className="text-rose-500">*</span>
                </Label>
                <Input
                  ref={dateInputRef}
                  id="schedule-one-on-one-datetime"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={event => setScheduledAt(event.target.value)}
                  data-testid="schedule-one-on-one-datetime"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="schedule-one-on-one-duration">
                  Duração (minutos)
                </Label>
                <Input
                  id="schedule-one-on-one-duration"
                  type="number"
                  inputMode="numeric"
                  min={5}
                  max={240}
                  value={durationMinutes}
                  onChange={event =>
                    setDurationMinutes(
                      Number.isFinite(Number(event.target.value))
                        ? Number(event.target.value)
                        : DEFAULT_DURATION_MINUTES
                    )
                  }
                  data-testid="schedule-one-on-one-duration"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recorrência</Label>
              <div className="grid grid-cols-2 gap-2">
                {RECURRENCE_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRecurrence(option.id)}
                    className={`flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-accent/50 ${
                      recurrence === option.id
                        ? 'border-primary bg-accent ring-1 ring-primary'
                        : 'border-border'
                    }`}
                    data-testid={`schedule-one-on-one-recurrence-${option.id.toLowerCase()}`}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {recurrence !== 'ONE_TIME' && (
              <div className="space-y-1">
                <Label htmlFor="schedule-one-on-one-occurrences">
                  Quantas ocorrências?
                </Label>
                <Input
                  id="schedule-one-on-one-occurrences"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={52}
                  value={occurrences}
                  onChange={event =>
                    setOccurrences(
                      Number.isFinite(Number(event.target.value))
                        ? Number(event.target.value)
                        : DEFAULT_OCCURRENCES
                    )
                  }
                  data-testid="schedule-one-on-one-occurrences"
                />
                <p className="text-xs text-muted-foreground">
                  Cria uma reunião para cada ocorrência a partir da data
                  escolhida.
                </p>
              </div>
            )}
          </div>
        ),
        footer: (
          <Button
            type="button"
            disabled={
              isSubmitting ||
              !reportId ||
              !scheduledAt ||
              durationMinutes <= 0
            }
            onClick={handleSubmit}
            data-testid="schedule-one-on-one-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agendando...
              </>
            ) : (
              'Agendar 1:1'
            )}
          </Button>
        ),
      },
    ],
    [
      reportId,
      employeeSearch,
      reportsLoading,
      filteredReports,
      supervisorId,
      selectedReport,
      scheduledAt,
      durationMinutes,
      recurrence,
      occurrences,
      isSubmitting,
    ]
  );

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={open => !open && onClose()}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={onClose}
    />
  );
}
