'use client';

import { GlassCard } from '@/components/central/glass-card';
import { StatCard } from '@/components/central/stat-card';
import { useDashboardStats } from '@/hooks/admin/use-admin';
import {
  Activity,
  Building2,
  CreditCard,
  Package,
  TrendingUp,
} from 'lucide-react';

export default function CentralDashboardPage() {
  const { data, isLoading } = useDashboardStats();

  const mainStats = [
    {
      label: 'Total de Empresas',
      value: data?.totalTenants ?? 0,
      icon: Building2,
      color: 'blue' as const,
      trend: { value: 12, isPositive: true },
    },
    {
      label: 'Total de Planos',
      value: data?.totalPlans ?? 0,
      icon: CreditCard,
      color: 'purple' as const,
      trend: { value: 5, isPositive: true },
    },
    {
      label: 'Planos Ativos',
      value: data?.activePlans ?? 0,
      icon: Activity,
      color: 'green' as const,
      trend: { value: 8, isPositive: true },
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Dashboard Central
        </h1>
        <p className="text-white/60 text-lg">Visão geral do sistema OpenSea</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {mainStats.map(stat => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Secondary Stats - Two Columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Overview */}
        <GlassCard variant="gradient" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Atividade Recente
              </h3>
              <p className="text-sm text-white/60">Últimas 24 horas</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/90 text-sm">Novos cadastros</span>
              </div>
              <span className="text-white font-semibold">
                +{data?.totalTenants ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-white/90 text-sm">
                  Planos contratados
                </span>
              </div>
              <span className="text-white font-semibold">
                +{data?.activePlans ?? 0}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Quick Stats */}
        <GlassCard variant="gradient" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/20">
              <Package className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Métricas Rápidas
              </h3>
              <p className="text-sm text-white/60">Visão geral do sistema</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">
                {isLoading ? '...' : (data?.totalTenants ?? 0)}
              </div>
              <div className="text-xs text-white/60">Empresas</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">
                {isLoading ? '...' : (data?.totalPlans ?? 0)}
              </div>
              <div className="text-xs text-white/60">Planos</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">
                {isLoading ? '...' : (data?.activePlans ?? 0)}
              </div>
              <div className="text-xs text-white/60">Ativos</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">
                {isLoading
                  ? '...'
                  : (data?.totalTenants ?? 0) - (data?.activePlans ?? 0)}
              </div>
              <div className="text-xs text-white/60">Inativos</div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Full Width Chart Card */}
      <GlassCard variant="gradient" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20">
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Crescimento</h3>
              <p className="text-sm text-white/60">Evolução mensal</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">+24%</div>
            <div className="text-xs text-green-400">vs. mês anterior</div>
          </div>
        </div>

        {/* Placeholder para gráfico */}
        <div className="h-48 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <p className="text-white/40 text-sm">
            Gráfico de crescimento (em desenvolvimento)
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
