'use client';

import { GlassCard } from '@/components/central/glass-card';
import { StatCard } from '@/components/central/stat-card';
import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';
import { useCentralTheme } from '@/contexts/central-theme-context';
import { useDashboardStats } from '@/hooks/admin/use-admin';
import type { RecentActivity } from '@/schemas/admin.schemas';
import {
  Activity,
  Building2,
  CreditCard,
  DollarSign,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Cores para gráficos por tier
const TIER_COLORS: Record<string, string> = {
  FREE: '#94a3b8',
  STARTER: '#3b82f6',
  PROFESSIONAL: '#8b5cf6',
  ENTERPRISE: '#f59e0b',
};

// Cores para status donut
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22c55e',
  INACTIVE: '#94a3b8',
  SUSPENDED: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativas',
  INACTIVE: 'Inativas',
  SUSPENDED: 'Suspensas',
};

const TIER_LABELS: Record<string, string> = {
  FREE: 'Free',
  STARTER: 'Starter',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Criação',
  UPDATE: 'Atualização',
  DELETE: 'Exclusão',
  STATUS_CHANGE: 'Status',
  PLAN_CHANGE: 'Plano',
  FLAG_CHANGE: 'Flag',
  SECURITY_KEY_CHANGE: 'Chave',
};

const ENTITY_LABELS: Record<string, string> = {
  TENANT: 'Empresa',
  PLAN: 'Plano',
  TENANT_USER: 'Usuário',
  FEATURE_FLAG: 'Feature Flag',
};

function formatMrr(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  const monthNames = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];
  return `${monthNames[parseInt(m, 10) - 1]} ${year?.slice(2)}`;
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return new Date(date).toLocaleDateString('pt-BR');
}

export default function CentralDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { theme } = useCentralTheme();
  const isDark = theme === 'dark-blue';

  // Prepare chart data
  const tierData = stats
    ? Object.entries(stats.tenantsByTier).map(([tier, count]) => ({
        name: TIER_LABELS[tier] ?? tier,
        value: count,
        tier,
      }))
    : [];

  const statusData = stats
    ? Object.entries(stats.tenantsByStatus).map(([status, count]) => ({
        name: STATUS_LABELS[status] ?? status,
        value: count,
        status,
      }))
    : [];

  const growthData = stats
    ? stats.monthlyGrowth.map(item => ({
        month: formatMonth(item.month),
        count: item.count,
      }))
    : [];

  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const chartGridColor = isDark
    ? 'rgba(148,163,184,0.1)'
    : 'rgba(100,116,139,0.15)';

  return (
    <div className="space-y-6 pb-8">
      <PageBreadcrumb items={[{ label: 'Central', href: '/central' }]} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold central-text">Painel Central</h1>
        <p className="text-sm central-text-muted mt-1">
          Visão geral do sistema e métricas em tempo real
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de Empresas"
          value={stats?.totalTenants ?? 0}
          icon={Building2}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          label="Total de Usuários"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="purple"
          isLoading={isLoading}
        />
        <StatCard
          label="Planos Ativos"
          value={stats?.activePlans ?? 0}
          icon={CreditCard}
          color="green"
          isLoading={isLoading}
        />
        <StatCard
          label="Receita Mensal"
          value={formatMrr(stats?.mrr ?? 0)}
          icon={DollarSign}
          color="amber"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Growth Line Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold central-text mb-4">
            Crescimento Mensal
          </h3>
          {isLoading ? (
            <div className="h-[250px] animate-pulse central-glass-subtle rounded-lg" />
          ) : growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: chartTextColor, fontSize: 12 }}
                  axisLine={{ stroke: chartGridColor }}
                />
                <YAxis
                  tick={{ fill: chartTextColor, fontSize: 12 }}
                  axisLine={{ stroke: chartGridColor }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(148,163,184,0.2)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '8px',
                    color: isDark ? '#f1f5f9' : '#1e293b',
                  }}
                  labelStyle={{ fontWeight: 600 }}
                  formatter={(value: number) => [value, 'Empresas criadas']}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <p className="text-sm central-text-muted">
                Nenhum dado de crescimento disponível
              </p>
            </div>
          )}
        </GlassCard>

        {/* Tenants by Tier Bar Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold central-text mb-4">
            Empresas por Plano
          </h3>
          {isLoading ? (
            <div className="h-[250px] animate-pulse central-glass-subtle rounded-lg" />
          ) : tierData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tierData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: chartTextColor, fontSize: 12 }}
                  axisLine={{ stroke: chartGridColor }}
                />
                <YAxis
                  tick={{ fill: chartTextColor, fontSize: 12 }}
                  axisLine={{ stroke: chartGridColor }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(148,163,184,0.2)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '8px',
                    color: isDark ? '#f1f5f9' : '#1e293b',
                  }}
                  formatter={(value: number) => [value, 'Empresas']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {tierData.map(entry => (
                    <Cell
                      key={entry.tier}
                      fill={TIER_COLORS[entry.tier] ?? '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <p className="text-sm central-text-muted">
                Nenhuma empresa com plano associado
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Bottom Row: Status Donut + Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Status Donut Chart */}
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold central-text mb-4">
            Status das Empresas
          </h3>
          {isLoading ? (
            <div className="h-[200px] animate-pulse central-glass-subtle rounded-lg" />
          ) : statusData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map(entry => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDark ? 'rgba(148,163,184,0.2)' : 'rgba(0,0,0,0.1)'}`,
                      borderRadius: '8px',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                    }}
                    formatter={(value: number) => [value, 'Empresas']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {statusData.map(entry => (
                  <div key={entry.status} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          STATUS_COLORS[entry.status] ?? '#94a3b8',
                      }}
                    />
                    <span className="text-sm central-text-muted">
                      {entry.name}
                    </span>
                    <span className="text-sm font-semibold central-text ml-auto">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-sm central-text-muted">
                Nenhuma empresa cadastrada
              </p>
            </div>
          )}
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="p-6 lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 central-text-muted" />
            <h3 className="text-lg font-semibold central-text">
              Atividade Recente
            </h3>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse central-glass-subtle rounded-lg"
                />
              ))}
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {stats.recentActivity.map((activity: RecentActivity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg central-glass-subtle"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium central-text truncate">
                      {activity.description ??
                        `${ACTION_LABELS[activity.action] ?? activity.action} de ${ENTITY_LABELS[activity.entity] ?? activity.entity}`}
                    </p>
                    <p className="text-xs central-text-muted">
                      {ENTITY_LABELS[activity.entity] ?? activity.entity} •{' '}
                      {ACTION_LABELS[activity.action] ?? activity.action}
                    </p>
                  </div>
                  <span className="text-xs central-text-muted whitespace-nowrap">
                    {formatRelativeDate(activity.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-sm central-text-muted">
                Nenhuma atividade registrada
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
