/**
 * OpenSea OS - Positions Entity Config
 * Configuração completa da entidade de cargos
 */

import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Position } from '@/types/hr';
import { Briefcase, Copy, Edit, Eye, Plus, Trash2 } from 'lucide-react';

export const positionsConfig = defineEntityConfig<Position>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Position',
  namePlural: 'Positions',
  slug: 'positions',
  description: 'Gerenciamento de cargos da organização',
  icon: Briefcase,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/hr/positions',
    queryKey: 'positions',
    queryKeys: {
      list: ['positions'],
      detail: (id: string) => ['positions', id],
    },
    endpoints: {
      list: '/v1/hr/positions',
      get: '/v1/hr/positions/:id',
      create: '/v1/hr/positions',
      update: '/v1/hr/positions/:id',
      delete: '/v1/hr/positions/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/hr/positions',
    detail: '/hr/positions/:id',
    create: '/hr/positions/new',
    edit: '/hr/positions/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Briefcase,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    titleField: 'name',
    subtitleField: 'description',
    imageField: undefined,
    labels: {
      singular: 'Cargo',
      plural: 'Cargos',
      createButton: 'Novo Cargo',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum cargo encontrado',
      searchPlaceholder: 'Buscar cargos...',
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
            label: 'Nome do Cargo',
            type: 'text',
            required: true,
            placeholder: 'Ex: Gerente de Vendas, Analista de TI',
            colSpan: 1,
            description: '',
          },
          {
            name: 'code',
            label: 'Código',
            type: 'text',
            required: true,
            placeholder: 'Ex: GER-VEN, ANA-TI',
            colSpan: 1,
            description: '',
          },
          {
            name: 'description',
            label: 'Descrição',
            type: 'textarea',
            required: false,
            placeholder: 'Descreva as responsabilidades e requisitos do cargo',
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
    view: HR_PERMISSIONS.POSITIONS.READ,
    create: HR_PERMISSIONS.POSITIONS.CREATE,
    update: HR_PERMISSIONS.POSITIONS.UPDATE,
    delete: HR_PERMISSIONS.POSITIONS.DELETE,
    export: HR_PERMISSIONS.POSITIONS.MANAGE,
    import: HR_PERMISSIONS.POSITIONS.MANAGE,
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
        label: 'Novo Cargo',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.POSITIONS.CREATE,
        onClick: () => {}, // Handled by page component
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.POSITIONS.READ,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: HR_PERMISSIONS.POSITIONS.UPDATE,
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: HR_PERMISSIONS.POSITIONS.CREATE,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: HR_PERMISSIONS.POSITIONS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Cargo',
        confirmMessage: 'Tem certeza que deseja excluir este cargo?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: HR_PERMISSIONS.POSITIONS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Cargos',
        confirmMessage:
          'Tem certeza que deseja excluir os cargos selecionados?',
      },
    ],
  },
});

export default positionsConfig;
