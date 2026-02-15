/**
 * Audit Logs Module Configuration
 * Definição completa da entidade Audit Logs
 */

import { AUDIT_PERMISSIONS } from '@/config/rbac/permission-codes';
import { defineEntityConfig } from '@/core/types';
import type { AuditLog } from '../types';
import { FileText } from 'lucide-react';

export const auditLogsConfig = defineEntityConfig<AuditLog>()({
  // ======================== IDENTIFICAÇÃO ========================
  name: 'Log de Auditoria',
  namePlural: 'Logs de Auditoria',
  slug: 'audit-logs',
  description: 'Visualização e análise de logs de auditoria do sistema',
  icon: FileText,

  // ======================== API ========================
  api: {
    baseUrl: '/api/v1/audit-logs',
    queryKey: 'audit-logs',
    queryKeys: {
      list: ['audit-logs'],
      detail: (id: string) => ['audit-logs', id],
    },
    endpoints: {
      list: '/v1/audit-logs',
      get: '/v1/audit-logs/:id',
      create: '/v1/audit-logs',
      update: '/v1/audit-logs/:id',
      delete: '/v1/audit-logs/:id',
    },
  },

  // ======================== ROTAS ========================
  routes: {
    list: '/admin/overview/audit-logs',
    detail: '/admin/overview/audit-logs/:id',
    create: '/admin/overview/audit-logs/new',
    edit: '/admin/overview/audit-logs/:id/edit',
  },

  // ======================== DISPLAY ========================
  display: {
    icon: FileText,
    color: 'purple',
    gradient: 'from-purple-500 to-indigo-600',
    titleField: 'action',
    subtitleField: 'entity',
    labels: {
      singular: 'Log de Auditoria',
      plural: 'Logs de Auditoria',
      createButton: 'Novo Log',
      editButton: 'Editar',
      deleteButton: 'Excluir',
      emptyState: 'Nenhum log de auditoria encontrado',
      searchPlaceholder: 'Buscar logs por ação, entidade ou descrição...',
    },
  },

  // ======================== GRID/LISTA ========================
  grid: {
    defaultView: 'list', // Audit logs são melhor visualizados em lista/timeline
    columns: {
      sm: 1,
      md: 1,
      lg: 1,
      xl: 1,
    },
    showViewToggle: false, // Desabilitar toggle, apenas timeline
  },

  // ======================== PERMISSÕES ========================
  permissions: {
    view: AUDIT_PERMISSIONS.LOGS.VIEW,
    create: AUDIT_PERMISSIONS.LOGS.VIEW,
    update: AUDIT_PERMISSIONS.LOGS.VIEW,
    delete: AUDIT_PERMISSIONS.LOGS.VIEW,
    export: AUDIT_PERMISSIONS.LOGS.SEARCH,
    import: AUDIT_PERMISSIONS.LOGS.VIEW,
  },

  // ======================== FEATURES ========================
  features: {
    create: false, // Logs são criados automaticamente
    edit: false, // Logs não devem ser editados
    delete: false, // Logs não devem ser deletados (ou apenas por admin)
    duplicate: false,
    export: true,
    import: false,
  },
});
