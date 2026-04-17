'use client';

/**
 * OpenSea OS - Vacations Team Calendar (HR)
 *
 * Visão BambooHR-style: calendário mensal de quem está fora, com filtros por
 * departamento e tipo, sidebar com "fora hoje", "próximos 7 dias" e detector
 * de conflitos (>30% do quadro de uma área fora simultaneamente).
 */

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type {
  DatesSetArg,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Filter,
  ListIcon,
  Palmtree,
  Plus,
  Sparkles,
  Stethoscope,
  Sun,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { VacationEventCard } from '@/components/hr/vacation-event-card';
import { useAbsencesInRange } from '@/hooks/hr/use-absences-in-range';
import { useVacationsInRange } from '@/hooks/hr/use-vacations-in-range';
import { usePermissions } from '@/hooks/use-permissions';
import { departmentsService } from '@/services/hr/departments.service';
import { employeesService } from '@/services/hr/employees.service';
import {
  calculateWeeklyConflicts,
  filterAbsencesActiveOn,
  filterAbsencesStartingWithin,
  type ConflictAbsenceItem,
  type ConflictDepartmentRef,
  type WeekConflictReport,
} from '@/lib/hr/calculate-conflicts';
import { cn } from '@/lib/utils';
import { HR_PERMISSIONS } from '../../../_shared/constants/hr-permissions';
import type { AbsenceType } from '@/types/hr';

/* ===========================================
   CONSTANTS
   =========================================== */

const TYPE_OPTIONS: {
  value: 'ALL' | 'VACATION' | 'SICK' | 'PARENTAL' | 'OTHER';
  label: string;
}[] = [
  { value: 'ALL', label: 'Todos os tipos' },
  { value: 'VACATION', label: 'Férias' },
  { value: 'SICK', label: 'Atestado' },
  { value: 'PARENTAL', label: 'Licença parental' },
  { value: 'OTHER', label: 'Outras' },
];

const APPROVAL_OPTIONS = [
  { value: 'APPROVED_ONLY', label: 'Apenas aprovadas' },
  { value: 'WITH_PENDING', label: 'Incluir pendentes' },
];

type TypeFilterValue = (typeof TYPE_OPTIONS)[number]['value'];
type ApprovalFilterValue = (typeof APPROVAL_OPTIONS)[number]['value'];

const TYPE_COLOR_MAP: Record<string, string> = {
  VACATION: '#10b981', // emerald-500
  SICK_LEAVE: '#f43f5e', // rose-500
  PARENTAL: '#8b5cf6', // violet-500
  MATERNITY_LEAVE: '#8b5cf6',
  PATERNITY_LEAVE: '#8b5cf6',
  PERSONAL_LEAVE: '#f59e0b', // amber-500
  BEREAVEMENT_LEAVE: '#94a3b8', // slate-400
  WEDDING_LEAVE: '#0ea5e9', // sky-500
  MEDICAL_APPOINTMENT: '#14b8a6', // teal-500
  JURY_DUTY: '#6366f1', // indigo-500
  UNPAID_LEAVE: '#f59e0b',
  OTHER: '#f59e0b',
};

const KIND_GROUPS: Record<TypeFilterValue, AbsenceType[]> = {
  ALL: [],
  VACATION: ['VACATION'],
  SICK: ['SICK_LEAVE', 'MEDICAL_APPOINTMENT'],
  PARENTAL: ['MATERNITY_LEAVE', 'PATERNITY_LEAVE'],
  OTHER: [
    'PERSONAL_LEAVE',
    'BEREAVEMENT_LEAVE',
    'WEDDING_LEAVE',
    'JURY_DUTY',
    'UNPAID_LEAVE',
    'OTHER',
  ],
};

/* ===========================================
   HELPERS
   =========================================== */

function startOfMonthSafe(reference: Date): Date {
  return new Date(reference.getFullYear(), reference.getMonth(), 1);
}

function endOfMonthSafe(reference: Date): Date {
  return new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
}

const dayMonthFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
});

/* ===========================================
   PAGE
   =========================================== */

export default function VacationsCalendarPage() {
  const router = useRouter();
  const { hasPermission, isLoading: isLoadingPermissions } = usePermissions();
  const calendarRef = useRef<FullCalendar>(null);

  const canViewVacations = hasPermission(HR_PERMISSIONS.VACATIONS.VIEW);
  const canCreateVacations = hasPermission(HR_PERMISSIONS.VACATIONS.CREATE);

  /* ----- view state ----- */
  const today = useMemo(() => new Date(), []);
  const [visibleStart, setVisibleStart] = useState<Date>(() =>
    startOfMonthSafe(today)
  );
  const [visibleEnd, setVisibleEnd] = useState<Date>(() =>
    endOfMonthSafe(today)
  );
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentView, setCurrentView] = useState<
    'dayGridMonth' | 'timeGridWeek' | 'listWeek'
  >('dayGridMonth');

  /* ----- filters ----- */
  const [filterDepartmentId, setFilterDepartmentId] = useState('');
  const [filterTypeKind, setFilterTypeKind] = useState<TypeFilterValue>('ALL');
  const [filterApproval, setFilterApproval] =
    useState<ApprovalFilterValue>('APPROVED_ONLY');

  const includePending = filterApproval === 'WITH_PENDING';

  /* ----- data: departments (filter + headcount) ----- */
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', 'calendar', 'active'],
    queryFn: () =>
      departmentsService.listDepartments({
        perPage: 100,
        isActive: true,
      }),
  });

  const departmentOptions = useMemo(
    () =>
      (departmentsData?.departments ?? []).map(department => ({
        value: department.id,
        label: department.name,
      })),
    [departmentsData]
  );

  const departmentRefs = useMemo<ConflictDepartmentRef[]>(() => {
    return (departmentsData?.departments ?? []).map(department => ({
      id: department.id,
      name: department.name,
      activeHeadcount: department._count?.employees ?? 0,
    }));
  }, [departmentsData]);

  /* ----- data: vacations + absences in range ----- */
  const typesForFetch = useMemo(() => {
    if (filterTypeKind === 'ALL') return undefined;
    return KIND_GROUPS[filterTypeKind];
  }, [filterTypeKind]);

  const includeVacations =
    filterTypeKind === 'ALL' || filterTypeKind === 'VACATION';

  const includeAbsencesEndpoint =
    filterTypeKind === 'ALL' ||
    filterTypeKind === 'SICK' ||
    filterTypeKind === 'PARENTAL' ||
    filterTypeKind === 'OTHER';

  const vacationsQuery = useVacationsInRange({
    rangeStart: visibleStart,
    rangeEnd: visibleEnd,
    enabled: includeVacations,
    statuses: includePending
      ? ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']
      : ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'],
  });

  const absencesQuery = useAbsencesInRange({
    rangeStart: visibleStart,
    rangeEnd: visibleEnd,
    enabled: includeAbsencesEndpoint,
    types: typesForFetch,
    statuses: includePending
      ? ['PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED']
      : ['APPROVED', 'IN_PROGRESS', 'COMPLETED'],
  });

  /* ----- merge employee labels (for names + dept + photo) ----- */
  const employeeIdsFromEvents = useMemo(() => {
    const ids = new Set<string>();
    if (includeVacations) {
      for (const vacation of vacationsQuery.vacations) {
        ids.add(vacation.employeeId);
      }
    }
    if (includeAbsencesEndpoint) {
      for (const absence of absencesQuery.absences) {
        ids.add(absence.employeeId);
      }
    }
    return Array.from(ids).sort();
  }, [
    vacationsQuery.vacations,
    absencesQuery.absences,
    includeVacations,
    includeAbsencesEndpoint,
  ]);

  const { data: labelsData } = useQuery({
    queryKey: ['employees', 'calendar-labels', employeeIdsFromEvents],
    queryFn: () => employeesService.getLabelData(employeeIdsFromEvents),
    enabled: employeeIdsFromEvents.length > 0,
    staleTime: 5 * 60_000,
  });

  const employeeLookup = useMemo(() => {
    const map = new Map<
      string,
      {
        fullName: string;
        photoUrl: string | null;
        departmentId: string | null;
        departmentName: string | null;
      }
    >();
    for (const item of labelsData?.labelData ?? []) {
      map.set(item.employee.id, {
        fullName: item.employee.fullName,
        photoUrl: item.employee.photoUrl,
        departmentId: item.department?.id ?? null,
        departmentName: item.department?.name ?? null,
      });
    }
    return map;
  }, [labelsData]);

  /* ----- consolidated event list (after department filter) ----- */
  type CalendarRowKind = 'VACATION' | AbsenceType;
  interface CalendarRow {
    id: string;
    employeeId: string;
    kind: CalendarRowKind;
    startDate: string;
    endDate: string;
    sourceType: 'vacation' | 'absence';
    isPending: boolean;
  }

  const consolidatedRows = useMemo<CalendarRow[]>(() => {
    const rows: CalendarRow[] = [];

    if (includeVacations) {
      for (const vacation of vacationsQuery.vacations) {
        if (!vacation.scheduledStart || !vacation.scheduledEnd) continue;
        rows.push({
          id: `vac-${vacation.id}`,
          employeeId: vacation.employeeId,
          kind: 'VACATION',
          startDate: vacation.scheduledStart,
          endDate: vacation.scheduledEnd,
          sourceType: 'vacation',
          isPending: vacation.status === 'PENDING',
        });
      }
    }

    if (includeAbsencesEndpoint) {
      for (const absence of absencesQuery.absences) {
        rows.push({
          id: `abs-${absence.id}`,
          employeeId: absence.employeeId,
          kind: absence.type,
          startDate: absence.startDate,
          endDate: absence.endDate,
          sourceType: 'absence',
          isPending: absence.status === 'PENDING',
        });
      }
    }

    if (!filterDepartmentId) return rows;
    return rows.filter(row => {
      const employee = employeeLookup.get(row.employeeId);
      return employee?.departmentId === filterDepartmentId;
    });
  }, [
    vacationsQuery.vacations,
    absencesQuery.absences,
    employeeLookup,
    filterDepartmentId,
    includeVacations,
    includeAbsencesEndpoint,
  ]);

  /* ----- map to FullCalendar events ----- */
  const fullCalendarEvents = useMemo<EventInput[]>(() => {
    return consolidatedRows.map(row => {
      const color =
        TYPE_COLOR_MAP[row.kind] ?? TYPE_COLOR_MAP.OTHER ?? '#64748b';
      const employee = employeeLookup.get(row.employeeId);
      const title =
        employee?.fullName ?? `Funcionário ${row.employeeId.slice(0, 6)}`;

      return {
        id: row.id,
        title,
        start: row.startDate,
        end: row.endDate,
        allDay: true,
        backgroundColor: color,
        borderColor: color,
        textColor: '#ffffff',
        classNames: row.isPending ? ['os-vac-event-pending'] : undefined,
        extendedProps: { row },
      };
    });
  }, [consolidatedRows, employeeLookup]);

  /* ----- conflicts (heatmap) ----- */
  const conflictAbsenceItems = useMemo<ConflictAbsenceItem[]>(() => {
    return consolidatedRows.map(row => {
      const employee = employeeLookup.get(row.employeeId);
      return {
        employeeId: row.employeeId,
        startDate: row.startDate,
        endDate: row.endDate,
        departmentId: employee?.departmentId ?? null,
        departmentName: employee?.departmentName ?? null,
      };
    });
  }, [consolidatedRows, employeeLookup]);

  const weekConflicts: WeekConflictReport[] = useMemo(() => {
    if (departmentRefs.length === 0) return [];
    return calculateWeeklyConflicts({
      absences: conflictAbsenceItems,
      departments: departmentRefs,
      rangeStart: visibleStart,
      rangeEnd: visibleEnd,
    });
  }, [conflictAbsenceItems, departmentRefs, visibleStart, visibleEnd]);

  /* ----- sidebar lists ----- */
  const outToday = useMemo(() => {
    return filterAbsencesActiveOn(consolidatedRows, today);
  }, [consolidatedRows, today]);

  const upcoming7Days = useMemo(() => {
    return filterAbsencesStartingWithin(consolidatedRows, today, 7);
  }, [consolidatedRows, today]);

  /* ----- handlers ----- */
  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setVisibleStart(arg.start);
    setVisibleEnd(arg.end);
    setCurrentTitle(arg.view.title);
    setCurrentView(
      arg.view.type as 'dayGridMonth' | 'timeGridWeek' | 'listWeek'
    );
  }, []);

  useEffect(() => {
    const calendar = calendarRef.current?.getApi();
    if (calendar && calendar.view.type !== currentView) {
      calendar.changeView(currentView);
    }
  }, [currentView]);

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const row = arg.event.extendedProps.row as CalendarRow | undefined;
      if (!row) return;
      if (row.sourceType === 'vacation') {
        router.push(`/hr/vacations/${row.id.replace(/^vac-/, '')}`);
      } else {
        router.push(`/hr/absences/${row.id.replace(/^abs-/, '')}`);
      }
    },
    [router]
  );

  const handleGoToList = useCallback(() => {
    router.push('/hr/vacations');
  }, [router]);

  const handleRequestVacation = useCallback(() => {
    router.push('/hr/vacations?action=create');
  }, [router]);

  const handlePrev = useCallback(() => {
    calendarRef.current?.getApi().prev();
  }, []);
  const handleNext = useCallback(() => {
    calendarRef.current?.getApi().next();
  }, []);
  const handleToday = useCallback(() => {
    calendarRef.current?.getApi().today();
  }, []);

  /* ----- header buttons ----- */
  const actionButtons: HeaderButton[] = useMemo(() => {
    const buttons: HeaderButton[] = [];
    buttons.push({
      id: 'list-view',
      title: 'Ver lista',
      icon: ListIcon,
      onClick: handleGoToList,
      variant: 'outline',
    });
    if (canCreateVacations) {
      buttons.push({
        id: 'request-vacation',
        title: 'Solicitar férias',
        icon: Plus,
        onClick: handleRequestVacation,
        variant: 'default',
      });
    }
    return buttons;
  }, [canCreateVacations, handleGoToList, handleRequestVacation]);

  /* ----- loading + permission gating ----- */
  if (isLoadingPermissions) {
    return (
      <PageLayout>
        <GridLoading count={6} layout="grid" size="md" gap="gap-4" />
      </PageLayout>
    );
  }

  if (!canViewVacations) {
    return (
      <PageLayout>
        <PageBody>
          <GridError
            type="server"
            title="Sem permissão"
            message="Você não tem permissão para visualizar férias."
          />
        </PageBody>
      </PageLayout>
    );
  }

  const isCalendarLoading =
    (includeVacations && vacationsQuery.isLoading) ||
    (includeAbsencesEndpoint && absencesQuery.isLoading);

  const hasError =
    (includeVacations && vacationsQuery.isError) ||
    (includeAbsencesEndpoint && absencesQuery.isError);

  const hasAnyEvents = consolidatedRows.length > 0;

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Férias', href: '/hr/vacations' },
            { label: 'Calendário', href: '/hr/vacations/calendar' },
          ]}
          buttons={actionButtons}
        />
        <Header
          title="Calendário de Férias"
          description="Visão de equipe estilo BambooHR: quem está fora, quando e onde há conflito."
        />
      </PageHeader>

      <PageBody>
        <div data-testid="vacations-calendar-page" className="contents" />

        {/* Toolbar de filtros */}
        <Card className="px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Filtros
            </div>

            <div data-testid="vacations-calendar-filter-department">
              <FilterDropdown
                label="Departamento"
                icon={Users}
                options={departmentOptions}
                value={filterDepartmentId}
                onChange={value => setFilterDepartmentId(value)}
                activeColor="violet"
                searchPlaceholder="Buscar departamento..."
                emptyText="Nenhum departamento encontrado."
              />
            </div>

            <div data-testid="vacations-calendar-filter-type">
              <FilterDropdown
                label="Tipo"
                icon={Sun}
                options={TYPE_OPTIONS.filter(option => option.value !== 'ALL')}
                value={filterTypeKind === 'ALL' ? '' : filterTypeKind}
                onChange={value =>
                  setFilterTypeKind((value || 'ALL') as TypeFilterValue)
                }
                activeColor="emerald"
              />
            </div>

            <div data-testid="vacations-calendar-filter-approval">
              <FilterDropdown
                label="Aprovação"
                icon={Sparkles}
                options={APPROVAL_OPTIONS}
                value={filterApproval}
                onChange={value =>
                  setFilterApproval(
                    (value || 'APPROVED_ONLY') as ApprovalFilterValue
                  )
                }
                activeColor="blue"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="ml-3 hidden lg:flex items-center gap-2 text-sm font-medium">
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
              <span data-testid="vacations-calendar-title">{currentTitle}</span>
            </div>
            <div className="ml-3 inline-flex items-center rounded-md border border-border bg-white p-0.5 dark:bg-slate-800/60">
              {(
                [
                  { value: 'dayGridMonth', label: 'Mês' },
                  { value: 'timeGridWeek', label: 'Semana' },
                  { value: 'listWeek', label: 'Lista' },
                ] as const
              ).map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCurrentView(option.value)}
                  className={cn(
                    'rounded-sm px-2.5 py-1 text-xs font-medium transition-colors',
                    currentView === option.value
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Calendar */}
          <Card className="lg:col-span-3 p-0 overflow-hidden">
            <div
              data-testid="vacations-calendar-fc"
              className="os-vac-calendar h-[720px]"
            >
              {isCalendarLoading ? (
                <div className="p-6">
                  <GridLoading count={6} layout="list" size="md" gap="gap-2" />
                </div>
              ) : hasError ? (
                <div className="p-6">
                  <GridError
                    type="server"
                    title="Não foi possível carregar o calendário"
                    message="Tente novamente em instantes."
                    action={{
                      label: 'Tentar novamente',
                      onClick: () => {
                        vacationsQuery.refetch();
                        absencesQuery.refetch();
                      },
                    }}
                  />
                </div>
              ) : !hasAnyEvents ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-12 text-center">
                  <Palmtree className="h-12 w-12 text-emerald-500" />
                  <h3 className="text-lg font-semibold">
                    Nenhuma ausência neste mês
                  </h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Aproveite a equipe completa em campo. Quando houver férias
                    ou licenças nesta janela, aparecerão aqui automaticamente.
                  </p>
                  {canCreateVacations ? (
                    <Button
                      onClick={handleRequestVacation}
                      className="mt-2"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Solicitar férias
                    </Button>
                  ) : null}
                </div>
              ) : (
                <FullCalendar
                  ref={calendarRef}
                  plugins={[
                    dayGridPlugin,
                    timeGridPlugin,
                    listPlugin,
                    interactionPlugin,
                  ]}
                  initialView="dayGridMonth"
                  locale="pt-br"
                  firstDay={1}
                  headerToolbar={false}
                  events={fullCalendarEvents}
                  datesSet={handleDatesSet}
                  eventClick={handleEventClick}
                  eventDisplay="block"
                  dayMaxEvents={3}
                  moreLinkText={count => `+${count} mais`}
                  noEventsText="Nenhuma ausência registrada"
                  height="100%"
                  buttonText={{
                    today: 'Hoje',
                    month: 'Mês',
                    week: 'Semana',
                    day: 'Dia',
                    list: 'Agenda',
                  }}
                  allDayText="Dia inteiro"
                />
              )}
            </div>
          </Card>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Out today */}
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <Sun className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Fora hoje</p>
                    <p className="text-xs text-muted-foreground">
                      {dayMonthFormatter.format(today)}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {outToday.length}
                </span>
              </div>

              <div
                data-testid="vacations-sidebar-today"
                className="flex flex-col gap-2"
              >
                {outToday.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Equipe completa hoje.
                  </p>
                ) : (
                  outToday.slice(0, 6).map(row => {
                    const employee = employeeLookup.get(row.employeeId);
                    return (
                      <VacationEventCard
                        key={row.id}
                        employeeName={employee?.fullName ?? 'Funcionário'}
                        photoUrl={employee?.photoUrl}
                        kind={row.kind}
                        startDate={row.startDate}
                        endDate={row.endDate}
                        departmentName={employee?.departmentName ?? null}
                        onClick={() =>
                          row.sourceType === 'vacation'
                            ? router.push(
                                `/hr/vacations/${row.id.replace(/^vac-/, '')}`
                              )
                            : router.push(
                                `/hr/absences/${row.id.replace(/^abs-/, '')}`
                              )
                        }
                      />
                    );
                  })
                )}
                {outToday.length > 6 ? (
                  <p className="text-xs text-muted-foreground">
                    +{outToday.length - 6} pessoas a mais.
                  </p>
                ) : null}
              </div>
            </Card>

            {/* Upcoming 7 days */}
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-md bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                    <CalendarRange className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Próximos 7 dias</p>
                    <p className="text-xs text-muted-foreground">
                      Ausências começando em breve
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                  {upcoming7Days.length}
                </span>
              </div>

              <div
                data-testid="vacations-sidebar-upcoming"
                className="flex flex-col gap-2"
              >
                {upcoming7Days.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sem novas ausências programadas para a próxima semana.
                  </p>
                ) : (
                  upcoming7Days.slice(0, 6).map(row => {
                    const employee = employeeLookup.get(row.employeeId);
                    return (
                      <VacationEventCard
                        key={row.id}
                        employeeName={employee?.fullName ?? 'Funcionário'}
                        photoUrl={employee?.photoUrl}
                        kind={row.kind}
                        startDate={row.startDate}
                        endDate={row.endDate}
                        departmentName={employee?.departmentName ?? null}
                        onClick={() =>
                          row.sourceType === 'vacation'
                            ? router.push(
                                `/hr/vacations/${row.id.replace(/^vac-/, '')}`
                              )
                            : router.push(
                                `/hr/absences/${row.id.replace(/^abs-/, '')}`
                              )
                        }
                      />
                    );
                  })
                )}
              </div>
            </Card>

            {/* Conflicts */}
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-md bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      Conflitos identificados
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Semanas com mais de 30% do quadro fora
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  {weekConflicts.length}
                </span>
              </div>

              <div
                data-testid="vacations-sidebar-conflicts"
                className="flex flex-col gap-3"
              >
                {weekConflicts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum conflito identificado nesta janela.
                  </p>
                ) : (
                  weekConflicts.map((report, index) => (
                    <div
                      key={`${report.week.start.toISOString()}-${index}`}
                      className="rounded-lg border border-rose-200/70 bg-rose-50/40 p-3 dark:border-rose-400/30 dark:bg-rose-500/5"
                    >
                      <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                        Semana de {dayMonthFormatter.format(report.week.start)}{' '}
                        a {dayMonthFormatter.format(report.week.end)}
                      </p>
                      <ul className="mt-2 flex flex-col gap-2">
                        {report.conflictingDepartments.map(conflict => (
                          <li
                            key={conflict.departmentId}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                              {conflict.departmentName}
                            </span>
                            <span className="text-rose-700 dark:text-rose-300 font-semibold tabular-nums">
                              {conflict.absentCount}/{conflict.totalActive}{' '}
                              {'\u00b7'} {Math.round(conflict.ratio * 100)}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Legenda */}
            <Card className="p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                Legenda
              </p>
              <ul className="grid grid-cols-2 gap-2 text-xs">
                <li className="flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-emerald-500" /> Férias
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-rose-500" /> Atestado
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-violet-500" /> Lic.
                  parental
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-amber-500" /> Outras
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </PageBody>
    </PageLayout>
  );
}
