/**
 * Sales Module Landing Page
 * Página inicial do módulo de vendas com cards de navegação para todas as sub-seções do CRM
 */

'use client';

import { PageActionBar } from '@/components/layout/page-action-bar';
import { PageDashboardSections } from '@/components/layout/page-dashboard-sections';
import { PageHeroBanner } from '@/components/layout/page-hero-banner';
import { usePermissions } from '@/hooks/use-permissions';

import {
  BarChart3,
  Contact,
  DollarSign,
  GitBranch,
  Megaphone,
  MessageSquare,
  ShoppingBag,
  ShoppingCart,
  Store,
  Users,
} from 'lucide-react';

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
    title: 'CRM',
    cards: [
      {
        id: 'customers',
        title: 'Clientes',
        description: 'Cadastro e gestão de clientes',
        icon: Users,
        href: '/sales/customers',
        gradient: 'from-blue-500 to-blue-600',
        hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
      },
      {
        id: 'contacts',
        title: 'Contatos',
        description: 'Pessoas e contatos comerciais',
        icon: Contact,
        href: '/sales/contacts',
        gradient: 'from-emerald-500 to-emerald-600',
        hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
      },
      {
        id: 'pipelines',
        title: 'Pipeline',
        description: 'Funil de vendas e oportunidades',
        icon: GitBranch,
        href: '/sales/pipelines',
        gradient: 'from-violet-500 to-violet-600',
        hoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-500/10',
      },
      {
        id: 'inbox',
        title: 'Inbox',
        description: 'Central de mensagens comerciais — Em breve',
        icon: MessageSquare,
        href: '/sales/inbox',
        gradient: 'from-cyan-500 to-cyan-600',
        hoverBg: 'hover:bg-cyan-50 dark:hover:bg-cyan-500/10',
      },
    ],
  },
  {
    title: 'Operações',
    cards: [
      {
        id: 'orders',
        title: 'Pedidos',
        description: 'Gestão de pedidos de venda — Em breve',
        icon: ShoppingCart,
        href: '/sales/orders',
        gradient: 'from-amber-500 to-amber-600',
        hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
      },
      {
        id: 'pos',
        title: 'PDV',
        description: 'Ponto de venda e caixa — Em breve',
        icon: Store,
        href: '/sales/pos',
        gradient: 'from-orange-500 to-orange-600',
        hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-500/10',
      },
    ],
  },
  {
    title: 'Precificação',
    cards: [
      {
        id: 'pricing',
        title: 'Tabelas de Preço',
        description: 'Tabelas e políticas de precificação — Em breve',
        icon: DollarSign,
        href: '/sales/pricing',
        gradient: 'from-teal-500 to-teal-600',
        hoverBg: 'hover:bg-teal-50 dark:hover:bg-teal-500/10',
      },
      {
        id: 'campaigns',
        title: 'Campanhas',
        description: 'Promoções e campanhas de vendas — Em breve',
        icon: Megaphone,
        href: '/sales/campaigns',
        gradient: 'from-rose-500 to-rose-600',
        hoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-500/10',
      },
    ],
  },
  {
    title: 'Inteligência',
    cards: [
      {
        id: 'analytics',
        title: 'Analytics',
        description: 'Relatórios e indicadores de vendas — Em breve',
        icon: BarChart3,
        href: '/sales/analytics',
        gradient: 'from-indigo-500 to-indigo-600',
        hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
      },
    ],
  },
];

const heroBannerButtons: (CardItem & { label: string })[] = [
  {
    id: 'pipeline',
    title: 'Pipeline de Vendas',
    label: 'Pipeline',
    description: 'Visualize o funil de vendas',
    icon: GitBranch,
    href: '/sales/pipelines',
    gradient: 'from-violet-500 to-violet-600',
    hoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-500/10',
  },
  {
    id: 'customers-btn',
    title: 'Clientes',
    label: 'Clientes',
    description: 'Acesse a base de clientes',
    icon: Users,
    href: '/sales/customers',
    gradient: 'from-blue-500 to-blue-600',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
  },
];

export default function SalesLandingPage() {
  const { hasPermission } = usePermissions();

  return (
    <div className="space-y-8">
      <PageActionBar
        breadcrumbItems={[{ label: 'Vendas', href: '/sales' }]}
        hasPermission={hasPermission}
      />

      <PageHeroBanner
        title="Vendas"
        description="Gerencie clientes, contatos, pipeline de vendas e acompanhe o desempenho comercial da sua empresa."
        icon={ShoppingBag}
        iconGradient="from-violet-500 to-indigo-600"
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
        counts={{}}
        countsLoading={false}
        hasPermission={hasPermission}
      />
    </div>
  );
}
