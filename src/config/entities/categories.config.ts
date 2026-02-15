/**
 * OpenSea OS - Categories Entity Config
 * Configuração completa da entidade de categorias
 */

import { STOCK_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Category } from '@/types/stock';
import { Copy, Edit, Eye, Folder, Plus, Trash2 } from 'lucide-react';

export const categoriesConfig = defineEntityConfig<Category>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Categoria',
  namePlural: 'Categorias',
  slug: 'categories',
  description: 'Gerenciamento de categorias de produtos',
  icon: Folder,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/categories',
    queryKey: 'categories',
    queryKeys: {
      list: ['categories'],
      detail: (id: string) => ['categories', id],
    },
    endpoints: {
      list: '/v1/categories',
      get: '/v1/categories/:id',
      create: '/v1/categories',
      update: '/v1/categories/:id',
      delete: '/v1/categories/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/stock/product-categories',
    detail: '/stock/product-categories/:id',
    create: '/stock/product-categories/new',
    edit: '/stock/product-categories/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Folder,
    color: 'blue',
    gradient: 'from-blue-500 to-purple-600',
    titleField: 'name',
    subtitleField: 'description',
    imageField: undefined,
    labels: {
      singular: 'Categoria',
      plural: 'Categorias',
      createButton: 'Nova Categoria',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma categoria encontrada',
      searchPlaceholder: 'Buscar categorias...',
    },
    badgeFields: [
      {
        field: 'isActive',
        label: 'Status',
        colorMap: {
          true: 'bg-green-500/20 text-green-700 dark:text-green-400',
          false: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
        },
        render: (value: unknown) => (value ? 'Ativa' : 'Inativa'),
      },
    ],
    metaFields: [
      {
        field: 'createdAt',
        label: 'Criado em',
        format: 'date',
      },
      {
        field: 'displayOrder',
        label: 'Ordem',
        format: 'number',
      },
    ],
  },

  // ======================== GRID/LISTA ========================
  grid: {
    defaultView: 'grid',
    columns: {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
    },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name', 'description', 'slug'],
    defaultSort: {
      field: 'displayOrder',
      direction: 'asc',
    },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // ======================== FORMULÁRIO ========================
  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informações Básicas',
        description: 'Dados principais da categoria',
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Ex: Eletrônicos',
            colSpan: 2,
            description: 'Nome da categoria',
          },
          {
            name: 'slug',
            label: 'Slug',
            type: 'text',
            placeholder: 'Ex: eletronicos',
            colSpan: 2,
            description: 'URL amigável (gerado automaticamente se vazio)',
          },
          {
            name: 'description',
            label: 'Descrição',
            type: 'textarea',
            placeholder: 'Descrição da categoria',
            colSpan: 4,
          },
        ],
        columns: 4,
      },
      {
        id: 'settings',
        title: 'Configurações',
        description: 'Configurações adicionais',
        fields: [
          {
            name: 'displayOrder',
            label: 'Ordem de Exibição',
            type: 'number',
            placeholder: '0',
            colSpan: 2,
            description: 'Ordem de exibição (menor número aparece primeiro)',
            min: 0,
          },
          {
            name: 'isActive',
            label: 'Status',
            type: 'checkbox',
            colSpan: 2,
            defaultValue: true,
          },
        ],
        columns: 4,
      },
    ],
    defaultColumns: 4,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  // ======================== PERMISSÕES ========================
  permissions: {
    view: STOCK_PERMISSIONS.CATEGORIES.READ,
    create: STOCK_PERMISSIONS.CATEGORIES.CREATE,
    update: STOCK_PERMISSIONS.CATEGORIES.UPDATE,
    delete: STOCK_PERMISSIONS.CATEGORIES.DELETE,
    export: STOCK_PERMISSIONS.CATEGORIES.MANAGE,
    import: STOCK_PERMISSIONS.CATEGORIES.MANAGE,
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: true,
    delete: true,
    duplicate: true,
    softDelete: true,
    export: true,
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
    auditLog: true,
    versioning: false,
    realtime: false,
  },

  // ======================== AÇÕES ========================
  actions: {
    header: [
      {
        id: 'create',
        label: 'Nova Categoria',
        icon: Plus,
        variant: 'default',
        permission: STOCK_PERMISSIONS.CATEGORIES.CREATE,
        onClick: () => {}, // Handled by page component
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.CATEGORIES.READ,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.CATEGORIES.UPDATE,
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.CATEGORIES.CREATE,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.CATEGORIES.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Categoria',
        confirmMessage: 'Tem certeza que deseja excluir esta categoria?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: STOCK_PERMISSIONS.CATEGORIES.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Categorias',
        confirmMessage:
          'Tem certeza que deseja excluir as categorias selecionadas?',
      },
    ],
  },
});

export default categoriesConfig;
