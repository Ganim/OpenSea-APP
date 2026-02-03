/**
 * OpenSea OS - Products Entity Config
 * Configuração completa da entidade de produtos
 */

import { STOCK_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Product } from '@/types/stock';
import { Copy, Edit, Eye, Package, Plus, Trash2 } from 'lucide-react';

export const productsConfig = defineEntityConfig<Product>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Produto',
  namePlural: 'Produtos',
  slug: 'products',
  description: 'Gerenciamento de produtos',
  icon: Package,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/products',
    queryKey: 'products',
    queryKeys: {
      list: ['products'],
      detail: (id: string) => ['products', id],
    },
    endpoints: {
      list: '/v1/products',
      get: '/v1/products/:id',
      create: '/v1/products',
      update: '/v1/products/:id',
      delete: '/v1/products/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/stock/products',
    detail: '/stock/products/:id',
    create: '/stock/products/new',
    edit: '/stock/products/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Package,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    titleField: 'name',
    subtitleField: 'fullCode',
    imageField: undefined,
    labels: {
      singular: 'Produto',
      plural: 'Produtos',
      createButton: 'Novo Produto',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum produto encontrado',
      searchPlaceholder: 'Buscar produtos...',
    },
    badgeFields: [
      {
        field: 'status',
        label: 'Status',
        colorMap: {
          ACTIVE: 'bg-green-500/20 text-green-700 dark:text-green-400',
          INACTIVE: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
          ARCHIVED: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
        },
        render: (value: unknown) => {
          const labels = {
            ACTIVE: 'Ativo',
            INACTIVE: 'Inativo',
            ARCHIVED: 'Arquivado',
          };
          return labels[value as keyof typeof labels] || String(value);
        },
      },
    ],
    metaFields: [
      {
        field: 'createdAt',
        label: 'Criado em',
        format: 'date',
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
    searchableFields: ['name', 'fullCode', 'description'],
    defaultSort: {
      field: 'name',
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
        description:
          'Apenas template e nome são obrigatórios para criar o produto',
        fields: [
          {
            name: 'templateId',
            label: 'Template',
            type: 'text',
            required: true,
            placeholder: 'ID do template',
            colSpan: 4,
            description: 'Template que define a estrutura deste produto',
          },
          {
            name: 'name',
            label: 'Nome do produto',
            type: 'text',
            required: true,
            placeholder: 'Ex: Tecido Denim Santista',
            colSpan: 4,
          },
          {
            name: 'code',
            label: 'Código',
            type: 'text',
            required: false,
            placeholder: 'Deixe vazio para gerar automaticamente',
            colSpan: 4,
            description: 'Código único (gerado automaticamente se vazio)',
          },
        ],
        columns: 4,
      },
      {
        id: 'additional',
        title: 'Informações Adicionais',
        description: 'Campos opcionais (status é ATIVO por padrão)',
        collapsible: true,
        defaultCollapsed: true,
        fields: [
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: false,
            colSpan: 2,
            defaultValue: 'ACTIVE',
            options: [
              { value: 'ACTIVE', label: 'Ativo' },
              { value: 'INACTIVE', label: 'Inativo' },
              { value: 'ARCHIVED', label: 'Arquivado' },
            ],
            description: 'Padrão: Ativo',
          },
          {
            name: 'description',
            label: 'Descrição',
            type: 'textarea',
            placeholder: 'Descrição detalhada do produto',
            colSpan: 4,
          },
          {
            name: 'supplierId',
            label: 'Fornecedor',
            type: 'text',
            placeholder: 'ID do fornecedor',
            colSpan: 2,
          },
          {
            name: 'manufacturerId',
            label: 'Fabricante',
            type: 'text',
            placeholder: 'ID do fabricante',
            colSpan: 2,
          },
          {
            name: 'attributes',
            label: 'Atributos Customizados',
            type: 'json',
            colSpan: 4,
            placeholder: '{}',
            description: 'Atributos específicos conforme o template',
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
    view: STOCK_PERMISSIONS.PRODUCTS.READ,
    create: STOCK_PERMISSIONS.PRODUCTS.CREATE,
    update: STOCK_PERMISSIONS.PRODUCTS.UPDATE,
    delete: STOCK_PERMISSIONS.PRODUCTS.DELETE,
    export: STOCK_PERMISSIONS.PRODUCTS.MANAGE, // Export uses manage permission
    import: STOCK_PERMISSIONS.PRODUCTS.MANAGE, // Import uses manage permission
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
    archive: true,
    auditLog: true,
    versioning: false,
    realtime: false,
  },

  // ======================== AÇÕES ========================
  actions: {
    header: [
      {
        id: 'create',
        label: 'Novo Produto',
        icon: Plus,
        variant: 'default',
        permission: STOCK_PERMISSIONS.PRODUCTS.CREATE,
        onClick: () => {}, // Handled by page component
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.PRODUCTS.READ,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.PRODUCTS.UPDATE,
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.PRODUCTS.CREATE,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.PRODUCTS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Produto',
        confirmMessage: 'Tem certeza que deseja excluir este produto?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: STOCK_PERMISSIONS.PRODUCTS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Produtos',
        confirmMessage:
          'Tem certeza que deseja excluir os produtos selecionados?',
      },
    ],
  },
});

export default productsConfig;
