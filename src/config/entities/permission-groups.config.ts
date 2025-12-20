/**
 * OpenSea OS - Permission Groups Entity Config
 * Configuração completa da entidade de grupos de permissões
 */

import { defineEntityConfig } from '@/core/types';
import type { PermissionGroup } from '@/types/rbac';
import { Users, Copy, Edit, Eye, Plus, Trash2, Shield } from 'lucide-react';

export const permissionGroupsConfig = defineEntityConfig<PermissionGroup>()(  {
  // ======================== IDENTIFICAÇÃO ========================
  name: 'PermissionGroup',
  namePlural: 'PermissionGroups',
  slug: 'permission-groups',
  description: 'Gerenciamento de grupos de permissões',
  icon: Users,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/rbac/permission-groups',
    queryKey: 'permission-groups',
    queryKeys: {
      list: ['permission-groups'],
      detail: (id: string) => ['permission-groups', id],
    },
    endpoints: {
      list: '/v1/rbac/permission-groups',
      get: '/v1/rbac/permission-groups/:id',
      create: '/v1/rbac/permission-groups',
      update: '/v1/rbac/permission-groups/:id',
      delete: '/v1/rbac/permission-groups/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/admin/permission-groups',
    detail: '/admin/permission-groups/:id',
    create: '/admin/permission-groups/new',
    edit: '/admin/permission-groups/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Users,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    titleField: 'name',
    subtitleField: 'description',
    imageField: undefined,
    labels: {
      singular: 'Grupo de Permissões',
      plural: 'Grupos de Permissões',
      createButton: 'Novo Grupo',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum grupo de permissões encontrado',
      searchPlaceholder: 'Buscar grupos...',
    },
    badgeFields: [
      {
        field: 'isSystem',
        label: 'Tipo',
        render: (value: unknown) => (value ? 'Sistema' : 'Custom'),
        colorMap: {
          true: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
          false: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
        },
      },
      {
        field: 'isActive',
        label: 'Status',
        render: (value: unknown) => (value ? 'Ativo' : 'Inativo'),
        colorMap: {
          true: 'bg-green-500/20 text-green-700 dark:text-green-400',
          false: 'bg-red-500/20 text-red-700 dark:text-red-400',
        },
      },
      {
        field: 'priority',
        label: 'Prioridade',
        render: (value: unknown) => `${value}`,
      },
    ],
    metaFields: [
      {
        field: 'slug',
        label: 'Slug',
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
    searchableFields: ['name', 'slug', 'description'],
    defaultSort: {
      field: 'priority',
      direction: 'desc',
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
        description: 'Apenas nome é obrigatório. Slug é gerado automaticamente.',
        fields: [
          {
            name: 'name',
            label: 'Nome do Grupo',
            type: 'text',
            required: true,
            placeholder: 'Ex: Gerente de Estoque',
            colSpan: 4,
            description: 'Nome único que identifica o grupo',
          },
          {
            name: 'description',
            label: 'Descrição',
            type: 'textarea',
            required: false,
            placeholder: 'Descreva as responsabilidades deste grupo',
            colSpan: 4,
          },
        ],
        columns: 4,
      },
      {
        id: 'settings',
        title: 'Configurações',
        description: 'Prioridade, cor, hierarquia e status',
        fields: [
          {
            name: 'priority',
            label: 'Prioridade',
            type: 'number',
            required: false,
            defaultValue: 100,
            colSpan: 2,
            description: 'Maior prioridade = maior precedência (default: 100)',
            min: 1,
            max: 1000,
          },
          {
            name: 'color',
            label: 'Cor',
            type: 'color',
            required: false,
            colSpan: 2,
            description: 'Cor em hexadecimal (ex: #3B82F6)',
            placeholder: '#3B82F6',
          },
          {
            name: 'parentId',
            label: 'Grupo Pai (Herança)',
            type: 'relation',
            required: false,
            colSpan: 4,
            description: 'Grupo do qual herdar permissões (opcional)',
            relationEntity: 'permission-groups',
            relationDisplayField: 'name',
            searchable: true,
          },
          {
            name: 'isActive',
            label: 'Ativo',
            type: 'switch',
            required: false,
            defaultValue: true,
            colSpan: 4,
            description: 'Grupos inativos não concedem permissões',
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
        label: 'Novo Grupo',
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
        id: 'permissions',
        label: 'Gerenciar Permissões',
        icon: Shield,
        onClick: () => {},
        permission: 'core.rbac.update',
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: 'core.rbac.update',
        show: (item: PermissionGroup) => !item.isSystem,
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: 'core.rbac.create',
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: 'core.rbac.delete',
        show: (item: PermissionGroup) => !item.isSystem,
        confirm: true,
        confirmTitle: 'Excluir Grupo',
        confirmMessage:
          'Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: 'core.rbac.delete',
        confirm: true,
        confirmTitle: 'Excluir Grupos',
        confirmMessage:
          'Tem certeza que deseja excluir os grupos selecionados?',
      },
    ],
  },
});

export default permissionGroupsConfig;
