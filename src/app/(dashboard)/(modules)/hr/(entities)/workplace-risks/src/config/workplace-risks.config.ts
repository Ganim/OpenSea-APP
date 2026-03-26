/**
 * OpenSea OS - Workplace Risks Entity Config
 */

import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { defineEntityConfig } from '@/core/types';
import type { WorkplaceRisk } from '@/types/hr';
import { AlertTriangle, Eye, Pencil, Plus, Trash2 } from 'lucide-react';

export const workplaceRisksConfig = defineEntityConfig<WorkplaceRisk>()({
  name: 'WorkplaceRisk',
  namePlural: 'WorkplaceRisks',
  slug: 'workplace-risks',
  description: 'Gerenciamento de riscos ocupacionais',
  icon: AlertTriangle,

  api: {
    baseUrl: '/api/v1/hr/safety-programs',
    queryKey: 'workplace-risks',
    queryKeys: {
      list: ['workplace-risks'],
      detail: (id: string) => ['workplace-risks', id],
    },
    endpoints: {
      list: '/v1/hr/safety-programs/:programId/risks',
      get: '/v1/hr/safety-programs/:programId/risks/:id',
      create: '/v1/hr/safety-programs/:programId/risks',
      update: '/v1/hr/safety-programs/:programId/risks/:id',
      delete: '/v1/hr/safety-programs/:programId/risks/:id',
    },
  },

  routes: {
    list: '/hr/workplace-risks',
    detail: '/hr/workplace-risks/:id',
    create: '/hr/workplace-risks/new',
    edit: '/hr/workplace-risks/:id/edit',
  },

  display: {
    icon: AlertTriangle,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    titleField: 'name',
    subtitleField: 'affectedArea',
    imageField: undefined,
    labels: {
      singular: 'Risco Ocupacional',
      plural: 'Riscos Ocupacionais',
      createButton: 'Novo Risco',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum risco ocupacional encontrado',
      searchPlaceholder: 'Buscar riscos por nome, fonte ou área afetada...',
    },
    badgeFields: [],
    metaFields: [
      {
        field: 'category',
        label: 'Categoria',
        format: 'text',
      },
      {
        field: 'severity',
        label: 'Severidade',
        format: 'text',
      },
    ],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name', 'source', 'affectedArea'],
    defaultSort: { field: 'createdAt', direction: 'desc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informações do Risco',
        description: '',
        fields: [
          {
            name: 'category',
            label: 'Categoria',
            type: 'select',
            required: true,
            placeholder: 'Selecionar categoria',
            colSpan: 1,
            description: '',
          },
          {
            name: 'severity',
            label: 'Severidade',
            type: 'select',
            required: true,
            placeholder: 'Selecionar severidade',
            colSpan: 1,
            description: '',
          },
        ],
        columns: 2,
      },
    ],
    defaultColumns: 2,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  permissions: {
    view: HR_PERMISSIONS.SAFETY_PROGRAMS.LIST,
    create: HR_PERMISSIONS.SAFETY_PROGRAMS.CREATE,
    update: HR_PERMISSIONS.SAFETY_PROGRAMS.UPDATE,
    delete: HR_PERMISSIONS.SAFETY_PROGRAMS.DELETE,
    export: HR_PERMISSIONS.SAFETY_PROGRAMS.MANAGE,
    import: HR_PERMISSIONS.SAFETY_PROGRAMS.MANAGE,
  },

  features: {
    create: true,
    edit: false,
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
        label: 'Novo Risco',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.SAFETY_PROGRAMS.CREATE,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.SAFETY_PROGRAMS.LIST,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Pencil,
        onClick: () => {},
        permission: HR_PERMISSIONS.SAFETY_PROGRAMS.UPDATE,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: HR_PERMISSIONS.SAFETY_PROGRAMS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Risco',
        confirmMessage: 'Tem certeza que deseja excluir este risco?',
      },
    ],
    batch: [],
  },
});

export default workplaceRisksConfig;
