/**
 * OpenSea OS - Safety Programs Entity Config
 */

import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { defineEntityConfig } from '@/core/types';
import type { SafetyProgram } from '@/types/hr';
import { Eye, Plus, ShieldCheck, Trash2 } from 'lucide-react';

export const safetyProgramsConfig = defineEntityConfig<SafetyProgram>()({
  name: 'SafetyProgram',
  namePlural: 'SafetyPrograms',
  slug: 'safety-programs',
  description: 'Gerenciamento de programas de segurança do trabalho',
  icon: ShieldCheck,

  api: {
    baseUrl: '/api/v1/hr/safety-programs',
    queryKey: 'safety-programs',
    queryKeys: {
      list: ['safety-programs'],
      detail: (id: string) => ['safety-programs', id],
    },
    endpoints: {
      list: '/v1/hr/safety-programs',
      get: '/v1/hr/safety-programs/:id',
      create: '/v1/hr/safety-programs',
      update: '/v1/hr/safety-programs/:id',
      delete: '/v1/hr/safety-programs/:id',
    },
  },

  routes: {
    list: '/hr/safety-programs',
    detail: '/hr/safety-programs/:id',
    create: '/hr/safety-programs/new',
    edit: '/hr/safety-programs/:id/edit',
  },

  display: {
    icon: ShieldCheck,
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    titleField: 'name',
    subtitleField: 'responsibleName',
    imageField: undefined,
    labels: {
      singular: 'Programa de Segurança',
      plural: 'Programas de Segurança',
      createButton: 'Novo Programa',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum programa de segurança encontrado',
      searchPlaceholder: 'Buscar programas por nome ou responsável...',
    },
    badgeFields: [],
    metaFields: [
      {
        field: 'validFrom',
        label: 'Vigência Início',
        format: 'date',
      },
      {
        field: 'validUntil',
        label: 'Vigência Fim',
        format: 'date',
      },
    ],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name', 'responsibleName'],
    defaultSort: { field: 'validFrom', direction: 'desc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informações do Programa',
        description: '',
        fields: [
          {
            name: 'type',
            label: 'Tipo',
            type: 'select',
            required: true,
            placeholder: 'Selecionar tipo',
            colSpan: 1,
            description: '',
          },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            placeholder: 'Selecionar status',
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
        label: 'Novo Programa',
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
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: HR_PERMISSIONS.SAFETY_PROGRAMS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Programa',
        confirmMessage: 'Tem certeza que deseja excluir este programa?',
      },
    ],
    batch: [],
  },
});

export default safetyProgramsConfig;
