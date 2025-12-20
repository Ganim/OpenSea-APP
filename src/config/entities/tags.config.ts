/**
 * OpenSea OS - Tags Entity Config
 * Configuração completa da entidade de tags
 */

import { defineEntityConfig } from '@/core/types';
import type { Tag } from '@/types/stock';
import { Copy, Edit, Eye, Plus, Tag as TagIcon, Trash2 } from 'lucide-react';

export const tagsConfig = defineEntityConfig<Tag>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Tag',
  namePlural: 'Tags',
  slug: 'tags',
  description: 'Gerenciamento de tags para produtos',
  icon: TagIcon,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/tags',
    queryKey: 'tags',
    queryKeys: {
      list: ['tags'],
      detail: (id: string) => ['tags', id],
    },
    endpoints: {
      list: '/v1/tags',
      get: '/v1/tags/:id',
      create: '/v1/tags',
      update: '/v1/tags/:id',
      delete: '/v1/tags/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/admin/tags',
    detail: '/admin/tags/:id',
    create: '/admin/tags/new',
    edit: '/admin/tags/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: TagIcon,
    color: 'pink',
    gradient: 'from-pink-500 to-rose-600',
    titleField: 'name',
    subtitleField: 'description',
    imageField: undefined,
    labels: {
      singular: 'Tag',
      plural: 'Tags',
      createButton: 'Nova Tag',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma tag encontrada',
      searchPlaceholder: 'Buscar tags...',
    },
    badgeFields: [
      {
        field: 'color',
        label: 'Cor',
        colorMap: {},
        render: (value: unknown) => {
          const color = value as string;
          return color || 'Sem cor';
        },
      },
    ],
    metaFields: [
      {
        field: 'createdAt',
        label: 'Criada em',
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
    searchableFields: ['name', 'description'],
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
        description: 'Dados principais da tag',
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Ex: Promoção',
            colSpan: 2,
            description: 'Nome da tag',
          },
          {
            name: 'color',
            label: 'Cor',
            type: 'text',
            placeholder: '#FF5733',
            colSpan: 2,
            description: 'Cor da tag em hexadecimal',
          },
          {
            name: 'description',
            label: 'Descrição',
            type: 'textarea',
            placeholder: 'Descrição da tag',
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
    view: 'tags.view',
    create: 'tags.create',
    update: 'tags.update',
    delete: 'tags.delete',
    export: 'tags.export',
    import: 'tags.import',
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
        label: 'Nova Tag',
        icon: Plus,
        variant: 'default',
        permission: 'tags.create',
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: 'tags.view',
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: 'tags.update',
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: 'tags.create',
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: 'tags.delete',
        confirm: true,
        confirmTitle: 'Excluir Tag',
        confirmMessage: 'Tem certeza que deseja excluir esta tag?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: 'tags.delete',
        confirm: true,
        confirmTitle: 'Excluir Tags',
        confirmMessage: 'Tem certeza que deseja excluir as tags selecionadas?',
      },
    ],
  },
});

export default tagsConfig;
