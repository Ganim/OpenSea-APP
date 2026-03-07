'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFinanceCashflow } from '@/hooks/finance';
type CashflowGroupBy = 'day' | 'week' | 'month';

// Helper to get start/end of current month
function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function CashflowPage() {
  const router = useRouter();
  const defaultRange = getMonthRange();
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [groupBy, setGroupBy] = useState<CashflowGroupBy>('day');

  const { data, isLoading } = useFinanceCashflow({
    startDate,
    endDate,
    groupBy,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/finance')}
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Visualize entradas, saídas e saldo acumulado por período
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
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
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">
                        Período
                      </th>
                      <th className="text-right py-3 px-4 font-medium">
                        Entradas
                      </th>
                      <th className="text-right py-3 px-4 font-medium">
                        Saídas
                      </th>
                      <th className="text-right py-3 px-4 font-medium">
                        Fluxo Líquido
                      </th>
                      <th className="text-right py-3 px-4 font-medium">
                        Saldo Acumulado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((entry, index) => {
                      const isPositiveFlow = entry.netFlow >= 0;
                      return (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 px-4">{entry.period}</td>
                          <td className="py-3 px-4 text-right text-green-600 font-medium">
                            {formatCurrency(entry.inflow)}
                          </td>
                          <td className="py-3 px-4 text-right text-red-600 font-medium">
                            {formatCurrency(entry.outflow)}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-medium ${
                              isPositiveFlow ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(entry.netFlow)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {formatCurrency(entry.cumulativeBalance)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(data.summary.totalInflow)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <TrendingDown className="h-4 w-4" />
                    <span>Total Saídas</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(data.summary.totalOutflow)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fluxo Líquido</p>
                  <p
                    className={`text-2xl font-bold ${
                      data.summary.netFlow >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
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
