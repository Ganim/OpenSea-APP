/**
 * OpenSea OS - Permissions Entity Config
 * Configuração completa da entidade de permissões
 */

import { defineEntityConfig } from '@/core/types';
import type { Permission } from '@/types/rbac';
import { Shield, Copy, Edit, Eye, Plus, Trash2 } from 'lucide-react';

export const permissionsConfig = defineEntityConfig<Permission>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Permission',
  namePlural: 'Permissions',
  slug: 'permissions',
  description: 'Gerenciamento de permissões do sistema',
  icon: Shield,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/rbac/permissions',
    queryKey: 'permissions',
    queryKeys: {
      list: ['permissions'],
      detail: (id: string) => ['permissions', id],
    },
    endpoints: {
      list: '/v1/rbac/permissions',
      get: '/v1/rbac/permissions/:id',
      create: '/v1/rbac/permissions',
      update: '/v1/rbac/permissions/:id',
      delete: '/v1/rbac/permissions/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/admin/permissions',
    detail: '/admin/permissions/:id',
    create: '/admin/permissions/new',
    edit: '/admin/permissions/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Shield,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    titleField: 'name',
    subtitleField: 'description',
    imageField: undefined,
    labels: {
      singular: 'Permissão',
      plural: 'Permissões',
      createButton: 'Nova Permissão',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma permissão encontrada',
      searchPlaceholder: 'Buscar permissões...',
    },
    badgeFields: [
      {
        field: 'module',
        label: 'Módulo',
      },
      {
        field: 'isSystem',
        label: 'Tipo',
        render: (value: unknown) => (value ? 'Sistema' : 'Custom'),
        colorMap: {
          true: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
          false: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
        },
      },
    ],
    metaFields: [
      {
        field: 'code',
        label: 'Código',
        format: 'text',
      },
      {
        field: 'createdAt',
        label: 'Criado em',
        format: 'date',
      },
    ],
  },

  // ======================== GRID/LISTA ========================
  grid: {
    defaultView: 'list',
    columns: {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
    },
    showViewToggle: true,
    enableDragSelection: false,
    selectable: true,
    searchableFields: ['name', 'code', 'description'],
    defaultSort: {
      field: 'code',
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
        title: 'Informações da Permissão',
        description:
          'Formato do código: módulo.recurso.ação (ex: stock.products.create)',
        fields: [
          {
            name: 'code',
            label: 'Código da Permissão',
            type: 'text',
            required: true,
            placeholder: 'Ex: stock.products.create',
            colSpan: 4,
            description:
              'Formato: módulo.recurso.ação. Use * para wildcards (ex: stock.*.read)',
            pattern: /^[a-z*]+\.[a-z*]+\.[a-z*]+$/,
          },
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Ex: Criar Produtos',
            colSpan: 4,
          },
          {
            name: 'description',
            label: 'Descrição',
            type: 'textarea',
            required: false,
            placeholder: 'Descreva o que esta permissão permite fazer',
            colSpan: 4,
          },
        ],
        columns: 4,
      },
      {
        id: 'details',
        title: 'Detalhes da Permissão',
        description: 'Informações adicionais extraídas do código',
        fields: [
          {
            name: 'module',
            label: 'Módulo',
            type: 'select',
            required: true,
            colSpan: 2,
            options: [
              { value: 'core', label: 'Core' },
              { value: 'stock', label: 'Estoque' },
              { value: 'sales', label: 'Vendas' },
            ],
            description: 'Módulo do sistema',
          },
          {
            name: 'resource',
            label: 'Recurso',
            type: 'text',
            required: true,
            colSpan: 2,
            placeholder: 'Ex: products, orders, users',
          },
          {
            name: 'action',
            label: 'Ação',
            type: 'select',
            required: true,
            colSpan: 2,
            options: [
              { value: 'create', label: 'Create' },
              { value: 'read', label: 'Read' },
              { value: 'update', label: 'Update' },
              { value: 'delete', label: 'Delete' },
              { value: 'manage', label: 'Manage (Full Access)' },
              { value: 'export', label: 'Export' },
              { value: 'import', label: 'Import' },
            ],
          },
        ],
        columns: 4,
      },
      {
        id: 'metadata',
        title: 'Metadados',
        description: 'Informações adicionais (opcional)',
        collapsible: true,
        defaultCollapsed: true,
        fields: [
          {
            name: 'metadata',
            label: 'Metadados JSON',
            type: 'json',
            colSpan: 4,
            description: 'Dados adicionais em formato JSON',
            placeholder: '{"category": "inventory", "critical": true}',
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
    view: 'core.rbac.view',
    create: 'core.rbac.create',
    update: 'core.rbac.update',
    delete: 'core.rbac.delete',
    export: 'core.rbac.export',
    import: 'core.rbac.import',
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: true,
    delete: true,
    duplicate: false,
    softDelete: false,
    export: true,
    import: false,
    search: true,
    filters: true,
    sort: true,
    pagination: true,
    selection: true,
    multiSelect: false,
    batchOperations: false,
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
        label: 'Nova Permissão',
        icon: Plus,
        variant: 'default',
        permission: 'core.rbac.create',
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: 'core.rbac.view',
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: 'core.rbac.update',
        show: (item: Permission) => !item.isSystem,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: 'core.rbac.delete',
        show: (item: Permission) => !item.isSystem,
        confirm: true,
        confirmTitle: 'Excluir Permissão',
        confirmMessage: 'Tem certeza que deseja excluir esta permissão?',
      },
    ],
    batch: [],
  },
});

export default permissionsConfig;
