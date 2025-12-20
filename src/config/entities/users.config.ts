/**
 * OpenSea OS - Users Entity Config
 * Configuração completa da entidade de usuários com RBAC
 */

import { defineEntityConfig } from '@/core/types';
import type { User } from '@/types/auth';
import { UserCircle, Copy, Edit, Eye, Plus, Trash2, Shield } from 'lucide-react';

export const usersConfig = defineEntityConfig<User>()(  {
  // ======================== IDENTIFICAÇÃO ========================
  name: 'User',
  namePlural: 'Users',
  slug: 'users',
  description: 'Gerenciamento de usuários do sistema',
  icon: UserCircle,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/users',
    queryKey: 'users',
    queryKeys: {
      list: ['users'],
      detail: (id: string) => ['users', id],
    },
    endpoints: {
      list: '/v1/users',
      get: '/v1/users/:id',
      create: '/v1/users',
      update: '/v1/users/:id',
      delete: '/v1/users/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/admin/users',
    detail: '/admin/users/:id',
    create: '/admin/users/new',
    edit: '/admin/users/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: UserCircle,
    color: 'green',
    gradient: 'from-green-500 to-teal-600',
    titleField: 'username',
    subtitleField: 'email',
    imageField: undefined,
    labels: {
      singular: 'Usuário',
      plural: 'Usuários',
      createButton: 'Novo Usuário',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum usuário encontrado',
      searchPlaceholder: 'Buscar usuários...',
    },
    badgeFields: [
      {
        field: 'role',
        label: 'Papel',
        render: (value: unknown) => String(value),
        colorMap: {
          ADMIN: 'bg-red-500/20 text-red-700 dark:text-red-400',
          MANAGER: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
          USER: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
        },
      },
    ],
    metaFields: [
      {
        field: 'email',
        label: 'Email',
        format: 'text',
      },
      {
        field: 'lastLoginAt',
        label: 'Último acesso',
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
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['username', 'email'],
    defaultSort: {
      field: 'username',
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
        description: 'Dados essenciais do usuário',
        fields: [
          {
            name: 'username',
            label: 'Nome de Usuário',
            type: 'text',
            required: true,
            placeholder: 'Ex: joao.silva',
            colSpan: 2,
            description: 'Nome único de usuário (sem espaços)',
          },
          {
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'joao@example.com',
            colSpan: 2,
          },
          {
            name: 'role',
            label: 'Função Base',
            type: 'select',
            required: true,
            defaultValue: 'USER',
            colSpan: 2,
            options: [
              { value: 'USER', label: 'Usuário' },
              { value: 'MANAGER', label: 'Gerente' },
              { value: 'ADMIN', label: 'Administrador' },
            ],
            description:
              'Função base do usuário. Permissões detalhadas são gerenciadas por grupos.',
          },
        ],
        columns: 4,
      },
      {
        id: 'profile',
        title: 'Perfil',
        description: 'Informações do perfil do usuário (opcional)',
        collapsible: true,
        defaultCollapsed: true,
        fields: [
          {
            name: 'profile.name',
            label: 'Nome',
            type: 'text',
            required: false,
            placeholder: 'João',
            colSpan: 2,
          },
          {
            name: 'profile.surname',
            label: 'Sobrenome',
            type: 'text',
            required: false,
            placeholder: 'Silva',
            colSpan: 2,
          },
          {
            name: 'profile.location',
            label: 'Localização',
            type: 'text',
            required: false,
            placeholder: 'São Paulo, SP',
            colSpan: 2,
          },
          {
            name: 'profile.birthday',
            label: 'Data de Nascimento',
            type: 'date',
            required: false,
            colSpan: 2,
          },
          {
            name: 'profile.bio',
            label: 'Biografia',
            type: 'textarea',
            required: false,
            placeholder: 'Uma breve descrição sobre o usuário',
            colSpan: 4,
          },
          {
            name: 'profile.avatarUrl',
            label: 'URL do Avatar',
            type: 'url',
            required: false,
            placeholder: 'https://example.com/avatar.jpg',
            colSpan: 4,
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
    view: 'core.users.view',
    create: 'core.users.create',
    update: 'core.users.update',
    delete: 'core.users.delete',
    export: 'core.users.export',
    import: 'core.users.import',
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: true,
    delete: true,
    duplicate: false,
    softDelete: true,
    export: true,
    import: true,
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
        label: 'Novo Usuário',
        icon: Plus,
        variant: 'default',
        permission: 'core.users.create',
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: 'core.users.view',
      },
      {
        id: 'permissions',
        label: 'Gerenciar Grupos',
        icon: Shield,
        onClick: () => {},
        permission: 'core.rbac.update',
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: 'core.users.update',
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: 'core.users.delete',
        confirm: true,
        confirmTitle: 'Excluir Usuário',
        confirmMessage:
          'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: 'core.users.delete',
        confirm: true,
        confirmTitle: 'Excluir Usuários',
        confirmMessage:
          'Tem certeza que deseja excluir os usuários selecionados?',
      },
    ],
  },
});

export default usersConfig;
