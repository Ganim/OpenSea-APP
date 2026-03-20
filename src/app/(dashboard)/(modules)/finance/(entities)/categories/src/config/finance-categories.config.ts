import { FINANCE_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { FinanceCategory } from '@/types/finance';
import { Layers } from 'lucide-react';

export const financeCategoriesConfig = defineEntityConfig<FinanceCategory>()({
  name: 'FinanceCategory',
  namePlural: 'FinanceCategories',
  slug: 'finance-categories',
  description: 'Gerenciamento de categorias financeiras',
  icon: Layers,

  api: {
    baseUrl: '/api/v1/finance/categories',
    queryKey: 'finance-categories',
    queryKeys: {
      list: ['finance-categories'],
      detail: (id: string) => ['finance-categories', id],
    },
    endpoints: {
      list: '/v1/finance/categories',
      get: '/v1/finance/categories/:id',
      create: '/v1/finance/categories',
      update: '/v1/finance/categories/:id',
      delete: '/v1/finance/categories/:id',
    },
  },

  routes: {
    list: '/finance/categories',
    detail: '/finance/categories/:id',
    create: '/finance/categories/new',
    edit: '/finance/categories/:id/edit',
  },

  display: {
    icon: Layers,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    titleField: 'name',
    subtitleField: 'type',
    labels: {
      singular: 'Categoria',
      plural: 'Categorias',
      createButton: 'Nova Categoria',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma categoria encontrada',
      searchPlaceholder: 'Buscar por nome, descrição ou tipo...',
    },
    badgeFields: [{ field: 'isActive', label: 'Status' }],
    metaFields: [
      { field: 'createdAt', label: 'Criado em', format: 'date' },
      { field: 'updatedAt', label: 'Atualizado em', format: 'date' },
    ],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name'],
    defaultSort: { field: 'name', direction: 'asc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  permissions: {
    view: FINANCE_PERMISSIONS.CATEGORIES.ACCESS,
    create: FINANCE_PERMISSIONS.CATEGORIES.REGISTER,
    update: FINANCE_PERMISSIONS.CATEGORIES.MODIFY,
    delete: FINANCE_PERMISSIONS.CATEGORIES.REMOVE,
  },

  features: {
    create: true,
    edit: true,
    delete: true,
    duplicate: false,
    softDelete: false,
    export: false,
    import: false,
    search: true,
    filters: true,
    sort: true,
    pagination: true,
    selection: true,
    multiSelect: true,
    batchOperations: true,
    favorite: false,
    archive: false,
    auditLog: false,
    versioning: false,
    realtime: false,
  },
});

export default financeCategoriesConfig;
