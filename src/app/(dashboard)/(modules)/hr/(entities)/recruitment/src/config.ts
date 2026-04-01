import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { JobPosting, Candidate } from '@/types/hr';
import { Briefcase, User } from 'lucide-react';

export const jobPostingsConfig = defineEntityConfig<JobPosting>()({
  name: 'JobPosting',
  namePlural: 'JobPostings',
  slug: 'job-postings',
  description: 'Gerenciamento de vagas',
  icon: Briefcase,

  api: {
    baseUrl: '/api/v1/hr/recruitment/job-postings',
    queryKey: 'job-postings',
    queryKeys: {
      list: ['job-postings'],
      detail: (id: string) => ['job-postings', id],
    },
    endpoints: {
      list: '/v1/hr/recruitment/job-postings',
      get: '/v1/hr/recruitment/job-postings/:id',
      create: '/v1/hr/recruitment/job-postings',
      update: '/v1/hr/recruitment/job-postings/:id',
      delete: '/v1/hr/recruitment/job-postings/:id',
    },
  },

  routes: {
    list: '/hr/recruitment',
    detail: '/hr/recruitment/:id',
    create: '/hr/recruitment/new',
    edit: '/hr/recruitment/:id/edit',
  },

  display: {
    icon: Briefcase,
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
    titleField: 'title',
    subtitleField: 'location',
    imageField: undefined,
    labels: {
      singular: 'Vaga',
      plural: 'Vagas',
      createButton: 'Nova Vaga',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhuma vaga encontrada',
      searchPlaceholder: 'Buscar vagas...',
    },
    badgeFields: [],
    metaFields: [{ field: 'createdAt', label: 'Criado em', format: 'date' }],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['title', 'location'],
    defaultSort: { field: 'title', direction: 'asc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50],
  },

  form: {
    sections: [],
    defaultColumns: 2,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  permissions: {
    view: HR_PERMISSIONS.RECRUITMENT.ACCESS,
    create: HR_PERMISSIONS.RECRUITMENT.REGISTER,
    update: HR_PERMISSIONS.RECRUITMENT.MODIFY,
    delete: HR_PERMISSIONS.RECRUITMENT.REMOVE,
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
    multiSelect: true,
    batchOperations: false,
    favorite: false,
    archive: false,
    auditLog: true,
    versioning: false,
    realtime: false,
  },

  actions: {
    header: [],
    item: [],
    batch: [],
  },
});

export const candidatesConfig = defineEntityConfig<Candidate>()({
  name: 'Candidate',
  namePlural: 'Candidates',
  slug: 'candidates',
  description: 'Gerenciamento de candidatos',
  icon: User,

  api: {
    baseUrl: '/api/v1/hr/recruitment/candidates',
    queryKey: 'candidates',
    queryKeys: {
      list: ['candidates'],
      detail: (id: string) => ['candidates', id],
    },
    endpoints: {
      list: '/v1/hr/recruitment/candidates',
      get: '/v1/hr/recruitment/candidates/:id',
      create: '/v1/hr/recruitment/candidates',
      update: '/v1/hr/recruitment/candidates/:id',
      delete: '/v1/hr/recruitment/candidates/:id',
    },
  },

  routes: {
    list: '/hr/recruitment/candidates',
    detail: '/hr/recruitment/candidates/:id',
    create: '/hr/recruitment/candidates/new',
    edit: '/hr/recruitment/candidates/:id/edit',
  },

  display: {
    icon: User,
    color: 'teal',
    gradient: 'from-teal-500 to-teal-600',
    titleField: 'fullName',
    subtitleField: 'email',
    imageField: undefined,
    labels: {
      singular: 'Candidato',
      plural: 'Candidatos',
      createButton: 'Novo Candidato',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum candidato encontrado',
      searchPlaceholder: 'Buscar candidatos...',
    },
    badgeFields: [],
    metaFields: [{ field: 'createdAt', label: 'Criado em', format: 'date' }],
  },

  grid: {
    defaultView: 'grid',
    columns: { sm: 1, md: 2, lg: 3, xl: 4 },
    showViewToggle: true,
    enableDragSelection: true,
    selectable: true,
    searchableFields: ['fullName', 'email'],
    defaultSort: { field: 'fullName', direction: 'asc' },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50],
  },

  form: {
    sections: [],
    defaultColumns: 2,
    validateOnBlur: true,
    showRequiredIndicator: true,
  },

  permissions: {
    view: HR_PERMISSIONS.RECRUITMENT.ACCESS,
    create: HR_PERMISSIONS.RECRUITMENT.REGISTER,
    update: HR_PERMISSIONS.RECRUITMENT.MODIFY,
    delete: HR_PERMISSIONS.RECRUITMENT.REMOVE,
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
    multiSelect: true,
    batchOperations: false,
    favorite: false,
    archive: false,
    auditLog: true,
    versioning: false,
    realtime: false,
  },

  actions: {
    header: [],
    item: [],
    batch: [],
  },
});
