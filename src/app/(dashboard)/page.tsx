/**
 * Dashboard Welcome Page
 * Página de boas-vindas do dashboard
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useTenant } from '@/contexts/tenant-context';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Box,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  Package,
  Settings,
  Sparkles,
  Users,
  Warehouse,
} from 'lucide-react';
import Link from 'next/link';

const quickLinks = [
  {
    title: 'Produtos',
    description: 'Gerencie seu catálogo de produtos e variantes',
    icon: Package,
    href: '/stock/products',
    gradient: 'from-blue-500 to-blue-600',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
  },
  {
    title: 'Estoque',
    description: 'Visualize o estoque geral e movimentações',
    icon: Warehouse,
    href: '/stock/overview/list',
    gradient: 'from-emerald-500 to-emerald-600',
    hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
  },
  {
    title: 'Pedidos de Compra',
    description: 'Acompanhe e gerencie suas compras',
    icon: ClipboardList,
    href: '/stock/purchase-orders',
    gradient: 'from-purple-500 to-purple-600',
    hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-500/10',
  },
  {
    title: 'Importação',
    description: 'Importe dados em massa via planilhas',
    icon: FileSpreadsheet,
    href: '/import',
    gradient: 'from-amber-500 to-amber-600',
    hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
  },
];

const features = [
  {
    icon: Box,
    title: 'Gestão de Estoque',
    description: 'Controle completo do seu inventário com rastreabilidade',
  },
  {
    icon: BarChart3,
    title: 'Relatórios',
    description: 'Análises e métricas para tomada de decisão',
  },
  {
    icon: Users,
    title: 'Colaboração',
    description: 'Gerencie usuários e permissões de acesso',
  },
];

export default function DashboardWelcomePage() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();

  const firstName = user?.username || user?.email?.split('@')[0] || 'Usuário';
  const tenantName = currentTenant?.name || 'Sua Empresa';

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden p-8 md:p-12 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-linear-to-br from-blue-500 to-purple-600">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-white/60">
                {tenantName}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Bem-vindo, {firstName}!
            </h1>

            <p className="text-lg text-gray-600 dark:text-white/60 mb-6">
              Gerencie seu estoque, produtos e operações de forma eficiente. Use
              o menu acima para navegar entre os módulos do sistema.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/stock/products">
                <Button className="gap-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  <Package className="h-4 w-4" />
                  Ver Produtos
                </Button>
              </Link>
              <Link href="/stock/overview/list">
                <Button variant="outline" className="gap-2">
                  <Warehouse className="h-4 w-4" />
                  Ver Estoque
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Acesso Rápido
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Link href={link.href}>
                <Card
                  className={`p-6 h-full backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10 transition-all group ${link.hoverBg}`}
                >
                  <div className="flex flex-col h-full">
                    <div
                      className={`w-12 h-12 rounded-xl bg-linear-to-br ${link.gradient} flex items-center justify-center mb-4`}
                    >
                      <link.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                      {link.title}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-white/60">
                      {link.description}
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          O que você pode fazer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <Card className="p-6 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 w-fit mb-4">
                  <feature.icon className="h-5 w-5 text-gray-600 dark:text-white/60" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-white/60">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Help Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card className="p-6 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="p-3 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 shrink-0">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Precisa de ajuda?
              </h3>
              <p className="text-sm text-gray-600 dark:text-white/60">
                Use o menu superior para navegar entre os módulos. Cada seção
                possui funcionalidades específicas para gerenciar seu negócio.
              </p>
            </div>
            <Link href="/settings">
              <Button variant="ghost" className="gap-2 shrink-0">
                <Settings className="h-4 w-4" />
                Configurações
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
