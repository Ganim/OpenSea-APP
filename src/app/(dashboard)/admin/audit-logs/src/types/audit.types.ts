/**
 * Audit Log Types
 * Tipos TypeScript para o módulo de Audit Log
 * Sincronizado com o backend OpenSea-API
 */

// ============================================
// ENUMS - Sincronizados com o Backend
// ============================================

export enum AuditAction {
  // CRUD básico
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',

  // Autenticação e Sessão
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SESSION_REFRESH = 'SESSION_REFRESH',
  SESSION_EXPIRE = 'SESSION_EXPIRE',
  SESSION_REVOKE = 'SESSION_REVOKE',

  // Senha e Segurança
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE = 'PASSWORD_RESET_COMPLETE',
  PASSWORD_FORCE_RESET = 'PASSWORD_FORCE_RESET',

  // Perfil de Usuário
  EMAIL_CHANGE = 'EMAIL_CHANGE',
  USERNAME_CHANGE = 'USERNAME_CHANGE',
  PROFILE_CHANGE = 'PROFILE_CHANGE',

  // RBAC - Permissões
  PERMISSION_GRANT = 'PERMISSION_GRANT',
  PERMISSION_REVOKE = 'PERMISSION_REVOKE',
  PERMISSION_UPDATE = 'PERMISSION_UPDATE',
  GROUP_ASSIGN = 'GROUP_ASSIGN',
  GROUP_REMOVE = 'GROUP_REMOVE',
  PERMISSION_ADD_TO_GROUP = 'PERMISSION_ADD_TO_GROUP',
  PERMISSION_REMOVE_FROM_GROUP = 'PERMISSION_REMOVE_FROM_GROUP',

  // Estoque
  PRICE_CHANGE = 'PRICE_CHANGE',
  STOCK_ENTRY = 'STOCK_ENTRY',
  STOCK_EXIT = 'STOCK_EXIT',
  STOCK_TRANSFER = 'STOCK_TRANSFER',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',

  // Pedidos e Compras
  ORDER_CREATE = 'ORDER_CREATE',
  ORDER_CANCEL = 'ORDER_CANCEL',
  STATUS_CHANGE = 'STATUS_CHANGE',

  // Reservas
  RESERVATION_CREATE = 'RESERVATION_CREATE',
  RESERVATION_RELEASE = 'RESERVATION_RELEASE',

  // HR - Funcionários
  EMPLOYEE_HIRE = 'EMPLOYEE_HIRE',
  EMPLOYEE_TERMINATE = 'EMPLOYEE_TERMINATE',
  EMPLOYEE_TRANSFER = 'EMPLOYEE_TRANSFER',
  EMPLOYEE_LINK_USER = 'EMPLOYEE_LINK_USER',

  // HR - Ponto e Tempo
  CLOCK_IN = 'CLOCK_IN',
  CLOCK_OUT = 'CLOCK_OUT',
  TIME_CALCULATE = 'TIME_CALCULATE',
  TIME_BANK_CREDIT = 'TIME_BANK_CREDIT',
  TIME_BANK_DEBIT = 'TIME_BANK_DEBIT',
  TIME_BANK_ADJUST = 'TIME_BANK_ADJUST',

  // HR - Ausências e Férias
  ABSENCE_REQUEST = 'ABSENCE_REQUEST',
  ABSENCE_APPROVE = 'ABSENCE_APPROVE',
  ABSENCE_REJECT = 'ABSENCE_REJECT',
  ABSENCE_CANCEL = 'ABSENCE_CANCEL',
  VACATION_SCHEDULE = 'VACATION_SCHEDULE',
  VACATION_START = 'VACATION_START',
  VACATION_COMPLETE = 'VACATION_COMPLETE',
  VACATION_CANCEL = 'VACATION_CANCEL',
  VACATION_SELL = 'VACATION_SELL',

  // HR - Horas Extras
  OVERTIME_REQUEST = 'OVERTIME_REQUEST',
  OVERTIME_APPROVE = 'OVERTIME_APPROVE',

  // Payroll - Folha de Pagamento
  PAYROLL_CREATE = 'PAYROLL_CREATE',
  PAYROLL_CALCULATE = 'PAYROLL_CALCULATE',
  PAYROLL_APPROVE = 'PAYROLL_APPROVE',
  PAYROLL_CANCEL = 'PAYROLL_CANCEL',
  PAYROLL_PAY = 'PAYROLL_PAY',

  // Requests - Workflow
  REQUEST_CREATE = 'REQUEST_CREATE',
  REQUEST_ASSIGN = 'REQUEST_ASSIGN',
  REQUEST_COMPLETE = 'REQUEST_COMPLETE',
  REQUEST_CANCEL = 'REQUEST_CANCEL',
  REQUEST_COMMENT = 'REQUEST_COMMENT',
  REQUEST_INFO = 'REQUEST_INFO',
  REQUEST_INFO_PROVIDE = 'REQUEST_INFO_PROVIDE',

  // Notificações
  NOTIFICATION_SEND = 'NOTIFICATION_SEND',
  NOTIFICATION_READ = 'NOTIFICATION_READ',
  NOTIFICATION_DELETE = 'NOTIFICATION_DELETE',

  // Verificações
  CHECK_CPF = 'CHECK_CPF',
  CHECK_CNPJ = 'CHECK_CNPJ',

  // Sistema
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  SYNC = 'SYNC',
  OTHER = 'OTHER',
}

export enum AuditEntity {
  // Auth & Users
  USER = 'USER',
  USER_PROFILE = 'USER_PROFILE',
  USER_EMAIL = 'USER_EMAIL',
  USER_PASSWORD = 'USER_PASSWORD',
  USER_USERNAME = 'USER_USERNAME',
  SESSION = 'SESSION',
  REFRESH_TOKEN = 'REFRESH_TOKEN',

  // RBAC - Controle de Acesso
  PERMISSION = 'PERMISSION',
  PERMISSION_GROUP = 'PERMISSION_GROUP',
  PERMISSION_GROUP_PERMISSION = 'PERMISSION_GROUP_PERMISSION',
  USER_PERMISSION_GROUP = 'USER_PERMISSION_GROUP',
  USER_DIRECT_PERMISSION = 'USER_DIRECT_PERMISSION',

  // Stock Management - Estoque
  PRODUCT = 'PRODUCT',
  VARIANT = 'VARIANT',
  ITEM = 'ITEM',
  CATEGORY = 'CATEGORY',
  SUPPLIER = 'SUPPLIER',
  MANUFACTURER = 'MANUFACTURER',
  LOCATION = 'LOCATION',
  TEMPLATE = 'TEMPLATE',
  ITEM_MOVEMENT = 'ITEM_MOVEMENT',
  PRODUCT_CATEGORY = 'PRODUCT_CATEGORY',
  VARIANT_PRICE_HISTORY = 'VARIANT_PRICE_HISTORY',
  TAG = 'TAG',
  PRODUCT_TAG = 'PRODUCT_TAG',
  VARIANT_IMAGE = 'VARIANT_IMAGE',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  PURCHASE_ORDER_ITEM = 'PURCHASE_ORDER_ITEM',
  UNIT_CONVERSION = 'UNIT_CONVERSION',
  STOCK_SNAPSHOT = 'STOCK_SNAPSHOT',
  VARIANT_SUPPLIER_CODE = 'VARIANT_SUPPLIER_CODE',
  VARIANT_PROMOTION = 'VARIANT_PROMOTION',

  // Sales - Vendas
  CUSTOMER = 'CUSTOMER',
  SALES_ORDER = 'SALES_ORDER',
  SALES_ORDER_ITEM = 'SALES_ORDER_ITEM',
  ITEM_RESERVATION = 'ITEM_RESERVATION',

  // Alerts & Notifications
  ALERT = 'ALERT',
  NOTIFICATION = 'NOTIFICATION',
  NOTIFICATION_TEMPLATE = 'NOTIFICATION_TEMPLATE',
  NOTIFICATION_PREFERENCE = 'NOTIFICATION_PREFERENCE',

  // Comments - Comentários
  COMMENT = 'COMMENT',

  // Requests - Workflow de Solicitações
  REQUEST = 'REQUEST',
  REQUEST_ATTACHMENT = 'REQUEST_ATTACHMENT',
  REQUEST_COMMENT = 'REQUEST_COMMENT',
  REQUEST_HISTORY = 'REQUEST_HISTORY',

  // HR - Organization (Empresa/Company)
  COMPANY = 'COMPANY',
  COMPANY_ADDRESS = 'COMPANY_ADDRESS',
  COMPANY_CNAE = 'COMPANY_CNAE',
  COMPANY_FISCAL_SETTINGS = 'COMPANY_FISCAL_SETTINGS',
  COMPANY_STAKEHOLDER = 'COMPANY_STAKEHOLDER',

  // HR - Estrutura Organizacional
  EMPLOYEE = 'EMPLOYEE',
  DEPARTMENT = 'DEPARTMENT',
  POSITION = 'POSITION',

  // HR - Controle de Ponto e Tempo
  TIME_ENTRY = 'TIME_ENTRY',
  WORK_SCHEDULE = 'WORK_SCHEDULE',
  OVERTIME = 'OVERTIME',
  TIME_BANK = 'TIME_BANK',

  // HR - Ausências e Férias
  ABSENCE = 'ABSENCE',
  VACATION_PERIOD = 'VACATION_PERIOD',
  VACATION_BALANCE = 'VACATION_BALANCE',

  // Payroll - Folha de Pagamento
  PAYROLL = 'PAYROLL',
  PAYROLL_ITEM = 'PAYROLL_ITEM',
  BONUS = 'BONUS',
  DEDUCTION = 'DEDUCTION',

  // System
  OTHER = 'OTHER',
}

export enum AuditModule {
  CORE = 'CORE',
  AUTH = 'AUTH',
  RBAC = 'RBAC',
  STOCK = 'STOCK',
  SALES = 'SALES',
  HR = 'HR',
  PAYROLL = 'PAYROLL',
  NOTIFICATIONS = 'NOTIFICATIONS',
  REQUESTS = 'REQUESTS',
  SYSTEM = 'SYSTEM',
  OTHER = 'OTHER',
}

// ============================================
// MAIN INTERFACES
// ============================================

export interface UserPermissionGroup {
  id: string;
  name: string;
  slug: string;
}

export interface AuditLog {
  id: string;
  action: AuditAction | string;
  entity: AuditEntity | string;
  module: AuditModule | string;
  entityId: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  // User info
  userId: string | null;
  userName: string | null;
  userPermissionGroups: UserPermissionGroup[];
  // Affected user
  affectedUser: string | null;
  // Request metadata
  ip: string | null;
  userAgent: string | null;
  endpoint: string | null;
  method: string | null;
  // Description (pre-formatted from backend)
  description: string | null;
  createdAt: string;
}

export interface AuditLogWithUser extends AuditLog {
  user?: {
    id: string;
    username: string;
    email: string;
  };
  affectedUserDetails?: {
    id: string;
    username: string;
    email: string;
  };
}

// ============================================
// PAGINATION & FILTERS
// ============================================

export interface AuditLogPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogFilters {
  userId?: string;
  affectedUser?: string;
  action?: AuditAction | string;
  entity?: AuditEntity | string;
  module?: AuditModule | string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: AuditLogPagination;
}

// ============================================
// HISTORY & VERSIONS
// ============================================

export interface HistoryVersion {
  version: number;
  action: string;
  timestamp: string;
  userId: string | null;
  data: Record<string, unknown> | null;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  description: string | null;
}

export interface HistoryResponse {
  history: HistoryVersion[];
}

// ============================================
// ROLLBACK
// ============================================

export interface RollbackPreview {
  canRollback: boolean;
  reason?: string;
  targetState: Record<string, unknown> | null;
  currentState: Record<string, unknown> | null;
  changes: Array<{
    field: string;
    from: unknown;
    to: unknown;
  }>;
}

export interface RollbackPreviewResponse {
  preview: RollbackPreview;
}

// ============================================
// COMPARISON
// ============================================

export interface VersionComparison {
  version1: {
    version: number;
    timestamp: string;
    data: Record<string, unknown> | null;
  };
  version2: {
    version: number;
    timestamp: string;
    data: Record<string, unknown> | null;
  };
  differences: Array<{
    field: string;
    version1Value: unknown;
    version2Value: unknown;
  }>;
  totalDifferences: number;
}

export interface ComparisonResponse {
  comparison: VersionComparison;
}

// ============================================
// TIMELINE
// ============================================

export interface TimelineItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'restore' | 'other';
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, unknown>;
  changes?: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  icon?: React.ComponentType;
  color?: string;
}

export interface TimelineGroup {
  date: string;
  items: TimelineItem[];
}
