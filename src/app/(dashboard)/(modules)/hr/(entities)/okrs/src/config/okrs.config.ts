/**
 * OpenSea OS - OKRs Config (HR)
 */

import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { OKRObjective } from '@/types/hr';
import { Eye, Plus, Target } from 'lucide-react';

export const okrsConfig = defineEntityConfig<OKRObjective>()({
  name: 'OKRObjective',
  namePlural: 'OKRObjectives',
  slug: 'okrs',
  description: 'Gerenciamento de Objetivos e Resultados-Chave',
  icon: Target,

  api: {
    baseUrl: '/api/v1/hr/okrs/objectives',
    queryKey: 'okrs',
    queryKeys: {
      list: ['okrs'],
      detail: (id: string) => ['okrs', id],
    },
    endpoints: {
      list: '/v1/hr/okrs/objectives',
      get: '/v1/hr/okrs/objectives/:id',
      create: '/v1/hr/okrs/objectives',
      update: '/v1/hr/okrs/objectives/:id',
      delete: '/v1/hr/okrs/objectives/:id',
    },
  },

  routes: {
    list: '/hr/okrs',
    detail: '/hr/okrs/:id',
    create: '/hr/okrs/new',
    edit: '/hr/okrs/:id/edit',
  },

  display: {
    icon: Target,
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
    titleField: 'title',
    subtitleField: 'period',
    labels: {
      singular: 'Objetivo',
      plural: 'Objetivos',
      createButton: 'Novo Objetivo',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum objetivo encontrado',
      searchPlaceholder: 'Buscar objetivos...',
    },
    badgeFields: [
      { field: 'level', label: 'Nível' },
      { field: 'status', label: 'Status' },
    ],
    metaFields: [
      { field: 'period', label: 'Período' },
      { field: 'createdAt', label: 'Criado em', format: 'date' },
    ],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: false,
    selectable: false,
    searchableFields: ['title', 'description'],
    defaultSort: { field: 'createdAt', direction: 'desc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50],
  },

  form: {
    sections: [],
    defaultColumns: 1,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  permissions: {
    view: HR_PERMISSIONS.OKRS.ACCESS,
    create: HR_PERMISSIONS.OKRS.REGISTER,
    update: HR_PERMISSIONS.OKRS.MODIFY,
    delete: HR_PERMISSIONS.OKRS.REMOVE,
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
    selection: false,
    multiSelect: false,
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
        label: 'Novo Objetivo',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.OKRS.REGISTER,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.OKRS.ACCESS,
      },
    ],
    batch: [],
  },
});

export default okrsConfig;
