/**
 * Stock Module Menu Configuration
 * Configuração de menu do módulo de estoque
 */

import { UI_PERMISSIONS } from '@/config/rbac/permission-codes';
import type { MenuItem } from '@/types/menu';
import { Package } from 'lucide-react';

export const stockMenu: MenuItem = {
  id: 'stock',
  label: 'Estoque',
  icon: <Package className="w-6 h-6" />,
  href: '/stock',
  requiredPermission: UI_PERMISSIONS.MENU.STOCK,
};
