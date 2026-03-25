/**
 * OpenSea OS - Deals Entity Config
 * Configuracao completa da entidade de negocios (deals)
 */

import { SALES_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Deal } from '@/types/sales';
import { Edit, Eye, Handshake, Plus, Trash2 } from 'lucide-react';

export const dealsConfig = defineEntityConfig<Deal>()({
  // ======================== IDENTIFICACAO ========================
  name: 'Negocio',
  namePlural: 'Negocios',
  slug: 'deals',
  description: 'Gerenciamento de negocios do pipeline de vendas',
  icon: Handshake,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/deals',
    queryKey: 'deals',
    queryKeys: {
      list: ['deals'],
      detail: (id: string) => ['deals', id],
    },
    endpoints: {
      list: '/v1/deals',
      get: '/v1/deals/:id',
      create: '/v1/deals',
      update: '/v1/deals/:id',
      delete: '/v1/deals/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/sales/deals',
    detail: '/sales/deals/:id',
    create: '/sales/deals/new',
    edit: '/sales/deals/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Handshake,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    titleField: 'title',
    subtitleField: 'value',
    imageField: undefined,
    labels: {
      singular: 'Negocio',
      plural: 'Negocios',
      createButton: 'Novo Negocio',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum negocio encontrado',
      searchPlaceholder: 'Buscar negocios por titulo ou cliente...',
    },
    badgeFields: [
      {
        field: 'status',
        label: 'Status',
        colorMap: {
          OPEN: 'bg-sky-500/20 text-sky-700 dark:text-sky-400',
          WON: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
          LOST: 'bg-rose-500/20 text-rose-700 dark:text-rose-400',
          ARCHIVED: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
        },
        render: (value: unknown) => {
          const labels = {
            OPEN: 'Aberto',
            WON: 'Ganho',
            LOST: 'Perdido',
            ARCHIVED: 'Arquivado',
          };
          return labels[value as keyof typeof labels] || String(value);
        },
      },
    ],
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
    defaultView: 'list',
    columns: {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
    },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['title'],
    defaultSort: {
      field: 'createdAt',
      direction: 'desc',
    },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // ======================== FORMULARIO ========================
  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informacoes Basicas',
        description: 'Dados de identificacao do negocio',
        fields: [
          {
            name: 'title',
            label: 'Titulo',
            type: 'text',
            required: true,
            placeholder: 'Titulo do negocio',
            colSpan: 4,
          },
          {
            name: 'value',
            label: 'Valor',
            type: 'text',
            placeholder: '0,00',
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

  // ======================== PERMISSOES ========================
  permissions: {
    view: SALES_PERMISSIONS.DEALS.ACCESS,
    create: SALES_PERMISSIONS.DEALS.REGISTER,
    update: SALES_PERMISSIONS.DEALS.MODIFY,
    delete: SALES_PERMISSIONS.DEALS.REMOVE,
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: true,
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
    multiSelect: true,
    batchOperations: true,
    favorite: false,
    archive: true,
    auditLog: true,
    versioning: false,
    realtime: false,
  },

  // ======================== ACOES ========================
  actions: {
    header: [
      {
        id: 'create',
        label: 'Novo Negocio',
        icon: Plus,
        variant: 'default',
        permission: SALES_PERMISSIONS.DEALS.REGISTER,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: SALES_PERMISSIONS.DEALS.ACCESS,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: SALES_PERMISSIONS.DEALS.MODIFY,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: SALES_PERMISSIONS.DEALS.REMOVE,
        confirm: true,
        confirmTitle: 'Excluir Negocio',
        confirmMessage: 'Tem certeza que deseja excluir este negocio?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: SALES_PERMISSIONS.DEALS.REMOVE,
        confirm: true,
        confirmTitle: 'Excluir Negocios',
        confirmMessage:
          'Tem certeza que deseja excluir os negocios selecionados?',
      },
    ],
  },
});

export default dealsConfig;
