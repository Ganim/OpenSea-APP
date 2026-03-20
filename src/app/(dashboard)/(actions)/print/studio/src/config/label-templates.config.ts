import { SYSTEM_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { LabelTemplate } from '@/core/print-queue/editor';
import { Copy, Download, Eye, Printer, Plus, Tag, Trash2 } from 'lucide-react';

export const labelTemplatesConfig = defineEntityConfig<LabelTemplate>()({
  name: 'LabelTemplate',
  namePlural: 'LabelTemplates',
  slug: 'label-templates',
  description: 'Gerenciamento de templates de etiquetas',
  icon: Tag,

  api: {
    baseUrl: '/api/v1/label-templates',
    queryKey: 'label-templates',
    queryKeys: {
      list: ['label-templates'],
      detail: (id: string) => ['label-templates', id],
    },
    endpoints: {
      list: '/v1/label-templates',
      get: '/v1/label-templates/:id',
      create: '/v1/label-templates',
      update: '/v1/label-templates/:id',
      delete: '/v1/label-templates/:id',
      duplicate: '/v1/label-templates/:id/duplicate',
    },
  },

  routes: {
    list: '/print/studio',
    detail: '/print/studio/label/:id',
    create: '/print/studio/label',
    edit: '/print/studio/label/:id/edit',
  },

  display: {
    icon: Tag,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    titleField: 'name',
    subtitleField: 'description',
    labels: {
      singular: 'Template de Etiqueta',
      plural: 'Templates de Etiqueta',
      createButton: 'Novo Template',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum template encontrado',
      searchPlaceholder: 'Buscar templates...',
    },
    badgeFields: [{ field: 'isSystem', label: 'Tipo' }],
    metaFields: [
      { field: 'createdAt', label: 'Criado em', format: 'date' },
      { field: 'updatedAt', label: 'Atualizado em', format: 'date' },
    ],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: false,
    selectable: false,
    searchableFields: ['name', 'description'],
    defaultSort: { field: 'name', direction: 'asc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  permissions: {
    view: SYSTEM_PERMISSIONS.LABEL_TEMPLATES.ACCESS,
    create: SYSTEM_PERMISSIONS.LABEL_TEMPLATES.REGISTER,
    update: SYSTEM_PERMISSIONS.LABEL_TEMPLATES.MODIFY,
    delete: SYSTEM_PERMISSIONS.LABEL_TEMPLATES.REMOVE,
    export: SYSTEM_PERMISSIONS.LABEL_TEMPLATES.ACCESS,
    import: SYSTEM_PERMISSIONS.LABEL_TEMPLATES.REGISTER,
  },

  features: {
    create: true,
    edit: true,
    delete: true,
    duplicate: true,
    softDelete: true,
    export: true,
    import: true,
    search: true,
    filters: false,
    sort: true,
    pagination: false,
    selection: false,
    multiSelect: false,
    batchOperations: false,
    favorite: false,
    archive: false,
    auditLog: false,
    versioning: false,
    realtime: false,
  },

  actions: {
    header: [
      {
        id: 'import',
        label: 'Importar',
        icon: Download,
        variant: 'outline',
        permission: SYSTEM_PERMISSIONS.LABEL_TEMPLATES.REGISTER,
        onClick: () => {},
      },
      {
        id: 'create',
        label: 'Novo Template',
        icon: Plus,
        variant: 'default',
        permission: SYSTEM_PERMISSIONS.LABEL_TEMPLATES.REGISTER,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: SYSTEM_PERMISSIONS.LABEL_TEMPLATES.ACCESS,
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: SYSTEM_PERMISSIONS.LABEL_TEMPLATES.ACCESS,
      },
      {
        id: 'export',
        label: 'Exportar JSON',
        icon: Download,
        onClick: () => {},
        permission: SYSTEM_PERMISSIONS.LABEL_TEMPLATES.ACCESS,
      },
      {
        id: 'testPrint',
        label: 'Imprimir Teste',
        icon: Printer,
        onClick: () => {},
        permission: SYSTEM_PERMISSIONS.LABEL_TEMPLATES.ACCESS,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: SYSTEM_PERMISSIONS.LABEL_TEMPLATES.REMOVE,
        confirm: true,
        confirmTitle: 'Excluir Template',
        confirmMessage:
          'Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.',
      },
    ],
  },
});

export default labelTemplatesConfig;
