/**
 * OpenSea OS - Deductions Entity Config
 * Configuração completa da entidade de deduções
 */

import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { defineEntityConfig } from '@/core/types';
import type { Deduction } from '@/types/hr';
import { Eye, MinusCircle, Plus, Trash2 } from 'lucide-react';

export const deductionsConfig = defineEntityConfig<Deduction>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Deduction',
  namePlural: 'Deductions',
  slug: 'deductions',
  description: 'Gerenciamento de deduções de funcionários',
  icon: MinusCircle,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/hr/deductions',
    queryKey: 'deductions',
    queryKeys: {
      list: ['deductions'],
      detail: (id: string) => ['deductions', id],
    },
    endpoints: {
      list: '/v1/hr/deductions',
      get: '/v1/hr/deductions/:id',
      create: '/v1/hr/deductions',
      update: '/v1/hr/deductions/:id',
      delete: '/v1/hr/deductions/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/hr/deductions',
    detail: '/hr/deductions/:id',
    create: '/hr/deductions/new',
    edit: '/hr/deductions/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: MinusCircle,
    color: 'rose',
    gradient: 'from-rose-500 to-rose-600',
    titleField: 'name',
    subtitleField: 'reason',
    imageField: undefined,
    labels: {
      singular: 'Dedução',
      plural: 'Deduções',
      createButton: 'Nova Dedução',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma dedução encontrada',
      searchPlaceholder: 'Buscar deduções por nome...',
    },
    badgeFields: [],
    metaFields: [
      {
        field: 'amount',
        label: 'Valor',
        format: 'currency',
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
    searchableFields: ['name', 'reason'],
    defaultSort: {
      field: 'createdAt',
      direction: 'desc',
    },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // ======================== FORMULÁRIO ========================
  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informações da Dedução',
        description: '',
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Ex: Adiantamento salarial',
            colSpan: 1,
            description: '',
          },
          {
            name: 'amount',
            label: 'Valor (R$)',
            type: 'number',
            required: true,
            placeholder: '0,00',
            colSpan: 1,
            description: '',
          },
          {
            name: 'reason',
            label: 'Motivo',
            type: 'textarea',
            required: true,
            placeholder: 'Descreva o motivo da dedução (mínimo 10 caracteres)',
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
    view: HR_PERMISSIONS.DEDUCTIONS.LIST,
    create: HR_PERMISSIONS.DEDUCTIONS.CREATE,
    update: HR_PERMISSIONS.DEDUCTIONS.UPDATE,
    delete: HR_PERMISSIONS.DEDUCTIONS.DELETE,
    export: HR_PERMISSIONS.DEDUCTIONS.MANAGE,
    import: HR_PERMISSIONS.DEDUCTIONS.MANAGE,
  },

  // ======================== FEATURES ========================
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

  // ======================== AÇÕES ========================
  actions: {
    header: [
      {
        id: 'create',
        label: 'Nova Dedução',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.DEDUCTIONS.CREATE,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.DEDUCTIONS.LIST,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: HR_PERMISSIONS.DEDUCTIONS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Dedução',
        confirmMessage: 'Tem certeza que deseja excluir esta dedução?',
      },
    ],
    batch: [],
  },
});

export default deductionsConfig;
