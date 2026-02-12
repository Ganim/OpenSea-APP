'use client';

import { GlassButton } from '@/components/central/glass-button';
import { GlassCard } from '@/components/central/glass-card';
import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';
import { useAuth } from '@/contexts/auth-context';
import {
  ArrowRight,
  Building2,
  CreditCard,
  Crown,
  Settings,
  Shield,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const quickLinks = [
  {
    title: 'Empresas',
    description: 'Gerencie tenants, usuários e configurações de cada empresa',
    icon: Building2,
    href: '/central/tenants',
    accent: 'central-accent-blue',
  },
  {
    title: 'Planos',
    description: 'Configure planos de assinatura, módulos e limites',
    icon: CreditCard,
    href: '/central/plans',
    accent: 'central-accent-purple',
  },
];

const features = [
  {
    icon: Shield,
    title: 'Controle Total',
    description: 'Gerencie todas as empresas do sistema em um único lugar',
  },
  {
    icon: Settings,
    title: 'Configurações',
    description: 'Ajuste planos, módulos e feature flags por tenant',
  },
  {
    icon: Sparkles,
    title: 'Monitoramento',
    description: 'Acompanhe o status e atividade de cada empresa',
  },
];

export default function CentralWelcomePage() {
  const { user } = useAuth();

  const firstName = user?.email?.split('@')[0] ?? 'Admin';

  return (
    <div className="space-y-8 pb-8">
      {/* Breadcrumb */}
      <PageBreadcrumb items={[{ label: 'Central', href: '/central' }]} />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl">
        <GlassCard
          variant="gradient"
          className="p-8 md:p-12 central-accent-amber"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[rgb(var(--os-amber-500)/0.1)] rounded-full opacity-80 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[rgb(var(--os-purple-500)/0.1)] rounded-full opacity-80 translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl central-accent-gradient">
                <Crown className="h-6 w-6 central-accent-text" />
              </div>
              <span className="text-sm font-medium central-text-muted">
                Painel Administrativo
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold central-text mb-3">
              Bem-vindo, {firstName}!
            </h1>

            <p className="text-lg central-text-muted mb-6">
              Este é o painel central do OpenSea. Aqui você pode gerenciar todas
              as empresas, planos de assinatura e configurações do sistema.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/central/tenants">
                <GlassButton variant="primary" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Ver Empresas
                </GlassButton>
              </Link>
              <Link href="/central/plans">
                <GlassButton variant="secondary" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Ver Planos
                </GlassButton>
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold central-text mb-4">
          Acesso Rápido
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickLinks.map(link => (
            <Link key={link.href} href={link.href}>
              <GlassCard
                variant="gradient"
                hover
                className={`p-6 h-full group ${link.accent}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl central-accent-gradient shrink-0">
                    <link.icon className="h-5 w-5 central-accent-text" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold central-text mb-1 flex items-center gap-2">
                      {link.title}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-sm central-text-muted">
                      {link.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-xl font-semibold central-text mb-4">
          O que você pode fazer
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map(feature => (
            <GlassCard key={feature.title} className="p-6">
              <div className="p-2 rounded-lg central-glass-subtle w-fit mb-4">
                <feature.icon className="h-5 w-5 central-text-muted" />
              </div>
              <h3 className="font-semibold central-text mb-2">
                {feature.title}
              </h3>
              <p className="text-sm central-text-muted">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Help Card */}
      <GlassCard className="p-6 central-accent-cyan">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold central-text mb-1">
              Precisa de ajuda?
            </h3>
            <p className="text-sm central-text-muted">
              Use o menu lateral para navegar entre as seções. Cada área possui
              funcionalidades específicas para gerenciar o sistema.
            </p>
          </div>
          <Link href="/central/tenants">
            <GlassButton variant="ghost" className="gap-2 shrink-0">
              Começar
              <ArrowRight className="h-4 w-4" />
            </GlassButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
