/**
 * OpenSea OS - Time Bank Entity Config
 */

import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { TimeBank } from '@/types/hr';
import { Hourglass } from 'lucide-react';

export const timeBankConfig = defineEntityConfig<TimeBank>()({
  name: 'TimeBank',
  namePlural: 'TimeBanks',
  slug: 'time-bank',
  description: 'Gerenciamento de banco de horas dos funcionários',
  icon: Hourglass,

  api: {
    baseUrl: '/api/v1/hr/time-bank',
    queryKey: 'time-banks',
    queryKeys: {
      list: ['time-banks'],
      detail: (id: string) => ['time-banks', id],
    },
    endpoints: {
      list: '/v1/hr/time-bank',
      get: '/v1/hr/time-bank/:employeeId',
      create: '/v1/hr/time-bank/credit',
      update: '/v1/hr/time-bank/adjust',
      delete: '',
    },
  },

  routes: {
    list: '/hr/time-bank',
    detail: '/hr/time-bank/:id',
    create: '',
    edit: '',
  },

  display: {
    icon: Hourglass,
    color: 'teal',
    gradient: 'from-teal-500 to-teal-600',
    titleField: 'employeeId',
    subtitleField: 'year',
    imageField: undefined,
    labels: {
      singular: 'Banco de Horas',
      plural: 'Bancos de Horas',
      createButton: 'Creditar',
      editButton: 'Ajustar',
      deleteButton: '',
      emptyState: 'Nenhum registro de banco de horas encontrado',
      searchPlaceholder: 'Buscar por funcionário...',
    },
    badgeFields: [],
    metaFields: [
      {
        field: 'balance',
        label: 'Saldo (horas)',
        format: 'number',
      },
      {
        field: 'year',
        label: 'Ano',
        format: 'number',
      },
    ],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: false,
    enableDragSelection: false,
    selectable: false,
    searchableFields: ['employeeId'],
    defaultSort: { field: 'year', direction: 'desc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50],
  },

  form: {
    sections: [],
    defaultColumns: 2,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  permissions: {
    view: HR_PERMISSIONS.EMPLOYEES.LIST,
    create: HR_PERMISSIONS.EMPLOYEES.LIST,
    update: HR_PERMISSIONS.EMPLOYEES.LIST,
    delete: HR_PERMISSIONS.EMPLOYEES.LIST,
    export: HR_PERMISSIONS.EMPLOYEES.LIST,
    import: HR_PERMISSIONS.EMPLOYEES.LIST,
  },

  features: {
    create: false,
    edit: false,
    delete: false,
    duplicate: false,
    softDelete: false,
    export: false,
    import: false,
    search: true,
    filters: true,
    sort: true,
    pagination: false,
    selection: false,
    multiSelect: false,
    batchOperations: false,
    favorite: false,
    archive: false,
    auditLog: false,
    versioning: false,
    realtime: false,
  },

  actions: {
    header: [],
    item: [],
    batch: [],
  },
});

export default timeBankConfig;
