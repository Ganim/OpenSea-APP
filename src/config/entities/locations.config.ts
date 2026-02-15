/**
 * OpenSea OS - Locations Entity Config
 * Configuração completa da entidade de localizações
 */

import { STOCK_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { ApiLocation } from '@/types/stock';
import { Copy, Edit, Eye, MapPin, Plus, Trash2 } from 'lucide-react';

export const locationsConfig = defineEntityConfig<ApiLocation>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Localização',
  namePlural: 'Localizações',
  slug: 'locations',
  description: 'Gerenciamento de localizações do estoque',
  icon: MapPin,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/locations',
    queryKey: 'locations',
    queryKeys: {
      list: ['locations'],
      detail: (id: string) => ['locations', id],
    },
    endpoints: {
      list: '/v1/locations',
      get: '/v1/locations/:id',
      create: '/v1/locations',
      update: '/v1/locations/:id',
      delete: '/v1/locations/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/stock/locations',
    detail: '/stock/locations/:id',
    create: '/stock/locations/new',
    edit: '/stock/locations/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: MapPin,
    color: 'green',
    gradient: 'from-green-500 to-teal-600',
    titleField: 'code',
    subtitleField: 'titulo',
    imageField: undefined,
    labels: {
      singular: 'Localização',
      plural: 'Localizações',
      createButton: 'Nova Localização',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma localização encontrada',
      searchPlaceholder: 'Buscar localizações...',
    },
    badgeFields: [
      {
        field: 'isActive',
        label: 'Status',
        colorMap: {
          true: 'bg-green-500/20 text-green-700 dark:text-green-400',
          false: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
        },
        render: (value: unknown) => (value ? 'Ativa' : 'Inativa'),
      },
      {
        field: 'type',
        label: 'Tipo',
        colorMap: {
          WAREHOUSE: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
          ZONE: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
          AISLE: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400',
          SHELF: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400',
          BIN: 'bg-teal-500/20 text-teal-700 dark:text-teal-400',
          OTHER: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
        },
        render: (value: unknown) => {
          const typeLabels: Record<string, string> = {
            WAREHOUSE: 'Armazém',
            ZONE: 'Zona',
            AISLE: 'Corredor',
            SHELF: 'Prateleira',
            BIN: 'Gaveta',
            OTHER: 'Outro',
          };
          return typeLabels[value as string] || String(value);
        },
      },
    ],
    metaFields: [
      {
        field: 'capacity',
        label: 'Capacidade',
        format: 'number',
      },
      {
        field: 'currentOccupancy',
        label: 'Ocupação',
        format: 'number',
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
    searchableFields: ['code', 'titulo', 'type'],
    defaultSort: {
      field: 'code',
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
        description: 'Dados principais da localização',
        fields: [
          {
            name: 'code',
            label: 'Código',
            type: 'text',
            required: true,
            placeholder: 'Ex: A-01-01',
            colSpan: 2,
            description: 'Código único da localização',
          },
          {
            name: 'titulo',
            label: 'Nome',
            type: 'text',
            placeholder: 'Ex: Depósito Principal',
            colSpan: 2,
            description: 'Nome descritivo da localização',
          },
          {
            name: 'type',
            label: 'Tipo',
            type: 'select',
            required: true,
            colSpan: 2,
            options: [
              { value: 'WAREHOUSE', label: 'Armazém' },
              { value: 'ZONE', label: 'Zona' },
              { value: 'AISLE', label: 'Corredor' },
              { value: 'SHELF', label: 'Prateleira' },
              { value: 'BIN', label: 'Gaveta' },
              { value: 'OTHER', label: 'Outro' },
            ],
          },
          {
            name: 'parentId',
            label: 'Localização Pai',
            type: 'text',
            placeholder: 'ID da localização pai',
            colSpan: 2,
            description: 'Localização hierarquicamente superior',
          },
        ],
        columns: 4,
      },
      {
        id: 'capacity',
        title: 'Capacidade',
        description: 'Informações sobre capacidade e ocupação',
        fields: [
          {
            name: 'capacity',
            label: 'Capacidade Total',
            type: 'number',
            placeholder: '0',
            colSpan: 2,
            description: 'Capacidade máxima da localização',
            min: 0,
          },
          {
            name: 'currentOccupancy',
            label: 'Ocupação Atual',
            type: 'number',
            placeholder: '0',
            colSpan: 2,
            description: 'Nível atual de ocupação',
            min: 0,
          },
        ],
        columns: 4,
      },
      {
        id: 'settings',
        title: 'Configurações',
        fields: [
          {
            name: 'isActive',
            label: 'Ativa',
            type: 'checkbox',
            colSpan: 1,
            defaultValue: true,
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
    view: STOCK_PERMISSIONS.LOCATIONS.READ,
    create: STOCK_PERMISSIONS.LOCATIONS.CREATE,
    update: STOCK_PERMISSIONS.LOCATIONS.UPDATE,
    delete: STOCK_PERMISSIONS.LOCATIONS.DELETE,
    export: STOCK_PERMISSIONS.LOCATIONS.MANAGE,
    import: STOCK_PERMISSIONS.LOCATIONS.MANAGE,
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
        label: 'Nova Localização',
        icon: Plus,
        variant: 'default',
        permission: STOCK_PERMISSIONS.LOCATIONS.CREATE,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.LOCATIONS.READ,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.LOCATIONS.UPDATE,
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.LOCATIONS.CREATE,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.LOCATIONS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Localização',
        confirmMessage: 'Tem certeza que deseja excluir esta localização?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: STOCK_PERMISSIONS.LOCATIONS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Localizações',
        confirmMessage:
          'Tem certeza que deseja excluir as localizações selecionadas?',
      },
    ],
  },
});

export default locationsConfig;
