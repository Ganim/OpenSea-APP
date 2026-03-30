/**
 * PPE (EPI) Entity Config
 */

import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { defineEntityConfig } from '@/core/types';
import type { PPEItem } from '@/types/hr';
import { Eye, HardHat, Plus, Trash2 } from 'lucide-react';

export const ppeConfig = defineEntityConfig<PPEItem>()({
  name: 'PPEItem',
  namePlural: 'PPEItems',
  slug: 'ppe',
  description: 'Gerenciamento de Equipamentos de Proteção Individual (EPI)',
  icon: HardHat,

  api: {
    baseUrl: '/api/v1/hr/ppe-items',
    queryKey: 'ppe-items',
    queryKeys: {
      list: ['ppe', 'items'],
      detail: (id: string) => ['ppe', 'items', id],
    },
    endpoints: {
      list: '/v1/hr/ppe-items',
      get: '/v1/hr/ppe-items/:id',
      create: '/v1/hr/ppe-items',
      update: '/v1/hr/ppe-items/:id',
      delete: '/v1/hr/ppe-items/:id',
    },
  },

  routes: {
    list: '/hr/ppe',
    detail: '/hr/ppe/:id',
    create: '/hr/ppe/new',
    edit: '/hr/ppe/:id/edit',
  },

  display: {
    icon: HardHat,
    color: 'sky',
    gradient: 'from-sky-500 to-sky-600',
    titleField: 'name',
    subtitleField: 'manufacturer',
    imageField: undefined,
    labels: {
      singular: 'EPI',
      plural: 'Equipamentos de Proteção Individual',
      createButton: 'Novo EPI',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum EPI cadastrado',
      searchPlaceholder: 'Buscar EPI por nome, CA ou fabricante...',
    },
    badgeFields: [],
    metaFields: [
      {
        field: 'category',
        label: 'Categoria',
        format: 'text',
      },
      {
        field: 'currentStock',
        label: 'Estoque',
        format: 'number',
      },
    ],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['name', 'caNumber', 'manufacturer'],
    defaultSort: { field: 'name', direction: 'asc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informações do EPI',
        description: '',
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Nome do EPI',
            colSpan: 2,
            description: '',
          },
          {
            name: 'category',
            label: 'Categoria',
            type: 'select',
            required: true,
            placeholder: 'Selecionar categoria',
            colSpan: 1,
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

  permissions: {
    view: HR_PERMISSIONS.PPE.LIST,
    create: HR_PERMISSIONS.PPE.CREATE,
    update: HR_PERMISSIONS.PPE.UPDATE,
    delete: HR_PERMISSIONS.PPE.DELETE,
    export: HR_PERMISSIONS.PPE.MANAGE,
    import: HR_PERMISSIONS.PPE.MANAGE,
  },

  features: {
    create: true,
    edit: true,
    delete: true,
    duplicate: false,
    softDelete: true,
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

  actions: {
    header: [
      {
        id: 'create',
        label: 'Novo EPI',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.PPE.CREATE,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.PPE.LIST,
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: HR_PERMISSIONS.PPE.DELETE,
        confirm: true,
        confirmTitle: 'Excluir EPI',
        confirmMessage: 'Tem certeza que deseja excluir este EPI?',
      },
    ],
    batch: [],
  },
});

export default ppeConfig;
