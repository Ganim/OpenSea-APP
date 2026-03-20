import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { TimeEntry } from '@/types/hr';
import { Timer, LogIn, LogOut, Eye } from 'lucide-react';

export const timeControlConfig = defineEntityConfig<TimeEntry>()({
  name: 'TimeEntry',
  namePlural: 'TimeEntries',
  slug: 'time-control',
  description: 'Controle de ponto e registro de jornada',
  icon: Timer,

  api: {
    baseUrl: '/api/v1/hr/time-control',
    queryKey: 'time-entries',
    queryKeys: {
      list: ['time-entries'],
      detail: (id: string) => ['time-entries', id],
    },
    endpoints: {
      list: '/v1/hr/time-control/entries',
      get: '/v1/hr/time-control/entries/:id',
      create: '/v1/hr/time-control/clock-in',
      update: '/v1/hr/time-control/clock-out',
      delete: '',
    },
  },

  routes: {
    list: '/hr/time-control',
    detail: '/hr/time-control/:id',
    create: '',
    edit: '',
  },

  display: {
    icon: Timer,
    color: 'cyan',
    gradient: 'from-cyan-500 to-cyan-600',
    titleField: 'entryType',
    subtitleField: 'notes',
    imageField: undefined,
    labels: {
      singular: 'Registro de Ponto',
      plural: 'Registros de Ponto',
      createButton: 'Registrar Entrada',
      editButton: '',
      deleteButton: '',
      emptyState: 'Nenhum registro de ponto encontrado',
      searchPlaceholder: 'Buscar registros...',
    },
    badgeFields: [],
    metaFields: [
      { field: 'timestamp', label: 'Horário', format: 'date' },
      { field: 'entryType', label: 'Tipo', format: 'text' },
    ],
  },

  grid: {
    defaultView: 'list',
    columns: { sm: 1, md: 1, lg: 1, xl: 1 },
    showViewToggle: false,
    enableDragSelection: false,
    selectable: false,
    searchableFields: ['notes'],
    defaultSort: { field: 'timestamp', direction: 'desc' },
    pageSize: 50,
    pageSizeOptions: [20, 50, 100],
  },

  form: {
    sections: [],
    defaultColumns: 1,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  permissions: {
    view: HR_PERMISSIONS.EMPLOYEES.ACCESS,
    create: HR_PERMISSIONS.EMPLOYEES.ACCESS,
    update: HR_PERMISSIONS.EMPLOYEES.ACCESS,
    delete: HR_PERMISSIONS.EMPLOYEES.ADMIN,
    export: HR_PERMISSIONS.EMPLOYEES.ADMIN,
    import: HR_PERMISSIONS.EMPLOYEES.ADMIN,
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
        id: 'clock-in',
        label: 'Registrar Entrada',
        icon: LogIn,
        variant: 'default',
        permission: HR_PERMISSIONS.EMPLOYEES.ACCESS,
        onClick: () => {},
      },
      {
        id: 'clock-out',
        label: 'Registrar Saída',
        icon: LogOut,
        variant: 'outline',
        permission: HR_PERMISSIONS.EMPLOYEES.ACCESS,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.EMPLOYEES.ACCESS,
      },
    ],
    batch: [],
  },
});

export default timeControlConfig;
