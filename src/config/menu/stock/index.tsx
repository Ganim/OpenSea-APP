/**
 * Stock Module Menu Configuration
 * Configuração de menu do módulo de estoque
 */

import { UI_PERMISSIONS } from '@/config/rbac/permission-codes';
import type { MenuItem } from '@/types/menu';
import {
  Factory,
  FileText,
  FolderTree,
  MapPin,
  Package,
  Tag,
} from 'lucide-react';

export const stockMenu: MenuItem = {
  id: 'stock',
  label: 'Estoque',
  icon: <Package className="w-6 h-6" />,
  href: '/stock',
  requiredPermission: UI_PERMISSIONS.MENU.STOCK,
  submenu: [
    {
      id: 'stock-products',
      label: 'Produtos',
      icon: <Package className="w-5 h-5" />,
      href: '/stock/products',
      requiredPermission: UI_PERMISSIONS.STOCK_SUBMENUS.PRODUCTS,
    },
    {
      id: 'stock-manufacturers',
      label: 'Fabricantes',
      icon: <Factory className="w-5 h-5" />,
      href: '/stock/manufacturers',
      requiredPermission: UI_PERMISSIONS.STOCK_SUBMENUS.MANUFACTURERS,
    },
    {
      id: 'stock-categories',
      label: 'Categorias',
      icon: <FolderTree className="w-5 h-5" />,
      href: '/stock/product-categories',
      requiredPermission: UI_PERMISSIONS.STOCK_SUBMENUS.CATEGORIES,
    },
    {
      id: 'stock-templates',
      label: 'Templates',
      icon: <FileText className="w-5 h-5" />,
      href: '/stock/templates',
    },
    {
      id: 'stock-tags',
      label: 'Tags',
      icon: <Tag className="w-5 h-5" />,
      href: '/stock/tags',
    },
    {
      id: 'stock-locations',
      label: 'Localizações',
      icon: <MapPin className="w-5 h-5" />,
      href: '/stock/locations',
      requiredPermission: UI_PERMISSIONS.STOCK_SUBMENUS.WAREHOUSES,
    },
  ],
};
