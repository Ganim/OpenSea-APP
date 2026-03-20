/**
 * OpenSea OS - Work Schedules Entity Config
 * Configuração completa da entidade de escalas de trabalho
 */

import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { WorkSchedule } from '@/types/hr';
import { Clock, Copy, Edit, Eye, Plus, Trash2 } from 'lucide-react';

export const workSchedulesConfig = defineEntityConfig<WorkSchedule>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'WorkSchedule',
  namePlural: 'WorkSchedules',
  slug: 'work-schedules',
  description: 'Gerenciamento de escalas e jornadas de trabalho',
  icon: Clock,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/hr/work-schedules',
    queryKey: 'work-schedules',
    queryKeys: {
      list: ['work-schedules'],
      detail: (id: string) => ['work-schedules', id],
    },
    endpoints: {
      list: '/v1/hr/work-schedules',
      get: '/v1/hr/work-schedules/:id',
      create: '/v1/hr/work-schedules',
      update: '/v1/hr/work-schedules/:id',
      delete: '/v1/hr/work-schedules/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/hr/work-schedules',
    detail: '/hr/work-schedules/:id',
    create: '/hr/work-schedules/new',
    edit: '/hr/work-schedules/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Clock,
    color: 'indigo',
    gradient: 'from-indigo-500 to-violet-600',
    titleField: 'name',
    subtitleField: 'description',
    imageField: undefined,
    labels: {
      singular: 'Escala de Trabalho',
      plural: 'Escalas de Trabalho',
      createButton: 'Nova Escala',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma escala de trabalho encontrada',
      searchPlaceholder: 'Buscar escalas...',
    },
    badgeFields: [],
    metaFields: [
      {
        field: 'weeklyHours',
        label: 'Horas Semanais',
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
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name', 'description'],
    defaultSort: {
      field: 'name',
      direction: 'asc',
    },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // ======================== FORMULÁRIO ========================
  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informações Básicas',
        description: '',
        fields: [
          {
            name: 'name',
            label: 'Nome da Escala',
            type: 'text',
            required: true,
            placeholder: 'Ex: Comercial, Administrativo, Turno Noturno',
            colSpan: 1,
            description: '',
          },
          {
            name: 'breakDuration',
            label: 'Intervalo (minutos)',
            type: 'number',
            required: false,
            placeholder: 'Ex: 60',
            colSpan: 1,
            description: '',
          },
          {
            name: 'description',
            label: 'Descrição',
            type: 'textarea',
            required: false,
            placeholder: 'Descreva a escala de trabalho',
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

  // ======================== PERMISSÕES ========================
  permissions: {
    view: HR_PERMISSIONS.WORK_SCHEDULES.ACCESS,
    create: HR_PERMISSIONS.WORK_SCHEDULES.REGISTER,
    update: HR_PERMISSIONS.WORK_SCHEDULES.MODIFY,
    delete: HR_PERMISSIONS.WORK_SCHEDULES.REMOVE,
    export: HR_PERMISSIONS.WORK_SCHEDULES.REMOVE,
    import: HR_PERMISSIONS.WORK_SCHEDULES.REMOVE,
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: true,
    delete: true,
    duplicate: true,
    softDelete: false,
    export: false,
    import: false,
    search: true,
    filters: true,
    sort: true,
    pagination: true,
    selection: true,
    multiSelect: true,
    batchOperations: true,
    favorite: false,
    archive: false,
    auditLog: true,
    versioning: false,
    realtime: false,
  },

  // ======================== AÇÕES ========================
  actions: {
    header: [
      {
        id: 'create',
        label: 'Nova Escala',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.WORK_SCHEDULES.REGISTER,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.WORK_SCHEDULES.ACCESS,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: HR_PERMISSIONS.WORK_SCHEDULES.MODIFY,
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: HR_PERMISSIONS.WORK_SCHEDULES.REGISTER,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: HR_PERMISSIONS.WORK_SCHEDULES.REMOVE,
        confirm: true,
        confirmTitle: 'Excluir Escala',
        confirmMessage: 'Tem certeza que deseja excluir esta escala?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionadas',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: HR_PERMISSIONS.WORK_SCHEDULES.REMOVE,
        confirm: true,
        confirmTitle: 'Excluir Escalas',
        confirmMessage:
          'Tem certeza que deseja excluir as escalas selecionadas?',
      },
    ],
  },
});

export default workSchedulesConfig;
