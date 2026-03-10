'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';

interface CashflowChartProps {
  realizedData?: { date: string; cumulativeBalance: number }[];
  projectedData?: { date: string; cumulativeNet: number }[];
  isLoading: boolean;
  groupBy: 'day' | 'week' | 'month';
  onGroupByChange: (value: 'day' | 'week' | 'month') => void;
}

const chartConfig: ChartConfig = {
  realized: {
    label: 'Realizado',
    color: 'hsl(217, 91%, 60%)',
  },
  projected: {
    label: 'Projetado',
    color: 'hsl(280, 87%, 65%)',
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function CashflowChart({
  realizedData,
  projectedData,
  isLoading,
  groupBy,
  onGroupByChange,
}: CashflowChartProps) {
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

  // Merge realized and projected data into a combined dataset
  const combinedData: {
    date: string;
    realized?: number;
    projected?: number;
  }[] = [];

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
      const existing = combinedData.find((d) => d.date === point.date);
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

  combinedData.sort((a, b) => a.date.localeCompare(b.date));

  if (combinedData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fluxo de Caixa</CardTitle>
          <GroupBySelector value={groupBy} onChange={onGroupByChange} />
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Nenhum dado disponivel para o periodo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fluxo de Caixa</CardTitle>
        <GroupBySelector value={groupBy} onChange={onGroupByChange} />
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
                  formatter={(value) => formatCurrency(value as number)}
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
    <Select value={value} onValueChange={(v) => onChange(v as 'day' | 'week' | 'month')}>
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="day">Dia</SelectItem>
        <SelectItem value="week">Semana</SelectItem>
        <SelectItem value="month">Mes</SelectItem>
      </SelectContent>
    </Select>
  );
}
