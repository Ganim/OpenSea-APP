/**
 * OpenSea OS - Vacations Config (HR)
 *
 * Configuração do módulo de férias.
 */

import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { VacationPeriod } from '@/types/hr';
import { CalendarDays, DollarSign, Eye, Palmtree, Plus } from 'lucide-react';

export const vacationsConfig = defineEntityConfig<VacationPeriod>()({
  name: 'Vacation',
  namePlural: 'Vacations',
  slug: 'vacations',
  description: 'Gerenciamento de períodos aquisitivos e agendamento de férias',
  icon: Palmtree,

  api: {
    baseUrl: '/api/v1/hr/vacation-periods',
    queryKey: 'vacations',
    queryKeys: {
      list: ['vacations'],
      detail: (id: string) => ['vacations', id],
    },
    endpoints: {
      list: '/v1/hr/vacation-periods',
      get: '/v1/hr/vacation-periods/:id',
      create: '/v1/hr/vacation-periods',
      update: '/v1/hr/vacation-periods/:id',
      delete: '/v1/hr/vacation-periods/:id',
    },
  },

  routes: {
    list: '/hr/vacations',
    detail: '/hr/vacations/:id',
    create: '/hr/vacations/new',
    edit: '/hr/vacations/:id/edit',
  },

  display: {
    icon: Palmtree,
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    titleField: 'status',
    subtitleField: 'employeeId',
    labels: {
      singular: 'Férias',
      plural: 'Férias',
      createButton: 'Novo Período',
      editButton: 'Editar',
      deleteButton: 'Remover',
      emptyState: 'Nenhum período de férias encontrado',
      searchPlaceholder: 'Buscar férias...',
    },
    badgeFields: [{ field: 'status', label: 'Status' }],
    metaFields: [
      { field: 'acquisitionStart', label: 'Início Aquisitivo', format: 'date' },
      { field: 'acquisitionEnd', label: 'Fim Aquisitivo', format: 'date' },
      { field: 'createdAt', label: 'Criado em', format: 'date' },
    ],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: false,
    selectable: false,
    searchableFields: ['employeeId', 'status'],
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
    view: HR_PERMISSIONS.VACATIONS.READ,
    create: HR_PERMISSIONS.VACATIONS.CREATE,
    update: HR_PERMISSIONS.VACATIONS.UPDATE,
    delete: HR_PERMISSIONS.VACATIONS.DELETE,
    export: HR_PERMISSIONS.VACATIONS.MANAGE,
    import: HR_PERMISSIONS.VACATIONS.MANAGE,
  },

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

  actions: {
    header: [
      {
        id: 'create',
        label: 'Novo Período',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.VACATIONS.CREATE,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.VACATIONS.READ,
      },
      {
        id: 'schedule',
        label: 'Agendar',
        icon: CalendarDays,
        onClick: () => {},
        permission: HR_PERMISSIONS.VACATIONS.UPDATE,
      },
      {
        id: 'sell',
        label: 'Vender Dias',
        icon: DollarSign,
        onClick: () => {},
        permission: HR_PERMISSIONS.VACATIONS.UPDATE,
      },
    ],
    batch: [],
  },
});

export default vacationsConfig;
