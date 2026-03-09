'use client';

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
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TimeBank } from '@/types/hr';
import { Hourglass, Minus, Plus, SlidersHorizontal } from 'lucide-react';
import { Suspense, useCallback, useMemo, useState } from 'react';
import {
  formatBalance,
  getBalanceColor,
  formatYear,
  timeBankConfig,
  useListTimeBanks,
  useCreditTimeBank,
  useDebitTimeBank,
  useAdjustTimeBank,
  CreditModal,
  DebitModal,
  AdjustModal,
  ViewModal,
} from './src';

export default function TimeBankPage() {
  return (
    <Suspense
      fallback={<GridLoading count={6} layout="list" size="md" gap="gap-2" />}
    >
      <TimeBankPageContent />
    </Suspense>
  );
}

function TimeBankPageContent() {
  // Filters
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Modals
  const [creditOpen, setCreditOpen] = useState(false);
  const [debitOpen, setDebitOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [viewItem, setViewItem] = useState<TimeBank | null>(null);

  // Data
  const params = useMemo(
    () => ({
      employeeId: employeeFilter || undefined,
      year: yearFilter ? Number(yearFilter) : undefined,
    }),
    [employeeFilter, yearFilter]
  );

  const { data, isLoading, error, refetch } = useListTimeBanks(params);
  const credit = useCreditTimeBank({ onSuccess: () => setCreditOpen(false) });
  const debit = useDebitTimeBank({ onSuccess: () => setDebitOpen(false) });
  const adjust = useAdjustTimeBank({ onSuccess: () => setAdjustOpen(false) });

  const timeBanks = data?.timeBanks ?? [];

  // Handlers
  const handleCredit = useCallback(
    async (data: { employeeId: string; hours: number; year?: number }) => {
      await credit.mutateAsync(data);
    },
    [credit]
  );

  const handleDebit = useCallback(
    async (data: { employeeId: string; hours: number; year?: number }) => {
      await debit.mutateAsync(data);
    },
    [debit]
  );

  const handleAdjust = useCallback(
    async (data: { employeeId: string; newBalance: number; year?: number }) => {
      await adjust.mutateAsync(data);
    },
    [adjust]
  );

  // Header buttons
  const actionButtons = useMemo<HeaderButton[]>(
    () => [
      {
        id: 'adjust',
        title: 'Ajustar',
        icon: SlidersHorizontal,
        onClick: () => setAdjustOpen(true),
        variant: 'outline',
      },
      {
        id: 'debit',
        title: 'Debitar',
        icon: Minus,
        onClick: () => setDebitOpen(true),
        variant: 'outline',
        className:
          'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950',
      },
      {
        id: 'credit',
        title: 'Creditar',
        icon: Plus,
        onClick: () => setCreditOpen(true),
        variant: 'default',
        className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      },
    ],
    []
  );

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Banco de Horas', href: '/hr/time-bank' },
          ]}
          buttons={actionButtons}
        />
        <Header
          title="Banco de Horas"
          description="Gerencie o banco de horas dos funcionários"
        />
      </PageHeader>

      <PageBody>
        {/* Filtros */}
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="filter-employee" className="text-xs">
                Funcionário
              </Label>
              <Input
                id="filter-employee"
                placeholder="ID do funcionário"
                value={employeeFilter}
                onChange={e => setEmployeeFilter(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="filter-year" className="text-xs">
                Ano
              </Label>
              <Input
                id="filter-year"
                type="number"
                min="2020"
                max="2100"
                placeholder={String(new Date().getFullYear())}
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </Card>

        {/* Content */}
        {isLoading ? (
          <GridLoading count={6} layout="list" size="md" gap="gap-2" />
        ) : error ? (
          <GridError
            type="server"
            title="Erro ao carregar banco de horas"
            message="Ocorreu um erro ao carregar os registros de banco de horas. Por favor, tente novamente."
            action={{
              label: 'Tentar Novamente',
              onClick: () => {
                refetch();
              },
            }}
          />
        ) : timeBanks.length === 0 ? (
          <Card className="p-12 text-center">
            <Hourglass className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {timeBankConfig.display.labels.emptyState}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {timeBanks.map(tb => (
              <Card
                key={tb.id}
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setViewItem(tb)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground font-mono">
                    {tb.employeeId.slice(0, 8)}...
                  </span>
                  <Badge variant="outline">{formatYear(tb.year)}</Badge>
                </div>
                <p
                  className={`text-2xl font-bold font-mono ${getBalanceColor(tb.balance)}`}
                >
                  {formatBalance(tb.balance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Atualizado em{' '}
                  {new Date(tb.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </Card>
            ))}
          </div>
        )}

        {/* Modals */}
        <CreditModal
          isOpen={creditOpen}
          onClose={() => setCreditOpen(false)}
          onSubmit={handleCredit}
          isLoading={credit.isPending}
        />

        <DebitModal
          isOpen={debitOpen}
          onClose={() => setDebitOpen(false)}
          onSubmit={handleDebit}
          isLoading={debit.isPending}
        />

        <AdjustModal
          isOpen={adjustOpen}
          onClose={() => setAdjustOpen(false)}
          onSubmit={handleAdjust}
          isLoading={adjust.isPending}
        />

        <ViewModal
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          timeBank={viewItem}
        />
      </PageBody>
    </PageLayout>
  );
}
