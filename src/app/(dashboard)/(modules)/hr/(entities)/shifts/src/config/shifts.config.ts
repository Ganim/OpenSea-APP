import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Shift } from '@/types/hr';
import { Clock, Edit, Eye, Plus, Trash2 } from 'lucide-react';

export const shiftsConfig = defineEntityConfig<Shift>()({
  // ======================== IDENTIFICACAO ========================
  name: 'Shift',
  namePlural: 'Shifts',
  slug: 'shifts',
  description: 'Gerenciamento de turnos de trabalho',
  icon: Clock,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/hr/shifts',
    queryKey: 'shifts',
    queryKeys: {
      list: ['shifts'],
      detail: (id: string) => ['shifts', id],
    },
    endpoints: {
      list: '/v1/hr/shifts',
      get: '/v1/hr/shifts/:id',
      create: '/v1/hr/shifts',
      update: '/v1/hr/shifts/:id',
      delete: '/v1/hr/shifts/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/hr/shifts',
    detail: '/hr/shifts/:id',
    create: '/hr/shifts/new',
    edit: '/hr/shifts/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Clock,
    color: 'cyan',
    gradient: 'from-sky-500 to-indigo-600',
    titleField: 'name',
    subtitleField: 'type',
    imageField: undefined,
    labels: {
      singular: 'Turno',
      plural: 'Turnos',
      createButton: 'Novo Turno',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum turno encontrado',
      searchPlaceholder: 'Buscar turnos...',
    },
    badgeFields: [],
    metaFields: [
      {
        field: 'durationHours',
        label: 'Duração',
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
    searchableFields: ['name', 'code', 'type'],
    defaultSort: {
      field: 'name',
      direction: 'asc',
    },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // ======================== PERMISSOES ========================
  permissions: {
    view: HR_PERMISSIONS.SHIFTS.ACCESS,
    create: HR_PERMISSIONS.SHIFTS.REGISTER,
    update: HR_PERMISSIONS.SHIFTS.MODIFY,
    delete: HR_PERMISSIONS.SHIFTS.REMOVE,
    export: HR_PERMISSIONS.SHIFTS.REMOVE,
    import: HR_PERMISSIONS.SHIFTS.REMOVE,
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: true,
    delete: true,
    duplicate: false,
    softDelete: true,
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

  // ======================== ACOES ========================
  actions: {
    header: [
      {
        id: 'create',
        label: 'Novo Turno',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.SHIFTS.REGISTER,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.SHIFTS.ACCESS,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: HR_PERMISSIONS.SHIFTS.MODIFY,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: HR_PERMISSIONS.SHIFTS.REMOVE,
        confirm: true,
        confirmTitle: 'Excluir Turno',
        confirmMessage: 'Tem certeza que deseja excluir este turno?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: HR_PERMISSIONS.SHIFTS.REMOVE,
        confirm: true,
        confirmTitle: 'Excluir Turnos',
        confirmMessage:
          'Tem certeza que deseja excluir os turnos selecionados?',
      },
    ],
  },
});

export const SHIFT_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Fixo',
  ROTATING: 'Rotativo',
  FLEXIBLE: 'Flexível',
  ON_CALL: 'Sobreaviso',
};

export const SHIFT_TYPE_COLORS: Record<string, string> = {
  FIXED: 'bg-sky-100 text-sky-700 dark:bg-sky-500/8 dark:text-sky-300',
  ROTATING:
    'bg-violet-100 text-violet-700 dark:bg-violet-500/8 dark:text-violet-300',
  FLEXIBLE:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300',
  ON_CALL:
    'bg-amber-100 text-amber-700 dark:bg-amber-500/8 dark:text-amber-300',
};

export default shiftsConfig;
