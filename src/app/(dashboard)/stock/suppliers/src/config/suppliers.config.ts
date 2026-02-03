/**
 * OpenSea OS - Suppliers Entity Config
 * Configuracao completa da entidade de fornecedores
 */

import { defineEntityConfig } from '@/core/types';
import type { Supplier } from '@/types/stock';
import { Copy, Edit, Eye, Plus, Trash2, Truck } from 'lucide-react';

export const suppliersConfig = defineEntityConfig<Supplier>()({
  // ======================== IDENTIFICACAO ========================
  name: 'Supplier',
  namePlural: 'Suppliers',
  slug: 'suppliers',
  description: 'Gerenciamento de fornecedores de produtos',
  icon: Truck,

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
    list: '/stock/suppliers',
    detail: '/stock/suppliers/:id',
    create: '/stock/suppliers/new',
    edit: '/stock/suppliers/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Truck,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    titleField: 'name',
    subtitleField: 'cnpj',
    labels: {
      singular: 'Fornecedor',
      plural: 'Fornecedores',
      createButton: 'Novo Fornecedor',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum fornecedor encontrado',
      searchPlaceholder: 'Buscar por nome, CNPJ ou email...',
    },
    badgeFields: [{ field: 'isActive', label: 'Status' }],
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
    searchableFields: ['name', 'cnpj', 'email'],
    defaultSort: { field: 'name', direction: 'asc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // ======================== FORMULARIO ========================
  form: {
    sections: [
      {
        id: 'identity',
        title: 'Identificacao',
        description: 'Dados basicos do fornecedor',
        columns: 2,
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Nome do fornecedor',
            colSpan: 2,
          },
          {
            name: 'cnpj',
            label: 'CNPJ',
            type: 'text',
            placeholder: '00.000.000/0001-00',
          },
          {
            name: 'taxId',
            label: 'Tax ID',
            type: 'text',
            placeholder: 'Identificacao fiscal',
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
            label: 'Avaliacao',
            type: 'number',
            placeholder: '1 a 5',
          },
          {
            name: 'website',
            label: 'Website',
            type: 'text',
            placeholder: 'https://www.fornecedor.com',
            colSpan: 2,
          },
        ],
      },
      {
        id: 'contact',
        title: 'Contato',
        description: 'Informacoes de contato',
        columns: 2,
        fields: [
          {
            name: 'email',
            label: 'E-mail',
            type: 'email',
            placeholder: 'contato@fornecedor.com',
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
        title: 'Endereco',
        description: 'Localizacao do fornecedor',
        columns: 2,
        fields: [
          {
            name: 'addressLine1',
            label: 'Endereco',
            type: 'text',
            placeholder: 'Rua, numero',
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
            placeholder: 'Sao Paulo',
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
          {
            name: 'country',
            label: 'Pais',
            type: 'text',
            placeholder: 'Brasil',
          },
        ],
      },
      {
        id: 'notes',
        title: 'Observacoes',
        description: 'Informacoes adicionais',
        columns: 1,
        fields: [
          {
            name: 'notes',
            label: 'Notas',
            type: 'textarea',
            placeholder: 'Observacoes sobre o fornecedor...',
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

  // ======================== ACOES ========================
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
