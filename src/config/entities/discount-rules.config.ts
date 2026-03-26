/**
 * OpenSea OS - Discount Rules Entity Config
 * Configuração completa da entidade de regras de desconto
 */

import { SALES_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { DiscountRule } from '@/types/sales';
import { Edit, Eye, Percent, Plus, Trash2 } from 'lucide-react';

export const discountRulesConfig = defineEntityConfig<DiscountRule>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Regra de Desconto',
  namePlural: 'Regras de Desconto',
  slug: 'discount-rules',
  description: 'Gerenciamento de regras de desconto',
  icon: Percent,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/discount-rules',
    queryKey: 'discount-rules',
    queryKeys: {
      list: ['discount-rules'],
      detail: (id: string) => ['discount-rules', id],
    },
    endpoints: {
      list: '/v1/discount-rules',
      get: '/v1/discount-rules/:id',
      create: '/v1/discount-rules',
      update: '/v1/discount-rules/:id',
      delete: '/v1/discount-rules/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/sales/discount-rules',
    detail: '/sales/discount-rules/:id',
    create: '/sales/discount-rules/new',
    edit: '/sales/discount-rules/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: Percent,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    titleField: 'name',
    subtitleField: 'description',
    imageField: undefined,
    labels: {
      singular: 'Regra de Desconto',
      plural: 'Regras de Desconto',
      createButton: 'Nova Regra',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma regra de desconto encontrada',
      searchPlaceholder: 'Buscar regras de desconto...',
    },
    badgeFields: [],
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
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name', 'description'],
    defaultSort: { field: 'createdAt', direction: 'desc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // ======================== FORMULÁRIO ========================
  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informações Básicas',
        description: 'Dados da regra de desconto',
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Nome da regra',
            colSpan: 2,
          },
          {
            name: 'type',
            label: 'Tipo',
            type: 'select',
            required: true,
            colSpan: 1,
            options: [
              { value: 'PERCENTAGE', label: 'Percentual' },
              { value: 'FIXED_AMOUNT', label: 'Valor Fixo' },
            ],
          },
          {
            name: 'value',
            label: 'Valor',
            type: 'number',
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

  // ======================== PERMISSÕES ========================
  permissions: {
    view: SALES_PERMISSIONS.DISCOUNTS.ACCESS,
    create: SALES_PERMISSIONS.DISCOUNTS.ADMIN,
    update: SALES_PERMISSIONS.DISCOUNTS.ADMIN,
    delete: SALES_PERMISSIONS.DISCOUNTS.ADMIN,
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
    batchOperations: false,
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
        label: 'Nova Regra',
        icon: Plus,
        variant: 'default',
        permission: SALES_PERMISSIONS.DISCOUNTS.ADMIN,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: SALES_PERMISSIONS.DISCOUNTS.ACCESS,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: SALES_PERMISSIONS.DISCOUNTS.ADMIN,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: SALES_PERMISSIONS.DISCOUNTS.ADMIN,
        confirm: true,
        confirmTitle: 'Excluir Regra de Desconto',
        confirmMessage: 'Tem certeza que deseja excluir esta regra?',
      },
    ],
    batch: [],
  },
});

export default discountRulesConfig;
