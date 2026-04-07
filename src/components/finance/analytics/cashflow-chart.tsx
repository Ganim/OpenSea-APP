'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';
import type { CashflowAccuracyDataPoint } from '@/types/finance';

interface CashflowChartProps {
  realizedData?: { date: string; cumulativeBalance: number }[];
  projectedData?: { date: string; cumulativeNet: number }[];
  accuracyData?: {
    accuracy: number;
    dataPoints: CashflowAccuracyDataPoint[];
    periodCount: number;
  };
  isLoading: boolean;
  isAccuracyLoading?: boolean;
  groupBy: 'day' | 'week' | 'month';
  onGroupByChange: (value: 'day' | 'week' | 'month') => void;
}

const BASE_CHART_CONFIG: ChartConfig = {
  realized: {
    label: 'Realizado',
    color: 'hsl(217, 91%, 60%)',
  },
  projected: {
    label: 'Projetado',
    color: 'hsl(280, 87%, 65%)',
  },
};

const EXTENDED_CHART_CONFIG: ChartConfig = {
  ...BASE_CHART_CONFIG,
  predictedInflow: {
    label: 'Entrada Projetada',
    color: 'hsl(152, 69%, 55%)',
  },
  predictedOutflow: {
    label: 'Saída Projetada',
    color: 'hsl(350, 80%, 65%)',
  },
  actualInflow: {
    label: 'Entrada Realizada',
    color: 'hsl(152, 69%, 40%)',
  },
  actualOutflow: {
    label: 'Saída Realizada',
    color: 'hsl(350, 80%, 50%)',
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function getAccuracyVariant(
  accuracy: number
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (accuracy >= 80) return 'default';
  if (accuracy >= 50) return 'secondary';
  return 'destructive';
}

function getAccuracyColorClass(accuracy: number): string {
  if (accuracy >= 80)
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20';
  if (accuracy >= 50)
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200 dark:border-amber-500/20';
  return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border-rose-200 dark:border-rose-500/20';
}

export function CashflowChart({
  realizedData,
  projectedData,
  accuracyData,
  isLoading,
  isAccuracyLoading,
  groupBy,
  onGroupByChange,
}: CashflowChartProps) {
  const [showProjectedComparison, setShowProjectedComparison] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const showComparisonBars =
    showProjectedComparison &&
    accuracyData &&
    accuracyData.dataPoints.length > 0;

  const chartConfig = showComparisonBars
    ? EXTENDED_CHART_CONFIG
    : BASE_CHART_CONFIG;

  // Merge realized and projected data into a combined dataset
  const combinedData: Record<string, unknown>[] = [];

  const todayStr = new Date().toISOString().split('T')[0];

  if (realizedData) {
    for (const point of realizedData) {
      combinedData.push({
        date: point.date,
        realized: point.cumulativeBalance,
      });
    }
  }

  if (projectedData) {
    for (const point of projectedData) {
      const existing = combinedData.find(
        dataPoint => dataPoint.date === point.date
      );
      if (existing) {
        existing.projected = point.cumulativeNet;
      } else {
        combinedData.push({
          date: point.date,
          projected: point.cumulativeNet,
        });
      }
    }
  }

  // Merge accuracy data (predicted bars) if toggle is on
  if (showComparisonBars) {
    for (const accuracyPoint of accuracyData.dataPoints) {
      const existing = combinedData.find(
        dataPoint => dataPoint.date === accuracyPoint.date
      );
      if (existing) {
        existing.predictedInflow = accuracyPoint.predictedInflow;
        existing.predictedOutflow = accuracyPoint.predictedOutflow;
        existing.actualInflow = accuracyPoint.actualInflow;
        existing.actualOutflow = accuracyPoint.actualOutflow;
      } else {
        combinedData.push({
          date: accuracyPoint.date,
          predictedInflow: accuracyPoint.predictedInflow,
          predictedOutflow: accuracyPoint.predictedOutflow,
          actualInflow: accuracyPoint.actualInflow,
          actualOutflow: accuracyPoint.actualOutflow,
        });
      }
    }
  }

  combinedData.sort((a, b) => String(a.date).localeCompare(String(b.date)));

  if (combinedData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fluxo de Caixa</CardTitle>
          <GroupBySelector value={groupBy} onChange={onGroupByChange} />
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Nenhum dado disponível para o período
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CardTitle>Fluxo de Caixa</CardTitle>
          {showProjectedComparison && accuracyData && !isAccuracyLoading && (
            <Badge
              variant={getAccuracyVariant(accuracyData.accuracy)}
              className={getAccuracyColorClass(accuracyData.accuracy)}
            >
              Precisão: {accuracyData.accuracy.toFixed(0)}%
            </Badge>
          )}
          {showProjectedComparison && isAccuracyLoading && (
            <Skeleton className="h-5 w-24" />
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="show-projected"
              checked={showProjectedComparison}
              onCheckedChange={setShowProjectedComparison}
            />
            <Label
              htmlFor="show-projected"
              className="text-sm whitespace-nowrap"
            >
              Mostrar Projetado
            </Label>
          </div>
          <GroupBySelector value={groupBy} onChange={onGroupByChange} />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ComposedChart data={combinedData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                new Intl.NumberFormat('pt-BR', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(v)
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={value => formatCurrency(value as number)}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceLine
              x={todayStr}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label="Hoje"
            />

            {/* Predicted bars (semi-transparent, behind actual) */}
            {showComparisonBars && (
              <>
                <Bar
                  dataKey="predictedInflow"
                  fill="var(--color-predictedInflow)"
                  opacity={0.35}
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                />
                <Bar
                  dataKey="predictedOutflow"
                  fill="var(--color-predictedOutflow)"
                  opacity={0.35}
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                />
                <Bar
                  dataKey="actualInflow"
                  fill="var(--color-actualInflow)"
                  opacity={0.85}
                  radius={[4, 4, 0, 0]}
                  barSize={8}
                />
                <Bar
                  dataKey="actualOutflow"
                  fill="var(--color-actualOutflow)"
                  opacity={0.85}
                  radius={[4, 4, 0, 0]}
                  barSize={8}
                />
              </>
            )}

            <Line
              type="monotone"
              dataKey="realized"
              stroke="var(--color-realized)"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="var(--color-projected)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function GroupBySelector({
  value,
  onChange,
}: {
  value: 'day' | 'week' | 'month';
  onChange: (v: 'day' | 'week' | 'month') => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={v => onChange(v as 'day' | 'week' | 'month')}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="day">Dia</SelectItem>
        <SelectItem value="week">Semana</SelectItem>
        <SelectItem value="month">Mês</SelectItem>
      </SelectContent>
    </Select>
  );
}
