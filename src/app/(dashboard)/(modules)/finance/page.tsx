/**
 * Finance Module Landing Page
 * Página inicial do módulo financeiro com cards de navegação e contagens reais
 */

'use client';

import { DailySummaryBanner } from '@/components/finance/notifications/daily-summary-banner';
import { PageActionBar } from '@/components/layout/page-action-bar';
import { PageDashboardSections } from '@/components/layout/page-dashboard-sections';
import { PageHeroBanner } from '@/components/layout/page-hero-banner';
import {
  FINANCE_CARD_GRADIENTS,
  FINANCE_CARD_HOVER_BG,
} from '@/constants/finance';
import { usePermissions } from '@/hooks/use-permissions';
import { financeDashboardService } from '@/services/finance';

import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Building2,
  DollarSign,
  FileSpreadsheet,
  FileText,
  FolderTree,
  Landmark,
  LayoutDashboard,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
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
}

const sections: {
  title: string;
  cards: CardItem[];
}[] = [
  {
    title: 'Lançamentos',
    cards: [
      {
        id: 'payable',
        title: 'Contas a Pagar',
        description: 'Despesas e pagamentos pendentes',
        icon: ArrowDownCircle,
        href: '/finance/payable',
        gradient: FINANCE_CARD_GRADIENTS.payable,
        hoverBg: FINANCE_CARD_HOVER_BG.payable,
        countKey: 'payable',
      },
      {
        id: 'receivable',
        title: 'Contas a Receber',
        description: 'Receitas e recebimentos pendentes',
        icon: ArrowUpCircle,
        href: '/finance/receivable',
        gradient: FINANCE_CARD_GRADIENTS.receivable,
        hoverBg: FINANCE_CARD_HOVER_BG.receivable,
        countKey: 'receivable',
      },
      {
        id: 'overdue',
        title: 'Atrasados',
        description: 'Contas vencidas a pagar e receber',
        icon: AlertTriangle,
        href: '/finance/overview/overdue',
        gradient: FINANCE_CARD_GRADIENTS.overdue,
        hoverBg: FINANCE_CARD_HOVER_BG.overdue,
        countKey: 'overdue',
      },
      {
        id: 'recurring',
        title: 'Recorrências',
        description: 'Lançamentos recorrentes automáticos',
        icon: RefreshCw,
        href: '/finance/recurring',
        gradient: FINANCE_CARD_GRADIENTS.recurring,
        hoverBg: FINANCE_CARD_HOVER_BG.recurring,
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
        gradient: FINANCE_CARD_GRADIENTS.bankAccounts,
        hoverBg: FINANCE_CARD_HOVER_BG.bankAccounts,
        countKey: 'bankAccounts',
      },
      {
        id: 'cost-centers',
        title: 'Centros de Custo',
        description: 'Estrutura de centros de custo',
        icon: Target,
        href: '/finance/cost-centers',
        gradient: FINANCE_CARD_GRADIENTS.costCenters,
        hoverBg: FINANCE_CARD_HOVER_BG.costCenters,
        countKey: 'costCenters',
      },
      {
        id: 'categories',
        title: 'Categorias',
        description: 'Categorias de receitas e despesas',
        icon: FolderTree,
        href: '/finance/categories',
        gradient: FINANCE_CARD_GRADIENTS.categories,
        hoverBg: FINANCE_CARD_HOVER_BG.categories,
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
        gradient: FINANCE_CARD_GRADIENTS.loans,
        hoverBg: FINANCE_CARD_HOVER_BG.loans,
        countKey: 'loans',
      },
      {
        id: 'consortia',
        title: 'Consórcios',
        description: 'Acompanhamento de consórcios',
        icon: Users,
        href: '/finance/consortia',
        gradient: FINANCE_CARD_GRADIENTS.consortia,
        hoverBg: FINANCE_CARD_HOVER_BG.consortia,
        countKey: 'consortia',
      },
      {
        id: 'contracts',
        title: 'Contratos',
        description: 'Gestão de contratos com fornecedores',
        icon: FileText,
        href: '/finance/contracts',
        gradient: FINANCE_CARD_GRADIENTS.contracts,
        hoverBg: FINANCE_CARD_HOVER_BG.contracts,
        countKey: 'contracts',
      },
    ],
  },
  {
    title: 'Relatórios',
    cards: [
      {
        id: 'reports',
        title: 'Relatórios',
        description: 'DRE, balanço patrimonial e exportação',
        icon: FileText,
        href: '/finance/reports',
        gradient: FINANCE_CARD_GRADIENTS.reports,
        hoverBg: FINANCE_CARD_HOVER_BG.reports,
      },
      {
        id: 'export',
        title: 'Exportação Contábil',
        description: 'Exportar dados para contabilidade',
        icon: FileSpreadsheet,
        href: '/finance/reports/export',
        gradient: FINANCE_CARD_GRADIENTS.export,
        hoverBg: FINANCE_CARD_HOVER_BG.export,
      },
    ],
  },
];

const heroBannerButtons: (CardItem & { label: string })[] = [
  {
    id: 'dashboard',
    title: 'Dashboard Financeiro',
    label: 'Dashboard',
    description: 'Indicadores e resumo financeiro',
    icon: LayoutDashboard,
    href: '/finance/dashboard',
    gradient: FINANCE_CARD_GRADIENTS.dashboard,
    hoverBg: FINANCE_CARD_HOVER_BG.dashboard,
  },
  {
    id: 'analytics',
    title: 'Painel Financeiro',
    label: 'Painel Financeiro',
    description: 'Gráficos, KPIs e análise financeira',
    icon: TrendingUp,
    href: '/finance/reports/analytics',
    gradient: FINANCE_CARD_GRADIENTS.analytics,
    hoverBg: FINANCE_CARD_HOVER_BG.analytics,
  },
  {
    id: 'cashflow',
    title: 'Fluxo de Caixa',
    label: 'Fluxo de Caixa',
    description: 'Entradas, saídas e projeções',
    icon: TrendingUp,
    href: '/finance/overview/cashflow',
    gradient: FINANCE_CARD_GRADIENTS.cashflow,
    hoverBg: FINANCE_CARD_HOVER_BG.cashflow,
  },
];

export default function FinanceLandingPage() {
  const { hasPermission } = usePermissions();
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const overview = await financeDashboardService.getOverview();
        setCounts({
          payable: overview.payable.pending,
          receivable: overview.receivable.pending,
          overdue: overview.payable.overdue + overview.receivable.overdue,
          bankAccounts: overview.bankAccounts,
          costCenters: overview.costCenters,
          loans: overview.loans.total,
          consortia: overview.consortia.total,
          contracts: overview.contracts.total,
        });
      } catch {
        setCounts({});
      }
      setCountsLoading(false);
    }
    fetchCounts();
  }, []);

  return (
    <div className="space-y-8">
      <PageActionBar
        breadcrumbItems={[{ label: 'Financeiro', href: '/finance' }]}
        hasPermission={hasPermission}
      />

      <DailySummaryBanner />

      <PageHeroBanner
        title="Financeiro"
        description="Gerencie contas a pagar, receber, fluxo de caixa, empréstimos e consórcios da sua empresa."
        icon={DollarSign}
        iconGradient={FINANCE_CARD_GRADIENTS.heroIcon}
        buttons={heroBannerButtons.map(btn => ({
          id: btn.id,
          label: btn.label,
          icon: btn.icon,
          href: btn.href,
          gradient: btn.gradient,
          permission: btn.permission,
        }))}
        hasPermission={hasPermission}
      />

      <PageDashboardSections
        sections={sections}
        counts={counts}
        countsLoading={countsLoading}
        hasPermission={hasPermission}
      />
    </div>
  );
}
