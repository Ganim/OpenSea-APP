/**
 * OpenSea OS - Suppliers Entity Config
 * Configuração completa da entidade de fornecedores
 */

import { defineEntityConfig } from '@/core/types';
import type { Supplier } from '@/types/stock';
import { Building2, Copy, Edit, Eye, Plus, Trash2 } from 'lucide-react';

export const suppliersConfig = defineEntityConfig<Supplier>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Fornecedor',
  namePlural: 'Fornecedores',
  slug: 'suppliers',
  description: 'Gerenciamento de fornecedores de matéria-prima',
  icon: Building2,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/suppliers',
    queryKey: 'suppliers',
    queryKeys: {
      list: ['suppliers'],
      detail: (id: string) => ['suppliers', id],
    },
    endpoints: {
      list: '/v1/suppliers',
      get: '/v1/suppliers/:id',
      create: '/v1/suppliers',
      update: '/v1/suppliers/:id',
      delete: '/v1/suppliers/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/admin/suppliers',
    detail: '/admin/suppliers/:id',
    create: '/admin/suppliers/new',
    edit: '/admin/suppliers/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Building2,
    color: 'orange',
    gradient: 'from-orange-500 to-red-600',
    titleField: 'name',
    subtitleField: 'email',
    imageField: undefined,
    labels: {
      singular: 'Fornecedor',
      plural: 'Fornecedores',
      createButton: 'Novo Fornecedor',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum fornecedor encontrado',
      searchPlaceholder: 'Buscar fornecedores...',
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
        field: 'phone',
        label: 'Telefone',
        format: 'text',
      },
      {
        field: 'city',
        label: 'Cidade',
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
    searchableFields: ['name', 'email', 'phone', 'cnpj', 'city'],
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
        description: 'Dados principais do fornecedor',
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Ex: Santista Têxtil',
            colSpan: 2,
          },
          {
            name: 'cnpj',
            label: 'CNPJ',
            type: 'text',
            placeholder: '00.000.000/0000-00',
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
            placeholder: 'contato@fornecedor.com',
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
            placeholder: 'https://www.fornecedor.com',
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
            name: 'notes',
            label: 'Observações',
            type: 'textarea',
            placeholder: 'Notas sobre o fornecedor',
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
    view: 'suppliers.view',
    create: 'suppliers.create',
    update: 'suppliers.update',
    delete: 'suppliers.delete',
    export: 'suppliers.export',
    import: 'suppliers.import',
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
        label: 'Novo Fornecedor',
        icon: Plus,
        variant: 'default',
        permission: 'suppliers.create',
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: 'suppliers.view',
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: 'suppliers.update',
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: 'suppliers.create',
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: 'suppliers.delete',
        confirm: true,
        confirmTitle: 'Excluir Fornecedor',
        confirmMessage: 'Tem certeza que deseja excluir este fornecedor?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: 'suppliers.delete',
        confirm: true,
        confirmTitle: 'Excluir Fornecedores',
        confirmMessage:
          'Tem certeza que deseja excluir os fornecedores selecionados?',
      },
    ],
  },
});

export default suppliersConfig;
