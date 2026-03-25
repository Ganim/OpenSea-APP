/**
 * OpenSea OS - Item Reservations Entity Config
 * Configuracao completa da entidade de reservas de itens
 */

import { SALES_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { ItemReservation } from '@/types/sales';
import { Eye, PackageCheck, Trash2, XCircle } from 'lucide-react';

export const itemReservationsConfig = defineEntityConfig<ItemReservation>()({
  // ======================== IDENTIFICACAO ========================
  name: 'Reserva de Item',
  namePlural: 'Reservas de Itens',
  slug: 'item-reservations',
  description: 'Gerenciamento de reservas de itens para pedidos',
  icon: PackageCheck,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/item-reservations',
    queryKey: 'item-reservations',
    queryKeys: {
      list: ['item-reservations'],
      detail: (id: string) => ['item-reservations', id],
    },
    endpoints: {
      list: '/v1/item-reservations',
      get: '/v1/item-reservations/:id',
      create: '/v1/item-reservations',
      update: '/v1/item-reservations/:id',
      delete: '/v1/item-reservations/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/sales/item-reservations',
    detail: '/sales/item-reservations/:id',
    create: '/sales/item-reservations/new',
    edit: '/sales/item-reservations/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: PackageCheck,
    color: 'teal',
    gradient: 'from-teal-500 to-emerald-600',
    titleField: 'id',
    subtitleField: 'status',
    imageField: undefined,
    labels: {
      singular: 'Reserva de Item',
      plural: 'Reservas de Itens',
      createButton: 'Nova Reserva',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma reserva de item encontrada',
      searchPlaceholder: 'Buscar reservas por item, pedido ou status...',
    },
    badgeFields: [
      {
        field: 'status',
        label: 'Status',
        colorMap: {
          PENDING:
            'bg-amber-500/20 text-amber-700 dark:text-amber-400',
          CONFIRMED:
            'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
          CANCELLED:
            'bg-rose-500/20 text-rose-700 dark:text-rose-400',
        },
        render: (value: unknown) => {
          const labels = {
            PENDING: 'Pendente',
            CONFIRMED: 'Confirmada',
            CANCELLED: 'Cancelada',
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
    searchableFields: ['id'],
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
        description: 'Dados da reserva',
        fields: [
          {
            name: 'itemId',
            label: 'Item',
            type: 'text',
            required: true,
            placeholder: 'ID do item',
            colSpan: 2,
          },
          {
            name: 'quantity',
            label: 'Quantidade',
            type: 'number',
            required: true,
            placeholder: '0',
            colSpan: 1,
          },
          {
            name: 'expiresAt',
            label: 'Expiracao',
            type: 'date',
            required: true,
            colSpan: 1,
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
    view: SALES_PERMISSIONS.ORDERS.ACCESS,
    create: SALES_PERMISSIONS.ORDERS.REGISTER,
    update: SALES_PERMISSIONS.ORDERS.MODIFY,
    delete: SALES_PERMISSIONS.ORDERS.REMOVE,
    export: SALES_PERMISSIONS.ORDERS.EXPORT,
    import: undefined,
  },

  // ======================== FEATURES ========================
  features: {
    create: false,
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
    multiSelect: true,
    batchOperations: false,
    favorite: false,
    archive: false,
    auditLog: true,
    versioning: false,
    realtime: false,
  },

  // ======================== ACOES ========================
  actions: {
    header: [],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: SALES_PERMISSIONS.ORDERS.ACCESS,
      },
      {
        id: 'cancel',
        label: 'Cancelar Reserva',
        icon: XCircle,
        onClick: () => {},
        permission: SALES_PERMISSIONS.ORDERS.CANCEL,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: SALES_PERMISSIONS.ORDERS.REMOVE,
        confirm: true,
        confirmTitle: 'Excluir Reserva',
        confirmMessage: 'Tem certeza que deseja excluir esta reserva?',
      },
    ],
    batch: [],
  },
});

export default itemReservationsConfig;
