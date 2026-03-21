'use client';

import { CentralAlertBar } from '@/components/central/central-alert-bar';
import { CentralBadge } from '@/components/central/central-badge';
import { CentralCard } from '@/components/central/central-card';
import { CentralHero } from '@/components/central/central-hero';
import { CentralStatPill } from '@/components/central/central-stat-pill';
import { useCentralTheme } from '@/contexts/central-theme-context';
import { useDashboardStats } from '@/hooks/admin/use-admin';
import { Building2, Clock, DollarSign, Users } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ========================
// Color definitions
// ========================

const MODULE_COLORS = {
  light: {
    SALES: '#8b5cf6',
    HR: '#0ea5e9',
    STOCK: '#10b981',
    FIN: '#f43f5e',
    TOOLS: '#14b8a6',
    AI: '#6366f1',
  },
  dark: {
    SALES: '#a78bfa',
    HR: '#38bdf8',
    STOCK: '#34d399',
    FIN: '#fb7185',
    TOOLS: '#2dd4bf',
    AI: '#818cf8',
  },
};

const PRIORITY_COLORS = {
  critical: '#f43f5e',
  medium: '#f97316',
  low: '#10b981',
};

const TENANT_AVATAR_COLORS = ['#8b5cf6', '#0ea5e9', '#10b981', '#f43f5e'];

// ========================
// Mock data (until backend integration)
// ========================

const MOCK_REVENUE_DATA = [
  { name: 'SALES', value: 4200 },
  { name: 'HR', value: 3100 },
  { name: 'STOCK', value: 2800 },
  { name: 'FIN', value: 2100 },
  { name: 'TOOLS', value: 1500 },
  { name: 'AI', value: 900 },
];

const MOCK_TICKETS = [
  {
    id: '1',
    priority: 'critical' as const,
    number: '#1842',
    tenant: 'Acme Corp',
    description: 'Falha na sincronização de estoque',
    time: '12min',
  },
  {
    id: '2',
    priority: 'medium' as const,
    number: '#1841',
    tenant: 'TechFlow',
    description: 'Relatório financeiro incompleto',
    time: '45min',
  },
  {
    id: '3',
    priority: 'low' as const,
    number: '#1840',
    tenant: 'StartUp Inc',
    description: 'Solicitação de novo módulo',
    time: '2h',
  },
];

const MOCK_TOP_TENANTS = [
  {
    id: '1',
    name: 'Acme Corporation',
    initials: 'AC',
    modules: 'SALES, HR, STOCK, FIN',
    mrr: 'R$2.450',
    color: TENANT_AVATAR_COLORS[0],
  },
  {
    id: '2',
    name: 'TechFlow Solutions',
    initials: 'TF',
    modules: 'SALES, HR, TOOLS',
    mrr: 'R$1.890',
    color: TENANT_AVATAR_COLORS[1],
  },
  {
    id: '3',
    name: 'StartUp Inc',
    initials: 'SI',
    modules: 'SALES, STOCK',
    mrr: 'R$980',
    color: TENANT_AVATAR_COLORS[2],
  },
];

const MOCK_GROWTH_DATA = [
  { month: 'Out', tenants: 28, users: 240 },
  { month: 'Nov', tenants: 31, users: 280 },
  { month: 'Dez', tenants: 34, users: 310 },
  { month: 'Jan', tenants: 36, users: 330 },
  { month: 'Fev', tenants: 39, users: 355 },
  { month: 'Mar', tenants: 42, users: 380 },
];

// ========================
// Helpers
// ========================

function formatMrr(value: number): string {
  if (value >= 1000) {
    return `R$${(value / 1000).toFixed(1)}k`;
  }
  return `R$${value}`;
}

// ========================
// Page Component
// ========================

export default function CentralDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { theme } = useCentralTheme();
  const isDark = theme === 'dark';

  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const chartGridColor = isDark
    ? 'rgba(148,163,184,0.08)'
    : 'rgba(100,116,139,0.12)';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? 'rgba(148,163,184,0.2)' : 'rgba(0,0,0,0.1)';
  const tooltipColor = isDark ? '#f1f5f9' : '#1e293b';

  const moduleColors = isDark ? MODULE_COLORS.dark : MODULE_COLORS.light;
  const moduleColorMap: Record<string, string> = {
    SALES: moduleColors.SALES,
    HR: moduleColors.HR,
    STOCK: moduleColors.STOCK,
    FIN: moduleColors.FIN,
    TOOLS: moduleColors.TOOLS,
    AI: moduleColors.AI,
  };

  // Use real data if available, otherwise mock
  const totalTenants = stats?.totalTenants ?? 42;
  const totalUsers = stats?.totalUsers ?? 380;
  const mrr = stats?.mrr ?? 12500;

  const lineStroke = isDark ? '#a78bfa' : '#8b5cf6';

  return (
    <div>
      {/* Hero Banner */}
      <CentralHero
        greeting="Bom dia, Admin"
        subtitle="Visão geral do sistema e métricas em tempo real"
      >
        <CentralStatPill
          icon={<Building2 className="h-3.5 w-3.5" />}
          iconColor="violet"
          value={String(totalTenants)}
          label="Tenants"
          change="+3"
          changeType="up"
        />
        <CentralStatPill
          icon={<Users className="h-3.5 w-3.5" />}
          iconColor="sky"
          value={String(totalUsers)}
          label="Usuários"
          change="+28"
          changeType="up"
        />
        <CentralStatPill
          icon={<DollarSign className="h-3.5 w-3.5" />}
          iconColor="emerald"
          value={formatMrr(mrr)}
          label="MRR"
          change="+8%"
          changeType="up"
        />
        <CentralStatPill
          icon={<Clock className="h-3.5 w-3.5" />}
          iconColor="teal"
          value="12"
          label="Tickets"
          change="2 SLA"
          changeType="warn"
        />
      </CentralHero>

      {/* Content area */}
      <div className="px-6 py-4 space-y-3">
        {/* Alert bar */}
        <CentralAlertBar
          items={[
            { text: '3 tenants com overage' },
            { text: '2 integrações com erro' },
            { text: '1 cert. expirando' },
          ]}
        />

        {/* Row 1: Revenue chart + Tickets */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-3">
          {/* Revenue by Module */}
          <CentralCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span
                className="font-semibold text-xs"
                style={{ color: 'var(--central-text-primary)' }}
              >
                Receita por Módulo
              </span>
              <CentralBadge variant="violet">Mar 2026</CentralBadge>
            </div>
            {isLoading ? (
              <div
                className="h-[200px] animate-pulse rounded-lg"
                style={{ background: 'var(--central-card-bg)' }}
              />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={MOCK_REVENUE_DATA} barCategoryGap="20%">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartGridColor}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: chartTextColor, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: chartTextColor, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: '8px',
                      color: tooltipColor,
                      fontSize: '11px',
                    }}
                    formatter={(value: number) => [
                      `R$${value.toLocaleString('pt-BR')}`,
                      'Receita',
                    ]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {MOCK_REVENUE_DATA.map(entry => (
                      <Cell
                        key={entry.name}
                        fill={moduleColorMap[entry.name] ?? '#8b5cf6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CentralCard>

          {/* Recent Tickets */}
          <CentralCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span
                className="font-semibold text-xs"
                style={{ color: 'var(--central-text-primary)' }}
              >
                Tickets Recentes
              </span>
              <CentralBadge variant="rose">3 novos</CentralBadge>
            </div>
            <div className="space-y-3">
              {MOCK_TICKETS.map(ticket => (
                <div key={ticket.id} className="flex items-start gap-2.5">
                  {/* Priority dot */}
                  <span
                    className="mt-1.5 flex-shrink-0 rounded-full"
                    style={{
                      width: 7,
                      height: 7,
                      backgroundColor: PRIORITY_COLORS[ticket.priority],
                    }}
                  />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-tight">
                      <span
                        className="font-bold"
                        style={{ color: 'var(--central-text-primary)' }}
                      >
                        {ticket.number}
                      </span>
                      <span
                        className="ml-1.5"
                        style={{ color: isDark ? '#a78bfa' : '#8b5cf6' }}
                      >
                        {ticket.tenant}
                      </span>
                    </p>
                    <p
                      className="text-[11px] mt-0.5 truncate"
                      style={{ color: 'var(--central-text-secondary)' }}
                    >
                      {ticket.description}
                    </p>
                  </div>
                  {/* Time */}
                  <span
                    className="text-[10px] flex-shrink-0 mt-0.5"
                    style={{ color: 'var(--central-text-secondary)' }}
                  >
                    {ticket.time}
                  </span>
                </div>
              ))}
            </div>
          </CentralCard>
        </div>

        {/* Row 2: Top Tenants + Growth chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Top Tenants by Revenue */}
          <CentralCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span
                className="font-semibold text-xs"
                style={{ color: 'var(--central-text-primary)' }}
              >
                Top Tenants por Receita
              </span>
            </div>
            <div className="space-y-3">
              {MOCK_TOP_TENANTS.map(tenant => (
                <div key={tenant.id} className="flex items-center gap-3">
                  {/* Circular avatar */}
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: 30,
                      height: 30,
                      backgroundColor: tenant.color,
                    }}
                  >
                    <span className="text-white text-[10px] font-bold">
                      {tenant.initials}
                    </span>
                  </div>
                  {/* Name + Modules */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-xs truncate"
                      style={{ color: 'var(--central-text-primary)' }}
                    >
                      {tenant.name}
                    </p>
                    <p
                      className="text-[9px] truncate"
                      style={{ color: 'var(--central-text-secondary)' }}
                    >
                      {tenant.modules}
                    </p>
                  </div>
                  {/* MRR */}
                  <span
                    className="font-bold text-xs flex-shrink-0"
                    style={{ color: 'var(--central-text-primary)' }}
                  >
                    {tenant.mrr}
                  </span>
                </div>
              ))}
            </div>
          </CentralCard>

          {/* Growth Chart */}
          <CentralCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span
                className="font-semibold text-xs"
                style={{ color: 'var(--central-text-primary)' }}
              >
                Crescimento
              </span>
              <CentralBadge variant="sky">6 meses</CentralBadge>
            </div>
            {isLoading ? (
              <div
                className="h-[200px] animate-pulse rounded-lg"
                style={{ background: 'var(--central-card-bg)' }}
              />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={MOCK_GROWTH_DATA}>
                  <defs>
                    <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={lineStroke}
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="100%"
                        stopColor={lineStroke}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartGridColor}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: chartTextColor, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: chartTextColor, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: '8px',
                      color: tooltipColor,
                      fontSize: '11px',
                    }}
                    formatter={(value: number, name: string) => [
                      value,
                      name === 'tenants' ? 'Tenants' : 'Usuários',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="tenants"
                    stroke={lineStroke}
                    strokeWidth={2}
                    fill="url(#growthFill)"
                    dot={{ fill: lineStroke, strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: lineStroke }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CentralCard>
        </div>
      </div>
    </div>
  );
}
