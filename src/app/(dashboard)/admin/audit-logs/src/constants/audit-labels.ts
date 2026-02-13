/**
 * Audit Log Labels
 * Labels e traduções para tipos de auditoria
 * Sincronizado com o backend OpenSea-API
 */

import type { LucideIcon } from 'lucide-react';
import {
  Boxes,
  Briefcase,
  Calculator,
  Calendar,
  Check,
  CircleDollarSign,
  Clock,
  CreditCard,
  DownloadCloud,
  FileText,
  Flag,
  History,
  KeyRound,
  LogIn,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  PenLine,
  PlusCircle,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  UploadCloud,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { AuditAction, AuditEntity, AuditModule } from '../types';

// ============================================
// ACTION LABELS - Sincronizado com Backend
// ============================================

export const ACTION_LABELS: Record<string, string> = {
  // CRUD
  CREATE: 'Criação',
  UPDATE: 'Atualização',
  DELETE: 'Exclusão',
  RESTORE: 'Restauração',

  // Auth
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  SESSION_REFRESH: 'Renovação de Sessão',
  SESSION_EXPIRE: 'Expiração de Sessão',
  SESSION_REVOKE: 'Revogação de Sessão',

  // Password
  PASSWORD_CHANGE: 'Alteração de Senha',
  PASSWORD_RESET_REQUEST: 'Solicitação Reset Senha',
  PASSWORD_RESET_COMPLETE: 'Reset de Senha Concluído',
  PASSWORD_FORCE_RESET: 'Reset Forçado de Senha',

  // Profile
  EMAIL_CHANGE: 'Alteração de Email',
  USERNAME_CHANGE: 'Alteração de Username',
  PROFILE_CHANGE: 'Alteração de Perfil',

  // RBAC
  PERMISSION_GRANT: 'Concessão de Permissão',
  PERMISSION_REVOKE: 'Revogação de Permissão',
  PERMISSION_UPDATE: 'Atualização de Permissão',
  GROUP_ASSIGN: 'Atribuição a Grupo',
  GROUP_REMOVE: 'Remoção de Grupo',
  PERMISSION_ADD_TO_GROUP: 'Permissão Adicionada ao Grupo',
  PERMISSION_REMOVE_FROM_GROUP: 'Permissão Removida do Grupo',

  // Stock
  PRICE_CHANGE: 'Alteração de Preço',
  STOCK_ENTRY: 'Entrada de Estoque',
  STOCK_EXIT: 'Saída de Estoque',
  STOCK_TRANSFER: 'Transferência de Estoque',
  STOCK_ADJUSTMENT: 'Ajuste de Estoque',

  // Orders
  ORDER_CREATE: 'Criação de Pedido',
  ORDER_CANCEL: 'Cancelamento de Pedido',
  STATUS_CHANGE: 'Alteração de Status',

  // Reservations
  RESERVATION_CREATE: 'Criação de Reserva',
  RESERVATION_RELEASE: 'Liberação de Reserva',

  // HR - Employees
  EMPLOYEE_HIRE: 'Contratação',
  EMPLOYEE_TERMINATE: 'Desligamento',
  EMPLOYEE_TRANSFER: 'Transferência',
  EMPLOYEE_LINK_USER: 'Vinculação de Usuário',

  // HR - Time
  CLOCK_IN: 'Registro de Entrada',
  CLOCK_OUT: 'Registro de Saída',
  TIME_CALCULATE: 'Cálculo de Tempo',
  TIME_BANK_CREDIT: 'Crédito em Banco de Horas',
  TIME_BANK_DEBIT: 'Débito em Banco de Horas',
  TIME_BANK_ADJUST: 'Ajuste de Banco de Horas',

  // HR - Absences
  ABSENCE_REQUEST: 'Solicitação de Ausência',
  ABSENCE_APPROVE: 'Aprovação de Ausência',
  ABSENCE_REJECT: 'Rejeição de Ausência',
  ABSENCE_CANCEL: 'Cancelamento de Ausência',
  VACATION_SCHEDULE: 'Agendamento de Férias',
  VACATION_START: 'Início de Férias',
  VACATION_COMPLETE: 'Conclusão de Férias',
  VACATION_CANCEL: 'Cancelamento de Férias',
  VACATION_SELL: 'Venda de Férias',

  // HR - Overtime
  OVERTIME_REQUEST: 'Solicitação de Hora Extra',
  OVERTIME_APPROVE: 'Aprovação de Hora Extra',

  // Payroll
  PAYROLL_CREATE: 'Criação de Folha',
  PAYROLL_CALCULATE: 'Cálculo de Folha',
  PAYROLL_APPROVE: 'Aprovação de Folha',
  PAYROLL_CANCEL: 'Cancelamento de Folha',
  PAYROLL_PAY: 'Pagamento de Folha',

  // Requests
  REQUEST_CREATE: 'Criação de Solicitação',
  REQUEST_ASSIGN: 'Atribuição de Solicitação',
  REQUEST_COMPLETE: 'Conclusão de Solicitação',
  REQUEST_CANCEL: 'Cancelamento de Solicitação',
  REQUEST_COMMENT: 'Comentário em Solicitação',
  REQUEST_INFO: 'Pedido de Informação',
  REQUEST_INFO_PROVIDE: 'Informação Fornecida',

  // Notifications
  NOTIFICATION_SEND: 'Envio de Notificação',
  NOTIFICATION_READ: 'Leitura de Notificação',
  NOTIFICATION_DELETE: 'Exclusão de Notificação',

  // Finance
  PAYMENT_REGISTER: 'Registro de Pagamento',
  PAYMENT_CANCEL: 'Cancelamento de Pagamento',
  ENTRY_CANCEL: 'Cancelamento de Lançamento',
  CONTEMPLATION: 'Contemplação',

  // Checks
  CHECK_CPF: 'Verificação de CPF',
  CHECK_CNPJ: 'Verificação de CNPJ',

  // System
  EXPORT: 'Exportação',
  IMPORT: 'Importação',
  SYNC: 'Sincronização',
  OTHER: 'Outro',
};

// ============================================
// ACTION VISUAL MAP
// ============================================

export type ActionStyle = {
  icon: LucideIcon;
  verb: string;
  text: string;
  bg: string;
  border: string;
  pill: string;
};

const DEFAULT_STYLE: ActionStyle = {
  icon: Sparkles,
  verb: 'executou ação em',
  text: 'text-slate-700 dark:text-slate-200',
  bg: 'bg-slate-50 dark:bg-slate-900',
  border: 'border-slate-200 dark:border-slate-800',
  pill: 'bg-slate-700 text-white hover:bg-slate-800',
};

export const ACTION_STYLES: Record<string, ActionStyle> = {
  // CRUD
  CREATE: {
    icon: PlusCircle,
    verb: 'criou',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  UPDATE: {
    icon: PenLine,
    verb: 'atualizou',
    text: 'text-blue-700 dark:text-blue-200',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  DELETE: {
    icon: Trash2,
    verb: 'removeu',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },
  RESTORE: {
    icon: History,
    verb: 'restaurou',
    text: 'text-purple-700 dark:text-purple-200',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-900',
    pill: 'bg-purple-600 text-white hover:bg-purple-700',
  },

  // Auth
  LOGIN: {
    icon: LogIn,
    verb: 'acessou o sistema',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  LOGOUT: {
    icon: LogOut,
    verb: 'saiu do sistema',
    text: 'text-slate-700 dark:text-slate-200',
    bg: 'bg-slate-50 dark:bg-slate-900',
    border: 'border-slate-200 dark:border-slate-800',
    pill: 'bg-slate-700 text-white hover:bg-slate-800',
  },
  SESSION_REFRESH: {
    icon: RefreshCcw,
    verb: 'renovou a sessão',
    text: 'text-sky-700 dark:text-sky-200',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    border: 'border-sky-200 dark:border-sky-900',
    pill: 'bg-sky-600 text-white hover:bg-sky-700',
  },
  SESSION_EXPIRE: {
    icon: Clock,
    verb: 'expirou a sessão de',
    text: 'text-amber-700 dark:text-amber-200',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    pill: 'bg-amber-600 text-white hover:bg-amber-700',
  },
  SESSION_REVOKE: {
    icon: XCircle,
    verb: 'revogou a sessão de',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },

  // Password
  PASSWORD_CHANGE: {
    icon: KeyRound,
    verb: 'alterou a senha',
    text: 'text-amber-700 dark:text-amber-200',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    pill: 'bg-amber-600 text-white hover:bg-amber-700',
  },
  PASSWORD_RESET_REQUEST: {
    icon: KeyRound,
    verb: 'solicitou reset de senha',
    text: 'text-amber-700 dark:text-amber-200',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    pill: 'bg-amber-600 text-white hover:bg-amber-700',
  },
  PASSWORD_RESET_COMPLETE: {
    icon: Check,
    verb: 'redefiniu a senha',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  PASSWORD_FORCE_RESET: {
    icon: KeyRound,
    verb: 'forçou reset de senha de',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },

  // Profile
  EMAIL_CHANGE: {
    icon: Mail,
    verb: 'alterou o email',
    text: 'text-blue-700 dark:text-blue-200',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  USERNAME_CHANGE: {
    icon: User,
    verb: 'alterou o username',
    text: 'text-blue-700 dark:text-blue-200',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  PROFILE_CHANGE: {
    icon: User,
    verb: 'atualizou o perfil',
    text: 'text-blue-700 dark:text-blue-200',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-700',
  },

  // RBAC
  PERMISSION_GRANT: {
    icon: ShieldCheck,
    verb: 'concedeu permissão',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  PERMISSION_REVOKE: {
    icon: ShieldX,
    verb: 'revogou permissão',
    text: 'text-rose-700 dark:text-rose-200',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-900',
    pill: 'bg-rose-600 text-white hover:bg-rose-700',
  },
  PERMISSION_UPDATE: {
    icon: ShieldCheck,
    verb: 'atualizou permissão',
    text: 'text-indigo-700 dark:text-indigo-200',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  GROUP_ASSIGN: {
    icon: Users,
    verb: 'adicionou ao grupo',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  GROUP_REMOVE: {
    icon: Users,
    verb: 'removeu do grupo',
    text: 'text-rose-700 dark:text-rose-200',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-900',
    pill: 'bg-rose-600 text-white hover:bg-rose-700',
  },
  PERMISSION_ADD_TO_GROUP: {
    icon: ShieldCheck,
    verb: 'adicionou permissão ao grupo',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  PERMISSION_REMOVE_FROM_GROUP: {
    icon: ShieldX,
    verb: 'removeu permissão do grupo',
    text: 'text-rose-700 dark:text-rose-200',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-900',
    pill: 'bg-rose-600 text-white hover:bg-rose-700',
  },

  // Stock
  PRICE_CHANGE: {
    icon: CircleDollarSign,
    verb: 'alterou o preço de',
    text: 'text-cyan-700 dark:text-cyan-200',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    border: 'border-cyan-200 dark:border-cyan-900',
    pill: 'bg-cyan-600 text-white hover:bg-cyan-700',
  },
  STOCK_ENTRY: {
    icon: TrendingUp,
    verb: 'registrou entrada de',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  STOCK_EXIT: {
    icon: TrendingDown,
    verb: 'registrou saída de',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },
  STOCK_TRANSFER: {
    icon: Package,
    verb: 'transferiu',
    text: 'text-blue-700 dark:text-blue-200',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  STOCK_ADJUSTMENT: {
    icon: Boxes,
    verb: 'ajustou estoque de',
    text: 'text-orange-700 dark:text-orange-200',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-900',
    pill: 'bg-orange-600 text-white hover:bg-orange-700',
  },

  // Orders
  ORDER_CREATE: {
    icon: FileText,
    verb: 'criou pedido',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  ORDER_CANCEL: {
    icon: XCircle,
    verb: 'cancelou pedido',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },
  STATUS_CHANGE: {
    icon: Flag,
    verb: 'alterou status de',
    text: 'text-indigo-700 dark:text-indigo-200',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },

  // Reservations
  RESERVATION_CREATE: {
    icon: Calendar,
    verb: 'criou reserva',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  RESERVATION_RELEASE: {
    icon: Calendar,
    verb: 'liberou reserva',
    text: 'text-blue-700 dark:text-blue-200',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-700',
  },

  // HR - Employees
  EMPLOYEE_HIRE: {
    icon: UserPlus,
    verb: 'contratou',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  EMPLOYEE_TERMINATE: {
    icon: UserMinus,
    verb: 'desligou',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },
  EMPLOYEE_TRANSFER: {
    icon: Users,
    verb: 'transferiu',
    text: 'text-blue-700 dark:text-blue-200',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  EMPLOYEE_LINK_USER: {
    icon: UserCheck,
    verb: 'vinculou usuário a',
    text: 'text-indigo-700 dark:text-indigo-200',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },

  // HR - Time
  CLOCK_IN: {
    icon: Clock,
    verb: 'registrou entrada',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  CLOCK_OUT: {
    icon: Clock,
    verb: 'registrou saída',
    text: 'text-blue-700 dark:text-blue-200',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  TIME_CALCULATE: {
    icon: Calculator,
    verb: 'calculou tempo de',
    text: 'text-indigo-700 dark:text-indigo-200',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  TIME_BANK_CREDIT: {
    icon: TrendingUp,
    verb: 'creditou horas em',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  TIME_BANK_DEBIT: {
    icon: TrendingDown,
    verb: 'debitou horas de',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },
  TIME_BANK_ADJUST: {
    icon: Clock,
    verb: 'ajustou banco de horas de',
    text: 'text-orange-700 dark:text-orange-200',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-900',
    pill: 'bg-orange-600 text-white hover:bg-orange-700',
  },

  // HR - Absences
  ABSENCE_REQUEST: {
    icon: Calendar,
    verb: 'solicitou ausência',
    text: 'text-amber-700 dark:text-amber-200',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    pill: 'bg-amber-600 text-white hover:bg-amber-700',
  },
  ABSENCE_APPROVE: {
    icon: Check,
    verb: 'aprovou ausência de',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  ABSENCE_REJECT: {
    icon: XCircle,
    verb: 'rejeitou ausência de',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },
  ABSENCE_CANCEL: {
    icon: XCircle,
    verb: 'cancelou ausência de',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },
  VACATION_SCHEDULE: {
    icon: Calendar,
    verb: 'agendou férias de',
    text: 'text-blue-700 dark:text-blue-200',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  VACATION_START: {
    icon: Calendar,
    verb: 'iniciou férias de',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  VACATION_COMPLETE: {
    icon: Check,
    verb: 'finalizou férias de',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  VACATION_CANCEL: {
    icon: XCircle,
    verb: 'cancelou férias de',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },
  VACATION_SELL: {
    icon: CreditCard,
    verb: 'vendeu férias de',
    text: 'text-cyan-700 dark:text-cyan-200',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    border: 'border-cyan-200 dark:border-cyan-900',
    pill: 'bg-cyan-600 text-white hover:bg-cyan-700',
  },

  // HR - Overtime
  OVERTIME_REQUEST: {
    icon: Clock,
    verb: 'solicitou hora extra',
    text: 'text-amber-700 dark:text-amber-200',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    pill: 'bg-amber-600 text-white hover:bg-amber-700',
  },
  OVERTIME_APPROVE: {
    icon: Check,
    verb: 'aprovou hora extra de',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },

  // Payroll
  PAYROLL_CREATE: {
    icon: CreditCard,
    verb: 'criou folha de pagamento',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  PAYROLL_CALCULATE: {
    icon: Calculator,
    verb: 'calculou folha de pagamento',
    text: 'text-indigo-700 dark:text-indigo-200',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  PAYROLL_APPROVE: {
    icon: Check,
    verb: 'aprovou folha de pagamento',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  PAYROLL_CANCEL: {
    icon: XCircle,
    verb: 'cancelou folha de pagamento',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },
  PAYROLL_PAY: {
    icon: CreditCard,
    verb: 'pagou folha de pagamento',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },

  // Requests
  REQUEST_CREATE: {
    icon: FileText,
    verb: 'criou solicitação',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  REQUEST_ASSIGN: {
    icon: Users,
    verb: 'atribuiu solicitação',
    text: 'text-blue-700 dark:text-blue-200',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  REQUEST_COMPLETE: {
    icon: Check,
    verb: 'completou solicitação',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  REQUEST_CANCEL: {
    icon: XCircle,
    verb: 'cancelou solicitação',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },
  REQUEST_COMMENT: {
    icon: MessageSquare,
    verb: 'comentou em solicitação',
    text: 'text-blue-700 dark:text-blue-200',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  REQUEST_INFO: {
    icon: MessageSquare,
    verb: 'solicitou informações',
    text: 'text-amber-700 dark:text-amber-200',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    pill: 'bg-amber-600 text-white hover:bg-amber-700',
  },
  REQUEST_INFO_PROVIDE: {
    icon: MessageSquare,
    verb: 'forneceu informações',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },

  // Notifications
  NOTIFICATION_SEND: {
    icon: Send,
    verb: 'enviou notificação',
    text: 'text-blue-700 dark:text-blue-200',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  NOTIFICATION_READ: {
    icon: Check,
    verb: 'leu notificação',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  NOTIFICATION_DELETE: {
    icon: Trash2,
    verb: 'excluiu notificação',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },

  // Finance
  PAYMENT_REGISTER: {
    icon: CreditCard,
    verb: 'registrou pagamento de',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  PAYMENT_CANCEL: {
    icon: XCircle,
    verb: 'cancelou pagamento de',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },
  ENTRY_CANCEL: {
    icon: XCircle,
    verb: 'cancelou lançamento',
    text: 'text-red-700 dark:text-red-200',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-700',
  },
  CONTEMPLATION: {
    icon: Check,
    verb: 'registrou contemplação de',
    text: 'text-emerald-700 dark:text-emerald-200',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },

  // Checks
  CHECK_CPF: {
    icon: Search,
    verb: 'verificou CPF',
    text: 'text-indigo-700 dark:text-indigo-200',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  CHECK_CNPJ: {
    icon: Briefcase,
    verb: 'verificou CNPJ',
    text: 'text-indigo-700 dark:text-indigo-200',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },

  // System
  EXPORT: {
    icon: UploadCloud,
    verb: 'exportou',
    text: 'text-teal-700 dark:text-teal-200',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    border: 'border-teal-200 dark:border-teal-900',
    pill: 'bg-teal-600 text-white hover:bg-teal-700',
  },
  IMPORT: {
    icon: DownloadCloud,
    verb: 'importou',
    text: 'text-teal-700 dark:text-teal-200',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    border: 'border-teal-200 dark:border-teal-900',
    pill: 'bg-teal-600 text-white hover:bg-teal-700',
  },
  SYNC: {
    icon: RefreshCcw,
    verb: 'sincronizou',
    text: 'text-sky-700 dark:text-sky-200',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    border: 'border-sky-200 dark:border-sky-900',
    pill: 'bg-sky-600 text-white hover:bg-sky-700',
  },
  OTHER: DEFAULT_STYLE,
};

// ============================================
// ENTITY LABELS - Sincronizado com Backend
// ============================================

export const ENTITY_LABELS: Record<string, string> = {
  // Auth & Users
  USER: 'Usuário',
  USER_PROFILE: 'Perfil de Usuário',
  USER_EMAIL: 'Email de Usuário',
  USER_PASSWORD: 'Senha de Usuário',
  USER_USERNAME: 'Username',
  SESSION: 'Sessão',
  REFRESH_TOKEN: 'Token de Atualização',

  // RBAC
  PERMISSION: 'Permissão',
  PERMISSION_GROUP: 'Grupo de Permissões',
  PERMISSION_GROUP_PERMISSION: 'Permissão do Grupo',
  USER_PERMISSION_GROUP: 'Grupo do Usuário',
  USER_DIRECT_PERMISSION: 'Permissão Direta',

  // Stock Management
  PRODUCT: 'Produto',
  VARIANT: 'Variante',
  ITEM: 'Item',
  CATEGORY: 'Categoria',
  SUPPLIER: 'Fornecedor',
  MANUFACTURER: 'Fabricante',
  LOCATION: 'Localização',
  TEMPLATE: 'Template',
  ITEM_MOVEMENT: 'Movimentação de Item',
  PRODUCT_CATEGORY: 'Categoria de Produto',
  VARIANT_PRICE_HISTORY: 'Histórico de Preços',
  TAG: 'Tag',
  PRODUCT_TAG: 'Tag de Produto',
  VARIANT_IMAGE: 'Imagem de Variante',
  PURCHASE_ORDER: 'Ordem de Compra',
  PURCHASE_ORDER_ITEM: 'Item da Ordem de Compra',
  UNIT_CONVERSION: 'Conversão de Unidade',
  STOCK_SNAPSHOT: 'Snapshot de Estoque',
  VARIANT_SUPPLIER_CODE: 'Código do Fornecedor',
  VARIANT_PROMOTION: 'Promoção',

  // Sales
  CUSTOMER: 'Cliente',
  SALES_ORDER: 'Pedido de Venda',
  SALES_ORDER_ITEM: 'Item do Pedido',
  ITEM_RESERVATION: 'Reserva de Item',

  // Alerts & Notifications
  ALERT: 'Alerta',
  NOTIFICATION: 'Notificação',
  NOTIFICATION_TEMPLATE: 'Template de Notificação',
  NOTIFICATION_PREFERENCE: 'Preferência de Notificação',

  // Comments
  COMMENT: 'Comentário',

  // Requests
  REQUEST: 'Solicitação',
  REQUEST_ATTACHMENT: 'Anexo da Solicitação',
  REQUEST_COMMENT: 'Comentário da Solicitação',
  REQUEST_HISTORY: 'Histórico da Solicitação',

  // HR - Organization
  COMPANY: 'Empresa',
  COMPANY_ADDRESS: 'Endereço da Empresa',
  COMPANY_CNAE: 'CNAE da Empresa',
  COMPANY_FISCAL_SETTINGS: 'Config. Fiscais',
  COMPANY_STAKEHOLDER: 'Sócio da Empresa',

  // HR - Structure
  EMPLOYEE: 'Funcionário',
  DEPARTMENT: 'Departamento',
  POSITION: 'Cargo',

  // HR - Time
  TIME_ENTRY: 'Registro de Ponto',
  WORK_SCHEDULE: 'Escala de Trabalho',
  OVERTIME: 'Hora Extra',
  TIME_BANK: 'Banco de Horas',

  // HR - Absences
  ABSENCE: 'Ausência',
  VACATION_PERIOD: 'Período de Férias',
  VACATION_BALANCE: 'Saldo de Férias',

  // Payroll
  PAYROLL: 'Folha de Pagamento',
  PAYROLL_ITEM: 'Item da Folha',
  BONUS: 'Bônus',
  DEDUCTION: 'Dedução',

  // Finance
  COST_CENTER: 'Centro de Custo',
  BANK_ACCOUNT: 'Conta Bancária',
  FINANCE_CATEGORY: 'Categoria Financeira',
  FINANCE_ENTRY: 'Lançamento Financeiro',
  FINANCE_ENTRY_PAYMENT: 'Pagamento de Lançamento',
  FINANCE_ATTACHMENT: 'Anexo Financeiro',
  LOAN: 'Empréstimo',
  LOAN_INSTALLMENT: 'Parcela de Empréstimo',
  CONSORTIUM: 'Consórcio',
  CONSORTIUM_PAYMENT: 'Pagamento de Consórcio',

  // System
  OTHER: 'Outro',
};

// ============================================
// MODULE LABELS
// ============================================

export const MODULE_LABELS: Record<string, string> = {
  CORE: 'Sistema',
  AUTH: 'Autenticação',
  RBAC: 'Controle de Acesso',
  STOCK: 'Estoque',
  SALES: 'Vendas',
  HR: 'Recursos Humanos',
  PAYROLL: 'Folha de Pagamento',
  FINANCE: 'Financeiro',
  NOTIFICATIONS: 'Notificações',
  REQUESTS: 'Solicitações',
  SYSTEM: 'Sistema',
  OTHER: 'Outro',
};

export const MODULE_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  CORE: {
    bg: 'bg-slate-100 dark:bg-slate-900/70',
    text: 'text-slate-800 dark:text-slate-200',
    border: 'border-slate-200 dark:border-slate-800',
  },
  AUTH: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/30',
    text: 'text-emerald-800 dark:text-emerald-200',
    border: 'border-emerald-200 dark:border-emerald-900',
  },
  RBAC: {
    bg: 'bg-indigo-100 dark:bg-indigo-950/30',
    text: 'text-indigo-800 dark:text-indigo-200',
    border: 'border-indigo-200 dark:border-indigo-900',
  },
  STOCK: {
    bg: 'bg-orange-100 dark:bg-orange-950/30',
    text: 'text-orange-800 dark:text-orange-200',
    border: 'border-orange-200 dark:border-orange-900',
  },
  SALES: {
    bg: 'bg-blue-100 dark:bg-blue-950/30',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-900',
  },
  HR: {
    bg: 'bg-purple-100 dark:bg-purple-950/30',
    text: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-200 dark:border-purple-900',
  },
  PAYROLL: {
    bg: 'bg-cyan-100 dark:bg-cyan-950/30',
    text: 'text-cyan-800 dark:text-cyan-200',
    border: 'border-cyan-200 dark:border-cyan-900',
  },
  FINANCE: {
    bg: 'bg-green-100 dark:bg-green-950/30',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-900',
  },
  NOTIFICATIONS: {
    bg: 'bg-cyan-100 dark:bg-cyan-950/30',
    text: 'text-cyan-800 dark:text-cyan-200',
    border: 'border-cyan-200 dark:border-cyan-900',
  },
  REQUESTS: {
    bg: 'bg-amber-100 dark:bg-amber-950/30',
    text: 'text-amber-800 dark:text-amber-200',
    border: 'border-amber-200 dark:border-amber-900',
  },
  SYSTEM: {
    bg: 'bg-slate-100 dark:bg-slate-900/70',
    text: 'text-slate-800 dark:text-slate-200',
    border: 'border-slate-200 dark:border-slate-800',
  },
  OTHER: {
    bg: 'bg-slate-100 dark:bg-slate-900/70',
    text: 'text-slate-800 dark:text-slate-200',
    border: 'border-slate-200 dark:border-slate-800',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getActionLabel(action: AuditAction | string): string {
  return ACTION_LABELS[action] || String(action);
}

export function getEntityLabel(entity: AuditEntity | string): string {
  return ENTITY_LABELS[entity] || String(entity);
}

export function getModuleLabel(module: AuditModule | string): string {
  return MODULE_LABELS[module] || String(module);
}

// ============================================
// ACTION VERBS
// ============================================

export const ACTION_VERBS: Record<string, string> = Object.keys(
  ACTION_STYLES
).reduce(
  (acc, key) => {
    acc[key] = ACTION_STYLES[key].verb;
    return acc;
  },
  {} as Record<string, string>
);
