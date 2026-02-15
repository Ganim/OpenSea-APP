/**
 * OpenSea OS - Departments Entity Config
 * Configuração completa da entidade de departamentos
 */

import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Department } from '@/types/hr';
import { Building2, Copy, Edit, Eye, Plus, Trash2 } from 'lucide-react';

export const departmentsConfig = defineEntityConfig<Department>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Department',
  namePlural: 'Departments',
  slug: 'departments',
  description: 'Gerenciamento de departamentos da organização',
  icon: Building2,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/hr/departments',
    queryKey: 'departments',
    queryKeys: {
      list: ['departments'],
      detail: (id: string) => ['departments', id],
    },
    endpoints: {
      list: '/v1/hr/departments',
      get: '/v1/hr/departments/:id',
      create: '/v1/hr/departments',
      update: '/v1/hr/departments/:id',
      delete: '/v1/hr/departments/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/hr/departments',
    detail: '/hr/departments/:id',
    create: '/hr/departments/new',
    edit: '/hr/departments/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Building2,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    titleField: 'name',
    subtitleField: 'description',
    imageField: undefined,
    labels: {
      singular: 'Departamento',
      plural: 'Departamentos',
      createButton: 'Novo Departamento',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum departamento encontrado',
      searchPlaceholder: 'Buscar departamentos...',
    },
    badgeFields: [],
    metaFields: [
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
    searchableFields: ['name', 'code', 'description'],
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
            label: 'Nome do Departamento',
            type: 'text',
            required: true,
            placeholder: 'Ex: Recursos Humanos, TI, Financeiro',
            colSpan: 1,
            description: '',
          },
          {
            name: 'code',
            label: 'Código',
            type: 'text',
            required: true,
            placeholder: 'Ex: RH, TI, FIN',
            colSpan: 1,
            description: '',
          },
          {
            name: 'description',
            label: 'Descrição',
            type: 'textarea',
            required: false,
            placeholder:
              'Descreva as responsabilidades e funções do departamento',
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
    view: HR_PERMISSIONS.DEPARTMENTS.READ,
    create: HR_PERMISSIONS.DEPARTMENTS.CREATE,
    update: HR_PERMISSIONS.DEPARTMENTS.UPDATE,
    delete: HR_PERMISSIONS.DEPARTMENTS.DELETE,
    export: HR_PERMISSIONS.DEPARTMENTS.MANAGE,
    import: HR_PERMISSIONS.DEPARTMENTS.MANAGE,
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: true,
    delete: true,
    duplicate: true,
    softDelete: true,
    export: true,
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
        label: 'Novo Departamento',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.DEPARTMENTS.CREATE,
        onClick: () => {}, // Handled by page component
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.DEPARTMENTS.READ,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: HR_PERMISSIONS.DEPARTMENTS.UPDATE,
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: HR_PERMISSIONS.DEPARTMENTS.CREATE,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: HR_PERMISSIONS.DEPARTMENTS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Departamento',
        confirmMessage: 'Tem certeza que deseja excluir este departamento?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: HR_PERMISSIONS.DEPARTMENTS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Departamentos',
        confirmMessage:
          'Tem certeza que deseja excluir os departamentos selecionados?',
      },
    ],
  },
});

export default departmentsConfig;
