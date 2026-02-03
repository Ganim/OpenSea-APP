/**
 * Dashboard Module Data
 * Configuração dos módulos disponíveis no sistema
 */

import type { Module, ProductivityItem } from '@/types/';

export const modules: Module[] = [
  {
    id: 'estoque',
    name: 'Estoque',
    description: 'Inventário completo',
    icon: 'Package',
    color: 'bg-linear-to-br from-blue-500 to-blue-600',
    status: 'active',
    category: 'inventory',
    href: '/estoque',
  },
  {
    id: 'vendas',
    name: 'Vendas',
    description: 'Gestão de clientes',
    icon: 'ShoppingCart',
    color: 'bg-linear-to-br from-purple-500 to-purple-600',
    status: 'active',
    category: 'sales',
    href: '/vendas',
  },
  {
    id: 'analises',
    name: 'Análises',
    description: 'Relatórios e métricas',
    icon: 'BarChart3',
    color: 'bg-linear-to-br from-orange-500 to-orange-600',
    status: 'coming-soon',
    category: 'analytics',
    href: '/analises',
    badge: {
      label: 'Em breve',
      variant: 'warning',
    },
  },
  {
    id: 'equipe',
    name: 'Equipe',
    description: 'Usuários e acessos',
    icon: 'Users',
    color: 'bg-linear-to-br from-green-500 to-green-600',
    status: 'coming-soon',
    category: 'team',
    href: '/equipe',
    badge: {
      label: 'Em breve',
      variant: 'warning',
    },
  },
  {
    id: 'documentos',
    name: 'Documentos',
    description: 'Notas e relatórios',
    icon: 'FileText',
    color: 'bg-linear-to-br from-indigo-500 to-indigo-600',
    status: 'coming-soon',
    category: 'documents',
    href: '/documentos',
    badge: {
      label: 'Em breve',
      variant: 'warning',
    },
  },
  {
    id: 'chat-ia',
    name: 'Chat IA',
    description: 'Assistente inteligente',
    icon: 'MessageSquare',
    color: 'bg-linear-to-br from-pink-500 to-pink-600',
    status: 'active',
    category: 'chat',
    href: '/chat',
    badge: {
      label: 'Novo',
      variant: 'success',
    },
  },
  {
    id: 'configuracoes',
    name: 'Configurações',
    description: 'Preferências',
    icon: 'Settings',
    color: 'bg-linear-to-br from-gray-500 to-gray-600',
    status: 'active',
    category: 'settings',
    href: '/configuracoes',
  },
];

export const productivityItems: ProductivityItem[] = [
  {
    id: 'calendario',
    name: 'Calendário',
    description: 'Eventos e compromissos',
    icon: 'Calendar',
    color: 'bg-linear-to-br from-blue-500 to-blue-600',
    count: 5,
    href: '/calendario',
  },
  {
    id: 'tarefas',
    name: 'Tarefas',
    description: 'To-do e pendências',
    icon: 'CheckSquare',
    color: 'bg-linear-to-br from-green-500 to-green-600',
    count: 8,
    href: '/tarefas',
  },
  {
    id: 'anotacoes',
    name: 'Anotações',
    description: 'Notas e lembretes',
    icon: 'StickyNote',
    color: 'bg-linear-to-br from-orange-500 to-orange-600',
    count: 12,
    href: '/anotacoes',
  },
  {
    id: 'notificacoes',
    name: 'Notificações',
    description: 'Central de notificações',
    icon: 'Bell',
    color: 'bg-linear-to-br from-purple-500 to-purple-600',
    count: 2,
    href: '/notificacoes',
  },
];
