/**
 * Permission Groups Module Configuration
 * Definição completa da entidade Permission Groups
 */

import { RBAC_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { PermissionGroup } from '@/types/rbac';
import { Users } from 'lucide-react';

export const permissionGroupsConfig = defineEntityConfig<PermissionGroup>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Grupo de Permissões',
  namePlural: 'Grupos de Permissões',
  slug: 'permission-groups',
  description: 'Gerenciamento de grupos de permissões do sistema',
  icon: Users,

  // ======================== API ========================
  api: {
    baseUrl: '/v1/rbac/permission-groups',
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
    subtitleField: 'slug',
    labels: {
      singular: 'Grupo de Permissões',
      plural: 'Grupos de Permissões',
      createButton: 'Novo Grupo',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum grupo encontrado',
      searchPlaceholder: 'Buscar grupos por nome, slug ou descrição...',
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
    view: RBAC_PERMISSIONS.GROUPS.READ,
    create: RBAC_PERMISSIONS.GROUPS.CREATE,
    update: RBAC_PERMISSIONS.GROUPS.UPDATE,
    delete: RBAC_PERMISSIONS.GROUPS.DELETE,
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
