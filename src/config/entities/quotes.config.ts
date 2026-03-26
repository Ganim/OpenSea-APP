/**
 * OpenSea OS - Quotes Entity Config
 * Configuração completa da entidade de orçamentos
 */

import { SALES_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Quote } from '@/types/sales';
import { Edit, Eye, FileText, Plus, Trash2 } from 'lucide-react';

export const quotesConfig = defineEntityConfig<Quote>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Orçamento',
  namePlural: 'Orçamentos',
  slug: 'quotes',
  description: 'Gerenciamento de orçamentos',
  icon: FileText,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/quotes',
    queryKey: 'quotes',
    queryKeys: {
      list: ['quotes'],
      detail: (id: string) => ['quotes', id],
    },
    endpoints: {
      list: '/v1/quotes',
      get: '/v1/quotes/:id',
      create: '/v1/quotes',
      update: '/v1/quotes/:id',
      delete: '/v1/quotes/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/sales/quotes',
    detail: '/sales/quotes/:id',
    create: '/sales/quotes/new',
    edit: '/sales/quotes/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: FileText,
    color: 'sky',
    gradient: 'from-sky-500 to-cyan-600',
    titleField: 'title',
    subtitleField: 'customerName',
    imageField: undefined,
    labels: {
      singular: 'Orçamento',
      plural: 'Orçamentos',
      createButton: 'Novo Orçamento',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum orçamento encontrado',
      searchPlaceholder: 'Buscar orçamentos por título ou cliente...',
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
        description: 'Dados do orçamento',
        fields: [
          {
            name: 'title',
            label: 'Título',
            type: 'text',
            required: true,
            placeholder: 'Título do orçamento',
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
    view: SALES_PERMISSIONS.QUOTES.ACCESS,
    create: SALES_PERMISSIONS.QUOTES.REGISTER,
    update: SALES_PERMISSIONS.QUOTES.MODIFY,
    delete: SALES_PERMISSIONS.QUOTES.REMOVE,
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
        label: 'Novo Orçamento',
        icon: Plus,
        variant: 'default',
        permission: SALES_PERMISSIONS.QUOTES.REGISTER,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: SALES_PERMISSIONS.QUOTES.ACCESS,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: SALES_PERMISSIONS.QUOTES.MODIFY,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: SALES_PERMISSIONS.QUOTES.REMOVE,
        confirm: true,
        confirmTitle: 'Excluir Orçamento',
        confirmMessage: 'Tem certeza que deseja excluir este orçamento?',
      },
    ],
    batch: [],
  },
});

export default quotesConfig;
