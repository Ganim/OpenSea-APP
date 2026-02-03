/**
 * Admin Module Menu Configuration
 * Configuração de menu do módulo de administração
 */

import {
  AUDIT_PERMISSIONS,
  CORE_PERMISSIONS,
  RBAC_PERMISSIONS,
  UI_PERMISSIONS,
} from '@/config/rbac/permission-codes';
import type { MenuItem } from '@/types/menu';
import {
  History,
  Settings,
  Shield,
  ShieldUser,
  UserCircle,
} from 'lucide-react';

export const adminMenu: MenuItem = {
  id: 'admin',
  label: 'Administração',
  icon: <Settings className="w-6 h-6" />,
  requiredPermission: UI_PERMISSIONS.MENU.RBAC,
  submenu: [
    {
      id: 'admin-access-control',
      label: 'Controle de Acesso',
      icon: <ShieldUser className="w-6 h-6" />,
      submenu: [
        {
          id: 'users',
          label: 'Usuários',
          icon: <UserCircle className="w-6 h-6" />,
          href: '/admin/users',
          requiredPermission: CORE_PERMISSIONS.USERS.LIST,
        },
        {
          id: 'permission-groups',
          label: 'Grupos de Permissões',
          icon: <Shield className="w-6 h-6" />,
          href: '/admin/permission-groups',
          requiredPermission: RBAC_PERMISSIONS.GROUPS.LIST,
        },
      ],
    },
    {
      id: 'admin-audit',
      label: 'Auditoria',
      icon: <History className="w-6 h-6" />,
      requiredPermission: UI_PERMISSIONS.MENU.AUDIT,
      submenu: [
        {
          id: 'audit-logs',
          label: 'Logs de Auditoria',
          icon: <History className="w-6 h-6" />,
          href: '/admin/audit-logs',
          requiredPermission: AUDIT_PERMISSIONS.LOGS.VIEW,
        },
      ],
    },
  ],
};
