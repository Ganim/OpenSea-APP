/**
 * Admin Module Landing Page
 * Página inicial do módulo de administração com stats e cards de navegação
 */

'use client';

import { Card } from '@/components/ui/card';
import {
  AUDIT_PERMISSIONS,
  CORE_PERMISSIONS,
  RBAC_PERMISSIONS,
} from '@/config/rbac/permission-codes';
import { useTenant } from '@/contexts/tenant-context';
import { usePermissions } from '@/hooks/use-permissions';
import { usersService } from '@/services/auth/users.service';
import { listPermissionGroups } from '@/services/rbac/rbac.service';

import {
  ArrowRight,
  History,
  Settings,
  Shield,
  UserCircle,
  Users,
  Wifi,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface StatCard {
  title: string;
  icon: React.ElementType;
  gradient: string;
  countKey: string;
}

const stats: StatCard[] = [
  {
    title: 'Total de Usuários',
    icon: Users,
    gradient: 'from-blue-500 to-blue-600',
    countKey: 'users',
  },
  {
    title: 'Grupos de Permissão',
    icon: Shield,
    gradient: 'from-purple-500 to-purple-600',
    countKey: 'groups',
  },
  {
    title: 'Usuários Online',
    icon: Wifi,
    gradient: 'from-emerald-500 to-emerald-600',
    countKey: 'online',
  },
];

interface NavCard {
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

const navCards: NavCard[] = [
  {
    id: 'users',
    title: 'Usuários',
    description: 'Gerencie contas, perfis e acessos dos usuários',
    icon: UserCircle,
    href: '/admin/users',
    gradient: 'from-blue-500 to-blue-600',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
    permission: CORE_PERMISSIONS.USERS.LIST,
    countKey: 'users',
  },
  {
    id: 'permission-groups',
    title: 'Grupos de Permissões',
    description: 'Configure grupos e controle de acesso granular',
    icon: Shield,
    href: '/admin/permission-groups',
    gradient: 'from-purple-500 to-purple-600',
    hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-500/10',
    permission: RBAC_PERMISSIONS.GROUPS.LIST,
    countKey: 'groups',
  },
  {
    id: 'audit-logs',
    title: 'Logs de Auditoria',
    description: 'Histórico de ações e alterações no sistema',
    icon: History,
    href: '/admin/audit-logs',
    gradient: 'from-amber-500 to-amber-600',
    hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
    permission: AUDIT_PERMISSIONS.LOGS.VIEW,
  },
];

export default function AdminLandingPage() {
  const { currentTenant } = useTenant();
  const { hasPermission } = usePermissions();
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [countsLoading, setCountsLoading] = useState(true);

  const tenantName = currentTenant?.name || 'Sua Empresa';

  useEffect(() => {
    async function fetchCounts() {
      const [users, groups, online] = await Promise.allSettled([
        usersService.listUsers(),
        listPermissionGroups(),
        usersService.getOnlineUsers(),
      ]);

      setCounts({
        users: users.status === 'fulfilled' ? users.value.users.length : null,
        groups: groups.status === 'fulfilled' ? groups.value.length : null,
        online:
          online.status === 'fulfilled' ? online.value.users.length : null,
      });
      setCountsLoading(false);
    }
    fetchCounts();
  }, []);

  const visibleNavCards = navCards.filter(
    card => !card.permission || hasPermission(card.permission)
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div>
        <Card className="relative overflow-hidden p-8 md:p-12 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full opacity-80 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full opacity-80 translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-linear-to-br from-purple-500 to-purple-600">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-white/60">
                {tenantName}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Administração
            </h1>

            <p className="text-lg text-gray-600 dark:text-white/60">
              Gerencie usuários, permissões e monitore a atividade do sistema.
            </p>
          </div>
        </Card>
      </div>

      {/* Stats Row */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.countKey}
            >
              <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${stat.gradient} flex items-center justify-center`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-white/60">
                      {stat.title}
                    </p>
                    {countsLoading ? (
                      <div className="h-8 w-16 rounded bg-gray-200 dark:bg-white/10 animate-pulse mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {counts[stat.countKey] !== null &&
                        counts[stat.countKey] !== undefined
                          ? counts[stat.countKey]!.toLocaleString('pt-BR')
                          : '—'}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Cards */}
      {visibleNavCards.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Navegação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleNavCards.map((card) => (
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
      )}
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
