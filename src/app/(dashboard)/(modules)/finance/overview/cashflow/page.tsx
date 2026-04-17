'use client';

import { useState } from 'react';
import { Activity, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageActionBar } from '@/components/layout/page-action-bar';
import { PageHeroBanner } from '@/components/layout/page-hero-banner';
import { CashflowChart } from '@/components/finance/analytics/cashflow-chart';
import { useFinanceCashflow, useCashflowAccuracy } from '@/hooks/finance';
import { usePermissions } from '@/hooks/use-permissions';
import { formatCurrency } from '@/lib/format';

type CashflowGroupBy = 'day' | 'week' | 'month';

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Maps an accuracy percentage (0-100) to a semantic tier.
 * Thresholds: high >= 80%, medium >= 50%, low otherwise.
 */
function getAccuracyTier(accuracy: number): 'high' | 'medium' | 'low' {
  if (accuracy >= 80) return 'high';
  if (accuracy >= 50) return 'medium';
  return 'low';
}

const ACCURACY_CLASSES = {
  high: {
    badge:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: 'text-emerald-600',
  },
  medium: {
    badge:
      'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200 dark:border-amber-500/20',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    icon: 'text-amber-600',
  },
  low: {
    badge:
      'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border-rose-200 dark:border-rose-500/20',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    icon: 'text-rose-600',
  },
} as const;

function getAccuracyColorClass(accuracy: number): string {
  return ACCURACY_CLASSES[getAccuracyTier(accuracy)].badge;
}

function getAccuracyBgClass(accuracy: number): string {
  return ACCURACY_CLASSES[getAccuracyTier(accuracy)].bg;
}

function getAccuracyIconClass(accuracy: number): string {
  return ACCURACY_CLASSES[getAccuracyTier(accuracy)].icon;
}

export default function CashflowPage() {
  const { hasPermission } = usePermissions();
  const defaultRange = getMonthRange();
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [groupBy, setGroupBy] = useState<CashflowGroupBy>('day');

  const { data, isLoading, error, refetch, isFetching } = useFinanceCashflow({
    startDate,
    endDate,
    groupBy,
  });

  const { data: accuracyData, isLoading: isAccuracyLoading } =
    useCashflowAccuracy({
      startDate,
      endDate,
    });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageActionBar
        breadcrumbItems={[
          { label: 'Financeiro', href: '/finance' },
          { label: 'Visão Geral', href: '/finance/overview' },
          { label: 'Fluxo de Caixa' },
        ]}
        hasPermission={hasPermission}
      />

      <PageHeroBanner
        title="Fluxo de Caixa"
        description="Visualize entradas, saídas e saldo acumulado por período. Acompanhe a precisão das previsões e identifique tendências."
        icon={Activity}
        iconGradient="from-violet-500 to-indigo-600"
        buttons={[]}
        hasPermission={hasPermission}
      />

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Início</Label>
              <DatePicker
                id="startDate"
                value={startDate}
                onChange={v => setStartDate(typeof v === 'string' ? v : '')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Fim</Label>
              <DatePicker
                id="endDate"
                value={endDate}
                onChange={v => setEndDate(typeof v === 'string' ? v : '')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupBy">Agrupar por</Label>
              <Select
                value={groupBy}
                onValueChange={value => setGroupBy(value as CashflowGroupBy)}
              >
                <SelectTrigger id="groupBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Dia</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accuracy KPI Card */}
      {isAccuracyLoading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ) : accuracyData && accuracyData.periodCount > 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Precisão das Projeções
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold">
                    {accuracyData.accuracy.toFixed(1)}%
                  </p>
                  <Badge
                    variant="outline"
                    className={getAccuracyColorClass(accuracyData.accuracy)}
                  >
                    {accuracyData.accuracy >= 80
                      ? 'Excelente'
                      : accuracyData.accuracy >= 50
                        ? 'Moderada'
                        : 'Baixa'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Baseado em {accuracyData.periodCount} dia(s) com dados
                  comparáveis
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${getAccuracyBgClass(accuracyData.accuracy)}`}
              >
                <Target
                  className={`h-5 w-5 ${getAccuracyIconClass(accuracyData.accuracy)}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Error state — surfaces failed cashflow queries instead of falling
          through to the empty-state branch and looking like "no data". */}
      {error && (
        <Card className="border-rose-200 dark:border-rose-500/20 bg-rose-50/40 dark:bg-rose-500/5">
          <CardContent className="p-8 text-center space-y-3">
            <div className="mx-auto h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-rose-900 dark:text-rose-200">
                Não foi possível carregar o fluxo de caixa
              </p>
              <p className="text-sm text-rose-800 dark:text-rose-300">
                {error instanceof Error
                  ? error.message
                  : 'Erro ao consultar o fluxo de caixa.'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-2"
            >
              {isFetching ? 'Tentando...' : 'Tentar novamente'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Chart with projected overlay */}
      {!error && (
        <CashflowChart
          realizedData={data?.data.map(entry => ({
            date: entry.period,
            cumulativeBalance: entry.cumulativeBalance,
          }))}
          accuracyData={accuracyData ?? undefined}
          isLoading={isLoading}
          isAccuracyLoading={isAccuracyLoading}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
        />
      )}

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="h-8 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ) : !data || data.data.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Nenhum dado encontrado para o período selecionado
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table aria-label="Detalhamento do fluxo de caixa por período">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">
                        Período
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">
                        Entradas
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">
                        Saídas
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">
                        Fluxo Líquido
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">
                        Saldo Acumulado
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map(entry => {
                      const isPositiveFlow = entry.netFlow >= 0;
                      return (
                        <TableRow key={entry.period}>
                          <TableCell className="text-xs sm:text-sm">
                            {entry.period}
                          </TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium text-xs sm:text-sm">
                            {formatCurrency(entry.inflow)}
                          </TableCell>
                          <TableCell className="text-right text-rose-600 font-medium text-xs sm:text-sm">
                            {formatCurrency(entry.outflow)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium text-xs sm:text-sm ${
                              isPositiveFlow
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {formatCurrency(entry.netFlow)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-xs sm:text-sm">
                            {formatCurrency(entry.cumulativeBalance)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(data.summary.openingBalance)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Total Entradas</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(data.summary.totalInflow)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <TrendingDown className="h-4 w-4" />
                    <span>Total Saídas</span>
                  </div>
                  <p className="text-2xl font-bold text-rose-600">
                    {formatCurrency(data.summary.totalOutflow)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fluxo Líquido</p>
                  <p
                    className={`text-2xl font-bold ${
                      data.summary.netFlow >= 0
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(data.summary.netFlow)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Saldo Final</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(data.summary.closingBalance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
