/**
 * OpenSea OS - Base Permissions
 * Definição das permissões base do sistema
 */

import type { CreatePermissionDTO } from '@/types/rbac';

// =============================================================================
// PERMISSION DEFINITIONS
// =============================================================================

/**
 * Permissões do módulo Core (sistema)
 */
export const corePermissions: CreatePermissionDTO[] = [
  // RBAC
  {
    code: 'core.rbac.view',
    name: 'Visualizar RBAC',
    description: 'Visualizar permissões e grupos de permissões',
    module: 'core',
    resource: 'rbac',
    action: 'view',
  },
  {
    code: 'core.rbac.create',
    name: 'Criar RBAC',
    description: 'Criar permissões e grupos',
    module: 'core',
    resource: 'rbac',
    action: 'create',
  },
  {
    code: 'core.rbac.update',
    name: 'Atualizar RBAC',
    description: 'Atualizar permissões e grupos',
    module: 'core',
    resource: 'rbac',
    action: 'update',
  },
  {
    code: 'core.rbac.delete',
    name: 'Excluir RBAC',
    description: 'Excluir permissões e grupos',
    module: 'core',
    resource: 'rbac',
    action: 'delete',
  },
  {
    code: 'core.rbac.manage',
    name: 'Gerenciar RBAC',
    description: 'Acesso total ao sistema RBAC',
    module: 'core',
    resource: 'rbac',
    action: 'manage',
  },

  // Users
  {
    code: 'core.users.view',
    name: 'Visualizar Usuários',
    description: 'Visualizar lista de usuários',
    module: 'core',
    resource: 'users',
    action: 'view',
  },
  {
    code: 'core.users.create',
    name: 'Criar Usuários',
    description: 'Criar novos usuários',
    module: 'core',
    resource: 'users',
    action: 'create',
  },
  {
    code: 'core.users.update',
    name: 'Atualizar Usuários',
    description: 'Atualizar dados de usuários',
    module: 'core',
    resource: 'users',
    action: 'update',
  },
  {
    code: 'core.users.delete',
    name: 'Excluir Usuários',
    description: 'Excluir usuários do sistema',
    module: 'core',
    resource: 'users',
    action: 'delete',
  },
  {
    code: 'core.users.manage',
    name: 'Gerenciar Usuários',
    description: 'Acesso total ao gerenciamento de usuários',
    module: 'core',
    resource: 'users',
    action: 'manage',
  },

  // Settings
  {
    code: 'core.settings.view',
    name: 'Visualizar Configurações',
    description: 'Visualizar configurações do sistema',
    module: 'core',
    resource: 'settings',
    action: 'view',
  },
  {
    code: 'core.settings.update',
    name: 'Atualizar Configurações',
    description: 'Atualizar configurações do sistema',
    module: 'core',
    resource: 'settings',
    action: 'update',
  },
];

/**
 * Permissões do módulo Stock (estoque)
 */
export const stockPermissions: CreatePermissionDTO[] = [
  // Templates
  {
    code: 'stock.templates.view',
    name: 'Visualizar Templates',
    description: 'Visualizar templates de produtos',
    module: 'stock',
    resource: 'templates',
    action: 'view',
  },
  {
    code: 'stock.templates.create',
    name: 'Criar Templates',
    description: 'Criar novos templates',
    module: 'stock',
    resource: 'templates',
    action: 'create',
  },
  {
    code: 'stock.templates.update',
    name: 'Atualizar Templates',
    description: 'Atualizar templates existentes',
    module: 'stock',
    resource: 'templates',
    action: 'update',
  },
  {
    code: 'stock.templates.delete',
    name: 'Excluir Templates',
    description: 'Excluir templates',
    module: 'stock',
    resource: 'templates',
    action: 'delete',
  },

  // Products
  {
    code: 'stock.products.view',
    name: 'Visualizar Produtos',
    description: 'Visualizar produtos do estoque',
    module: 'stock',
    resource: 'products',
    action: 'view',
  },
  {
    code: 'stock.products.create',
    name: 'Criar Produtos',
    description: 'Criar novos produtos',
    module: 'stock',
    resource: 'products',
    action: 'create',
  },
  {
    code: 'stock.products.update',
    name: 'Atualizar Produtos',
    description: 'Atualizar produtos existentes',
    module: 'stock',
    resource: 'products',
    action: 'update',
  },
  {
    code: 'stock.products.delete',
    name: 'Excluir Produtos',
    description: 'Excluir produtos',
    module: 'stock',
    resource: 'products',
    action: 'delete',
  },

  // Variants
  {
    code: 'stock.variants.view',
    name: 'Visualizar Variantes',
    description: 'Visualizar variantes de produtos',
    module: 'stock',
    resource: 'variants',
    action: 'view',
  },
  {
    code: 'stock.variants.create',
    name: 'Criar Variantes',
    description: 'Criar novas variantes',
    module: 'stock',
    resource: 'variants',
    action: 'create',
  },
  {
    code: 'stock.variants.update',
    name: 'Atualizar Variantes',
    description: 'Atualizar variantes existentes',
    module: 'stock',
    resource: 'variants',
    action: 'update',
  },
  {
    code: 'stock.variants.delete',
    name: 'Excluir Variantes',
    description: 'Excluir variantes',
    module: 'stock',
    resource: 'variants',
    action: 'delete',
  },

  // Items
  {
    code: 'stock.items.view',
    name: 'Visualizar Itens',
    description: 'Visualizar itens de estoque',
    module: 'stock',
    resource: 'items',
    action: 'view',
  },
  {
    code: 'stock.items.create',
    name: 'Criar Itens',
    description: 'Criar novos itens',
    module: 'stock',
    resource: 'items',
    action: 'create',
  },
  {
    code: 'stock.items.update',
    name: 'Atualizar Itens',
    description: 'Atualizar itens existentes',
    module: 'stock',
    resource: 'items',
    action: 'update',
  },
  {
    code: 'stock.items.delete',
    name: 'Excluir Itens',
    description: 'Excluir itens',
    module: 'stock',
    resource: 'items',
    action: 'delete',
  },

  // Locations
  {
    code: 'stock.locations.view',
    name: 'Visualizar Localizações',
    description: 'Visualizar localizações de estoque',
    module: 'stock',
    resource: 'locations',
    action: 'view',
  },
  {
    code: 'stock.locations.create',
    name: 'Criar Localizações',
    description: 'Criar novas localizações',
    module: 'stock',
    resource: 'locations',
    action: 'create',
  },
  {
    code: 'stock.locations.update',
    name: 'Atualizar Localizações',
    description: 'Atualizar localizações existentes',
    module: 'stock',
    resource: 'locations',
    action: 'update',
  },
  {
    code: 'stock.locations.delete',
    name: 'Excluir Localizações',
    description: 'Excluir localizações',
    module: 'stock',
    resource: 'locations',
    action: 'delete',
  },

  // Categories
  {
    code: 'stock.categories.view',
    name: 'Visualizar Categorias',
    description: 'Visualizar categorias',
    module: 'stock',
    resource: 'categories',
    action: 'view',
  },
  {
    code: 'stock.categories.create',
    name: 'Criar Categorias',
    description: 'Criar novas categorias',
    module: 'stock',
    resource: 'categories',
    action: 'create',
  },
  {
    code: 'stock.categories.update',
    name: 'Atualizar Categorias',
    description: 'Atualizar categorias existentes',
    module: 'stock',
    resource: 'categories',
    action: 'update',
  },
  {
    code: 'stock.categories.delete',
    name: 'Excluir Categorias',
    description: 'Excluir categorias',
    module: 'stock',
    resource: 'categories',
    action: 'delete',
  },

  // Suppliers
  {
    code: 'stock.suppliers.view',
    name: 'Visualizar Fornecedores',
    description: 'Visualizar fornecedores',
    module: 'stock',
    resource: 'suppliers',
    action: 'view',
  },
  {
    code: 'stock.suppliers.create',
    name: 'Criar Fornecedores',
    description: 'Criar novos fornecedores',
    module: 'stock',
    resource: 'suppliers',
    action: 'create',
  },
  {
    code: 'stock.suppliers.update',
    name: 'Atualizar Fornecedores',
    description: 'Atualizar fornecedores existentes',
    module: 'stock',
    resource: 'suppliers',
    action: 'update',
  },
  {
    code: 'stock.suppliers.delete',
    name: 'Excluir Fornecedores',
    description: 'Excluir fornecedores',
    module: 'stock',
    resource: 'suppliers',
    action: 'delete',
  },

  // Manufacturers
  {
    code: 'stock.manufacturers.view',
    name: 'Visualizar Fabricantes',
    description: 'Visualizar fabricantes',
    module: 'stock',
    resource: 'manufacturers',
    action: 'view',
  },
  {
    code: 'stock.manufacturers.create',
    name: 'Criar Fabricantes',
    description: 'Criar novos fabricantes',
    module: 'stock',
    resource: 'manufacturers',
    action: 'create',
  },
  {
    code: 'stock.manufacturers.update',
    name: 'Atualizar Fabricantes',
    description: 'Atualizar fabricantes existentes',
    module: 'stock',
    resource: 'manufacturers',
    action: 'update',
  },
  {
    code: 'stock.manufacturers.delete',
    name: 'Excluir Fabricantes',
    description: 'Excluir fabricantes',
    module: 'stock',
    resource: 'manufacturers',
    action: 'delete',
  },

  // Tags
  {
    code: 'stock.tags.view',
    name: 'Visualizar Tags',
    description: 'Visualizar tags',
    module: 'stock',
    resource: 'tags',
    action: 'view',
  },
  {
    code: 'stock.tags.create',
    name: 'Criar Tags',
    description: 'Criar novas tags',
    module: 'stock',
    resource: 'tags',
    action: 'create',
  },
  {
    code: 'stock.tags.update',
    name: 'Atualizar Tags',
    description: 'Atualizar tags existentes',
    module: 'stock',
    resource: 'tags',
    action: 'update',
  },
  {
    code: 'stock.tags.delete',
    name: 'Excluir Tags',
    description: 'Excluir tags',
    module: 'stock',
    resource: 'tags',
    action: 'delete',
  },

  // Wildcard permissions
  {
    code: 'stock.*.view',
    name: 'Visualizar Tudo (Stock)',
    description: 'Visualizar todos os recursos de estoque',
    module: 'stock',
    resource: '*',
    action: 'view',
  },
  {
    code: 'stock.*.manage',
    name: 'Gerenciar Tudo (Stock)',
    description: 'Gerenciar todos os recursos de estoque',
    module: 'stock',
    resource: '*',
    action: 'manage',
  },
];

/**
 * Permissões do módulo Sales (vendas)
 */
export const salesPermissions: CreatePermissionDTO[] = [
  // Orders
  {
    code: 'sales.orders.view',
    name: 'Visualizar Pedidos',
    description: 'Visualizar pedidos de venda',
    module: 'sales',
    resource: 'orders',
    action: 'view',
  },
  {
    code: 'sales.orders.create',
    name: 'Criar Pedidos',
    description: 'Criar novos pedidos',
    module: 'sales',
    resource: 'orders',
    action: 'create',
  },
  {
    code: 'sales.orders.update',
    name: 'Atualizar Pedidos',
    description: 'Atualizar pedidos existentes',
    module: 'sales',
    resource: 'orders',
    action: 'update',
  },
  {
    code: 'sales.orders.delete',
    name: 'Excluir Pedidos',
    description: 'Excluir pedidos',
    module: 'sales',
    resource: 'orders',
    action: 'delete',
  },

  // Customers
  {
    code: 'sales.customers.view',
    name: 'Visualizar Clientes',
    description: 'Visualizar clientes',
    module: 'sales',
    resource: 'customers',
    action: 'view',
  },
  {
    code: 'sales.customers.create',
    name: 'Criar Clientes',
    description: 'Criar novos clientes',
    module: 'sales',
    resource: 'customers',
    action: 'create',
  },
  {
    code: 'sales.customers.update',
    name: 'Atualizar Clientes',
    description: 'Atualizar clientes existentes',
    module: 'sales',
    resource: 'customers',
    action: 'update',
  },
  {
    code: 'sales.customers.delete',
    name: 'Excluir Clientes',
    description: 'Excluir clientes',
    module: 'sales',
    resource: 'customers',
    action: 'delete',
  },
];

/**
 * Permissão global de administrador
 */
export const wildcardPermissions: CreatePermissionDTO[] = [
  {
    code: '*.*.*',
    name: 'Acesso Total',
    description: 'Acesso total ao sistema (Super Admin)',
    module: '*',
    resource: '*',
    action: '*',
    metadata: {
      critical: true,
      dangerous: true,
    },
  },
];

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Todas as permissões base do sistema
 */
export const allBasePermissions: CreatePermissionDTO[] = [
  ...corePermissions,
  ...stockPermissions,
  ...salesPermissions,
  ...wildcardPermissions,
];

/**
 * Permissões agrupadas por módulo
 */
export const permissionsByModule = {
  core: corePermissions,
  stock: stockPermissions,
  sales: salesPermissions,
  wildcard: wildcardPermissions,
};
