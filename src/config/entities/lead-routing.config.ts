import { SALES_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { LeadRoutingRule } from '@/types/sales';
import { Edit, Eye, Plus, Shuffle, Trash2 } from 'lucide-react';

export const leadRoutingConfig = defineEntityConfig<LeadRoutingRule>()({
  name: 'Regra de Roteamento',
  namePlural: 'Regras de Roteamento',
  slug: 'lead-routing',
  description: 'Distribuicao automatica de leads entre vendedores',
  icon: Shuffle,

  api: {
    baseUrl: '/api/v1/lead-routing-rules',
    queryKey: 'lead-routing-rules',
    queryKeys: {
      list: ['lead-routing-rules'],
      detail: (id: string) => ['lead-routing-rules', id],
    },
    endpoints: {
      list: '/v1/lead-routing/rules',
      get: '/v1/lead-routing/rules/:id',
      create: '/v1/lead-routing/rules',
      update: '/v1/lead-routing/rules/:id',
      delete: '/v1/lead-routing/rules/:id',
    },
  },

  routes: {
    list: '/sales/lead-routing',
    detail: '/sales/lead-routing/:id',
    create: '/sales/lead-routing/new',
    edit: '/sales/lead-routing/:id/edit',
  },

  display: {
    icon: Shuffle,
    color: 'teal',
    gradient: 'from-teal-500 to-emerald-600',
    titleField: 'name',
    subtitleField: 'description',
    imageField: undefined,
    labels: {
      singular: 'Regra',
      plural: 'Regras',
      createButton: 'Nova Regra',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma regra encontrada',
      searchPlaceholder: 'Buscar regras...',
    },
    badgeFields: [],
    metaFields: [{ field: 'createdAt', label: 'Criada em', format: 'date' }],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name'],
    defaultSort: { field: 'createdAt', direction: 'desc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50],
  },

  form: {
    sections: [],
    defaultColumns: 4,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  permissions: {
    view: SALES_PERMISSIONS.LEAD_ROUTING.ACCESS,
    create: SALES_PERMISSIONS.LEAD_ROUTING.REGISTER,
    update: SALES_PERMISSIONS.LEAD_ROUTING.MODIFY,
    delete: SALES_PERMISSIONS.LEAD_ROUTING.REMOVE,
  },

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

  actions: {
    header: [
      {
        id: 'create',
        label: 'Nova Regra',
        icon: Plus,
        variant: 'default',
        permission: SALES_PERMISSIONS.LEAD_ROUTING.REGISTER,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: SALES_PERMISSIONS.LEAD_ROUTING.ACCESS,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: SALES_PERMISSIONS.LEAD_ROUTING.MODIFY,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: SALES_PERMISSIONS.LEAD_ROUTING.REMOVE,
        confirm: true,
        confirmTitle: 'Excluir Regra',
        confirmMessage: 'Tem certeza que deseja excluir esta regra?',
      },
    ],
    batch: [],
  },
});

export default leadRoutingConfig;
