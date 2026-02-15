import { STOCK_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Manufacturer } from '@/types/stock';
import { Copy, Edit, Eye, Factory, Plus, Trash2 } from 'lucide-react';

export const manufacturersConfig = defineEntityConfig<Manufacturer>()({
  name: 'Manufacturer',
  namePlural: 'Manufacturers',
  slug: 'manufacturers',
  description: 'Gerenciamento de fabricantes de produtos',
  icon: Factory,

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

  routes: {
    list: '/stock/manufacturers',
    detail: '/stock/manufacturers/:id',
    create: '/stock/manufacturers/new',
    edit: '/stock/manufacturers/:id/edit',
  },

  display: {
    icon: Factory,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    titleField: 'name',
    subtitleField: 'country',
    labels: {
      singular: 'Fabricante',
      plural: 'Fabricantes',
      createButton: 'Novo Fabricante',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum fabricante encontrado',
      searchPlaceholder: 'Buscar por nome, país ou email...',
    },
    badgeFields: [{ field: 'isActive', label: 'Status' }],
    metaFields: [
      { field: 'createdAt', label: 'Criado em', format: 'date' },
      { field: 'updatedAt', label: 'Atualizado em', format: 'date' },
    ],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name', 'country', 'email'],
    defaultSort: { field: 'name', direction: 'asc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  form: {
    sections: [
      {
        id: 'identity',
        title: 'Identificação',
        description: 'Dados básicos do fabricante',
        columns: 2,
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Nome do fabricante',
          },
          {
            name: 'legalName',
            label: 'Razão Social',
            type: 'text',
            placeholder: 'Razão social completa',
          },
          {
            name: 'cnpj',
            label: 'CNPJ',
            type: 'text',
            placeholder: '00.000.000/0000-00',
          },
          {
            name: 'country',
            label: 'País',
            type: 'text',
            required: true,
            placeholder: 'Brasil',
          },
          {
            name: 'isActive',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
              { label: 'Ativo', value: 'true' },
              { label: 'Inativo', value: 'false' },
            ],
            defaultValue: 'true',
          },
          {
            name: 'rating',
            label: 'Avaliação',
            type: 'number',
            placeholder: '1 a 5',
          },
          {
            name: 'website',
            label: 'Website',
            type: 'text',
            placeholder: 'https://www.fabricante.com',
          },
        ],
      },
      {
        id: 'contact',
        title: 'Contato',
        description: 'Informações de contato',
        columns: 2,
        fields: [
          {
            name: 'email',
            label: 'E-mail',
            type: 'email',
            placeholder: 'contato@fabricante.com',
          },
          {
            name: 'phone',
            label: 'Telefone',
            type: 'text',
            placeholder: '(11) 98888-7777',
          },
        ],
      },
      {
        id: 'address',
        title: 'Endereço',
        description: 'Localização do fabricante',
        columns: 2,
        fields: [
          {
            name: 'addressLine1',
            label: 'Endereço',
            type: 'text',
            placeholder: 'Rua, número',
            colSpan: 2,
          },
          {
            name: 'addressLine2',
            label: 'Complemento',
            type: 'text',
            placeholder: 'Sala, andar',
            colSpan: 2,
          },
          {
            name: 'city',
            label: 'Cidade',
            type: 'text',
            placeholder: 'São Paulo',
          },
          {
            name: 'state',
            label: 'Estado',
            type: 'text',
            placeholder: 'SP',
          },
          {
            name: 'postalCode',
            label: 'CEP',
            type: 'text',
            placeholder: '00000-000',
          },
        ],
      },
      {
        id: 'notes',
        title: 'Observações',
        description: 'Informações adicionais',
        columns: 1,
        fields: [
          {
            name: 'notes',
            label: 'Notas',
            type: 'textarea',
            placeholder: 'Observações sobre o fabricante...',
            colSpan: 2,
          },
        ],
      },
    ],
    defaultColumns: 2,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  permissions: {
    view: STOCK_PERMISSIONS.MANUFACTURERS.READ,
    create: STOCK_PERMISSIONS.MANUFACTURERS.CREATE,
    update: STOCK_PERMISSIONS.MANUFACTURERS.UPDATE,
    delete: STOCK_PERMISSIONS.MANUFACTURERS.DELETE,
    export: STOCK_PERMISSIONS.MANUFACTURERS.MANAGE,
    import: STOCK_PERMISSIONS.MANUFACTURERS.MANAGE,
  },

  features: {
    create: true,
    edit: true,
    delete: true,
    duplicate: true,
    softDelete: true,
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
    archive: false,
    auditLog: true,
    versioning: false,
    realtime: false,
  },

  actions: {
    header: [
      {
        id: 'create',
        label: 'Novo Fabricante',
        icon: Plus,
        variant: 'default',
        permission: STOCK_PERMISSIONS.MANUFACTURERS.CREATE,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.MANUFACTURERS.READ,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.MANUFACTURERS.UPDATE,
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.MANUFACTURERS.CREATE,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: STOCK_PERMISSIONS.MANUFACTURERS.DELETE,
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
        permission: STOCK_PERMISSIONS.MANUFACTURERS.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Fabricantes',
        confirmMessage:
          'Tem certeza que deseja excluir os fabricantes selecionados?',
      },
    ],
  },
});

export default manufacturersConfig;
