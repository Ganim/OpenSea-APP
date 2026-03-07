/**
 * Stock Module Landing Page
 * Página inicial do módulo de estoque com cards de navegação e contagens reais
 */

'use client';

import { PageActionBar } from '@/components/layout/page-action-bar';
import { PageDashboardSections } from '@/components/layout/page-dashboard-sections';
import { PageHeroBanner } from '@/components/layout/page-hero-banner';
import {
  DATA_PERMISSIONS,
  STOCK_PERMISSIONS,
} from '@/config/rbac/permission-codes';
import { useTenant } from '@/contexts/tenant-context';
import { usePermissions } from '@/hooks/use-permissions';
import {
  categoriesService,
  itemsService,
  manufacturersService,
  productsService,
  purchaseOrdersService,
  suppliersService,
  templatesService,
} from '@/services/stock';

import {
  Factory,
  Folder,
  History,
  LayoutList,
  MapPin,
  Package,
  ShoppingCart,
  Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { GrObjectGroup } from 'react-icons/gr';

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
    title: 'Cadastros',
    cards: [
      {
        id: 'templates',
        title: 'Templates',
        description: 'Modelos de atributos para produtos',
        icon: GrObjectGroup,
        href: '/stock/templates',
        gradient: 'from-cyan-500 to-cyan-600',
        hoverBg: 'hover:bg-cyan-50 dark:hover:bg-cyan-500/10',
        permission: STOCK_PERMISSIONS.TEMPLATES.LIST,
        countKey: 'templates',
      },
      {
        id: 'products',
        title: 'Produtos',
        description: 'Catálogo de produtos e variantes',
        icon: Package,
        href: '/stock/products',
        gradient: 'from-blue-500 to-blue-600',
        hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
        permission: STOCK_PERMISSIONS.PRODUCTS.LIST,
        countKey: 'products',
      },

      {
        id: 'manufacturers',
        title: 'Fabricantes',
        description: 'Cadastro de fabricantes e marcas',
        icon: Factory,
        href: '/stock/manufacturers',
        gradient: 'from-orange-500 to-orange-600',
        hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-500/10',
        permission: STOCK_PERMISSIONS.MANUFACTURERS.LIST,
        countKey: 'manufacturers',
      },
      {
        id: 'locations',
        title: 'Localizações',
        description: 'Armazéns, zonas e endereços de estoque',
        icon: MapPin,
        href: '/stock/locations',
        gradient: 'from-rose-500 to-rose-600',
        hoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-500/10',
        permission: STOCK_PERMISSIONS.LOCATIONS.LIST,
      },
      {
        id: 'categories',
        title: 'Categorias',
        description: 'Categorias hierárquicas de produtos',
        icon: Folder,
        href: '/stock/product-categories',
        gradient: 'from-indigo-500 to-indigo-600',
        hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
        permission: STOCK_PERMISSIONS.CATEGORIES.LIST,
        countKey: 'categories',
      },
    ],
  },
];

const actionButtons: (CardItem & {
  label: string;
  variant: 'default' | 'outline';
})[] = [
  {
    id: 'import',
    title: 'Importação',
    label: 'Importação',
    description: 'Importe dados em massa via planilhas',
    icon: Upload,
    href: '/import',
    variant: 'outline',
    gradient: 'from-amber-500 to-amber-600',
    hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
    permission: DATA_PERMISSIONS.IMPORT.PRODUCTS,
  },
  {
    id: 'purchase-orders',
    title: 'Ordens de Compra',
    label: 'Ordens de Compra',
    description: 'Gerencie pedidos de compra e recebimentos',
    icon: ShoppingCart,
    href: '/stock/requests/purchase-orders',
    variant: 'default',
    gradient: 'from-purple-500 to-purple-600',
    hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-500/10',
    permission: STOCK_PERMISSIONS.PURCHASE_ORDERS.LIST,
    countKey: 'purchaseOrders',
  },
] as const;

const heroBannerButtons: (CardItem & { label: string })[] = [
  {
    id: 'overview',
    title: 'Estoque Geral',
    label: 'Consultar Estoque',
    description: 'Visualize todos os itens em estoque',
    icon: LayoutList,
    href: '/stock/overview/list',
    gradient: 'from-emerald-500 to-emerald-600',
    hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
    permission: STOCK_PERMISSIONS.ITEMS.LIST,
    countKey: 'items',
  },
  {
    id: 'movements',
    title: 'Movimentações',
    label: 'Consultar Movimentações',
    description: 'Histórico de entradas, saídas e transferências',
    icon: History,
    href: '/stock/overview/movements',
    gradient: 'from-slate-500 to-slate-600',
    hoverBg: 'hover:bg-slate-50 dark:hover:bg-slate-500/10',
    permission: STOCK_PERMISSIONS.MOVEMENTS.LIST,
  },
];

export default function StockLandingPage() {
  const { currentTenant } = useTenant();
  const { hasPermission } = usePermissions();
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [countsLoading, setCountsLoading] = useState(true);

  const tenantName = currentTenant?.name || 'Sua Empresa';

  useEffect(() => {
    async function fetchCounts() {
      const [
        products,
        items,
        purchaseOrders,
        templates,
        manufacturers,
        suppliers,
        categories,
      ] = await Promise.allSettled([
        productsService.listProducts(),
        itemsService.listItems(),
        purchaseOrdersService.list({ page: 1, limit: 1 }),
        templatesService.listTemplates(),
        manufacturersService.listManufacturers(),
        suppliersService.listSuppliers(),
        categoriesService.listCategories(),
      ]);

      setCounts({
        products:
          products.status === 'fulfilled'
            ? products.value.products.length
            : null,
        items: items.status === 'fulfilled' ? items.value.items.length : null,
        purchaseOrders:
          purchaseOrders.status === 'fulfilled'
            ? (purchaseOrders.value.pagination?.total ??
              purchaseOrders.value.purchaseOrders.length)
            : null,
        templates:
          templates.status === 'fulfilled'
            ? templates.value.templates.length
            : null,
        manufacturers:
          manufacturers.status === 'fulfilled'
            ? manufacturers.value.manufacturers.length
            : null,
        suppliers:
          suppliers.status === 'fulfilled'
            ? suppliers.value.suppliers.length
            : null,
        categories:
          categories.status === 'fulfilled'
            ? categories.value.categories.length
            : null,
      });
      setCountsLoading(false);
    }
    fetchCounts();
  }, []);

  return (
    <div className="space-y-8 ">
      <PageActionBar
        breadcrumbItems={[{ label: 'Estoque', href: '/stock' }]}
        actionButtons={actionButtons.map(btn => ({
          id: btn.id,
          label: btn.label,
          icon: btn.icon,
          href: btn.href,
          variant: btn.variant,
          permission: btn.permission,
        }))}
        hasPermission={hasPermission}
      />

      <PageHeroBanner
        title="Estoque"
        description="Gerencie produtos, movimentações, localizações e toda a cadeia de suprimentos do seu negócio."
        icon={Package}
        iconGradient="from-emerald-500 to-emerald-600"
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
