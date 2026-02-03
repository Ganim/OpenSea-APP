import { defineEntityConfig } from '@/core/types';
import type { Employee } from '@/types/hr';
import { Copy, Edit, Eye, Plus, Trash2, Users } from 'lucide-react';

export const employeesConfig = defineEntityConfig<Employee>()({
  name: 'Employee',
  namePlural: 'Employees',
  slug: 'employees',
  description: 'Gerenciamento de funcionários da organização',
  icon: Users,

  api: {
    baseUrl: '/api/v1/hr/employees',
    queryKey: 'employees',
    queryKeys: {
      list: ['employees'],
      detail: (id: string) => ['employees', id],
    },
    endpoints: {
      list: '/v1/hr/employees',
      get: '/v1/hr/employees/:id',
      create: '/v1/hr/employees',
      update: '/v1/hr/employees/:id',
      delete: '/v1/hr/employees/:id',
    },
  },

  routes: {
    list: '/hr/employees',
    detail: '/hr/employees/:id',
    create: '/hr/employees/new',
    edit: '/hr/employees/:id/edit',
  },

  display: {
    icon: Users,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    titleField: 'fullName',
    subtitleField: undefined,
    imageField: undefined,
    labels: {
      singular: 'Funcionário',
      plural: 'Funcionários',
      createButton: 'Novo Funcionário',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum funcionário encontrado',
      searchPlaceholder: 'Buscar funcionários...',
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
    searchableFields: ['fullName', 'registrationNumber', 'cpf'],
    defaultSort: {
      field: 'fullName',
      direction: 'asc',
    },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  form: {
    sections: [
      {
        id: 'basic',
        title: 'Informações Básicas',
        description: '',
        fields: [
          {
            name: 'fullName',
            label: 'Nome Completo',
            type: 'text',
            required: true,
            placeholder: 'Ex: João da Silva',
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

  permissions: {
    view: 'employees.view',
    create: 'employees.create',
    update: 'employees.update',
    delete: 'employees.delete',
    export: 'employees.export',
    import: 'employees.import',
  },

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

  actions: {
    header: [
      {
        id: 'create',
        label: 'Novo Funcionário',
        icon: Plus,
        variant: 'default',
        permission: 'employees.create',
        onClick: () => {},
      },
    ],
    item: [
      {
        id: 'view',
        label: 'Visualizar',
        icon: Eye,
        onClick: () => {},
        permission: 'employees.view',
      },
      {
        id: 'edit',
        label: 'Editar',
        icon: Edit,
        onClick: () => {},
        permission: 'employees.update',
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        icon: Copy,
        onClick: () => {},
        permission: 'employees.create',
      },
      {
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {},
        permission: 'employees.delete',
        confirm: true,
        confirmTitle: 'Excluir Funcionário',
        confirmMessage: 'Tem certeza que deseja excluir este funcionário?',
      },
    ],
    batch: [
      {
        id: 'delete',
        label: 'Excluir Selecionados',
        icon: Trash2,
        onClick: () => {},
        variant: 'destructive',
        permission: 'employees.delete',
        confirm: true,
        confirmTitle: 'Excluir Funcionários',
        confirmMessage:
          'Tem certeza que deseja excluir os funcionários selecionados?',
      },
    ],
  },
});

export default employeesConfig;
