/**
 * OpenSea OS - Proposals Entity Config
 * Configuração completa da entidade de propostas
 */

import { SALES_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Proposal } from '@/types/sales';
import { Edit, Eye, FileCheck, Plus, Trash2 } from 'lucide-react';

export const proposalsConfig = defineEntityConfig<Proposal>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Proposta',
  namePlural: 'Propostas',
  slug: 'proposals',
  description: 'Gerenciamento de propostas comerciais',
  icon: FileCheck,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/proposals',
    queryKey: 'proposals',
    queryKeys: {
      list: ['proposals'],
      detail: (id: string) => ['proposals', id],
    },
    endpoints: {
      list: '/v1/proposals',
      get: '/v1/proposals/:id',
      create: '/v1/proposals',
      update: '/v1/proposals/:id',
      delete: '/v1/proposals/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/sales/proposals',
    detail: '/sales/proposals/:id',
    create: '/sales/proposals/new',
    edit: '/sales/proposals/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: FileCheck,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    titleField: 'title',
    subtitleField: 'customerName',
    imageField: undefined,
    labels: {
      singular: 'Proposta',
      plural: 'Propostas',
      createButton: 'Nova Proposta',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma proposta encontrada',
      searchPlaceholder: 'Buscar propostas por título ou cliente...',
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
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['title', 'customerName'],
    defaultSort: { field: 'createdAt', direction: 'desc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // ======================== FORMULÁRIO ========================
  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informações Básicas',
        description: 'Dados da proposta',
        fields: [
          {
            name: 'title',
            label: 'Título',
            type: 'text',
            required: true,
            placeholder: 'Título da proposta',
            colSpan: 4,
          },
          {
            name: 'customerId',
            label: 'Cliente',
            type: 'text',
            required: true,
            colSpan: 2,
          },
          {
            name: 'validUntil',
            label: 'Válido até',
            type: 'date',
            colSpan: 2,
          },
        ],
        columns: 4,
      },
    ],
    defaultColumns: 4,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  // ======================== PERMISSÕES ========================
  permissions: {
    view: SALES_PERMISSIONS.PROPOSALS.ACCESS,
    create: SALES_PERMISSIONS.PROPOSALS.REGISTER,
    update: SALES_PERMISSIONS.PROPOSALS.REGISTER,
    delete: SALES_PERMISSIONS.PROPOSALS.ADMIN,
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
        label: 'Nova Proposta',
        icon: Plus,
        variant: 'default',
        permission: SALES_PERMISSIONS.PROPOSALS.REGISTER,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: SALES_PERMISSIONS.PROPOSALS.ACCESS,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: SALES_PERMISSIONS.PROPOSALS.REGISTER,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: SALES_PERMISSIONS.PROPOSALS.ADMIN,
        confirm: true,
        confirmTitle: 'Excluir Proposta',
        confirmMessage: 'Tem certeza que deseja excluir esta proposta?',
      },
    ],
    batch: [],
  },
});

export default proposalsConfig;
