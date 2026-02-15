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
  getEntityArticle,
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
 * Segmento estilizado da narrativa do backend.
 * - 'text': texto normal (verbo/preposições) — renderizado em negrito
 * - 'chip': nome de entidade — renderizado como pill/chip
 */
export interface NarrativeSegment {
  type: 'text' | 'chip';
  value: string;
}

/** Chaves de placeholder que representam nomes de entidades (devem virar chips) */
const ENTITY_PLACEHOLDER_KEYS = new Set([
  'userName',
  'groupName',
  'permissionCode',
  'templateName',
  'oldUsername',
  'newUsername',
  'oldEmail',
  'newEmail',
  'employeeName',
  'companyName',
  'sourceTemplateName',
  'newTemplateName',
]);

/**
 * Divide uma frase em segmentos estilizados (text + chip)
 * com base nos valores de placeholder encontrados na string.
 */
function splitIntoSegments(
  text: string,
  entityValues: string[]
): NarrativeSegment[] {
  if (entityValues.length === 0) {
    return [{ type: 'text', value: text }];
  }

  // Escapa para regex e ordena do mais longo para o mais curto (evita match parcial)
  const sorted = [...entityValues].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'g');

  const segments: NarrativeSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(regex)) {
    const idx = match.index!;
    if (idx > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, idx) });
    }
    segments.push({ type: 'chip', value: match[0] });
    lastIndex = idx + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
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
    // Extrai o "restante" da frase removendo o nome do ator do início
    // para que o card possa renderizar [Actor Pill] + restante
    const restOfSentence = log.description.startsWith(actor.label)
      ? log.description.slice(actor.label.length).trim()
      : null;

    // Extrai valores de entidade dos placeholders armazenados em newData._placeholders
    const placeholders =
      log.newData &&
      typeof log.newData === 'object' &&
      '_placeholders' in log.newData
        ? (log.newData._placeholders as Record<
            string,
            string | number | null | undefined
          >)
        : null;

    const entityValues: string[] = [];
    if (placeholders) {
      for (const [key, val] of Object.entries(placeholders)) {
        if (
          ENTITY_PLACEHOLDER_KEYS.has(key) &&
          val != null &&
          String(val).length > 0
        ) {
          entityValues.push(String(val));
        }
      }
    }

    const segments = restOfSentence
      ? splitIntoSegments(restOfSentence, entityValues)
      : null;

    return {
      sentence: log.description,
      actor,
      target,
      verb: getActionVerb(log.action),
      timestamp,
      fromBackend: true as const,
      restOfSentence,
      segments,
    };
  }

  // Fallback: gera uma sentença genérica
  const verb = getActionVerb(log.action);
  const sentence = target.selfContained
    ? `${actor.label} ${verb}.`
    : target.article
      ? `${actor.label} ${verb} ${target.article} ${target.label}.`
      : `${actor.label} ${verb} ${target.label}.`;

  return {
    sentence,
    actor,
    target,
    verb,
    timestamp,
    fromBackend: false as const,
    restOfSentence: null,
    segments: null,
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

  // Cor do grupo de permissão com maior prioridade (quando disponível)
  const groupColor =
    log.userPermissionGroups && log.userPermissionGroups.length > 0
      ? [...log.userPermissionGroups].sort((a, b) => b.priority - a.priority)[0]
          .color
      : null;

  return {
    label,
    isSystem,
    groupColor,
    description: isSystem
      ? 'Ação executada automaticamente pelo sistema'
      : groupsInfo || 'Usuário autenticado',
  };
}

// ============================================
// ARTICLE CONNECTOR SYSTEM
// Contrações de preposição + artigo em PT-BR
// ============================================

/** Verbos auto-suficientes – a label da entidade é suprimida no card */
const SELF_CONTAINED_ACTIONS = new Set([
  'LOGIN',
  'LOGOUT',
  'PASSWORD_CHANGE',
  'PASSWORD_RESET_REQUEST',
  'PASSWORD_RESET_COMPLETE',
  'PASSWORD_FORCE_RESET',
  'PIN_CHANGE',
  'PIN_FORCE_RESET',
  'EMAIL_CHANGE',
  'USERNAME_CHANGE',
  'PROFILE_CHANGE',
  'CHECK_CPF',
  'CHECK_CNPJ',
  'CLOCK_IN',
  'CLOCK_OUT',
]);

/** Verbos que já terminam com conector (ao/do/da/em) – sem artigo adicional */
const PRECONNECTED_ACTIONS = new Set([
  'GROUP_ASSIGN', // "adicionou ao"
  'GROUP_REMOVE', // "removeu do"
  'PERMISSION_ADD_TO_GROUP', // "adicionou permissões ao"
  'PERMISSION_REMOVE_FROM_GROUP', // "removeu permissões do"
  'OTHER', // "executou ação em"
]);

/** Verbos que precisam da contração de+artigo (do/da) */
const DE_CONNECTOR_ACTIONS = new Set([
  'PRICE_CHANGE', // "alterou o preço" + do/da
  'STOCK_ENTRY', // "registrou entrada" + do/da
  'STOCK_EXIT', // "registrou saída" + do/da
  'STOCK_ADJUSTMENT', // "ajustou estoque" + do/da
  'STATUS_CHANGE', // "alterou status" + do/da
  'TIME_CALCULATE', // "calculou tempo" + do/da
  'TIME_BANK_CREDIT', // "creditou horas" + do/da
  'TIME_BANK_DEBIT', // "debitou horas" + do/da
  'PAYMENT_REGISTER', // "registrou pagamento" + do/da
  'PAYMENT_CANCEL', // "cancelou pagamento" + do/da
  'CONTEMPLATION', // "registrou contemplação" + do/da
]);

/** Verbos que precisam da contração em+artigo (no/na) */
const EM_CONNECTOR_ACTIONS = new Set([
  'REQUEST_COMMENT', // "comentou" + no/na
]);

/** Verbos que precisam da contração a+artigo (ao/à) */
const A_CONNECTOR_ACTIONS = new Set([
  'EMPLOYEE_LINK_USER', // "vinculou usuário" + ao/à
]);

function contractDe(article: string): string {
  if (article === 'o') return 'do';
  if (article === 'a') return 'da';
  if (article === 'os') return 'dos';
  if (article === 'as') return 'das';
  return `de ${article}`;
}

function contractEm(article: string): string {
  if (article === 'o') return 'no';
  if (article === 'a') return 'na';
  if (article === 'os') return 'nos';
  if (article === 'as') return 'nas';
  return `em ${article}`;
}

function contractA(article: string): string {
  if (article === 'o') return 'ao';
  if (article === 'a') return 'à';
  if (article === 'os') return 'aos';
  if (article === 'as') return 'às';
  return `a ${article}`;
}

/**
 * Retorna o conector (artigo simples ou contração) entre verbo e label da entidade.
 * Ex: "criou" → "o" | "registrou entrada" → "do" | "acessou o sistema" → ""
 */
function getArticleConnector(action: string, entity: string): string {
  if (SELF_CONTAINED_ACTIONS.has(action)) return '';
  if (PRECONNECTED_ACTIONS.has(action)) return '';

  const baseArticle = getEntityArticle(entity);

  if (DE_CONNECTOR_ACTIONS.has(action)) return contractDe(baseArticle);
  if (EM_CONNECTOR_ACTIONS.has(action)) return contractEm(baseArticle);
  if (A_CONNECTOR_ACTIONS.has(action)) return contractA(baseArticle);

  return baseArticle;
}

/**
 * Retorna informações sobre o alvo da ação
 * Tenta extrair nome da entidade dos dados quando possível
 */
export function getTargetDisplay(log: AuditLog) {
  const base = getEntityLabel(log.entity);
  const selfContained = SELF_CONTAINED_ACTIONS.has(log.action);

  // Tenta extrair o nome da entidade dos dados (newData primeiro, depois oldData)
  let entityName: string | null = null;

  for (const data of [log.newData, log.oldData]) {
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      entityName =
        (typeof record.name === 'string' ? record.name : null) ||
        (typeof record.groupName === 'string' ? record.groupName : null) ||
        (typeof record.fullName === 'string' ? record.fullName : null) ||
        (typeof record.tradeName === 'string' ? record.tradeName : null) ||
        (typeof record.legalName === 'string' ? record.legalName : null) ||
        (typeof record.socialName === 'string' ? record.socialName : null) ||
        (typeof record.employeeName === 'string'
          ? record.employeeName
          : null) ||
        (typeof record.companyName === 'string' ? record.companyName : null) ||
        (typeof record.title === 'string' ? record.title : null) ||
        (typeof record.userName === 'string' ? record.userName : null) ||
        (typeof record.email === 'string' ? record.email : null) ||
        (typeof record.orderNumber === 'string' ? record.orderNumber : null) ||
        (typeof record.sku === 'string' ? record.sku : null) ||
        (typeof record.code === 'string' ? record.code : null);
      if (entityName) break;
    }
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

  const article = getArticleConnector(log.action, log.entity);

  return {
    label,
    base,
    entityName,
    article,
    selfContained,
    identifier: log.entityId,
  };
}

// ============================================
// ACTION VERB MAPPING
// ============================================

const ACTION_VERBS: Partial<Record<AuditAction | string, string>> = {
  // CRUD — artigo simples (o/a) via getArticleConnector
  CREATE: 'criou',
  UPDATE: 'atualizou',
  DELETE: 'removeu',
  RESTORE: 'restaurou',

  // Auth — self-contained (entity label suprimida no card)
  LOGIN: 'acessou o sistema',
  LOGOUT: 'saiu do sistema',
  // Sessão — artigo simples
  SESSION_REFRESH: 'renovou',
  SESSION_EXPIRE: 'expirou',
  SESSION_REVOKE: 'revogou',

  // Senha — self-contained
  PASSWORD_CHANGE: 'alterou a senha',
  PASSWORD_RESET_REQUEST: 'solicitou reset de senha',
  PASSWORD_RESET_COMPLETE: 'redefiniu a senha',
  PASSWORD_FORCE_RESET: 'forçou reset de senha',
  PIN_CHANGE: 'alterou o PIN',
  PIN_FORCE_RESET: 'solicitou reset do PIN',

  // Perfil — self-contained
  EMAIL_CHANGE: 'alterou o email',
  USERNAME_CHANGE: 'alterou o username',
  PROFILE_CHANGE: 'atualizou o perfil',

  // RBAC — artigo simples para GRANT/REVOKE/UPDATE, preconnected para GROUP/*
  PERMISSION_GRANT: 'concedeu',
  PERMISSION_REVOKE: 'revogou',
  PERMISSION_UPDATE: 'atualizou',
  GROUP_ASSIGN: 'adicionou ao',
  GROUP_REMOVE: 'removeu do',
  PERMISSION_ADD_TO_GROUP: 'adicionou permissões ao',
  PERMISSION_REMOVE_FROM_GROUP: 'removeu permissões do',

  // Estoque — DE_CONNECTOR (do/da) exceto STOCK_TRANSFER (artigo simples)
  PRICE_CHANGE: 'alterou o preço',
  STOCK_ENTRY: 'registrou entrada',
  STOCK_EXIT: 'registrou saída',
  STOCK_TRANSFER: 'transferiu',
  STOCK_ADJUSTMENT: 'ajustou estoque',

  // Pedidos — artigo simples
  ORDER_CREATE: 'criou',
  ORDER_CANCEL: 'cancelou',
  STATUS_CHANGE: 'alterou status',

  // Reservas — artigo simples
  RESERVATION_CREATE: 'criou',
  RESERVATION_RELEASE: 'liberou',

  // HR — Funcionários
  EMPLOYEE_HIRE: 'contratou',
  EMPLOYEE_TERMINATE: 'desligou',
  EMPLOYEE_TRANSFER: 'transferiu',
  EMPLOYEE_LINK_USER: 'vinculou usuário',

  // HR — Ponto (self-contained)
  CLOCK_IN: 'registrou entrada',
  CLOCK_OUT: 'registrou saída',
  // Tempo — DE_CONNECTOR (do/da)
  TIME_CALCULATE: 'calculou tempo',
  TIME_BANK_CREDIT: 'creditou horas',
  TIME_BANK_DEBIT: 'debitou horas',
  TIME_BANK_ADJUST: 'ajustou',

  // HR — Ausências/Férias — artigo simples
  ABSENCE_REQUEST: 'solicitou',
  ABSENCE_APPROVE: 'aprovou',
  ABSENCE_REJECT: 'rejeitou',
  ABSENCE_CANCEL: 'cancelou',
  VACATION_SCHEDULE: 'agendou',
  VACATION_START: 'iniciou',
  VACATION_COMPLETE: 'finalizou',
  VACATION_CANCEL: 'cancelou',
  VACATION_SELL: 'vendeu',

  // HR — Horas Extras — artigo simples
  OVERTIME_REQUEST: 'solicitou',
  OVERTIME_APPROVE: 'aprovou',

  // Folha de Pagamento — artigo simples
  PAYROLL_CREATE: 'criou',
  PAYROLL_CALCULATE: 'calculou',
  PAYROLL_APPROVE: 'aprovou',
  PAYROLL_CANCEL: 'cancelou',
  PAYROLL_PAY: 'pagou',

  // Solicitações — artigo simples (REQUEST_COMMENT usa EM_CONNECTOR)
  REQUEST_CREATE: 'criou',
  REQUEST_ASSIGN: 'atribuiu',
  REQUEST_COMPLETE: 'completou',
  REQUEST_CANCEL: 'cancelou',
  REQUEST_COMMENT: 'comentou',
  REQUEST_INFO: 'solicitou informações sobre',
  REQUEST_INFO_PROVIDE: 'forneceu informações sobre',

  // Notificações — artigo simples
  NOTIFICATION_SEND: 'enviou',
  NOTIFICATION_READ: 'leu',
  NOTIFICATION_DELETE: 'excluiu',

  // Financeiro — DE_CONNECTOR para pagamento/contemplação, artigo simples para ENTRY_CANCEL
  PAYMENT_REGISTER: 'registrou pagamento',
  PAYMENT_CANCEL: 'cancelou pagamento',
  ENTRY_CANCEL: 'cancelou',
  CONTEMPLATION: 'registrou contemplação',

  // Verificações — self-contained
  CHECK_CPF: 'verificou CPF',
  CHECK_CNPJ: 'verificou CNPJ',

  // Sistema — artigo simples
  EXPORT: 'exportou',
  IMPORT: 'importou',
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

  chips.push({ label: 'Ação', value: getActionLabel(log.action) });
  chips.push({ label: 'Módulo', value: getModuleLabel(log.module) });
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
    PIN_CHANGE: 'warning',
    PIN_FORCE_RESET: 'warning',
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
    PIN_CHANGE: Key,
    PIN_FORCE_RESET: Key,

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
    PIN_CHANGE: 'outline',
    PIN_FORCE_RESET: 'outline',
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

export function formatRelativeTimestamp(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin}min`;
  if (diffHr < 24) return `há ${diffHr}h`;
  if (diffDay < 7) return `há ${diffDay}d`;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatCompactTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

export const FIELD_LABELS: Record<string, string> = {
  name: 'Nome',
  email: 'Email',
  username: 'Username',
  password: 'Senha',
  price: 'Preço',
  quantity: 'Quantidade',
  status: 'Status',
  description: 'Descrição',
  createdAt: 'Criado em',
  updatedAt: 'Atualizado em',
  deletedAt: 'Excluído em',
  sku: 'SKU',
  title: 'Título',
  active: 'Ativo',
  enabled: 'Habilitado',
  role: 'Cargo',
  department: 'Departamento',
  position: 'Posição',
  company: 'Empresa',
  employee: 'Funcionário',
  user: 'Usuário',
  product: 'Produto',
  variant: 'Variante',
  category: 'Categoria',
  supplier: 'Fornecedor',
  manufacturer: 'Fabricante',
  customer: 'Cliente',
  order: 'Pedido',
  startDate: 'Data Início',
  endDate: 'Data Fim',
  dueDate: 'Data Vencimento',
  amount: 'Valor',
  total: 'Total',
  discount: 'Desconto',
  tax: 'Imposto',
};

export function formatFieldLabel(field: string): string {
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
