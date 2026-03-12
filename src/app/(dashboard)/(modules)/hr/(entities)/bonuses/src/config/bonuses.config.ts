/**
 * OpenSea OS - Bonuses Entity Config
 * Configuração completa da entidade de bonificações
 */

import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Bonus } from '@/types/hr';
import { Eye, PlusCircle, Plus, Trash2 } from 'lucide-react';

export const bonusesConfig = defineEntityConfig<Bonus>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Bonus',
  namePlural: 'Bonuses',
  slug: 'bonuses',
  description: 'Gerenciamento de bonificações de funcionários',
  icon: PlusCircle,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/hr/bonuses',
    queryKey: 'bonuses',
    queryKeys: {
      list: ['bonuses'],
      detail: (id: string) => ['bonuses', id],
    },
    endpoints: {
      list: '/v1/hr/bonuses',
      get: '/v1/hr/bonuses/:id',
      create: '/v1/hr/bonuses',
      update: '/v1/hr/bonuses/:id',
      delete: '/v1/hr/bonuses/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/hr/bonuses',
    detail: '/hr/bonuses/:id',
    create: '/hr/bonuses/new',
    edit: '/hr/bonuses/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: PlusCircle,
    color: 'lime',
    gradient: 'from-lime-500 to-lime-600',
    titleField: 'name',
    subtitleField: 'reason',
    imageField: undefined,
    labels: {
      singular: 'Bonificação',
      plural: 'Bonificações',
      createButton: 'Nova Bonificação',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma bonificação encontrada',
      searchPlaceholder: 'Buscar bonificações por nome...',
    },
    badgeFields: [],
    metaFields: [
      {
        field: 'amount',
        label: 'Valor',
        format: 'currency',
      },
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
    columns: {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
    },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name', 'reason'],
    defaultSort: {
      field: 'createdAt',
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
        title: 'Informações da Bonificação',
        description: '',
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Ex: Bônus de produtividade',
            colSpan: 1,
            description: '',
          },
          {
            name: 'amount',
            label: 'Valor (R$)',
            type: 'number',
            required: true,
            placeholder: '0,00',
            colSpan: 1,
            description: '',
          },
          {
            name: 'reason',
            label: 'Motivo',
            type: 'textarea',
            required: true,
            placeholder:
              'Descreva o motivo da bonificação (mínimo 10 caracteres)',
            colSpan: 2,
            description: '',
          },
        ],
        columns: 2,
      },
    ],
    defaultColumns: 2,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  // ======================== PERMISSÕES ========================
  permissions: {
    view: HR_PERMISSIONS.BONUSES.READ,
    create: HR_PERMISSIONS.BONUSES.CREATE,
    update: HR_PERMISSIONS.BONUSES.UPDATE,
    delete: HR_PERMISSIONS.BONUSES.DELETE,
    export: HR_PERMISSIONS.BONUSES.MANAGE,
    import: HR_PERMISSIONS.BONUSES.MANAGE,
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: false,
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
    multiSelect: false,
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
        label: 'Nova Bonificação',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.BONUSES.CREATE,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.BONUSES.READ,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: HR_PERMISSIONS.BONUSES.DELETE,
        confirm: true,
        confirmTitle: 'Excluir Bonificação',
        confirmMessage: 'Tem certeza que deseja excluir esta bonificação?',
      },
    ],
    batch: [],
  },
});

export default bonusesConfig;
