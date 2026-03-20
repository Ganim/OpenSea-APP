/**
 * OpenSea OS - Payroll Entity Config
 * Configuração completa da entidade de folha de pagamento
 */

import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { Payroll } from '@/types/hr';
import { CalendarDays, Eye, Plus } from 'lucide-react';

export const payrollConfig = defineEntityConfig<Payroll>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Payroll',
  namePlural: 'Payrolls',
  slug: 'payroll',
  description: 'Geração, cálculo e pagamento de folhas de pagamento',
  icon: CalendarDays,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/hr/payrolls',
    queryKey: 'payrolls',
    queryKeys: {
      list: ['payrolls'],
      detail: (id: string) => ['payrolls', id],
    },
    endpoints: {
      list: '/v1/hr/payrolls',
      get: '/v1/hr/payrolls/:id',
      create: '/v1/hr/payrolls',
      update: '/v1/hr/payrolls/:id',
      delete: '/v1/hr/payrolls/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/hr/payroll',
    detail: '/hr/payroll/:id',
    create: '/hr/payroll/new',
    edit: '/hr/payroll/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: CalendarDays,
    color: 'sky',
    gradient: 'from-sky-500 to-sky-600',
    titleField: 'referenceMonth',
    subtitleField: 'status',
    imageField: undefined,
    labels: {
      singular: 'Folha de Pagamento',
      plural: 'Folhas de Pagamento',
      createButton: 'Nova Folha',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma folha de pagamento encontrada',
      searchPlaceholder: 'Buscar folhas de pagamento...',
    },
    badgeFields: [],
    metaFields: [
      {
        field: 'totalNet',
        label: 'Líquido',
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
    searchableFields: [],
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
        title: 'Dados da Folha',
        description: '',
        fields: [
          {
            name: 'referenceMonth',
            label: 'Mês de Referência',
            type: 'select',
            required: true,
            placeholder: 'Selecione o mês',
            colSpan: 1,
            description: '',
          },
          {
            name: 'referenceYear',
            label: 'Ano de Referência',
            type: 'number',
            required: true,
            placeholder: 'Ex.: 2026',
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

  // ======================== PERMISSÕES ========================
  permissions: {
    view: HR_PERMISSIONS.PAYROLL.ACCESS,
    create: HR_PERMISSIONS.PAYROLL.REGISTER,
    update: HR_PERMISSIONS.PAYROLL.REGISTER,
    delete: HR_PERMISSIONS.PAYROLL.ADMIN,
    export: HR_PERMISSIONS.PAYROLL.ADMIN,
    import: HR_PERMISSIONS.PAYROLL.ADMIN,
  },

  // ======================== FEATURES ========================
  features: {
    create: true,
    edit: false,
    delete: false,
    duplicate: false,
    softDelete: false,
    export: false,
    import: false,
    search: false,
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
        label: 'Nova Folha',
        icon: Plus,
        variant: 'default',
        permission: HR_PERMISSIONS.PAYROLL.REGISTER,
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: HR_PERMISSIONS.PAYROLL.ACCESS,
      },
    ],
    batch: [],
  },
});

export default payrollConfig;
