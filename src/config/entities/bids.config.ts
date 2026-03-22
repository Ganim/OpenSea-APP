/**
 * OpenSea OS - Bids Entity Config
 * Configuracao da entidade de licitacoes
 */

import { SALES_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Bid } from '@/types/sales';
import { Gavel } from 'lucide-react';

export const bidsConfig = defineEntityConfig<Bid>()({
  // ======================== IDENTIFICACAO ========================
  name: 'Licitacao',
  namePlural: 'Licitacoes',
  slug: 'bids',
  description: 'Gerenciamento de licitacoes e pregoes',
  icon: Gavel,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/bids',
    queryKey: 'bids',
    queryKeys: {
      list: ['bids'],
      detail: (id: string) => ['bids', id],
    },
    endpoints: {
      list: '/v1/bids',
      get: '/v1/bids/:id',
      create: '/v1/bids',
      update: '/v1/bids/:id',
      delete: '/v1/bids/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/sales/bids',
    detail: '/sales/bids/:id',
    create: '/sales/bids/new',
    edit: '/sales/bids/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Gavel,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    titleField: 'editalNumber',
    subtitleField: 'organName',
    imageField: undefined,
    labels: {
      singular: 'Licitacao',
      plural: 'Licitacoes',
      createButton: 'Nova Licitacao',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma licitacao encontrada',
      searchPlaceholder: 'Buscar por numero, orgao ou objeto...',
    },
    badgeFields: [
      {
        field: 'status',
        label: 'Status',
        colorMap: {
          DISCOVERED: 'bg-sky-500/20 text-sky-700 dark:text-sky-400',
          ANALYZING: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
          VIABLE: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
          NOT_VIABLE: 'bg-rose-500/20 text-rose-700 dark:text-rose-400',
          WON: 'bg-green-500/20 text-green-700 dark:text-green-400',
          LOST: 'bg-rose-500/20 text-rose-700 dark:text-rose-400',
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
    defaultView: 'grid',
    columns: {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
    },
    showViewToggle: true,
    enableDragSelection: false,
    selectable: false,
    searchableFields: ['editalNumber', 'organName', 'object'],
    defaultSort: {
      field: 'createdAt',
      direction: 'desc',
    },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // ======================== PERMISSOES ========================
  permissions: {
    view: SALES_PERMISSIONS.BIDS.ACCESS,
    create: SALES_PERMISSIONS.BIDS.REGISTER,
    update: SALES_PERMISSIONS.BIDS.MODIFY,
    delete: SALES_PERMISSIONS.BIDS.REMOVE,
  },
});
