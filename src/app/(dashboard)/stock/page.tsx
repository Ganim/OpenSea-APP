/**
 * Stock Module Landing Page
 * Página inicial do módulo de estoque com cards de navegação e contagens reais
 */

'use client';

import { Card } from '@/components/ui/card';
import {
  STOCK_PERMISSIONS,
  DATA_PERMISSIONS,
} from '@/config/rbac/permission-codes';
import { useTenant } from '@/contexts/tenant-context';
import { usePermissions } from '@/hooks/use-permissions';
import {
  productsService,
  itemsService,
  purchaseOrdersService,
  templatesService,
  manufacturersService,
  suppliersService,
  tagsService,
  categoriesService,
} from '@/services/stock';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Factory,
  Folder,
  History,
  LayoutList,
  MapPin,
  Package,
  ShoppingCart,
  TagIcon,
  Truck,
  Upload,
} from 'lucide-react';
import { GrObjectGroup } from 'react-icons/gr';
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
}

const sections: {
  title: string;
  cards: CardItem[];
}[] = [
  {
    title: 'Consulta',
    cards: [
      {
        id: 'overview',
        title: 'Estoque Geral',
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
        description: 'Histórico de entradas, saídas e transferências',
        icon: History,
        href: '/stock/movements',
        gradient: 'from-slate-500 to-slate-600',
        hoverBg: 'hover:bg-slate-50 dark:hover:bg-slate-500/10',
        permission: STOCK_PERMISSIONS.MOVEMENTS.LIST,
      },
    ],
  },
  {
    title: 'Operações',
    cards: [
      {
        id: 'purchase-orders',
        title: 'Ordens de Compra',
        description: 'Gerencie pedidos de compra e recebimentos',
        icon: ShoppingCart,
        href: '/stock/purchase-orders',
        gradient: 'from-purple-500 to-purple-600',
        hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-500/10',
        permission: STOCK_PERMISSIONS.PURCHASE_ORDERS.LIST,
        countKey: 'purchaseOrders',
      },
      {
        id: 'import',
        title: 'Importação',
        description: 'Importe dados em massa via planilhas',
        icon: Upload,
        href: '/import',
        gradient: 'from-amber-500 to-amber-600',
        hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
        permission: DATA_PERMISSIONS.IMPORT.PRODUCTS,
      },
    ],
  },
  {
    title: 'Cadastros',
    cards: [
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
        id: 'suppliers',
        title: 'Fornecedores',
        description: 'Cadastro de fornecedores e parceiros',
        icon: Truck,
        href: '/stock/suppliers',
        gradient: 'from-teal-500 to-teal-600',
        hoverBg: 'hover:bg-teal-50 dark:hover:bg-teal-500/10',
        permission: STOCK_PERMISSIONS.SUPPLIERS.LIST,
        countKey: 'suppliers',
      },
      {
        id: 'tags',
        title: 'Tags',
        description: 'Etiquetas para organizar produtos',
        icon: TagIcon,
        href: '/stock/tags',
        gradient: 'from-pink-500 to-pink-600',
        hoverBg: 'hover:bg-pink-50 dark:hover:bg-pink-500/10',
        permission: STOCK_PERMISSIONS.TAGS.LIST,
        countKey: 'tags',
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
        tags,
        categories,
      ] = await Promise.allSettled([
        productsService.listProducts(),
        itemsService.listItems(),
        purchaseOrdersService.list({ page: 1, limit: 1 }),
        templatesService.listTemplates(),
        manufacturersService.listManufacturers(),
        suppliersService.listSuppliers(),
        tagsService.listTags(),
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
        tags: tags.status === 'fulfilled' ? tags.value.tags.length : null,
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
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden p-8 md:p-12 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full opacity-80 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full opacity-80 translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-white/60">
                {tenantName}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Estoque
            </h1>

            <p className="text-lg text-gray-600 dark:text-white/60">
              Gerencie produtos, movimentações, localizações e toda a cadeia de
              suprimentos do seu negócio.
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
}: {
  count: number | null | undefined;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="h-6 w-12 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
    );
  }

  if (count === null || count === undefined) return null;

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70">
      {count.toLocaleString('pt-BR')}
    </span>
  );
}
