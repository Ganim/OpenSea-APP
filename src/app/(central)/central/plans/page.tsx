'use client';

import { GlassBadge } from '@/components/central/glass-badge';
import { GlassButton } from '@/components/central/glass-button';
import { GlassCard } from '@/components/central/glass-card';
import { useAdminPlans } from '@/hooks/admin/use-admin';
import {
  Check,
  CreditCard,
  Package,
  Pencil,
  Plus,
  Users,
  Warehouse,
} from 'lucide-react';
import Link from 'next/link';

const tierColors: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
  FREE: 'default',
  STARTER: 'info',
  PROFESSIONAL: 'success',
  ENTERPRISE: 'warning',
};

const tierGradients: Record<string, string> = {
  FREE: 'from-gray-500/20 to-gray-600/20',
  STARTER: 'from-blue-500/20 to-blue-600/20',
  PROFESSIONAL: 'from-purple-500/20 to-purple-600/20',
  ENTERPRISE: 'from-amber-500/20 to-amber-600/20',
};

export default function PlansListPage() {
  const { data, isLoading } = useAdminPlans();

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight central-text">
            Planos
          </h1>
          <p className="central-text-muted text-lg mt-1">
            Gerencie os planos de assinatura do sistema
          </p>
        </div>
        <Link href="/central/plans/new">
          <GlassButton variant="primary" className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Plano
          </GlassButton>
        </Link>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-80 rounded-2xl central-glass-subtle animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.plans.map(plan => (
            <GlassCard
              key={plan.id}
              variant="gradient"
              hover
              className="p-6 flex flex-col relative overflow-hidden group"
            >
              {/* Gradient overlay on hover */}
              <div
                className={`absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${tierGradients[plan.tier]}`}
              />

              <div className="relative z-10 flex-1 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg bg-linear-to-br ${tierGradients[plan.tier]}`}
                    >
                      <CreditCard className="h-5 w-5 central-text" />
                    </div>
                  </div>
                  <GlassBadge variant={tierColors[plan.tier] ?? 'default'}>
                    {plan.tier}
                  </GlassBadge>
                </div>

                {/* Plan Name */}
                <h3 className="text-xl font-bold central-text">{plan.name}</h3>

                {/* Price */}
                <div>
                  <p className="text-3xl font-bold central-text">
                    {plan.price === 0
                      ? 'Grátis'
                      : `R$ ${plan.price.toFixed(2)}`}
                  </p>
                  {plan.price > 0 && (
                    <p className="text-sm central-text-muted">/mês</p>
                  )}
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="text-sm central-text-muted line-clamp-2">
                    {plan.description}
                  </p>
                )}

                {/* Features */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded central-glass-subtle">
                      <Users className="h-3.5 w-3.5 central-text-muted" />
                    </div>
                    <span className="text-sm central-text">
                      {plan.maxUsers >= 999999 ? 'Ilimitado' : plan.maxUsers}{' '}
                      usuários
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded central-glass-subtle">
                      <Warehouse className="h-3.5 w-3.5 central-text-muted" />
                    </div>
                    <span className="text-sm central-text">
                      {plan.maxWarehouses >= 999999
                        ? 'Ilimitado'
                        : plan.maxWarehouses}{' '}
                      armazéns
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded central-glass-subtle">
                      <Package className="h-3.5 w-3.5 central-text-muted" />
                    </div>
                    <span className="text-sm central-text">
                      {plan.maxProducts >= 999999
                        ? 'Ilimitado'
                        : plan.maxProducts}{' '}
                      produtos
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 flex items-center justify-between pt-4 mt-4 border-t central-divider">
                {plan.isActive ? (
                  <GlassBadge variant="success" className="gap-1">
                    <Check className="h-3 w-3" />
                    Ativo
                  </GlassBadge>
                ) : (
                  <GlassBadge variant="default">Inativo</GlassBadge>
                )}
                <Link href={`/central/plans/${plan.id}`}>
                  <GlassButton variant="ghost" size="sm" className="gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && data?.plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <GlassCard variant="gradient" className="p-12 max-w-md text-center">
            <CreditCard className="h-16 w-16 central-text-subtle mx-auto mb-4" />
            <h3 className="text-xl font-semibold central-text mb-2">
              Nenhum plano cadastrado
            </h3>
            <p className="central-text-muted mb-6">
              Comece criando o primeiro plano de assinatura do sistema
            </p>
            <Link href="/central/plans/new">
              <GlassButton variant="primary" className="gap-2">
                <Plus className="h-4 w-4" />
                Criar primeiro plano
              </GlassButton>
            </Link>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
