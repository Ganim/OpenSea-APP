/**
 * OpenSea OS - Base Permission Groups
 * Definição dos grupos de permissões base do sistema
 */

import type { CreatePermissionGroupDTO } from '@/types/rbac';

// =============================================================================
// GROUP DEFINITIONS
// =============================================================================

/**
 * Grupos de permissões base do sistema
 */
export const baseGroups: Array<
  CreatePermissionGroupDTO & {
    permissions: Array<{
      code: string;
      effect: 'allow' | 'deny';
    }>;
  }
> = [
  // =========================
  // SUPER ADMIN
  // =========================
  {
    name: 'Super Administrador',
    description:
      'Acesso total ao sistema. Pode fazer qualquer operação sem restrições.',
    color: '#EF4444',
    priority: 1000,
    permissions: [
      {
        code: '*.*.*',
        effect: 'allow',
      },
    ],
  },

  // =========================
  // ADMINISTRADOR
  // =========================
  {
    name: 'Administrador',
    description:
      'Administrador do sistema com acesso à maioria das funcionalidades.',
    color: '#F97316',
    priority: 900,
    permissions: [
      // Core
      { code: 'core.rbac.view', effect: 'allow' },
      { code: 'core.rbac.create', effect: 'allow' },
      { code: 'core.rbac.update', effect: 'allow' },
      { code: 'core.rbac.delete', effect: 'allow' },
      { code: 'core.users.view', effect: 'allow' },
      { code: 'core.users.create', effect: 'allow' },
      { code: 'core.users.update', effect: 'allow' },
      { code: 'core.users.delete', effect: 'allow' },
      { code: 'core.settings.view', effect: 'allow' },
      { code: 'core.settings.update', effect: 'allow' },

      // Stock - acesso total
      { code: 'stock.*.manage', effect: 'allow' },

      // Sales - acesso total
      { code: 'sales.orders.view', effect: 'allow' },
      { code: 'sales.orders.create', effect: 'allow' },
      { code: 'sales.orders.update', effect: 'allow' },
      { code: 'sales.orders.delete', effect: 'allow' },
      { code: 'sales.customers.view', effect: 'allow' },
      { code: 'sales.customers.create', effect: 'allow' },
      { code: 'sales.customers.update', effect: 'allow' },
      { code: 'sales.customers.delete', effect: 'allow' },
    ],
  },

  // =========================
  // GERENTE DE ESTOQUE
  // =========================
  {
    name: 'Gerente de Estoque',
    description: 'Gerencia produtos, variantes, itens e localizações do estoque.',
    color: '#3B82F6',
    priority: 500,
    permissions: [
      // Stock - visualização total
      { code: 'stock.*.view', effect: 'allow' },

      // Templates
      { code: 'stock.templates.create', effect: 'allow' },
      { code: 'stock.templates.update', effect: 'allow' },
      { code: 'stock.templates.delete', effect: 'allow' },

      // Products
      { code: 'stock.products.create', effect: 'allow' },
      { code: 'stock.products.update', effect: 'allow' },
      { code: 'stock.products.delete', effect: 'allow' },

      // Variants
      { code: 'stock.variants.create', effect: 'allow' },
      { code: 'stock.variants.update', effect: 'allow' },
      { code: 'stock.variants.delete', effect: 'allow' },

      // Items
      { code: 'stock.items.create', effect: 'allow' },
      { code: 'stock.items.update', effect: 'allow' },
      { code: 'stock.items.delete', effect: 'allow' },

      // Locations
      { code: 'stock.locations.create', effect: 'allow' },
      { code: 'stock.locations.update', effect: 'allow' },
      { code: 'stock.locations.delete', effect: 'allow' },

      // Categories, Suppliers, etc.
      { code: 'stock.categories.create', effect: 'allow' },
      { code: 'stock.categories.update', effect: 'allow' },
      { code: 'stock.suppliers.create', effect: 'allow' },
      { code: 'stock.suppliers.update', effect: 'allow' },
      { code: 'stock.manufacturers.create', effect: 'allow' },
      { code: 'stock.manufacturers.update', effect: 'allow' },
      { code: 'stock.tags.create', effect: 'allow' },
      { code: 'stock.tags.update', effect: 'allow' },
    ],
  },

  // =========================
  // OPERADOR DE ESTOQUE
  // =========================
  {
    name: 'Operador de Estoque',
    description:
      'Visualiza estoque e pode criar/atualizar itens e localizações.',
    color: '#10B981',
    priority: 300,
    permissions: [
      // Visualização de tudo
      { code: 'stock.*.view', effect: 'allow' },

      // Pode gerenciar itens
      { code: 'stock.items.create', effect: 'allow' },
      { code: 'stock.items.update', effect: 'allow' },

      // Pode gerenciar localizações
      { code: 'stock.locations.create', effect: 'allow' },
      { code: 'stock.locations.update', effect: 'allow' },

      // NÃO pode deletar produtos/variantes
      { code: 'stock.products.delete', effect: 'deny' },
      { code: 'stock.variants.delete', effect: 'deny' },
    ],
  },

  // =========================
  // VENDEDOR
  // =========================
  {
    name: 'Vendedor',
    description: 'Visualiza produtos e cria pedidos de venda.',
    color: '#8B5CF6',
    priority: 200,
    permissions: [
      // Visualizar estoque
      { code: 'stock.products.view', effect: 'allow' },
      { code: 'stock.variants.view', effect: 'allow' },
      { code: 'stock.items.view', effect: 'allow' },

      // Criar e visualizar pedidos
      { code: 'sales.orders.view', effect: 'allow' },
      { code: 'sales.orders.create', effect: 'allow' },
      { code: 'sales.orders.update', effect: 'allow' },

      // NÃO pode deletar pedidos
      { code: 'sales.orders.delete', effect: 'deny' },

      // Gerenciar clientes
      { code: 'sales.customers.view', effect: 'allow' },
      { code: 'sales.customers.create', effect: 'allow' },
      { code: 'sales.customers.update', effect: 'allow' },
    ],
  },

  // =========================
  // VISUALIZADOR
  // =========================
  {
    name: 'Visualizador',
    description: 'Acesso somente leitura a todos os módulos.',
    color: '#6B7280',
    priority: 100,
    permissions: [
      // Apenas visualização
      { code: 'stock.*.view', effect: 'allow' },
      { code: 'sales.orders.view', effect: 'allow' },
      { code: 'sales.customers.view', effect: 'allow' },

      // Negar qualquer criação, atualização ou exclusão
      { code: 'stock.*.create', effect: 'deny' },
      { code: 'stock.*.update', effect: 'deny' },
      { code: 'stock.*.delete', effect: 'deny' },
      { code: 'sales.*.create', effect: 'deny' },
      { code: 'sales.*.update', effect: 'deny' },
      { code: 'sales.*.delete', effect: 'deny' },
    ],
  },

  // =========================
  // USUÁRIO BÁSICO
  // =========================
  {
    name: 'Usuário Básico',
    description:
      'Acesso básico ao sistema. Pode visualizar produtos e templates.',
    color: '#64748B',
    priority: 50,
    permissions: [
      // Apenas visualização de templates e produtos
      { code: 'stock.templates.view', effect: 'allow' },
      { code: 'stock.products.view', effect: 'allow' },
      { code: 'stock.variants.view', effect: 'allow' },
    ],
  },
];

// =============================================================================
// EXPORTS
// =============================================================================

export default baseGroups;
