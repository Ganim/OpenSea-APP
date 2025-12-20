/**
 * OpenSea OS - Manufacturers Entity Config
 * Configuração completa da entidade de fabricantes
 */

import { defineEntityConfig } from '@/core/types';
import type { Manufacturer } from '@/types/stock';
import { Copy, Edit, Eye, Factory, Plus, Trash2 } from 'lucide-react';

export const manufacturersConfig = defineEntityConfig<Manufacturer>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Fabricante',
  namePlural: 'Fabricantes',
  slug: 'manufacturers',
  description: 'Gerenciamento de fabricantes e marcas',
  icon: Factory,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/manufacturers',
    queryKey: 'manufacturers',
    queryKeys: {
      list: ['manufacturers'],
      detail: (id: string) => ['manufacturers', id],
    },
    endpoints: {
      list: '/v1/manufacturers',
      get: '/v1/manufacturers/:id',
      create: '/v1/manufacturers',
      update: '/v1/manufacturers/:id',
      delete: '/v1/manufacturers/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/admin/manufacturers',
    detail: '/admin/manufacturers/:id',
    create: '/admin/manufacturers/new',
    edit: '/admin/manufacturers/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Factory,
    color: 'indigo',
    gradient: 'from-indigo-500 to-blue-600',
    titleField: 'name',
    subtitleField: 'country',
    imageField: undefined,
    labels: {
      singular: 'Fabricante',
      plural: 'Fabricantes',
      createButton: 'Novo Fabricante',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum fabricante encontrado',
      searchPlaceholder: 'Buscar fabricantes...',
    },
    badgeFields: [
      {
        field: 'isActive',
        label: 'Status',
        colorMap: {
          true: 'bg-green-500/20 text-green-700 dark:text-green-400',
          false: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
        },
        render: (value: unknown) => (value ? 'Ativo' : 'Inativo'),
      },
    ],
    metaFields: [
      {
        field: 'email',
        label: 'Email',
        format: 'text',
      },
      {
        field: 'phone',
        label: 'Telefone',
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
    searchableFields: ['name', 'country', 'email', 'phone', 'website'],
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
        description: 'Dados principais do fabricante',
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Ex: Nike',
            colSpan: 2,
          },
          {
            name: 'country',
            label: 'País',
            type: 'text',
            required: true,
            placeholder: 'Ex: Brasil',
            colSpan: 2,
          },
        ],
        columns: 4,
      },
      {
        id: 'contact',
        title: 'Contato',
        fields: [
          {
            name: 'email',
            label: 'Email',
            type: 'text',
            placeholder: 'contato@fabricante.com',
            colSpan: 2,
          },
          {
            name: 'phone',
            label: 'Telefone',
            type: 'text',
            placeholder: '(00) 00000-0000',
            colSpan: 2,
          },
          {
            name: 'website',
            label: 'Website',
            type: 'text',
            placeholder: 'https://www.fabricante.com',
            colSpan: 4,
          },
        ],
        columns: 4,
      },
      {
        id: 'address',
        title: 'Endereço',
        fields: [
          {
            name: 'addressLine1',
            label: 'Endereço',
            type: 'text',
            placeholder: 'Rua, número',
            colSpan: 4,
          },
          {
            name: 'addressLine2',
            label: 'Complemento',
            type: 'text',
            placeholder: 'Apto, bloco, etc',
            colSpan: 4,
          },
          {
            name: 'city',
            label: 'Cidade',
            type: 'text',
            colSpan: 2,
          },
          {
            name: 'state',
            label: 'Estado',
            type: 'text',
            colSpan: 1,
          },
          {
            name: 'postalCode',
            label: 'CEP',
            type: 'text',
            colSpan: 1,
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
            label: 'Ativo',
            type: 'checkbox',
            colSpan: 1,
            defaultValue: true,
          },
          {
            name: 'rating',
            label: 'Avaliação',
            type: 'number',
            placeholder: '0-5',
            colSpan: 1,
            min: 0,
            max: 5,
          },
          {
            name: 'notes',
            label: 'Observações',
            type: 'textarea',
            placeholder: 'Notas sobre o fabricante',
            colSpan: 4,
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
    view: 'manufacturers.view',
    create: 'manufacturers.create',
    update: 'manufacturers.update',
    delete: 'manufacturers.delete',
    export: 'manufacturers.export',
    import: 'manufacturers.import',
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
        label: 'Novo Fabricante',
        icon: Plus,
        variant: 'default',
        permission: 'manufacturers.create',
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: 'manufacturers.view',
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: 'manufacturers.update',
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: 'manufacturers.create',
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: 'manufacturers.delete',
        confirm: true,
        confirmTitle: 'Excluir Fabricante',
        confirmMessage: 'Tem certeza que deseja excluir este fabricante?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: 'manufacturers.delete',
        confirm: true,
        confirmTitle: 'Excluir Fabricantes',
        confirmMessage:
          'Tem certeza que deseja excluir os fabricantes selecionados?',
      },
    ],
  },
});

export default manufacturersConfig;
