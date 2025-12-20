/**
 * Users Module Configuration
 * Definição completa da entidade Users
 */

import { defineEntityConfig } from '@/core/types';
import type { User } from '@/types/auth';
import { Users } from 'lucide-react';

export const usersConfig = defineEntityConfig<User>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Usuário',
  namePlural: 'Usuários',
  slug: 'users',
  description: 'Gerenciamento de usuários do sistema',
  icon: Users,

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
    icon: Users,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    titleField: 'username',
    subtitleField: 'email',
    labels: {
      singular: 'Usuário',
      plural: 'Usuários',
      createButton: 'Novo Usuário',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum usuário encontrado',
      searchPlaceholder: 'Buscar usuários por nome, email ou username...',
    },
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
  },

  // ======================== PERMISSÕES ========================
  permissions: {
    view: 'users.view',
    create: 'users.create',
    update: 'users.update',
    delete: 'users.delete',
    export: 'users.export',
    import: 'users.import',
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: true,
    delete: true,
    duplicate: false,
    export: false,
    import: false,
  },
});
