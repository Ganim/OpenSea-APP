'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFinanceDashboard } from '@/hooks/finance';
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

interface KPICardData {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  href: string;
  accentBg: string;
  accentIcon: string;
  accentValue: string;
  isAlarming?: boolean;
}

function KPICardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </Card>
  );
}

export function FinanceKPICards() {
  const { data, isLoading } = useFinanceDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const overdueCount = data.overduePayableCount + data.overdueReceivableCount;
  const overdueTotal = data.overduePayable + data.overdueReceivable;

  const cards: KPICardData[] = [
    {
      label: 'A Pagar (Pendente)',
      value: formatCurrency(data.totalPayable),
      subtitle: `${data.upcomingPayable7Days > 0 ? formatCurrency(data.upcomingPayable7Days) + ' em 7 dias' : 'Nenhum pendente'}`,
      icon: ArrowDownCircle,
      href: '/finance/payable?status=PENDING',
      accentBg: 'bg-rose-50 dark:bg-rose-500/10',
      accentIcon: 'text-rose-600 dark:text-rose-400',
      accentValue: 'text-rose-700 dark:text-rose-300',
    },
    {
      label: 'A Receber (Pendente)',
      value: formatCurrency(data.totalReceivable),
      subtitle: `${data.upcomingReceivable7Days > 0 ? formatCurrency(data.upcomingReceivable7Days) + ' em 7 dias' : 'Nenhum pendente'}`,
      icon: ArrowUpCircle,
      href: '/finance/receivable?status=PENDING',
      accentBg: 'bg-emerald-50 dark:bg-emerald-500/10',
      accentIcon: 'text-emerald-600 dark:text-emerald-400',
      accentValue: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      label: 'Vencidos',
      value: formatCurrency(overdueTotal),
      subtitle: `${overdueCount} ${overdueCount === 1 ? 'conta' : 'contas'}`,
      icon: AlertTriangle,
      href: '/finance/overview/overdue',
      accentBg:
        overdueCount > 0
          ? 'bg-rose-600 dark:bg-rose-600'
          : 'bg-slate-100 dark:bg-slate-800',
      accentIcon:
        overdueCount > 0 ? 'text-white' : 'text-slate-500 dark:text-slate-400',
      accentValue:
        overdueCount > 0
          ? 'text-rose-700 dark:text-rose-300'
          : 'text-muted-foreground',
      isAlarming: overdueCount > 0,
    },
    {
      label: 'Pago este Mês',
      value: formatCurrency(data.paidThisMonth),
      subtitle: `Recebido: ${formatCurrency(data.receivedThisMonth)}`,
      icon: CheckCircle2,
      href: '/finance/payable?status=PAID',
      accentBg: 'bg-sky-50 dark:bg-sky-500/10',
      accentIcon: 'text-sky-600 dark:text-sky-400',
      accentValue: 'text-sky-700 dark:text-sky-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <Link key={card.label} href={card.href}>
          <Card
            className={`p-4 rounded-xl transition-colors hover:shadow-md cursor-pointer ${
              card.isAlarming ? 'border-rose-200 dark:border-rose-800/50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {card.label}
                </p>
                <p
                  className={`text-xl font-bold tracking-tight ${card.accentValue}`}
                >
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {card.subtitle}
                  </p>
                )}
              </div>
              <div className={`p-2.5 rounded-xl ${card.accentBg} shrink-0`}>
                <card.icon className={`h-5 w-5 ${card.accentIcon}`} />
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
