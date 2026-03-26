/**
 * OpenSea OS - Workflows Entity Config
 */

import { SALES_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Workflow } from '@/types/sales';
import { Eye, Edit, GitBranch, Plus, Trash2 } from 'lucide-react';

export const workflowsConfig = defineEntityConfig<Workflow>()({
  name: 'Workflow',
  namePlural: 'Workflows',
  slug: 'workflows',
  description: 'Automações e fluxos de trabalho',
  icon: GitBranch,

  api: {
    baseUrl: '/api/v1/workflows',
    queryKey: 'workflows',
    queryKeys: {
      list: ['workflows'],
      detail: (id: string) => ['workflows', id],
    },
    endpoints: {
      list: '/v1/workflows',
      get: '/v1/workflows/:id',
      create: '/v1/workflows',
      update: '/v1/workflows/:id',
      delete: '/v1/workflows/:id',
    },
  },

  routes: {
    list: '/sales/workflows',
    detail: '/sales/workflows/:id',
    create: '/sales/workflows/new',
    edit: '/sales/workflows/:id/edit',
  },

  display: {
    icon: GitBranch,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    titleField: 'name',
    subtitleField: 'description',
    imageField: undefined,
    labels: {
      singular: 'Workflow',
      plural: 'Workflows',
      createButton: 'Novo Workflow',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum workflow encontrado',
      searchPlaceholder: 'Buscar workflows por nome...',
    },
    badgeFields: [],
    metaFields: [{ field: 'createdAt', label: 'Criado em', format: 'date' }],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name'],
    defaultSort: { field: 'createdAt', direction: 'desc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50],
  },

  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informações Básicas',
        description: 'Dados do workflow',
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Nome do workflow',
            colSpan: 2,
          },
          {
            name: 'trigger',
            label: 'Gatilho',
            type: 'select',
            required: true,
            colSpan: 2,
            options: [],
          },
        ],
        columns: 4,
      },
    ],
    defaultColumns: 4,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  permissions: {
    view: SALES_PERMISSIONS.WORKFLOWS.ACCESS,
    create: SALES_PERMISSIONS.WORKFLOWS.ADMIN,
    update: SALES_PERMISSIONS.WORKFLOWS.ADMIN,
    delete: SALES_PERMISSIONS.WORKFLOWS.ADMIN,
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
    batchOperations: false,
    favorite: false,
    archive: false,
    auditLog: true,
    versioning: false,
    realtime: false,
  },

  actions: {
    header: [
      {
        id: 'create',
        label: 'Novo Workflow',
        icon: Plus,
        variant: 'default',
        permission: SALES_PERMISSIONS.WORKFLOWS.ADMIN,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: SALES_PERMISSIONS.WORKFLOWS.ACCESS,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: SALES_PERMISSIONS.WORKFLOWS.ADMIN,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: SALES_PERMISSIONS.WORKFLOWS.ADMIN,
        confirm: true,
        confirmTitle: 'Excluir Workflow',
        confirmMessage: 'Tem certeza que deseja excluir este workflow?',
      },
    ],
    batch: [],
  },
});

export default workflowsConfig;
