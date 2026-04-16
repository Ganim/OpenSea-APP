'use client';

/**
 * Birthday & Anniversary Widget
 *
 * Inspired by BambooHR's "Celebrations" widget. Shows two stacked sections
 * inside a single card on the /hr hub:
 *
 *   1. Today  - confetti-styled highlight with birthdays and work anniversaries
 *      celebrated on the current day.
 *   2. This month - the rest of the month grouped by tabs.
 *
 * Each item exposes a "Felicitar" CTA that opens the SendKudosModal already
 * pre-filled (recipient + category + message template) so colleagues can
 * congratulate the celebrant in two clicks.
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { translateError } from '@/lib/error-messages';
import {
  formatDayMonth,
  getAnniversariesThisMonth,
  getAnniversariesToday,
  getBirthdaysThisMonth,
  getBirthdaysToday,
  type AnniversaryMatch,
  type BirthdayMatch,
  type MinimalEmployeeForBirthday,
} from '@/lib/hr/calculate-birthdays';
import { employeesService, portalService } from '@/services/hr';
import type { Employee, KudosCategory, SendKudosData } from '@/types/hr';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Cake, Gift, PartyPopper, Sparkles, Trophy, User } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

// Lazy-load the modal so the widget itself stays light.
const SendKudosModal = dynamic(
  () =>
    import(
      '@/app/(dashboard)/(modules)/hr/(entities)/kudos/src/modals/send-kudos-modal'
    ).then(m => ({ default: m.SendKudosModal })),
  { ssr: false }
);

// ---------------------------------------------------------------------------
// Pre-fill builders
// ---------------------------------------------------------------------------

interface PreFilledKudos {
  defaultRecipientId: string;
  defaultCategory: KudosCategory;
  defaultMessage: string;
}

function buildBirthdayKudos(
  match: BirthdayMatch<MinimalEmployeeForBirthday>
): PreFilledKudos {
  const firstName =
    match.employee.fullName.split(' ')[0] ?? match.employee.fullName;
  return {
    defaultRecipientId: match.employee.id,
    defaultCategory: 'HELPFULNESS',
    defaultMessage:
      `Feliz aniversário, ${firstName}! Que este novo ciclo seja repleto de ` +
      'conquistas, saúde e momentos especiais. Obrigado por fazer parte do time!',
  };
}

function buildAnniversaryKudos(
  match: AnniversaryMatch<MinimalEmployeeForBirthday>
): PreFilledKudos {
  const firstName =
    match.employee.fullName.split(' ')[0] ?? match.employee.fullName;
  const yearsLabel = match.years === 1 ? '1 ano' : `${match.years} anos`;
  return {
    defaultRecipientId: match.employee.id,
    defaultCategory: 'EXCELLENCE',
    defaultMessage:
      `Parabéns, ${firstName}, por ${yearsLabel} de empresa! Sua dedicação ` +
      'e contribuição fazem a diferença todos os dias. Obrigado por seguir com a gente!',
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface CelebrantRowProps {
  testId: string;
  employee: MinimalEmployeeForBirthday;
  /** Subtitle text shown beneath the name (e.g. dept + DD/MM or "X anos") */
  subtitle: string;
  icon: React.ElementType;
  iconBg: string;
  iconText: string;
  congratulateLabel?: string;
  onCongratulate: () => void;
  testIdCongratulate: string;
}

function CelebrantRow({
  testId,
  employee,
  subtitle,
  icon: Icon,
  iconBg,
  iconText,
  congratulateLabel = 'Felicitar',
  onCongratulate,
  testIdCongratulate,
}: CelebrantRowProps) {
  return (
    <li
      data-testid={testId}
      className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-3 py-2"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconText}`}
      >
        {employee.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar comes from arbitrary external storage URL
          <img
            src={employee.photoUrl}
            alt={employee.fullName}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/hr/employees/${employee.id}`}
          className="text-sm font-medium hover:underline truncate block"
        >
          {employee.fullName}
        </Link>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 px-2 text-xs"
        onClick={onCongratulate}
        data-testid={testIdCongratulate}
      >
        <PartyPopper className="h-3.5 w-3.5" />
        {congratulateLabel}
      </Button>
    </li>
  );
}

interface TodaySectionProps {
  birthdays: BirthdayMatch<MinimalEmployeeForBirthday>[];
  anniversaries: AnniversaryMatch<MinimalEmployeeForBirthday>[];
  onCongratulateBirthday: (
    match: BirthdayMatch<MinimalEmployeeForBirthday>
  ) => void;
  onCongratulateAnniversary: (
    match: AnniversaryMatch<MinimalEmployeeForBirthday>
  ) => void;
}

function TodaySection({
  birthdays,
  anniversaries,
  onCongratulateBirthday,
  onCongratulateAnniversary,
}: TodaySectionProps) {
  if (birthdays.length === 0 && anniversaries.length === 0) return null;

  return (
    <section
      data-testid="birthday-today-section"
      className="rounded-xl border border-violet-200/60 bg-gradient-to-br from-violet-50 via-white to-pink-50/40 p-4 dark:border-violet-500/20 dark:from-violet-500/8 dark:via-slate-900/40 dark:to-pink-500/8"
    >
      <header className="mb-3 flex items-center gap-2">
        <PartyPopper className="h-4 w-4 text-violet-500" />
        <h4 className="text-sm font-semibold text-foreground">
          Celebrações de hoje
        </h4>
      </header>

      <ul className="space-y-2">
        {birthdays.map(match => {
          const subtitleParts = [
            match.employee.department?.name,
            'Aniversariante do dia',
          ].filter(Boolean);
          return (
            <CelebrantRow
              key={`bday-today-${match.employee.id}`}
              testId={`birthday-item-${match.employee.id}`}
              testIdCongratulate={`birthday-congratulate-${match.employee.id}`}
              employee={match.employee}
              subtitle={subtitleParts.join(' · ')}
              icon={Cake}
              iconBg="bg-pink-50 dark:bg-pink-500/10"
              iconText="text-pink-600 dark:text-pink-300"
              onCongratulate={() => onCongratulateBirthday(match)}
            />
          );
        })}

        {anniversaries.map(match => {
          const yearsLabel =
            match.years === 1
              ? '1 ano de empresa'
              : `${match.years} anos de empresa`;
          const subtitleParts = [
            match.employee.department?.name,
            yearsLabel,
          ].filter(Boolean);
          return (
            <CelebrantRow
              key={`anniv-today-${match.employee.id}`}
              testId={`birthday-item-${match.employee.id}`}
              testIdCongratulate={`birthday-congratulate-${match.employee.id}`}
              employee={match.employee}
              subtitle={subtitleParts.join(' · ')}
              icon={Trophy}
              iconBg="bg-amber-50 dark:bg-amber-500/10"
              iconText="text-amber-600 dark:text-amber-300"
              onCongratulate={() => onCongratulateAnniversary(match)}
            />
          );
        })}
      </ul>
    </section>
  );
}

type MonthTab = 'birthdays' | 'anniversaries';

interface MonthSectionProps {
  birthdays: BirthdayMatch<MinimalEmployeeForBirthday>[];
  anniversaries: AnniversaryMatch<MinimalEmployeeForBirthday>[];
  onCongratulateBirthday: (
    match: BirthdayMatch<MinimalEmployeeForBirthday>
  ) => void;
  onCongratulateAnniversary: (
    match: AnniversaryMatch<MinimalEmployeeForBirthday>
  ) => void;
}

function MonthSection({
  birthdays,
  anniversaries,
  onCongratulateBirthday,
  onCongratulateAnniversary,
}: MonthSectionProps) {
  const [tab, setTab] = useState<MonthTab>(
    birthdays.length === 0 && anniversaries.length > 0
      ? 'anniversaries'
      : 'birthdays'
  );

  const hasAny = birthdays.length > 0 || anniversaries.length > 0;
  if (!hasAny) return null;

  return (
    <section data-testid="birthday-month-section" className="space-y-3">
      <header className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <h4 className="text-sm font-semibold text-foreground">
          Restante do mês
        </h4>
      </header>

      <Tabs value={tab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger
            value="birthdays"
            onClick={() => setTab('birthdays')}
            className="flex items-center gap-2 text-xs"
            data-testid="birthday-month-tab-birthdays"
          >
            <Cake className="h-3.5 w-3.5" />
            Aniversários ({birthdays.length})
          </TabsTrigger>
          <TabsTrigger
            value="anniversaries"
            onClick={() => setTab('anniversaries')}
            className="flex items-center gap-2 text-xs"
            data-testid="birthday-month-tab-anniversaries"
          >
            <Trophy className="h-3.5 w-3.5" />
            Empresa ({anniversaries.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === 'birthdays' ? (
        birthdays.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">
            Nenhum outro aniversário neste mês.
          </p>
        ) : (
          <ul className="space-y-2">
            {birthdays.map(match => {
              const subtitleParts = [
                match.employee.department?.name,
                formatDayMonth(match.day, match.month),
              ].filter(Boolean);
              return (
                <CelebrantRow
                  key={`bday-month-${match.employee.id}`}
                  testId={`birthday-item-${match.employee.id}`}
                  testIdCongratulate={`birthday-congratulate-${match.employee.id}`}
                  employee={match.employee}
                  subtitle={subtitleParts.join(' · ')}
                  icon={Cake}
                  iconBg="bg-pink-50 dark:bg-pink-500/10"
                  iconText="text-pink-600 dark:text-pink-300"
                  onCongratulate={() => onCongratulateBirthday(match)}
                />
              );
            })}
          </ul>
        )
      ) : anniversaries.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3 text-center">
          Nenhum aniversário de empresa neste mês.
        </p>
      ) : (
        <ul className="space-y-2">
          {anniversaries.map(match => {
            const yearsLabel =
              match.years === 1 ? '1 ano' : `${match.years} anos`;
            const subtitleParts = [
              match.employee.department?.name,
              `${formatDayMonth(match.day, match.month)} · ${yearsLabel}`,
            ].filter(Boolean);
            return (
              <CelebrantRow
                key={`anniv-month-${match.employee.id}`}
                testId={`birthday-item-${match.employee.id}`}
                testIdCongratulate={`birthday-congratulate-${match.employee.id}`}
                employee={match.employee}
                subtitle={subtitleParts.join(' · ')}
                icon={Trophy}
                iconBg="bg-amber-50 dark:bg-amber-500/10"
                iconText="text-amber-600 dark:text-amber-300"
                onCongratulate={() => onCongratulateAnniversary(match)}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main widget
// ---------------------------------------------------------------------------

function toMinimalEmployee(employee: Employee): MinimalEmployeeForBirthday {
  return {
    id: employee.id,
    fullName: employee.fullName,
    birthDate: employee.birthDate ?? null,
    hireDate: employee.hireDate,
    photoUrl: employee.photoUrl ?? null,
    department: employee.department ? { name: employee.department.name } : null,
    position: employee.position ? { name: employee.position.name } : null,
  };
}

export function BirthdayAnniversaryWidget() {
  const queryClient = useQueryClient();

  const [preFilledKudos, setPreFilledKudos] = useState<PreFilledKudos | null>(
    null
  );

  const { data, isLoading } = useQuery({
    queryKey: ['hr-birthday-widget-employees'],
    queryFn: async () => {
      const response = await employeesService.listEmployees({
        page: 1,
        perPage: 500,
        status: 'ACTIVE',
      });
      return response.employees.map(toMinimalEmployee);
    },
    staleTime: 30 * 60 * 1000, // 30 min — birth dates don't change often
  });

  const employees = useMemo(() => data ?? [], [data]);

  const birthdaysToday = useMemo(
    () => getBirthdaysToday(employees),
    [employees]
  );
  const anniversariesToday = useMemo(
    () => getAnniversariesToday(employees),
    [employees]
  );
  const birthdaysMonth = useMemo(
    () => getBirthdaysThisMonth(employees, { excludeToday: true }),
    [employees]
  );
  const anniversariesMonth = useMemo(
    () => getAnniversariesThisMonth(employees, { excludeToday: true }),
    [employees]
  );

  const sendKudosMutation = useMutation({
    mutationFn: (payload: SendKudosData) => portalService.sendKudos(payload),
    onSuccess: () => {
      toast.success('Felicitações enviadas com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['hr', 'kudos'] });
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(translateError(msg));
    },
  });

  const handleCongratulateBirthday = (
    match: BirthdayMatch<MinimalEmployeeForBirthday>
  ) => {
    setPreFilledKudos(buildBirthdayKudos(match));
  };

  const handleCongratulateAnniversary = (
    match: AnniversaryMatch<MinimalEmployeeForBirthday>
  ) => {
    setPreFilledKudos(buildAnniversaryKudos(match));
  };

  const totalThisMonth =
    birthdaysToday.length +
    anniversariesToday.length +
    birthdaysMonth.length +
    anniversariesMonth.length;

  return (
    <Card className="bg-white/5 p-5 space-y-4" data-testid="birthday-widget">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-pink-500 to-amber-500 text-white">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold">
              Aniversários e celebrações
            </h3>
            <p className="text-xs text-muted-foreground">
              Reconheça aniversariantes do mês e tempo de casa
            </p>
          </div>
        </div>
        <Link
          href="/hr/employees"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver equipe →
        </Link>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : totalThisMonth === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <User className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhum aniversário neste mês.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <TodaySection
            birthdays={birthdaysToday}
            anniversaries={anniversariesToday}
            onCongratulateBirthday={handleCongratulateBirthday}
            onCongratulateAnniversary={handleCongratulateAnniversary}
          />
          <MonthSection
            birthdays={birthdaysMonth}
            anniversaries={anniversariesMonth}
            onCongratulateBirthday={handleCongratulateBirthday}
            onCongratulateAnniversary={handleCongratulateAnniversary}
          />
        </div>
      )}

      <SendKudosModal
        isOpen={preFilledKudos !== null}
        onClose={() => setPreFilledKudos(null)}
        isSubmitting={sendKudosMutation.isPending}
        onSubmit={async payload => {
          await sendKudosMutation.mutateAsync(payload);
        }}
        defaultRecipientId={preFilledKudos?.defaultRecipientId}
        defaultCategory={preFilledKudos?.defaultCategory}
        defaultMessage={preFilledKudos?.defaultMessage}
        startOnMessageStep={preFilledKudos !== null}
      />
    </Card>
  );
}
