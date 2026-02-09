/**
 * Admin Module Menu Configuration
 * Configuração de menu do módulo de administração
 */

import { UI_PERMISSIONS } from '@/config/rbac/permission-codes';
import type { MenuItem } from '@/types/menu';
import { Settings } from 'lucide-react';

export const adminMenu: MenuItem = {
  id: 'admin',
  label: 'Administração',
  icon: <Settings className="w-6 h-6" />,
  href: '/admin',
  requiredPermission: UI_PERMISSIONS.MENU.RBAC,
};
