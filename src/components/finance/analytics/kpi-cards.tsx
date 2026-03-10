'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { FinanceDashboard } from '@/types/finance';
import {
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
} from 'lucide-react';

interface KPICardsProps {
  data?: FinanceDashboard;
  isLoading: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function KPICards({ data, isLoading }: KPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    {
      title: 'Saldo Total',
      value: formatCurrency(data.cashBalance),
      icon: DollarSign,
      color: data.cashBalance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor:
        data.cashBalance >= 0
          ? 'bg-green-100 dark:bg-green-900/30'
          : 'bg-red-100 dark:bg-red-900/30',
      iconColor: data.cashBalance >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: 'A Pagar Hoje',
      value: formatCurrency(data.totalPayable),
      icon: ArrowDownCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600',
    },
    {
      title: 'A Receber Hoje',
      value: formatCurrency(data.totalReceivable),
      icon: ArrowUpCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600',
    },
    {
      title: 'Contas Vencidas',
      value: formatCurrency(data.overduePayable + data.overdueReceivable),
      subtitle: `${data.overduePayableCount + data.overdueReceivableCount} contas`,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {card.subtitle}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
