/**
 * HR Module Landing Page
 * Página inicial do módulo de recursos humanos com cards de navegação e contagens reais
 */

'use client';

import { Card } from '@/components/ui/card';
import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { useTenant } from '@/contexts/tenant-context';
import { usePermissions } from '@/hooks/use-permissions';
import {
  employeesService,
  companiesService,
  departmentsService,
  positionsService,
} from '@/services/hr';

import {
  ArrowRight,
  BookUser,
  Building2,
  FileUser,
  LayoutList,
  SquareUserRound,
  UserRoundCog,
} from 'lucide-react';
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
        id: 'employees',
        title: 'Funcionários',
        description: 'Listagem e gestão de colaboradores',
        icon: SquareUserRound,
        href: '/hr/employees',
        gradient: 'from-blue-500 to-blue-600',
        hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
        permission: HR_PERMISSIONS.EMPLOYEES.LIST,
        countKey: 'employees',
      },
      {
        id: 'overview',
        title: 'Visão Geral',
        description: 'Painel de indicadores do RH',
        icon: LayoutList,
        href: '/hr/overview',
        gradient: 'from-slate-500 to-slate-600',
        hoverBg: 'hover:bg-slate-50 dark:hover:bg-slate-500/10',
        permission: HR_PERMISSIONS.EMPLOYEES.LIST,
      },
    ],
  },
  {
    title: 'Cadastros',
    cards: [
      {
        id: 'companies',
        title: 'Empresas',
        description: 'Cadastro de empresas e filiais',
        icon: Building2,
        href: '/hr/companies',
        gradient: 'from-purple-500 to-purple-600',
        hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-500/10',
        permission: HR_PERMISSIONS.COMPANIES.LIST,
        countKey: 'companies',
      },
      {
        id: 'departments',
        title: 'Departamentos',
        description: 'Estrutura organizacional e áreas',
        icon: BookUser,
        href: '/hr/departments',
        gradient: 'from-emerald-500 to-emerald-600',
        hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
        permission: HR_PERMISSIONS.DEPARTMENTS.LIST,
        countKey: 'departments',
      },
      {
        id: 'positions',
        title: 'Cargos e Funções',
        description: 'Cadastro de cargos, salários e requisitos',
        icon: FileUser,
        href: '/hr/positions',
        gradient: 'from-amber-500 to-amber-600',
        hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
        permission: HR_PERMISSIONS.POSITIONS.LIST,
        countKey: 'positions',
      },
    ],
  },
];

export default function HRLandingPage() {
  const { currentTenant } = useTenant();
  const { hasPermission } = usePermissions();
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [countsLoading, setCountsLoading] = useState(true);

  const tenantName = currentTenant?.name || 'Sua Empresa';

  useEffect(() => {
    async function fetchCounts() {
      const [employees, companies, departments, positions] =
        await Promise.allSettled([
          employeesService.listEmployees({ page: 1, perPage: 1 }),
          companiesService.listCompanies({ page: 1, perPage: 1 }),
          departmentsService.listDepartments({ page: 1, perPage: 1 }),
          positionsService.listPositions({ page: 1, perPage: 1 }),
        ]);

      setCounts({
        employees:
          employees.status === 'fulfilled'
            ? (employees.value.total ??
              employees.value.employees?.length ??
              null)
            : null,
        companies:
          companies.status === 'fulfilled'
            ? (companies.value.meta?.total ??
              companies.value.companies?.length ??
              null)
            : null,
        departments:
          departments.status === 'fulfilled'
            ? (departments.value.total ??
              departments.value.departments?.length ??
              null)
            : null,
        positions:
          positions.status === 'fulfilled'
            ? (positions.value.total ??
              positions.value.positions?.length ??
              null)
            : null,
      });
      setCountsLoading(false);
    }
    fetchCounts();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div>
        <Card className="relative overflow-hidden p-8 md:p-12 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full opacity-80 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full opacity-80 translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-linear-to-br from-blue-500 to-purple-600">
                <UserRoundCog className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-white/60">
                {tenantName}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Recursos Humanos
            </h1>

            <p className="text-lg text-gray-600 dark:text-white/60">
              Gerencie funcionários, departamentos, cargos e a estrutura
              organizacional da sua empresa.
            </p>
          </div>
        </Card>
      </div>

      {/* Sections */}
      {sections.map((section, sectionIndex) => {
        const visibleCards = section.cards.filter(
          card => !card.permission || hasPermission(card.permission)
        );

        if (visibleCards.length === 0) return null;

        return (
          <div
            key={section.title}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleCards.map((card) => (
                <div
                  key={card.id}
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
                </div>
              ))}
            </div>
          </div>
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
