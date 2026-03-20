/**
 * OpenSea OS - Overtime Entity Config
 * Configuração completa da entidade de horas extras
 */

import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { defineEntityConfig } from '@/core/types';
import type { Overtime } from '@/types/hr';
import { Coffee, Eye, Plus } from 'lucide-react';

export const overtimeConfig = defineEntityConfig<Overtime>()({
  // ======================== IDENTIFICACAO ========================
  name: 'Overtime',
  namePlural: 'Overtimes',
  slug: 'overtime',
  description: 'Registros e aprovação de horas extras',
  icon: Coffee,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/hr/overtime',
    queryKey: 'overtime',
    queryKeys: {
      list: ['overtime'],
      detail: (id: string) => ['overtime', id],
    },
    endpoints: {
      list: '/v1/hr/overtime',
      get: '/v1/hr/overtime/:id',
      create: '/v1/hr/overtime',
      update: '/v1/hr/overtime/:id',
      delete: '/v1/hr/overtime/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/hr/overtime',
    detail: '/hr/overtime/:id',
    create: '/hr/overtime/new',
    edit: '/hr/overtime/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Coffee,
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    titleField: 'reason',
    subtitleField: 'employeeId',
    imageField: undefined,
    labels: {
      singular: 'Hora Extra',
      plural: 'Horas Extras',
      createButton: 'Registrar Hora Extra',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma hora extra encontrada',
      searchPlaceholder: 'Buscar horas extras...',
    },
    badgeFields: [],
    metaFields: [
      {
        field: 'hours',
        label: 'Horas',
        format: 'number',
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
    showViewToggle: false,
    enableDragSelection: false,
    selectable: false,
    searchableFields: ['reason'],
    defaultSort: {
      field: 'createdAt',
      direction: 'desc',
    },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // ======================== FORMULARIO ========================
  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informações da Hora Extra',
        description: '',
        fields: [
          {
            name: 'employeeId',
            label: 'Funcionário',
            type: 'text',
            required: true,
            placeholder: 'ID do funcionário',
            colSpan: 1,
            description: '',
          },
          {
            name: 'date',
            label: 'Data',
            type: 'date',
            required: true,
            placeholder: '',
            colSpan: 1,
            description: '',
          },
          {
            name: 'hours',
            label: 'Horas',
            type: 'number',
            required: true,
            placeholder: '0',
            colSpan: 1,
            description: '',
          },
          {
            name: 'reason',
            label: 'Motivo',
            type: 'textarea',
            required: true,
            placeholder:
              'Descreva o motivo da hora extra (mínimo 10 caracteres)',
            colSpan: 2,
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

  // ======================== PERMISSOES ========================
  permissions: {
    view: HR_PERMISSIONS.OVERTIME.LIST,
    create: HR_PERMISSIONS.OVERTIME.CREATE,
    update: HR_PERMISSIONS.OVERTIME.UPDATE,
    delete: HR_PERMISSIONS.OVERTIME.DELETE,
    export: HR_PERMISSIONS.OVERTIME.APPROVE,
    import: HR_PERMISSIONS.OVERTIME.APPROVE,
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: false,
    delete: false,
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

  // ======================== ACOES ========================
  actions: {
    header: [
      {
        id: 'create',
        label: 'Registrar Hora Extra',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.OVERTIME.CREATE,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.OVERTIME.LIST,
      },
    ],
    batch: [],
  },
});

export default overtimeConfig;
