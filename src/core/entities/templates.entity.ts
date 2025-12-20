/**
 * OpenSea OS - Templates EntityConfig
 * Configuração completa da entidade Template usando o sistema core
 */

import {
  Grid3x3,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Eye,
  Download,
  Upload,
} from 'lucide-react';
import type { Template } from '@/types/stock';
import {
  defineEntityConfig,
  defineFormConfig,
  defineField,
  defineSection,
  defineViewerConfig,
  defineViewerField,
  defineViewerSection,
} from '@/core/types';

// =============================================================================
// ENTITY CONFIG
// =============================================================================

export const templatesEntityConfig = defineEntityConfig<Template>()({
  name: 'template',

  // ==========================================================================
  // API CONFIG
  // ==========================================================================
  api: {
    baseUrl: '/api/stock/templates',
    endpoints: {
      list: '',
      get: '/:id',
      create: '',
      update: '/:id',
      delete: '/:id',
      batchDelete: '/batch',
    },
    queryKeys: {
      list: ['templates'],
      detail: (id: string) => ['templates', id],
    },
    responseTransform: {
      list: (data: unknown) => (data as { templates: Template[] }).templates,
      detail: (data: unknown) => (data as { template: Template }).template,
    },
  },

  // ==========================================================================
  // ROUTES
  // ==========================================================================
  routes: {
    list: '/stock/templates',
    detail: '/stock/templates/:id',
    create: '/stock/templates/new',
    edit: '/stock/templates/:id/edit',
  },

  // ==========================================================================
  // DISPLAY
  // ==========================================================================
  display: {
    icon: Grid3x3,
    color: 'blue',
    gradient: 'from-blue-500 to-purple-600',
    labels: {
      singular: 'Template',
      plural: 'Templates',
      createButton: 'Novo Template',
      editButton: 'Editar Template',
      deleteButton: 'Excluir Template',
      emptyState: 'Nenhum template encontrado',
      searchPlaceholder: 'Buscar templates...',
    },
    titleField: 'name',
    subtitleField: undefined,
    descriptionField: undefined,
  },

  // ==========================================================================
  // GRID CONFIG
  // ==========================================================================
  grid: {
    defaultView: 'grid',
    columns: {
      grid: 4,
      list: 1,
    },
    showViewToggle: true,
    enableDragSelection: true,
    cardConfig: {
      showBadges: true,
      showStatusBadges: true,
      badgeFields: [],
    },
  },

  // ==========================================================================
  // PERMISSIONS
  // ==========================================================================
  permissions: {
    view: 'templates:view',
    create: 'templates:create',
    edit: 'templates:edit',
    delete: 'templates:delete',
    export: 'templates:export',
    import: 'templates:import',
  },

  // ==========================================================================
  // FEATURES
  // ==========================================================================
  features: {
    search: true,
    filter: true,
    sort: true,
    pagination: true,
    selection: true,
    batchOperations: true,
    export: true,
    import: true,
    softDelete: true,
    audit: true,
    realtime: false,
    duplicate: true,
    archive: false,
    favorites: false,
  },

  // ==========================================================================
  // HOOKS
  // ==========================================================================
  hooks: {
    useList: 'useTemplates',
    useDetail: 'useTemplate',
    useCreate: 'useCreateTemplate',
    useUpdate: 'useUpdateTemplate',
    useDelete: 'useDeleteTemplate',
    useBatchDelete: 'useBatchDeleteTemplates',
  },

  // ==========================================================================
  // ACTIONS
  // ==========================================================================
  actions: {
    headerActions: [
      {
        id: 'create',
        label: 'Novo Template',
        icon: Plus,
        variant: 'default',
        onClick: () => {},
        permission: 'templates:create',
      },
      {
        id: 'import',
        label: 'Importar',
        icon: Upload,
        variant: 'outline',
        onClick: () => {},
        permission: 'templates:import',
      },
      {
        id: 'export',
        label: 'Exportar',
        icon: Download,
        variant: 'outline',
        onClick: () => {},
        permission: 'templates:export',
      },
    ],
    itemActions: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Pencil,
        onClick: () => {},
        permission: 'templates:edit',
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: 'templates:create',
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        variant: 'destructive',
        onClick: () => {},
        permission: 'templates:delete',
        confirm: true,
        confirmTitle: 'Excluir Template',
        confirmMessage: 'Tem certeza que deseja excluir este template?',
      },
    ],
    batchActions: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        variant: 'destructive',
        onClick: () => {},
        permission: 'templates:delete',
        minSelection: 1,
        confirm: true,
        confirmTitle: 'Excluir Templates',
        confirmMessage:
          'Tem certeza que deseja excluir os templates selecionados?',
      },
      {
        id: 'export',
        label: 'Exportar Selecionados',
        icon: Download,
        variant: 'outline',
        onClick: () => {},
        permission: 'templates:export',
        minSelection: 1,
      },
    ],
  },

  // ==========================================================================
  // RELATIONS
  // ==========================================================================
  relations: [
    {
      name: 'products',
      entity: 'product',
      type: 'hasMany',
      foreignKey: 'templateId',
      displayField: 'name',
      eager: false,
    },
  ],

  // ==========================================================================
  // FORM CONFIG
  // ==========================================================================
  form: defineFormConfig<Template>({
    sections: [
      defineSection({
        id: 'basic',
        title: 'Informações Básicas',
        description: 'Defina o nome e identificação do template',
        columns: 1,
        fields: [
          defineField({
            name: 'name',
            type: 'text',
            label: 'Nome do Template',
            placeholder: 'Digite o nome do template',
            required: true,
            validation: {
              minLength: 3,
              maxLength: 100,
            },
          }),
        ],
      }),
      defineSection({
        id: 'productAttributes',
        title: 'Atributos do Produto',
        description: 'Defina os atributos padrão para produtos',
        columns: 1,
        collapsible: true,
        fields: [
          defineField({
            name: 'productAttributes',
            type: 'key-value',
            label: 'Atributos',
            placeholder: 'Adicionar atributo',
            keyLabel: 'Chave',
            valueLabel: 'Valor',
          }),
        ],
      }),
      defineSection({
        id: 'variantAttributes',
        title: 'Atributos da Variante',
        description: 'Defina os atributos padrão para variantes',
        columns: 1,
        collapsible: true,
        fields: [
          defineField({
            name: 'variantAttributes',
            type: 'key-value',
            label: 'Atributos',
            placeholder: 'Adicionar atributo',
            keyLabel: 'Chave',
            valueLabel: 'Valor',
          }),
        ],
      }),
      defineSection({
        id: 'itemAttributes',
        title: 'Atributos do Item',
        description: 'Defina os atributos padrão para itens',
        columns: 1,
        collapsible: true,
        fields: [
          defineField({
            name: 'itemAttributes',
            type: 'key-value',
            label: 'Atributos',
            placeholder: 'Adicionar atributo',
            keyLabel: 'Chave',
            valueLabel: 'Valor',
          }),
        ],
      }),
    ],
    submitLabel: 'Salvar Template',
    cancelLabel: 'Cancelar',
  }),

  // ==========================================================================
  // VIEWER CONFIG
  // ==========================================================================
  viewer: defineViewerConfig<Template>({
    sections: [
      defineViewerSection({
        id: 'basic',
        title: 'Informações Básicas',
        type: 'fields',
        columns: 2,
        fields: [
          defineViewerField({
            field: 'name',
            label: 'Nome',
            format: 'text',
          }),
          defineViewerField({
            field: 'createdAt',
            label: 'Criado em',
            format: 'date',
          }),
          defineViewerField({
            field: 'updatedAt',
            label: 'Atualizado em',
            format: 'datetime',
          }),
        ],
      }),
      defineViewerSection({
        id: 'productAttrs',
        title: 'Atributos do Produto',
        type: 'fields',
        columns: 2,
        collapsible: true,
        fields: [
          defineViewerField({
            field: 'productAttributes',
            label: 'Atributos',
            format: 'json',
            emptyValue: 'Nenhum atributo definido',
          }),
        ],
      }),
      defineViewerSection({
        id: 'variantAttrs',
        title: 'Atributos da Variante',
        type: 'fields',
        columns: 2,
        collapsible: true,
        fields: [
          defineViewerField({
            field: 'variantAttributes',
            label: 'Atributos',
            format: 'json',
            emptyValue: 'Nenhum atributo definido',
          }),
        ],
      }),
      defineViewerSection({
        id: 'itemAttrs',
        title: 'Atributos do Item',
        type: 'fields',
        columns: 2,
        collapsible: true,
        fields: [
          defineViewerField({
            field: 'itemAttributes',
            label: 'Atributos',
            format: 'json',
            emptyValue: 'Nenhum atributo definido',
          }),
        ],
      }),
    ],
    allowEdit: true,
    allowDelete: true,
    showAuditLog: true,
  }),
});

// =============================================================================
// TYPE EXPORT
// =============================================================================

export type TemplatesEntityConfig = typeof templatesEntityConfig;
