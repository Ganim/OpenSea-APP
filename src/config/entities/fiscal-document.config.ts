/**
 * OpenSea OS - Fiscal Document Entity Config
 * Configuracao completa da entidade de documentos fiscais
 */

import { FINANCE_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { FiscalDocumentDTO } from '@/types/fiscal';
import { Download, Eye, FileText, Plus, XCircle } from 'lucide-react';

export const fiscalDocumentConfig = defineEntityConfig<FiscalDocumentDTO>()({
  // ======================== IDENTIFICACAO ========================
  name: 'Documento Fiscal',
  namePlural: 'Documentos Fiscais',
  slug: 'fiscal',
  description: 'Gerenciamento de NF-e, NFC-e e documentos fiscais',
  icon: FileText,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/fiscal/documents',
    queryKey: 'fiscal-documents',
    queryKeys: {
      list: ['fiscal', 'documents'],
      detail: (id: string) => ['fiscal', 'documents', id],
    },
    endpoints: {
      list: '/v1/fiscal/documents',
      get: '/v1/fiscal/documents/:id',
      create: '/v1/fiscal/nfe',
      update: '',
      delete: '',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/finance/fiscal',
    detail: '/finance/fiscal/:id',
    create: '/finance/fiscal/new',
    edit: '',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: FileText,
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
    titleField: 'recipientName',
    subtitleField: 'accessKey',
    imageField: undefined,
    labels: {
      singular: 'Documento Fiscal',
      plural: 'Documentos Fiscais',
      createButton: 'Emitir NF-e',
      editButton: 'Visualizar',
      deleteButton: 'Cancelar',
      emptyState: 'Nenhum documento fiscal encontrado',
      searchPlaceholder:
        'Buscar por destinatário, chave de acesso ou número...',
    },
    badgeFields: [
      {
        field: 'status',
        label: 'Status',
        colorMap: {
          DRAFT: 'bg-slate-500/20 text-slate-700 dark:text-slate-400',
          PENDING: 'bg-sky-500/20 text-sky-700 dark:text-sky-400',
          AUTHORIZED:
            'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
          CANCELLED: 'bg-rose-500/20 text-rose-700 dark:text-rose-400',
          DENIED: 'bg-rose-500/20 text-rose-700 dark:text-rose-400',
          CORRECTED: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
          INUTILIZED: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
        },
        render: (value: unknown) => {
          const labels = {
            DRAFT: 'Rascunho',
            PENDING: 'Pendente',
            AUTHORIZED: 'Autorizada',
            CANCELLED: 'Cancelada',
            DENIED: 'Denegada',
            CORRECTED: 'Corrigida',
            INUTILIZED: 'Inutilizada',
          };
          return labels[value as keyof typeof labels] || String(value);
        },
      },
    ],
    metaFields: [
      {
        field: 'createdAt',
        label: 'Data de Emissao',
        format: 'date',
      },
    ],
  },

  // ======================== GRID/LISTA ========================
  grid: {
    defaultView: 'list',
    columns: {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
    },
    showViewToggle: true,
    enableDragSelection: false,
    selectable: false,
    searchableFields: ['recipientName', 'accessKey'],
    defaultSort: {
      field: 'createdAt',
      direction: 'desc',
    },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // ======================== FORMULARIO ========================
  form: {
    sections: [],
    defaultColumns: 4,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  // ======================== PERMISSOES ========================
  permissions: {
    view: FINANCE_PERMISSIONS.FISCAL.ACCESS,
    create: FINANCE_PERMISSIONS.FISCAL.REGISTER,
    update: FINANCE_PERMISSIONS.FISCAL.MODIFY,
    delete: FINANCE_PERMISSIONS.FISCAL.REMOVE,
    export: FINANCE_PERMISSIONS.FISCAL.EXPORT,
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: false,
    delete: false,
    duplicate: false,
    softDelete: false,
    export: true,
    import: false,
    search: true,
    filters: true,
    sort: true,
    pagination: true,
    selection: false,
    multiSelect: false,
    batchOperations: false,
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
        id: 'emit-nfe',
        label: 'Emitir NF-e',
        icon: Plus,
        variant: 'default',
        permission: FINANCE_PERMISSIONS.FISCAL.REGISTER,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: FINANCE_PERMISSIONS.FISCAL.ACCESS,
      },
      {
        id: 'download-danfe',
        label: 'Baixar DANFE',
        icon: Download,
        onClick: () => {},
        permission: FINANCE_PERMISSIONS.FISCAL.ACCESS,
      },
      {
        id: 'cancel',
        label: 'Cancelar',
        icon: XCircle,
        onClick: () => {},
        permission: FINANCE_PERMISSIONS.FISCAL.REMOVE,
        confirm: true,
        confirmTitle: 'Cancelar Documento Fiscal',
        confirmMessage:
          'Tem certeza que deseja cancelar este documento fiscal?',
      },
    ],
    batch: [],
  },
});

export default fiscalDocumentConfig;
