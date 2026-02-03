/**
 * OpenSea OS - Templates Entity Config
 * Configuração completa da entidade de templates
 */

import { defineEntityConfig } from '@/core/types';
import type { Template } from '@/types/stock';
import { Copy, Edit, Eye, FileText, Plus, Trash2 } from 'lucide-react';

export const templatesConfig = defineEntityConfig<Template>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Template',
  namePlural: 'Templates',
  slug: 'templates',
  description: 'Gerenciamento de templates de produtos',
  icon: FileText,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/templates',
    queryKey: 'templates',
    queryKeys: {
      list: ['templates'],
      detail: (id: string) => ['templates', id],
    },
    endpoints: {
      list: '/v1/templates',
      get: '/v1/templates/:id',
      create: '/v1/templates',
      update: '/v1/templates/:id',
      delete: '/v1/templates/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/stock/assets/templates',
    detail: '/stock/assets/templates/:id',
    create: '/stock/assets/templates/new',
    edit: '/stock/assets/templates/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: FileText,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    titleField: 'name',
    subtitleField: undefined,
    imageField: undefined,
    labels: {
      singular: 'Template',
      plural: 'Templates',
      createButton: 'Novo Template',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum template encontrado',
      searchPlaceholder: 'Buscar templates...',
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
    columns: {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
    },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name'],
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
        title: '',
        description: '',
        fields: [
          {
            name: 'name',
            label: 'Nome do Template',
            type: 'text',
            required: true,
            placeholder: 'Ex: Tecido, Linha, Botão',
            colSpan: 1,
            description: '',
          },
          {
            name: 'unitOfMeasure',
            label: 'Unidade de Medida',
            type: 'select',
            required: true,
            colSpan: 1,
            defaultValue: 'METERS',
            options: [
              { value: 'METERS', label: 'Metros' },
              { value: 'KILOGRAMS', label: 'Quilogramas' },
              { value: 'UNITS', label: 'Unidades' },
            ],
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
    view: 'templates.view',
    create: 'templates.create',
    update: 'templates.update',
    delete: 'templates.delete',
    export: 'templates.export',
    import: 'templates.import',
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
        label: 'Novo Template',
        icon: Plus,
        variant: 'default',
        permission: 'templates.create',
        onClick: () => {}, // Handled by page component
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: 'templates.view',
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: 'templates.update',
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: 'templates.create',
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: 'templates.delete',
        confirm: true,
        confirmTitle: 'Excluir Template',
        confirmMessage: 'Tem certeza que deseja excluir este template?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: 'templates.delete',
        confirm: true,
        confirmTitle: 'Excluir Templates',
        confirmMessage:
          'Tem certeza que deseja excluir os templates selecionados?',
      },
    ],
  },
});

export default templatesConfig;
