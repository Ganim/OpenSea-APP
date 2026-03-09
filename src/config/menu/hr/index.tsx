/**
 * Human Resources Module Menu Configuration
 * Configuração de menu do módulo de recursos humanos
 */

import { UI_PERMISSIONS } from '@/config/rbac/permission-codes';
import type { MenuItem } from '@/types/menu';
import {
  BookUser,
  Building2,
  CalendarDays,
  Clock,
  Coffee,
  FileUser,
  Hourglass,
  MinusCircle,
  PalmtreeIcon,
  PlusCircle,
  SquareUserRound,
  Timer,
  UserRoundCog,
  UserX,
} from 'lucide-react';

export const hrMenu: MenuItem = {
  id: 'human-resources',
  label: 'Recursos Humanos',
  icon: <UserRoundCog className="w-6 h-6" />,
  href: '/hr',
  requiredPermission: UI_PERMISSIONS.MENU.HR,
  submenu: [
    // ── Cadastros ──
    {
      id: 'hr-companies',
      label: 'Empresas',
      icon: <Building2 className="w-6 h-6" />,
      href: '/hr/companies',
      requiredPermission: UI_PERMISSIONS.HR_SUBMENUS.COMPANIES,
    },
    {
      id: 'hr-departments',
      label: 'Departamentos',
      icon: <BookUser className="w-6 h-6" />,
      href: '/hr/departments',
      requiredPermission: UI_PERMISSIONS.HR_SUBMENUS.DEPARTMENTS,
    },
    {
      id: 'hr-positions',
      label: 'Cargos e Funções',
      icon: <FileUser className="w-6 h-6" />,
      href: '/hr/positions',
      requiredPermission: UI_PERMISSIONS.HR_SUBMENUS.POSITIONS,
    },
    {
      id: 'hr-employees',
      label: 'Funcionários',
      icon: <SquareUserRound className="w-6 h-6" />,
      href: '/hr/employees',
      requiredPermission: UI_PERMISSIONS.HR_SUBMENUS.EMPLOYEES,
    },
    // ── Gestão de Tempo ──
    {
      id: 'hr-work-schedules',
      label: 'Escalas de Trabalho',
      icon: <Clock className="w-6 h-6" />,
      href: '/hr/work-schedules',
      requiredPermission: UI_PERMISSIONS.HR_SUBMENUS.WORK_SCHEDULES,
    },
    {
      id: 'hr-time-control',
      label: 'Controle de Ponto',
      icon: <Timer className="w-6 h-6" />,
      href: '/hr/time-control',
      requiredPermission: UI_PERMISSIONS.HR_SUBMENUS.TIME_CONTROL,
    },
    {
      id: 'hr-time-bank',
      label: 'Banco de Horas',
      icon: <Hourglass className="w-6 h-6" />,
      href: '/hr/time-bank',
      requiredPermission: UI_PERMISSIONS.HR_SUBMENUS.TIME_BANK,
    },
    {
      id: 'hr-overtime',
      label: 'Horas Extras',
      icon: <Coffee className="w-6 h-6" />,
      href: '/hr/overtime',
      requiredPermission: UI_PERMISSIONS.HR_SUBMENUS.OVERTIME,
    },
    // ── Férias e Ausências ──
    {
      id: 'hr-vacations',
      label: 'Férias',
      icon: <PalmtreeIcon className="w-6 h-6" />,
      href: '/hr/vacations',
      requiredPermission: UI_PERMISSIONS.HR_SUBMENUS.VACATIONS,
    },
    {
      id: 'hr-absences',
      label: 'Ausências',
      icon: <UserX className="w-6 h-6" />,
      href: '/hr/absences',
      requiredPermission: UI_PERMISSIONS.HR_SUBMENUS.ABSENCES,
    },
    // ── Departamento Pessoal ──
    {
      id: 'hr-payroll',
      label: 'Folha de Pagamento',
      icon: <CalendarDays className="w-6 h-6" />,
      href: '/hr/payroll',
      requiredPermission: UI_PERMISSIONS.HR_SUBMENUS.PAYROLL,
    },
    {
      id: 'hr-bonuses',
      label: 'Bonificações',
      icon: <PlusCircle className="w-6 h-6" />,
      href: '/hr/bonuses',
      requiredPermission: UI_PERMISSIONS.HR_SUBMENUS.BONUSES,
    },
    {
      id: 'hr-deductions',
      label: 'Deduções',
      icon: <MinusCircle className="w-6 h-6" />,
      href: '/hr/deductions',
      requiredPermission: UI_PERMISSIONS.HR_SUBMENUS.DEDUCTIONS,
    },
  ],
};
