'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

interface CategoryData {
  categoryId: string;
  categoryName: string;
  total: number;
}

interface CategoryDistributionChartProps {
  data?: CategoryData[];
  isLoading: boolean;
}

const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 76%, 36%)',
  'hsl(0, 84%, 60%)',
  'hsl(45, 93%, 47%)',
  'hsl(280, 87%, 65%)',
  'hsl(199, 89%, 48%)',
  'hsl(24, 95%, 53%)',
  'hsl(330, 81%, 60%)',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function CategoryDistributionChart({
  data,
  isLoading,
}: CategoryDistributionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Nenhum dado disponivel para o periodo
          </p>
        </CardContent>
      </Card>
    );
  }

  // Build chart config dynamically from data
  const chartConfig: ChartConfig = {};
  const chartData = data.slice(0, 8).map((item, i) => {
    const key = `cat${i}`;
    chartConfig[key] = {
      label: item.categoryName,
      color: COLORS[i % COLORS.length],
    };
    return {
      name: item.categoryName,
      value: item.total,
      fill: COLORS[i % COLORS.length],
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart accessibilityLayer>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={value => formatCurrency(value as number)}
                  nameKey="name"
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {chartData.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
