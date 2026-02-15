/**
 * OpenSea OS - Items Entity Config
 * Configuração completa da entidade de itens
 */

import { STOCK_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Item } from '@/types/stock';
import { Box, Copy, Edit, Eye, Plus, Trash2 } from 'lucide-react';

export const itemsConfig = defineEntityConfig<Item>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Item',
  namePlural: 'Itens',
  slug: 'items',
  description: 'Gerenciamento de itens físicos do estoque',
  icon: Box,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/items',
    queryKey: 'items',
    queryKeys: {
      list: ['items'],
      detail: (id: string) => ['items', id],
    },
    endpoints: {
      list: '/v1/items',
      get: '/v1/items/:id',
      create: '/v1/items',
      update: '/v1/items/:id',
      delete: '/v1/items/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/stock/items',
    detail: '/stock/items/:id',
    create: '/stock/items/new',
    edit: '/stock/items/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Box,
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
    titleField: 'uniqueCode',
    subtitleField: 'batchNumber',
    imageField: undefined,
    labels: {
      singular: 'Item',
      plural: 'Itens',
      createButton: 'Novo Item',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum item encontrado',
      searchPlaceholder: 'Buscar itens...',
    },
    badgeFields: [
      {
        field: 'status',
        label: 'Status',
        colorMap: {
          AVAILABLE: 'bg-green-500/20 text-green-700 dark:text-green-400',
          RESERVED: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
          IN_TRANSIT: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
          DAMAGED: 'bg-red-500/20 text-red-700 dark:text-red-400',
          EXPIRED: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
          DISPOSED: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
        },
        render: (value: unknown) => {
          const labels = {
            AVAILABLE: 'Disponível',
            RESERVED: 'Reservado',
            IN_TRANSIT: 'Em Trânsito',
            DAMAGED: 'Danificado',
            EXPIRED: 'Expirado',
            DISPOSED: 'Descartado',
          };
          return labels[value as keyof typeof labels] || String(value);
        },
      },
      {
        field: 'currentQuantity',
        label: 'Quantidade',
        colorMap: {},
        render: (value: unknown) => `${value} un`,
      },
    ],
    metaFields: [
      {
        field: 'entryDate',
        label: 'Data de Entrada',
        format: 'date',
      },
      {
        field: 'batchNumber',
        label: 'Lote',
        format: 'text',
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
    searchableFields: ['uniqueCode', 'batchNumber'],
    defaultSort: {
      field: 'entryDate',
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
        title: 'Informações Básicas',
        description: 'Dados principais do item',
        fields: [
          {
            name: 'variantId',
            label: 'Variante',
            type: 'text',
            required: true,
            placeholder: 'ID da variante',
            colSpan: 2,
            description: 'Variante à qual este item pertence',
          },
          {
            name: 'locationId',
            label: 'Localização',
            type: 'text',
            required: true,
            placeholder: 'ID da localização',
            colSpan: 2,
            description: 'Onde o item está armazenado',
          },
          {
            name: 'uniqueCode',
            label: 'Código Único',
            type: 'text',
            required: true,
            placeholder: 'Ex: ITEM-001',
            colSpan: 2,
            description: 'Código único de identificação',
          },
          {
            name: 'batchNumber',
            label: 'Número do Lote',
            type: 'text',
            placeholder: 'Ex: L001',
            colSpan: 2,
          },
        ],
        columns: 4,
      },
      {
        id: 'quantity',
        title: 'Quantidade',
        description: 'Controle de quantidade',
        fields: [
          {
            name: 'initialQuantity',
            label: 'Quantidade Inicial',
            type: 'number',
            required: true,
            placeholder: '0',
            colSpan: 2,
            min: 0,
            step: 0.01,
          },
          {
            name: 'currentQuantity',
            label: 'Quantidade Atual',
            type: 'number',
            required: true,
            placeholder: '0',
            colSpan: 2,
            min: 0,
            step: 0.01,
          },
        ],
        columns: 4,
      },
      {
        id: 'status',
        title: 'Status',
        description: 'Status atual do item',
        fields: [
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            colSpan: 4,
            defaultValue: 'AVAILABLE',
            options: [
              { value: 'AVAILABLE', label: 'Disponível' },
              { value: 'RESERVED', label: 'Reservado' },
              { value: 'IN_TRANSIT', label: 'Em Trânsito' },
              { value: 'DAMAGED', label: 'Danificado' },
              { value: 'EXPIRED', label: 'Expirado' },
              { value: 'DISPOSED', label: 'Descartado' },
            ],
          },
        ],
        columns: 4,
      },
      {
        id: 'dates',
        title: 'Datas',
        description: 'Datas importantes',
        fields: [
          {
            name: 'entryDate',
            label: 'Data de Entrada',
            type: 'date',
            required: true,
            colSpan: 4,
          },
          {
            name: 'manufacturingDate',
            label: 'Data de Fabricação',
            type: 'date',
            colSpan: 2,
          },
          {
            name: 'expiryDate',
            label: 'Data de Validade',
            type: 'date',
            colSpan: 2,
          },
        ],
        columns: 4,
      },
      {
        id: 'attributes',
        title: 'Atributos Personalizados',
        description: 'Atributos específicos deste item',
        fields: [
          {
            name: 'attributes',
            label: 'Atributos',
            type: 'json',
            colSpan: 4,
            description: 'Atributos customizados conforme o template',
            placeholder: '{}',
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
    view: STOCK_PERMISSIONS.ITEMS.READ,
    create: STOCK_PERMISSIONS.ITEMS.CREATE,
    update: STOCK_PERMISSIONS.ITEMS.UPDATE,
    delete: STOCK_PERMISSIONS.ITEMS.DELETE,
    export: STOCK_PERMISSIONS.ITEMS.MANAGE,
    import: STOCK_PERMISSIONS.ITEMS.MANAGE,
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
        label: 'Novo Item',
        icon: Plus,
        variant: 'default',
        permission: STOCK_PERMISSIONS.ITEMS.CREATE,
        onClick: () => {}, // Handled by page component
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.ITEMS.READ,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.ITEMS.UPDATE,
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.ITEMS.CREATE,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.ITEMS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Item',
        confirmMessage: 'Tem certeza que deseja excluir este item?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: STOCK_PERMISSIONS.ITEMS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Itens',
        confirmMessage: 'Tem certeza que deseja excluir os itens selecionados?',
      },
    ],
  },
});

export default itemsConfig;
