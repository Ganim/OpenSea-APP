/**
 * Stock Module Menu Configuration
 * Configuração de menu do módulo de estoque
 */

import {
  STOCK_PERMISSIONS,
  DATA_PERMISSIONS,
} from '@/config/rbac/permission-codes';
import { UI_PERMISSIONS } from '@/config/rbac/permission-codes';
import type { MenuItem } from '@/types/menu';
import {
  Factory,
  FileText,
  Folder,
  FolderPen,
  FolderSearch,
  History,
  LayoutList,
  List,
  MapPin,
  Package,
  Printer,
  ShoppingCart,
  TagIcon,
  Upload,
} from 'lucide-react';

export const stockMenu: MenuItem = {
  id: 'stock',
  label: 'Estoque',
  icon: <Package className="w-6 h-6" />,
  requiredPermission: UI_PERMISSIONS.MENU.STOCK,
  submenu: [
    {
      id: 'stock-search',
      label: 'Consulta',
      icon: <FolderSearch className="w-6 h-6" />,
      submenu: [
        {
          id: 'stock-search-overview-list',
          label: 'Listagem de Estoque',
          icon: <LayoutList className="w-6 h-6" />,
          href: '/stock/overview/list',
          requiredPermission: STOCK_PERMISSIONS.ITEMS.LIST,
        },
        {
          id: 'stock-search-list',
          label: 'Listagem',
          icon: <List className="w-6 h-6" />,
          href: '/stock/templates',
          requiredPermission: STOCK_PERMISSIONS.TEMPLATES.LIST,
        },
        {
          id: 'stock-search-locations',
          label: 'Mapa de Estoque',
          icon: <LayoutList className="w-6 h-6" />,
          href: '/stock/products',
          requiredPermission: STOCK_PERMISSIONS.PRODUCTS.LIST,
        },
        {
          id: 'stock-movements',
          label: 'Movimentações',
          icon: <History className="w-6 h-6" />,
          href: '/stock/movements',
          requiredPermission: STOCK_PERMISSIONS.MOVEMENTS.LIST,
        },
      ],
    },
    {
      id: 'stock-operations',
      label: 'Operações',
      icon: <Package className="w-6 h-6" />,
      submenu: [
        {
          id: 'stock-purchase-orders',
          label: 'Ordens de Compra',
          icon: <ShoppingCart className="w-6 h-6" />,
          href: '/stock/purchase-orders',
          requiredPermission: STOCK_PERMISSIONS.PURCHASE_ORDERS.LIST,
        },
        {
          id: 'stock-import',
          label: 'Importação',
          icon: <Upload className="w-6 h-6" />,
          href: '/import',
          requiredPermission: DATA_PERMISSIONS.IMPORT.PRODUCTS,
        },
      ],
    },
    {
      id: 'stock-data',
      label: 'Cadastros',
      icon: <FolderPen className="w-6 h-6" />,
      submenu: [
        {
          id: 'templates',
          label: 'Templates',
          icon: <FileText className="w-6 h-6" />,
          href: '/stock/templates',
          requiredPermission: STOCK_PERMISSIONS.TEMPLATES.LIST,
        },
        {
          id: 'products',
          label: 'Produtos',
          icon: <Package className="w-6 h-6" />,
          href: '/stock/products',
          requiredPermission: STOCK_PERMISSIONS.PRODUCTS.LIST,
        },
        {
          id: 'locations',
          label: 'Localizações',
          icon: <MapPin className="w-6 h-6" />,
          href: '/stock/locations',
          requiredPermission: STOCK_PERMISSIONS.LOCATIONS.LIST,
        },
        {
          id: 'manufacturers',
          label: 'Fabricantes',
          icon: <Factory className="w-6 h-6" />,
          href: '/stock/manufacturers',
          requiredPermission: STOCK_PERMISSIONS.MANUFACTURERS.LIST,
        },
        {
          id: 'tags',
          label: 'Tags',
          icon: <TagIcon className="w-6 h-6" />,
          href: '/stock/tags',
          requiredPermission: STOCK_PERMISSIONS.TAGS.LIST,
        },
        {
          id: 'product-categories',
          label: 'Categoria de Produtos',
          icon: <Folder className="w-6 h-6" />,
          href: '/stock/product-categories',
          requiredPermission: STOCK_PERMISSIONS.CATEGORIES.LIST,
        },
        {
          id: 'label-templates',
          label: 'Templates de Etiquetas',
          icon: <Printer className="w-6 h-6" />,
          href: '/stock/label-templates',
          requiredPermission: STOCK_PERMISSIONS.TEMPLATES.LIST,
        },
      ],
    },
  ],
};
