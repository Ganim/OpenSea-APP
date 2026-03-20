/**
 * OpenSea OS - Absences Config (HR)
 *
 * Configuração do módulo de ausências.
 */

import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Absence } from '@/types/hr';
import { Check, Eye, Plus, UserX, XCircle } from 'lucide-react';

export const absencesConfig = defineEntityConfig<Absence>()({
  name: 'Absence',
  namePlural: 'Absences',
  slug: 'absences',
  description: 'Gerenciamento de ausências, atestados e licenças',
  icon: UserX,

  api: {
    baseUrl: '/api/v1/hr/absences',
    queryKey: 'absences',
    queryKeys: {
      list: ['absences'],
      detail: (id: string) => ['absences', id],
    },
    endpoints: {
      list: '/v1/hr/absences',
      get: '/v1/hr/absences/:id',
      create: '/v1/hr/absences/sick-leave',
      update: '/v1/hr/absences/:id',
      delete: '/v1/hr/absences/:id',
    },
  },

  routes: {
    list: '/hr/absences',
    detail: '/hr/absences/:id',
    create: '/hr/absences/new',
    edit: '/hr/absences/:id/edit',
  },

  display: {
    icon: UserX,
    color: 'rose',
    gradient: 'from-rose-500 to-rose-600',
    titleField: 'type',
    subtitleField: 'status',
    labels: {
      singular: 'Ausência',
      plural: 'Ausências',
      createButton: 'Registrar Atestado',
      editButton: 'Editar',
      deleteButton: 'Cancelar',
      emptyState: 'Nenhuma ausência encontrada',
      searchPlaceholder: 'Buscar ausências...',
    },
    badgeFields: [
      { field: 'type', label: 'Tipo' },
      { field: 'status', label: 'Status' },
    ],
    metaFields: [
      { field: 'startDate', label: 'Início', format: 'date' },
      { field: 'endDate', label: 'Fim', format: 'date' },
      { field: 'createdAt', label: 'Criada em', format: 'date' },
    ],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: false,
    selectable: false,
    searchableFields: ['employeeId', 'type', 'status'],
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
    view: HR_PERMISSIONS.ABSENCES.ACCESS,
    create: HR_PERMISSIONS.ABSENCES.REGISTER,
    update: HR_PERMISSIONS.ABSENCES.MODIFY,
    delete: HR_PERMISSIONS.ABSENCES.REMOVE,
    export: HR_PERMISSIONS.ABSENCES.ADMIN,
    import: HR_PERMISSIONS.ABSENCES.ADMIN,
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
        label: 'Registrar Atestado',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.ABSENCES.REGISTER,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.ABSENCES.ACCESS,
      },
      {
        id: 'approve',
        label: 'Aprovar',
        icon: Check,
        onClick: () => {},
        permission: HR_PERMISSIONS.ABSENCES.ADMIN,
      },
      {
        id: 'reject',
        label: 'Rejeitar',
        icon: XCircle,
        onClick: () => {},
        permission: HR_PERMISSIONS.ABSENCES.ADMIN,
      },
    ],
    batch: [],
  },
});

export default absencesConfig;
