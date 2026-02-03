/**
 * Audit Log Utils
 * Funções utilitárias para o módulo de Audit Log
 */

import type { TimelineItemData } from '@/components/shared/timeline';
import {
  AlertCircle,
  Briefcase,
  Calculator,
  Calendar,
  Check,
  Clock,
  CreditCard,
  FileText,
  Key,
  LogIn,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Shield,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import {
  ACTION_STYLES,
  getActionLabel,
  getEntityLabel,
  getModuleLabel,
} from '../constants';
import { AuditAction, type AuditLog } from '../types';

// ============================================
// CONVERT TO TIMELINE
// ============================================

export function convertAuditLogToTimeline(log: AuditLog): TimelineItemData {
  const actionType = getTimelineType(log.action);
  const icon = getActionIcon(log.action);

  return {
    id: log.id,
    type: actionType,
    title: `${getActionLabel(log.action)} - ${getEntityLabel(log.entity)}`,
    description: log.description || undefined,
    timestamp: log.createdAt,
    user: log.userId
      ? {
          id: log.userId,
          name: log.userName || log.userId,
        }
      : undefined,
    icon,
    badge: {
      label: getActionLabel(log.action),
      variant: getBadgeVariant(log.action),
    },
    changes: extractChanges(log),
    metadata: log.entityId ? `ID: ${log.entityId}` : undefined,
  };
}

export function convertAuditLogsToTimeline(
  logs: AuditLog[]
): TimelineItemData[] {
  return logs.map(convertAuditLogToTimeline);
}

// ============================================
// HUMANIZED NARRATIVE
// ============================================

export function formatAuditTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

/**
 * Formata a narrativa do audit log para exibição
 * Prioriza o campo description do backend quando disponível
 */
export function formatAuditNarrative(log: AuditLog) {
  const actor = getActorDisplay(log);
  const target = getTargetDisplay(log);
  const timestamp = formatAuditTimestamp(log.createdAt);

  // Se temos uma description formatada do backend, usamos ela
  // A description já vem com os placeholders substituídos
  if (log.description && !log.description.includes('{{')) {
    return {
      sentence: log.description,
      actor,
      target,
      verb: getActionVerb(log.action),
      timestamp,
    };
  }

  // Fallback: gera uma sentença genérica
  const verb = getActionVerb(log.action);
  const sentence = `${actor.label} ${verb} ${target.label}.`;

  return {
    sentence,
    actor,
    target,
    verb,
    timestamp,
  };
}

// ============================================
// ACTOR & TARGET HELPERS
// ============================================

/**
 * Retorna informações sobre quem executou a ação
 * Prioriza userName quando disponível
 */
export function getActorDisplay(log: AuditLog) {
  const isSystem = !log.userId;

  // Prioriza userName, depois tenta extrair do newData/oldData
  let label = 'Sistema';

  if (!isSystem) {
    if (log.userName) {
      label = log.userName;
    } else if (log.newData && typeof log.newData === 'object') {
      // Tenta extrair nome de newData para ações de criação
      const data = log.newData as Record<string, unknown>;
      if (data.userName && typeof data.userName === 'string') {
        label = data.userName;
      } else if (data.name && typeof data.name === 'string') {
        label = data.name;
      } else if (data.email && typeof data.email === 'string') {
        label = data.email;
      } else {
        // Último recurso: mostra ID truncado
        label = `Usuário ${log.userId?.slice(0, 8)}...`;
      }
    } else {
      label = `Usuário ${log.userId?.slice(0, 8)}...`;
    }
  }

  // Informação sobre grupos de permissão
  const groupsInfo =
    log.userPermissionGroups && log.userPermissionGroups.length > 0
      ? `Grupos: ${log.userPermissionGroups.map(g => g.name).join(', ')}`
      : '';

  return {
    label,
    isSystem,
    description: isSystem
      ? 'Ação executada automaticamente pelo sistema'
      : groupsInfo || 'Usuário autenticado',
  };
}

/**
 * Retorna informações sobre o alvo da ação
 * Tenta extrair nome da entidade dos dados quando possível
 */
export function getTargetDisplay(log: AuditLog) {
  const base = getEntityLabel(log.entity);

  // Tenta extrair o nome da entidade dos dados
  let entityName: string | null = null;

  const data = log.newData || log.oldData;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    // Tenta diferentes campos comuns para nome
    entityName =
      (typeof record.name === 'string' ? record.name : null) ||
      (typeof record.title === 'string' ? record.title : null) ||
      (typeof record.userName === 'string' ? record.userName : null) ||
      (typeof record.email === 'string' ? record.email : null) ||
      (typeof record.sku === 'string' ? record.sku : null) ||
      (typeof record.code === 'string' ? record.code : null);
  }

  // Monta o label com nome da entidade quando disponível
  let label: string;
  if (entityName) {
    label = `${base} "${entityName}"`;
  } else if (log.entityId) {
    // Se não tem nome, mostra ID truncado
    const shortId =
      log.entityId.length > 8 ? `${log.entityId.slice(0, 8)}...` : log.entityId;
    label = `${base} #${shortId}`;
  } else {
    label = base;
  }

  return {
    label,
    base,
    entityName,
    identifier: log.entityId,
  };
}

// ============================================
// ACTION VERB MAPPING
// ============================================

const ACTION_VERBS: Partial<Record<AuditAction | string, string>> = {
  // CRUD
  CREATE: 'criou',
  UPDATE: 'atualizou',
  DELETE: 'removeu',
  RESTORE: 'restaurou',

  // Auth
  LOGIN: 'acessou o sistema',
  LOGOUT: 'saiu do sistema',
  SESSION_REFRESH: 'renovou a sessão',
  SESSION_EXPIRE: 'expirou a sessão de',
  SESSION_REVOKE: 'revogou a sessão de',

  // Password
  PASSWORD_CHANGE: 'alterou a senha',
  PASSWORD_RESET_REQUEST: 'solicitou reset de senha',
  PASSWORD_RESET_COMPLETE: 'redefiniu a senha',
  PASSWORD_FORCE_RESET: 'forçou reset de senha de',

  // Profile
  EMAIL_CHANGE: 'alterou o email',
  USERNAME_CHANGE: 'alterou o username',
  PROFILE_CHANGE: 'atualizou o perfil',

  // RBAC
  PERMISSION_GRANT: 'concedeu permissão',
  PERMISSION_REVOKE: 'revogou permissão',
  PERMISSION_UPDATE: 'atualizou permissão',
  GROUP_ASSIGN: 'adicionou ao grupo',
  GROUP_REMOVE: 'removeu do grupo',
  PERMISSION_ADD_TO_GROUP: 'adicionou permissão ao grupo',
  PERMISSION_REMOVE_FROM_GROUP: 'removeu permissão do grupo',

  // Stock
  PRICE_CHANGE: 'alterou o preço de',
  STOCK_ENTRY: 'registrou entrada de',
  STOCK_EXIT: 'registrou saída de',
  STOCK_TRANSFER: 'transferiu',
  STOCK_ADJUSTMENT: 'ajustou estoque de',

  // Orders
  ORDER_CREATE: 'criou pedido',
  ORDER_CANCEL: 'cancelou pedido',
  STATUS_CHANGE: 'alterou status de',

  // Reservations
  RESERVATION_CREATE: 'criou reserva',
  RESERVATION_RELEASE: 'liberou reserva',

  // HR - Employees
  EMPLOYEE_HIRE: 'contratou',
  EMPLOYEE_TERMINATE: 'desligou',
  EMPLOYEE_TRANSFER: 'transferiu',
  EMPLOYEE_LINK_USER: 'vinculou usuário a',

  // HR - Time
  CLOCK_IN: 'registrou entrada',
  CLOCK_OUT: 'registrou saída',
  TIME_CALCULATE: 'calculou tempo de',
  TIME_BANK_CREDIT: 'creditou horas em',
  TIME_BANK_DEBIT: 'debitou horas de',
  TIME_BANK_ADJUST: 'ajustou banco de horas de',

  // HR - Absences
  ABSENCE_REQUEST: 'solicitou ausência',
  ABSENCE_APPROVE: 'aprovou ausência de',
  ABSENCE_REJECT: 'rejeitou ausência de',
  ABSENCE_CANCEL: 'cancelou ausência de',
  VACATION_SCHEDULE: 'agendou férias de',
  VACATION_START: 'iniciou férias de',
  VACATION_COMPLETE: 'finalizou férias de',
  VACATION_CANCEL: 'cancelou férias de',
  VACATION_SELL: 'vendeu férias de',

  // HR - Overtime
  OVERTIME_REQUEST: 'solicitou hora extra',
  OVERTIME_APPROVE: 'aprovou hora extra de',

  // Payroll
  PAYROLL_CREATE: 'criou folha de pagamento',
  PAYROLL_CALCULATE: 'calculou folha de pagamento',
  PAYROLL_APPROVE: 'aprovou folha de pagamento',
  PAYROLL_CANCEL: 'cancelou folha de pagamento',
  PAYROLL_PAY: 'pagou folha de pagamento',

  // Requests
  REQUEST_CREATE: 'criou solicitação',
  REQUEST_ASSIGN: 'atribuiu solicitação a',
  REQUEST_COMPLETE: 'completou solicitação',
  REQUEST_CANCEL: 'cancelou solicitação',
  REQUEST_COMMENT: 'comentou em solicitação',
  REQUEST_INFO: 'solicitou informações sobre',
  REQUEST_INFO_PROVIDE: 'forneceu informações sobre',

  // Notifications
  NOTIFICATION_SEND: 'enviou notificação',
  NOTIFICATION_READ: 'leu notificação',
  NOTIFICATION_DELETE: 'excluiu notificação',

  // Checks
  CHECK_CPF: 'verificou CPF',
  CHECK_CNPJ: 'verificou CNPJ',

  // System
  EXPORT: 'exportou dados de',
  IMPORT: 'importou dados para',
  SYNC: 'sincronizou',
  OTHER: 'executou ação em',
};

export function getActionVerb(action: AuditAction | string): string {
  return ACTION_VERBS[action] || 'executou ação em';
}

// ============================================
// STYLE HELPERS
// ============================================

export function getActionStyle(action: AuditAction | string) {
  return (
    ACTION_STYLES[action as AuditAction] || ACTION_STYLES[AuditAction.OTHER]
  );
}

export function countChangedFields(log: AuditLog): number {
  const changes = extractChanges(log);
  return changes ? changes.length : 0;
}

export function buildMetadataChips(log: AuditLog) {
  const chips: Array<{ label: string; value: string }> = [];

  chips.push({ label: 'Acao', value: getActionLabel(log.action) });
  chips.push({ label: 'Modulo', value: getModuleLabel(log.module) });
  chips.push({ label: 'Entidade', value: getEntityLabel(log.entity) });
  if (log.entityId) chips.push({ label: 'ID', value: String(log.entityId) });
  if (log.ip) chips.push({ label: 'IP', value: log.ip });
  if (log.method && log.endpoint)
    chips.push({ label: 'Endpoint', value: `${log.method} ${log.endpoint}` });

  return chips;
}

// ============================================
// TYPE MAPPING
// ============================================

function getTimelineType(
  action: AuditAction | string
): TimelineItemData['type'] {
  const typeMap: Partial<
    Record<AuditAction | string, TimelineItemData['type']>
  > = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    RESTORE: 'restore',
    LOGIN: 'success',
    LOGOUT: 'info',
    PASSWORD_CHANGE: 'warning',
    PRICE_CHANGE: 'update',
    STOCK_ADJUSTMENT: 'update',
    STATUS_CHANGE: 'update',
    PERMISSION_GRANT: 'success',
    PERMISSION_REVOKE: 'warning',
    EXPORT: 'info',
    IMPORT: 'info',
    SYNC: 'info',
    OTHER: 'info',
  };

  return typeMap[action] || 'info';
}

// ============================================
// ICON MAPPING
// ============================================

function getActionIcon(action: AuditAction | string) {
  const iconMap: Partial<Record<AuditAction | string, typeof Clock>> = {
    // CRUD
    CREATE: Plus,
    UPDATE: RefreshCw,
    DELETE: Trash2,
    RESTORE: RotateCcw,

    // Auth
    LOGIN: LogIn,
    LOGOUT: LogOut,
    SESSION_REFRESH: RefreshCw,
    SESSION_EXPIRE: Clock,
    SESSION_REVOKE: XCircle,

    // Password
    PASSWORD_CHANGE: Key,
    PASSWORD_RESET_REQUEST: Key,
    PASSWORD_RESET_COMPLETE: Check,
    PASSWORD_FORCE_RESET: Key,

    // Profile
    EMAIL_CHANGE: Mail,
    USERNAME_CHANGE: User,
    PROFILE_CHANGE: User,

    // RBAC
    PERMISSION_GRANT: Shield,
    PERMISSION_REVOKE: Shield,
    PERMISSION_UPDATE: Shield,
    GROUP_ASSIGN: Users,
    GROUP_REMOVE: Users,
    PERMISSION_ADD_TO_GROUP: Shield,
    PERMISSION_REMOVE_FROM_GROUP: Shield,

    // Stock
    PRICE_CHANGE: CreditCard,
    STOCK_ENTRY: TrendingUp,
    STOCK_EXIT: TrendingDown,
    STOCK_TRANSFER: Package,
    STOCK_ADJUSTMENT: Package,

    // Orders
    ORDER_CREATE: FileText,
    ORDER_CANCEL: XCircle,
    STATUS_CHANGE: RefreshCw,

    // Reservations
    RESERVATION_CREATE: Calendar,
    RESERVATION_RELEASE: Calendar,

    // HR
    EMPLOYEE_HIRE: UserPlus,
    EMPLOYEE_TERMINATE: UserMinus,
    EMPLOYEE_TRANSFER: Users,
    EMPLOYEE_LINK_USER: UserCheck,
    CLOCK_IN: Clock,
    CLOCK_OUT: Clock,
    TIME_CALCULATE: Calculator,
    TIME_BANK_CREDIT: TrendingUp,
    TIME_BANK_DEBIT: TrendingDown,
    TIME_BANK_ADJUST: Clock,
    ABSENCE_REQUEST: Calendar,
    ABSENCE_APPROVE: Check,
    ABSENCE_REJECT: XCircle,
    ABSENCE_CANCEL: XCircle,
    VACATION_SCHEDULE: Calendar,
    VACATION_START: Calendar,
    VACATION_COMPLETE: Check,
    VACATION_CANCEL: XCircle,
    VACATION_SELL: CreditCard,
    OVERTIME_REQUEST: Clock,
    OVERTIME_APPROVE: Check,

    // Payroll
    PAYROLL_CREATE: CreditCard,
    PAYROLL_CALCULATE: Calculator,
    PAYROLL_APPROVE: Check,
    PAYROLL_CANCEL: XCircle,
    PAYROLL_PAY: CreditCard,

    // Requests
    REQUEST_CREATE: FileText,
    REQUEST_ASSIGN: Users,
    REQUEST_COMPLETE: Check,
    REQUEST_CANCEL: XCircle,
    REQUEST_COMMENT: MessageSquare,
    REQUEST_INFO: AlertCircle,
    REQUEST_INFO_PROVIDE: MessageSquare,

    // Notifications
    NOTIFICATION_SEND: Send,
    NOTIFICATION_READ: Check,
    NOTIFICATION_DELETE: Trash2,

    // Checks
    CHECK_CPF: Search,
    CHECK_CNPJ: Briefcase,

    // System
    EXPORT: TrendingUp,
    IMPORT: TrendingDown,
    SYNC: RefreshCw,
    OTHER: AlertCircle,
  };

  return iconMap[action] || Clock;
}

// ============================================
// BADGE VARIANT
// ============================================

function getBadgeVariant(
  action: AuditAction | string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variantMap: Partial<
    Record<
      AuditAction | string,
      'default' | 'secondary' | 'destructive' | 'outline'
    >
  > = {
    CREATE: 'default',
    UPDATE: 'secondary',
    DELETE: 'destructive',
    RESTORE: 'default',
    LOGIN: 'default',
    LOGOUT: 'secondary',
    PASSWORD_CHANGE: 'outline',
    PRICE_CHANGE: 'secondary',
    STOCK_ADJUSTMENT: 'secondary',
    STATUS_CHANGE: 'secondary',
    PERMISSION_GRANT: 'default',
    PERMISSION_REVOKE: 'destructive',
    EXPORT: 'outline',
    IMPORT: 'outline',
    SYNC: 'outline',
    OTHER: 'outline',
  };

  return variantMap[action] || 'outline';
}

// ============================================
// EXTRACT CHANGES
// ============================================

function extractChanges(log: AuditLog): TimelineItemData['changes'] {
  if (!log.oldData || !log.newData) {
    return undefined;
  }

  const changes: TimelineItemData['changes'] = [];
  const oldData = log.oldData as Record<string, unknown>;
  const newData = log.newData as Record<string, unknown>;

  // Compare old and new data
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  allKeys.forEach(key => {
    const oldValue = oldData[key];
    const newValue = newData[key];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue: formatValue(oldValue),
        newValue: formatValue(newValue),
        label: formatFieldLabel(key),
      });
    }
  });

  return changes.length > 0 ? changes : undefined;
}

// ============================================
// FORMAT HELPERS
// ============================================

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Nao';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Nome',
  email: 'Email',
  username: 'Username',
  password: 'Senha',
  price: 'Preco',
  quantity: 'Quantidade',
  status: 'Status',
  description: 'Descricao',
  createdAt: 'Criado em',
  updatedAt: 'Atualizado em',
  deletedAt: 'Excluido em',
  sku: 'SKU',
  title: 'Titulo',
  active: 'Ativo',
  enabled: 'Habilitado',
  role: 'Cargo',
  department: 'Departamento',
  position: 'Posicao',
  company: 'Empresa',
  employee: 'Funcionario',
  user: 'Usuario',
  product: 'Produto',
  variant: 'Variante',
  category: 'Categoria',
  supplier: 'Fornecedor',
  manufacturer: 'Fabricante',
  customer: 'Cliente',
  order: 'Pedido',
  startDate: 'Data Inicio',
  endDate: 'Data Fim',
  dueDate: 'Data Vencimento',
  amount: 'Valor',
  total: 'Total',
  discount: 'Desconto',
  tax: 'Imposto',
};

function formatFieldLabel(field: string): string {
  // Check if we have a predefined label
  if (FIELD_LABELS[field]) {
    return FIELD_LABELS[field];
  }

  // Convert camelCase to Title Case
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// ============================================
// FILTER HELPERS
// ============================================

export function filterAuditLogs(
  logs: AuditLog[],
  filters: {
    action?: string;
    entity?: string;
    module?: string;
    userId?: string;
    search?: string;
  }
): AuditLog[] {
  return logs.filter(log => {
    if (filters.action && log.action !== filters.action) return false;
    if (filters.entity && log.entity !== filters.entity) return false;
    if (filters.module && log.module !== filters.module) return false;
    if (filters.userId && log.userId !== filters.userId) return false;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchable = [
        log.description,
        log.entityId,
        log.userName,
        getActionLabel(log.action),
        getEntityLabel(log.entity),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!searchable.includes(searchLower)) return false;
    }

    return true;
  });
}
