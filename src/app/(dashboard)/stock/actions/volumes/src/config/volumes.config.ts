/**
 * OpenSea OS - Volumes Entity Config
 * Configuracao completa da entidade de volumes
 */

import { STOCK_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Volume } from '@/types/stock';
import { Edit, Eye, Package, Plus, Trash2 } from 'lucide-react';

export const volumesConfig = defineEntityConfig<Volume>()({
  // ======================== IDENTIFICACAO ========================
  name: 'Volume',
  namePlural: 'Volumes',
  slug: 'volumes',
  description: 'Gerenciamento de volumes e expedicao de itens',
  icon: Package,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/volumes',
    queryKey: 'volumes',
    queryKeys: {
      list: ['volumes'],
      detail: (id: string) => ['volumes', id],
    },
    endpoints: {
      list: '/v1/volumes',
      get: '/v1/volumes/:id',
      create: '/v1/volumes',
      update: '/v1/volumes/:id',
      delete: '/v1/volumes/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/stock/actions/volumes',
    detail: '/stock/actions/volumes/:id',
    create: '/stock/actions/volumes/new',
    edit: '/stock/actions/volumes/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Package,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    titleField: 'name',
    subtitleField: 'code',
    labels: {
      singular: 'Volume',
      plural: 'Volumes',
      createButton: 'Novo Volume',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum volume encontrado',
      searchPlaceholder: 'Buscar por nome, codigo...',
    },
    badgeFields: [{ field: 'status', label: 'Status' }],
    metaFields: [
      { field: 'createdAt', label: 'Criado em', format: 'date' },
      { field: 'updatedAt', label: 'Atualizado em', format: 'date' },
    ],
  },

  // ======================== GRID/LISTA ========================
  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name', 'code', 'notes'],
    defaultSort: { field: 'createdAt', direction: 'desc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // ======================== FORMULARIO ========================
  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informacoes Basicas',
        description: 'Dados principais do volume',
        columns: 2,
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Ex: Volume 001 - Cliente ABC',
            colSpan: 2,
          },
          {
            name: 'destinationRef',
            label: 'Destino',
            type: 'text',
            placeholder: 'Referencia de destino',
            colSpan: 2,
          },
          {
            name: 'notes',
            label: 'Observacoes',
            type: 'textarea',
            placeholder: 'Observacoes sobre o volume...',
            colSpan: 2,
          },
        ],
      },
    ],
    defaultColumns: 2,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  // ======================== PERMISSOES ========================
  permissions: {
    view: STOCK_PERMISSIONS.VOLUMES.READ,
    create: STOCK_PERMISSIONS.VOLUMES.CREATE,
    update: STOCK_PERMISSIONS.VOLUMES.UPDATE,
    delete: STOCK_PERMISSIONS.VOLUMES.DELETE,
    export: STOCK_PERMISSIONS.VOLUMES.MANAGE,
    import: STOCK_PERMISSIONS.VOLUMES.MANAGE,
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: true,
    delete: true,
    duplicate: false,
    softDelete: false,
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

  // ======================== ACOES ========================
  actions: {
    header: [
      {
        id: 'create',
        label: 'Novo Volume',
        icon: Plus,
        variant: 'default',
        permission: STOCK_PERMISSIONS.VOLUMES.CREATE,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.VOLUMES.READ,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.VOLUMES.UPDATE,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.VOLUMES.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Volume',
        confirmMessage: 'Tem certeza que deseja excluir este volume?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: STOCK_PERMISSIONS.VOLUMES.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Volumes',
        confirmMessage:
          'Tem certeza que deseja excluir os volumes selecionados?',
      },
    ],
  },
});

export default volumesConfig;
