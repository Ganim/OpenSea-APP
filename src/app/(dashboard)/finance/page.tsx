/**
 * Finance Module Landing Page
 * Página inicial do módulo financeiro com cards de navegação e contagens reais
 */

'use client';

import { Card } from '@/components/ui/card';
import { UI_PERMISSIONS } from '@/config/rbac/permission-codes';
import { useTenant } from '@/contexts/tenant-context';
import { usePermissions } from '@/hooks/use-permissions';
import {
  financeEntriesService,
  bankAccountsService,
  costCentersService,
  loansService,
  consortiaService,
} from '@/services/finance';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  Building2,
  DollarSign,
  FileSpreadsheet,
  FolderTree,
  Landmark,
  LayoutDashboard,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CardItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
  hoverBg: string;
  permission?: string;
  countKey?: string;
  variant?: 'default' | 'alert';
}

const sections: {
  title: string;
  cards: CardItem[];
}[] = [
  {
    title: 'Visão Geral',
    cards: [
      {
        id: 'dashboard',
        title: 'Dashboard Financeiro',
        description: 'Indicadores e resumo financeiro',
        icon: LayoutDashboard,
        href: '/finance',
        gradient: 'from-blue-500 to-blue-600',
        hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
      },
      {
        id: 'cashflow',
        title: 'Fluxo de Caixa',
        description: 'Entradas, saídas e projeções',
        icon: TrendingUp,
        href: '/finance/cashflow',
        gradient: 'from-slate-500 to-slate-600',
        hoverBg: 'hover:bg-slate-50 dark:hover:bg-slate-500/10',
      },
    ],
  },
  {
    title: 'Lançamentos',
    cards: [
      {
        id: 'payable',
        title: 'Contas a Pagar',
        description: 'Despesas e pagamentos pendentes',
        icon: ArrowDownCircle,
        href: '/finance/payable',
        gradient: 'from-red-500 to-red-600',
        hoverBg: 'hover:bg-red-50 dark:hover:bg-red-500/10',
        countKey: 'payable',
      },
      {
        id: 'receivable',
        title: 'Contas a Receber',
        description: 'Receitas e recebimentos pendentes',
        icon: ArrowUpCircle,
        href: '/finance/receivable',
        gradient: 'from-green-500 to-green-600',
        hoverBg: 'hover:bg-green-50 dark:hover:bg-green-500/10',
        countKey: 'receivable',
      },
      {
        id: 'overdue',
        title: 'Atrasados',
        description: 'Contas vencidas a pagar e receber',
        icon: AlertTriangle,
        href: '/finance/overdue',
        gradient: 'from-amber-500 to-amber-600',
        hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
        variant: 'alert',
        countKey: 'overdue',
      },
    ],
  },
  {
    title: 'Cadastros',
    cards: [
      {
        id: 'bank-accounts',
        title: 'Contas Bancárias',
        description: 'Gestão de contas e saldos',
        icon: Building2,
        href: '/finance/bank-accounts',
        gradient: 'from-purple-500 to-purple-600',
        hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-500/10',
        countKey: 'bankAccounts',
      },
      {
        id: 'cost-centers',
        title: 'Centros de Custo',
        description: 'Estrutura de centros de custo',
        icon: Target,
        href: '/finance/cost-centers',
        gradient: 'from-emerald-500 to-emerald-600',
        hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
        countKey: 'costCenters',
      },
      {
        id: 'categories',
        title: 'Categorias',
        description: 'Categorias de receitas e despesas',
        icon: FolderTree,
        href: '/finance/categories',
        gradient: 'from-cyan-500 to-cyan-600',
        hoverBg: 'hover:bg-cyan-50 dark:hover:bg-cyan-500/10',
      },
    ],
  },
  {
    title: 'Crédito',
    cards: [
      {
        id: 'loans',
        title: 'Empréstimos',
        description: 'Controle de empréstimos e parcelas',
        icon: Landmark,
        href: '/finance/loans',
        gradient: 'from-orange-500 to-orange-600',
        hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-500/10',
        countKey: 'loans',
      },
      {
        id: 'consortia',
        title: 'Consórcios',
        description: 'Acompanhamento de consórcios',
        icon: Users,
        href: '/finance/consortia',
        gradient: 'from-pink-500 to-pink-600',
        hoverBg: 'hover:bg-pink-50 dark:hover:bg-pink-500/10',
        countKey: 'consortia',
      },
    ],
  },
  {
    title: 'Relatórios',
    cards: [
      {
        id: 'export',
        title: 'Exportação Contábil',
        description: 'Exportar dados para contabilidade',
        icon: FileSpreadsheet,
        href: '/finance/export',
        gradient: 'from-indigo-500 to-indigo-600',
        hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
      },
    ],
  },
];

export default function FinanceLandingPage() {
  const { currentTenant } = useTenant();
  const { hasPermission } = usePermissions();
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [countsLoading, setCountsLoading] = useState(true);

  const tenantName = currentTenant?.name || 'Sua Empresa';

  useEffect(() => {
    async function fetchCounts() {
      const [
        payable,
        receivable,
        overdue,
        bankAccounts,
        costCenters,
        loans,
        consortia,
      ] = await Promise.allSettled([
        financeEntriesService.list({
          type: 'PAYABLE',
          status: 'PENDING',
          page: 1,
          perPage: 1,
        }),
        financeEntriesService.list({
          type: 'RECEIVABLE',
          status: 'PENDING',
          page: 1,
          perPage: 1,
        }),
        financeEntriesService.list({ isOverdue: true, page: 1, perPage: 1 }),
        bankAccountsService.list({ page: 1, perPage: 1 }),
        costCentersService.list({ page: 1, perPage: 1 }),
        loansService.list({ page: 1, perPage: 1 }),
        consortiaService.list({ page: 1, perPage: 1 }),
      ]);

      setCounts({
        payable:
          payable.status === 'fulfilled'
            ? (payable.value.meta?.total ??
              payable.value.entries?.length ??
              null)
            : null,
        receivable:
          receivable.status === 'fulfilled'
            ? (receivable.value.meta?.total ??
              receivable.value.entries?.length ??
              null)
            : null,
        overdue:
          overdue.status === 'fulfilled'
            ? (overdue.value.meta?.total ??
              overdue.value.entries?.length ??
              null)
            : null,
        bankAccounts:
          bankAccounts.status === 'fulfilled'
            ? (bankAccounts.value.meta?.total ??
              bankAccounts.value.bankAccounts?.length ??
              null)
            : null,
        costCenters:
          costCenters.status === 'fulfilled'
            ? (costCenters.value.meta?.total ??
              costCenters.value.costCenters?.length ??
              null)
            : null,
        loans:
          loans.status === 'fulfilled'
            ? (loans.value.meta?.total ?? loans.value.loans?.length ?? null)
            : null,
        consortia:
          consortia.status === 'fulfilled'
            ? (consortia.value.meta?.total ??
              consortia.value.consortia?.length ??
              null)
            : null,
      });
      setCountsLoading(false);
    }
    fetchCounts();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden p-8 md:p-12 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full opacity-80 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full opacity-80 translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-linear-to-br from-blue-500 to-emerald-600">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-white/60">
                {tenantName}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Financeiro
            </h1>

            <p className="text-lg text-gray-600 dark:text-white/60">
              Gerencie contas a pagar, receber, fluxo de caixa, empréstimos e
              consórcios da sua empresa.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Sections */}
      {sections.map((section, sectionIndex) => {
        const visibleCards = section.cards.filter(
          card => !card.permission || hasPermission(card.permission)
        );

        if (visibleCards.length === 0) return null;

        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + sectionIndex * 0.1 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleCards.map((card, cardIndex) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + sectionIndex * 0.1 + cardIndex * 0.05,
                  }}
                >
                  <Link href={card.href}>
                    <Card
                      className={`p-6 h-full bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10 transition-all group ${card.hoverBg}`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`w-12 h-12 rounded-xl bg-linear-to-br ${card.gradient} flex items-center justify-center`}
                          >
                            <card.icon className="h-6 w-6 text-white" />
                          </div>
                          {card.countKey && (
                            <CountBadge
                              count={counts[card.countKey]}
                              loading={countsLoading}
                              variant={card.variant}
                            />
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                          {card.title}
                          <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-white/60">
                          {card.description}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function CountBadge({
  count,
  loading,
  variant = 'default',
}: {
  count: number | null | undefined;
  loading: boolean;
  variant?: 'default' | 'alert';
}) {
  if (loading) {
    return (
      <div className="h-6 w-12 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
    );
  }

  if (count === null || count === undefined) return null;

  const bgClass =
    variant === 'alert'
      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
      : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgClass}`}
    >
      {count.toLocaleString('pt-BR')}
    </span>
  );
}
