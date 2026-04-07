import { SALES_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { LeadScoringRule } from '@/types/sales';
import { Edit, Eye, Plus, Star, Trash2 } from 'lucide-react';

export const leadScoringConfig = defineEntityConfig<LeadScoringRule>()({
  name: 'Regra de Scoring',
  namePlural: 'Regras de Scoring',
  slug: 'lead-scoring',
  description: 'Regras de pontuacao automatica para leads',
  icon: Star,

  api: {
    baseUrl: '/api/v1/lead-scoring/rules',
    queryKey: 'lead-scoring-rules',
    queryKeys: {
      list: ['lead-scoring-rules'],
      detail: (id: string) => ['lead-scoring-rules', id],
    },
    endpoints: {
      list: '/v1/lead-scoring/rules',
      get: '/v1/lead-scoring/rules/:id',
      create: '/v1/lead-scoring/rules',
      update: '/v1/lead-scoring/rules/:id',
      delete: '/v1/lead-scoring/rules/:id',
    },
  },

  routes: {
    list: '/sales/lead-scoring',
    detail: '/sales/lead-scoring/:id',
    create: '/sales/lead-scoring/new',
    edit: '/sales/lead-scoring/:id/edit',
  },

  display: {
    icon: Star,
    color: 'cyan',
    gradient: 'from-amber-500 to-orange-600',
    titleField: 'name',
    subtitleField: 'value',
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
    view: SALES_PERMISSIONS.LEAD_SCORING.ACCESS,
    create: SALES_PERMISSIONS.LEAD_SCORING.REGISTER,
    update: SALES_PERMISSIONS.LEAD_SCORING.MODIFY,
    delete: SALES_PERMISSIONS.LEAD_SCORING.REMOVE,
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
        permission: SALES_PERMISSIONS.LEAD_SCORING.REGISTER,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: SALES_PERMISSIONS.LEAD_SCORING.ACCESS,
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: SALES_PERMISSIONS.LEAD_SCORING.MODIFY,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: SALES_PERMISSIONS.LEAD_SCORING.REMOVE,
        confirm: true,
        confirmTitle: 'Excluir Regra',
        confirmMessage: 'Tem certeza que deseja excluir esta regra?',
      },
    ],
    batch: [],
  },
});

export default leadScoringConfig;
