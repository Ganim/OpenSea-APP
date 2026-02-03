/**
 * Human Resources Module Menu Configuration
 * Configuração de menu do módulo de recursos humanos
 */

import { HR_PERMISSIONS, UI_PERMISSIONS } from '@/config/rbac/permission-codes';
import type { MenuItem } from '@/types/menu';
import {
  BookUser,
  Building2,
  FileUser,
  FolderPen,
  FolderSearch,
  LayoutList,
  List,
  SquareUserRound,
  UserRoundCog,
} from 'lucide-react';

export const hrMenu: MenuItem = {
  id: 'human-resources',
  label: 'Recursos Humanos',
  icon: <UserRoundCog className="w-6 h-6" />,
  requiredPermission: UI_PERMISSIONS.MENU.HR,
  submenu: [
    {
      id: 'hr-search',
      label: 'Consulta',
      icon: <FolderSearch className="w-6 h-6" />,
      submenu: [
        {
          id: 'hr-search-list',
          label: 'Listagem',
          icon: <List className="w-6 h-6" />,
          href: '/hr/employees',
          requiredPermission: HR_PERMISSIONS.EMPLOYEES.LIST,
        },
        {
          id: 'hr-search-overview',
          label: 'Visão Geral',
          icon: <LayoutList className="w-6 h-6" />,
          href: '/hr/overview',
          requiredPermission: HR_PERMISSIONS.EMPLOYEES.LIST,
        },
      ],
    },
    {
      id: 'hr-data',
      label: 'Cadastros',
      icon: <FolderPen className="w-6 h-6" />,
      submenu: [
        {
          id: 'hr-companies',
          label: 'Empresas',
          icon: <Building2 className="w-6 h-6" />,
          href: '/hr/companies',
          requiredPermission: HR_PERMISSIONS.COMPANIES.LIST,
        },
        {
          id: 'hr-departments',
          label: 'Departamentos',
          icon: <BookUser className="w-6 h-6" />,
          href: '/hr/departments',
          requiredPermission: HR_PERMISSIONS.DEPARTMENTS.LIST,
        },
        {
          id: 'hr-positions',
          label: 'Cargos e Funções',
          icon: <FileUser className="w-6 h-6" />,
          href: '/hr/positions',
          requiredPermission: HR_PERMISSIONS.POSITIONS.LIST,
        },
        {
          id: 'hr-employees',
          label: 'Funcionários',
          icon: <SquareUserRound className="w-6 h-6" />,
          href: '/hr/employees',
          requiredPermission: HR_PERMISSIONS.EMPLOYEES.LIST,
        },
      ],
    },
  ],
};
