'use client';

import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageDashboardSections,
  type DashboardSection,
} from '@/components/layout/page-dashboard-sections';
import { PageHeroBanner } from '@/components/layout/page-hero-banner';
import {
  ADMIN_PERMISSIONS,
  FINANCE_PERMISSIONS,
  HR_PERMISSIONS,
  STOCK_PERMISSIONS,
} from '@/config/rbac/permission-codes';
import { usePermissions } from '@/hooks/use-permissions';
import {
  BadgeCheck,
  Box,
  Building2,
  Factory,
  FolderTree,
  Layers,
  LayoutTemplate,
  Network,
  Package,
  Truck,
  Upload,
  UserCheck,
  Users,
} from 'lucide-react';

const sections: DashboardSection[] = [
  {
    title: 'Estoque',
    cards: [
      {
        id: 'products',
        title: 'Produtos',
        description: 'Importar produtos com templates e categorias',
        icon: Package,
        href: '/import/stock/products',
        gradient: 'from-blue-500 to-blue-600',
        hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
        permission: STOCK_PERMISSIONS.PRODUCTS.IMPORT,
      },
      {
        id: 'variants',
        title: 'Variantes',
        description: 'Importar variantes de produtos',
        icon: Layers,
        href: '/import/stock/variants',
        gradient: 'from-purple-500 to-purple-600',
        hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-500/10',
        permission: STOCK_PERMISSIONS.VARIANTS.IMPORT,
      },
      {
        id: 'items',
        title: 'Itens',
        description: 'Importar itens de estoque',
        icon: Box,
        href: '/import/stock/items',
        gradient: 'from-green-500 to-green-600',
        hoverBg: 'hover:bg-green-50 dark:hover:bg-green-500/10',
        permission: STOCK_PERMISSIONS.ITEMS.IMPORT,
      },
      {
        id: 'suppliers',
        title: 'Fornecedores',
        description: 'Importar fornecedores e contatos',
        icon: Truck,
        href: '/import/stock/suppliers',
        gradient: 'from-orange-500 to-orange-600',
        hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-500/10',
        permission: FINANCE_PERMISSIONS.SUPPLIERS.IMPORT,
      },
      {
        id: 'categories',
        title: 'Categorias',
        description: 'Importar categorias de produtos',
        icon: FolderTree,
        href: '/import/stock/product-categories',
        gradient: 'from-yellow-500 to-yellow-600',
        hoverBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-500/10',
        permission: STOCK_PERMISSIONS.CATEGORIES.IMPORT,
      },
      {
        id: 'manufacturers',
        title: 'Fabricantes',
        description: 'Importar fabricantes via CNPJ',
        icon: Factory,
        href: '/import/stock/manufacturers',
        gradient: 'from-indigo-500 to-indigo-600',
        hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
        permission: STOCK_PERMISSIONS.MANUFACTURERS.IMPORT,
      },
      {
        id: 'templates',
        title: 'Templates',
        description: 'Importar templates de produtos',
        icon: LayoutTemplate,
        href: '/import/stock/templates',
        gradient: 'from-violet-500 to-violet-600',
        hoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-500/10',
        permission: STOCK_PERMISSIONS.TEMPLATES.IMPORT,
      },
    ],
  },
  {
    title: 'Recursos Humanos',
    cards: [
      {
        id: 'employees',
        title: 'Funcionários',
        description: 'Importar funcionários e colaboradores',
        icon: UserCheck,
        href: '/import/hr/employees',
        gradient: 'from-teal-500 to-teal-600',
        hoverBg: 'hover:bg-teal-50 dark:hover:bg-teal-500/10',
        permission: HR_PERMISSIONS.EMPLOYEES.IMPORT,
      },
      {
        id: 'departments',
        title: 'Departamentos',
        description: 'Importar departamentos organizacionais',
        icon: Network,
        href: '/import/hr/departments',
        gradient: 'from-cyan-500 to-cyan-600',
        hoverBg: 'hover:bg-cyan-50 dark:hover:bg-cyan-500/10',
        permission: HR_PERMISSIONS.DEPARTMENTS.IMPORT,
      },
      {
        id: 'positions',
        title: 'Cargos',
        description: 'Importar cargos e funções',
        icon: BadgeCheck,
        href: '/import/hr/positions',
        gradient: 'from-amber-500 to-amber-600',
        hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
        permission: HR_PERMISSIONS.POSITIONS.IMPORT,
      },
    ],
  },
  {
    title: 'Administração',
    cards: [
      {
        id: 'companies',
        title: 'Empresas',
        description: 'Importar empresas via CNPJ',
        icon: Building2,
        href: '/import/admin/companies',
        gradient: 'from-emerald-500 to-emerald-600',
        hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
        permission: ADMIN_PERMISSIONS.COMPANIES.IMPORT,
      },
      {
        id: 'users',
        title: 'Usuários',
        description: 'Importar usuários do sistema',
        icon: Users,
        href: '/import/admin/users',
        gradient: 'from-pink-500 to-pink-600',
        hoverBg: 'hover:bg-pink-50 dark:hover:bg-pink-500/10',
        permission: ADMIN_PERMISSIONS.USERS.IMPORT,
      },
    ],
  },
];

export default function ImportDashboardPage() {
  const { hasPermission } = usePermissions();

  return (
    <div className="space-y-8">
      <PageActionBar
        breadcrumbItems={[{ label: 'Importação', href: '/import' }]}
        actionButtons={[]}
        hasPermission={hasPermission}
      />

      <PageHeroBanner
        title="Importação de Dados"
        description="Importe dados em massa para o sistema via planilhas interativas. Selecione a entidade que deseja importar."
        icon={Upload}
        iconGradient="from-amber-500 to-amber-600"
        buttons={[]}
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
