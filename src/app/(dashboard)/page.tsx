/**
 * Dashboard Page
 * Página principal do dashboard
 */

'use client';

import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  DollarSign,
  Package,
  Plus,
  ShoppingCart,
  Users,
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      label: 'Total de Produtos',
      value: '1,234',
      icon: <Package className="w-6 h-6" />,
      trend: { value: 12, isPositive: true },
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Vendas do Mês',
      value: 'R$ 45.2k',
      icon: <ShoppingCart className="w-6 h-6" />,
      trend: { value: 23, isPositive: true },
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Clientes',
      value: '856',
      icon: <Users className="w-6 h-6" />,
      trend: { value: 8, isPositive: true },
      gradient: 'from-green-500 to-green-600',
    },
    {
      label: 'Receita Total',
      value: 'R$ 123.4k',
      icon: <DollarSign className="w-6 h-6" />,
      trend: { value: 18, isPositive: true },
      gradient: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Bem-vindo de volta! 👋
        </h1>
        <p className="text-lg text-gray-600 dark:text-white/60">
          Aqui está o resumo do seu negócio hoje
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="p-6 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Ações Rápidas
              </h2>
              <p className="text-gray-600 dark:text-white/60">
                Acesse funcionalidades frequentes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-3 hover:bg-blue-50 dark:hover:bg-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Novo Produto
                </h3>
                <p className="text-sm text-gray-600 dark:text-white/60">
                  Adicionar item ao estoque
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-3 hover:bg-purple-50 dark:hover:bg-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Nova Venda
                </h3>
                <p className="text-sm text-gray-600 dark:text-white/60">
                  Registrar pedido
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-3 hover:bg-green-50 dark:hover:bg-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Relatórios
                </h3>
                <p className="text-sm text-gray-600 dark:text-white/60">
                  Ver análises
                </p>
              </div>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="p-6 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Atividades Recentes
              </h2>
              <p className="text-gray-600 dark:text-white/60">
                Últimas movimentações do sistema
              </p>
            </div>
            <Button variant="ghost" className="gap-2">
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {[
              {
                title: 'Novo pedido recebido',
                description: 'Pedido #12345 de João Silva',
                time: '5 min atrás',
                type: 'success',
              },
              {
                title: 'Estoque baixo',
                description: 'Produto XYZ-123 com apenas 5 unidades',
                time: '15 min atrás',
                type: 'warning',
              },
              {
                title: 'Pagamento confirmado',
                description: 'Pedido #12344 - R$ 1.250,00',
                time: '1 hora atrás',
                type: 'success',
              },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success'
                      ? 'bg-green-500'
                      : activity.type === 'warning'
                        ? 'bg-orange-500'
                        : 'bg-blue-500'
                  }`}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-white/60">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/40 mt-1">
                    {activity.time}
                  </p>
                </div>
                <Badge
                  variant={
                    activity.type === 'success' ? 'default' : 'secondary'
                  }
                >
                  {activity.type === 'success' ? 'Sucesso' : 'Alerta'}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
