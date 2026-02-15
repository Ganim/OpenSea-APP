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
  PIN_CHANGE: 'Alteração de PIN',
  PIN_FORCE_RESET: 'Reset Forçado de PIN',

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
  text: 'text-slate-600 dark:text-slate-200',
  bg: 'bg-slate-200 dark:bg-slate-900',
  border: 'border-slate-200 dark:border-slate-800',
  pill: 'bg-slate-600 text-white hover:bg-slate-800',
};

export const ACTION_STYLES: Record<string, ActionStyle> = {
  // CRUD
  CREATE: {
    icon: PlusCircle,
    verb: 'criou',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  UPDATE: {
    icon: PenLine,
    verb: 'atualizou',
    text: 'text-sky-600 dark:text-sky-200',
    bg: 'bg-sky-200 dark:bg-sky-800/30',
    border: 'border-sky-200 dark:border-sky-900',
    pill: 'bg-sky-600 text-white hover:bg-sky-600',
  },
  DELETE: {
    icon: Trash2,
    verb: 'removeu',
    text: 'text-rose-600 dark:text-rose-200',
    bg: 'bg-rose-200 dark:bg-rose-800/30',
    border: 'border-rose-200 dark:border-rose-900',
    pill: 'bg-rose-600 text-white hover:bg-rose-600',
  },
  RESTORE: {
    icon: History,
    verb: 'restaurou',
    text: 'text-purple-600 dark:text-purple-200',
    bg: 'bg-purple-200 dark:bg-purple-800/30',
    border: 'border-purple-200 dark:border-purple-900',
    pill: 'bg-purple-600 text-white hover:bg-purple-600',
  },

  // Auth
  LOGIN: {
    icon: LogIn,
    verb: 'acessou o sistema',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  LOGOUT: {
    icon: LogOut,
    verb: 'saiu do sistema',
    text: 'text-slate-600 dark:text-slate-200',
    bg: 'bg-slate-200 dark:bg-slate-900',
    border: 'border-slate-200 dark:border-slate-800',
    pill: 'bg-slate-600 text-white hover:bg-slate-800',
  },
  SESSION_REFRESH: {
    icon: RefreshCcw,
    verb: 'renovou',
    text: 'text-sky-600 dark:text-sky-200',
    bg: 'bg-sky-200 dark:bg-sky-800/30',
    border: 'border-sky-200 dark:border-sky-900',
    pill: 'bg-sky-600 text-white hover:bg-sky-600',
  },
  SESSION_EXPIRE: {
    icon: Clock,
    verb: 'expirou',
    text: 'text-amber-600 dark:text-amber-200',
    bg: 'bg-amber-200 dark:bg-amber-800/30',
    border: 'border-amber-200 dark:border-amber-900',
    pill: 'bg-amber-600 text-white hover:bg-amber-600',
  },
  SESSION_REVOKE: {
    icon: XCircle,
    verb: 'revogou',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },

  // Password
  PASSWORD_CHANGE: {
    icon: KeyRound,
    verb: 'alterou a senha',
    text: 'text-amber-600 dark:text-amber-200',
    bg: 'bg-amber-200 dark:bg-amber-800/30',
    border: 'border-amber-200 dark:border-amber-900',
    pill: 'bg-amber-600 text-white hover:bg-amber-600',
  },
  PASSWORD_RESET_REQUEST: {
    icon: KeyRound,
    verb: 'solicitou reset de senha',
    text: 'text-amber-600 dark:text-amber-200',
    bg: 'bg-amber-200 dark:bg-amber-800/30',
    border: 'border-amber-200 dark:border-amber-900',
    pill: 'bg-amber-600 text-white hover:bg-amber-600',
  },
  PASSWORD_RESET_COMPLETE: {
    icon: Check,
    verb: 'redefiniu a senha',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  PASSWORD_FORCE_RESET: {
    icon: KeyRound,
    verb: 'forçou reset de senha',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },

  // PIN
  PIN_CHANGE: {
    icon: KeyRound,
    verb: 'alterou o PIN',
    text: 'text-amber-600 dark:text-amber-200',
    bg: 'bg-amber-200 dark:bg-amber-800/30',
    border: 'border-amber-200 dark:border-amber-900',
    pill: 'bg-amber-600 text-white hover:bg-amber-600',
  },
  PIN_FORCE_RESET: {
    icon: KeyRound,
    verb: 'solicitou reset do PIN',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },

  // Profile
  EMAIL_CHANGE: {
    icon: Mail,
    verb: 'alterou o email',
    text: 'text-blue-600 dark:text-blue-200',
    bg: 'bg-blue-200 dark:bg-blue-800/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-600',
  },
  USERNAME_CHANGE: {
    icon: User,
    verb: 'alterou o username',
    text: 'text-blue-600 dark:text-blue-200',
    bg: 'bg-blue-200 dark:bg-blue-800/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-600',
  },
  PROFILE_CHANGE: {
    icon: User,
    verb: 'atualizou o perfil',
    text: 'text-blue-600 dark:text-blue-200',
    bg: 'bg-blue-200 dark:bg-blue-800/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-600',
  },

  // RBAC
  PERMISSION_GRANT: {
    icon: ShieldCheck,
    verb: 'concedeu',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  PERMISSION_REVOKE: {
    icon: ShieldX,
    verb: 'revogou',
    text: 'text-rose-600 dark:text-rose-200',
    bg: 'bg-rose-200 dark:bg-rose-800/30',
    border: 'border-rose-200 dark:border-rose-900',
    pill: 'bg-rose-600 text-white hover:bg-rose-600',
  },
  PERMISSION_UPDATE: {
    icon: ShieldCheck,
    verb: 'atualizou',
    text: 'text-indigo-600 dark:text-indigo-200',
    bg: 'bg-indigo-200 dark:bg-indigo-800/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-600',
  },
  GROUP_ASSIGN: {
    icon: Users,
    verb: 'adicionou ao',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  GROUP_REMOVE: {
    icon: Users,
    verb: 'removeu do',
    text: 'text-rose-600 dark:text-rose-200',
    bg: 'bg-rose-200 dark:bg-rose-800/30',
    border: 'border-rose-200 dark:border-rose-900',
    pill: 'bg-rose-600 text-white hover:bg-rose-600',
  },
  PERMISSION_ADD_TO_GROUP: {
    icon: ShieldCheck,
    verb: 'adicionou permissões ao',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  PERMISSION_REMOVE_FROM_GROUP: {
    icon: ShieldX,
    verb: 'removeu permissões do',
    text: 'text-rose-600 dark:text-rose-200',
    bg: 'bg-rose-200 dark:bg-rose-800/30',
    border: 'border-rose-200 dark:border-rose-900',
    pill: 'bg-rose-600 text-white hover:bg-rose-600',
  },

  // Stock
  PRICE_CHANGE: {
    icon: CircleDollarSign,
    verb: 'alterou o preço',
    text: 'text-cyan-600 dark:text-cyan-200',
    bg: 'bg-cyan-200 dark:bg-cyan-800/30',
    border: 'border-cyan-200 dark:border-cyan-900',
    pill: 'bg-cyan-600 text-white hover:bg-cyan-600',
  },
  STOCK_ENTRY: {
    icon: TrendingUp,
    verb: 'registrou entrada',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  STOCK_EXIT: {
    icon: TrendingDown,
    verb: 'registrou saída',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },
  STOCK_TRANSFER: {
    icon: Package,
    verb: 'transferiu',
    text: 'text-blue-600 dark:text-blue-200',
    bg: 'bg-blue-200 dark:bg-blue-800/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-600',
  },
  STOCK_ADJUSTMENT: {
    icon: Boxes,
    verb: 'ajustou estoque',
    text: 'text-orange-600 dark:text-orange-200',
    bg: 'bg-orange-200 dark:bg-orange-800/30',
    border: 'border-orange-200 dark:border-orange-900',
    pill: 'bg-orange-600 text-white hover:bg-orange-600',
  },

  // Orders
  ORDER_CREATE: {
    icon: FileText,
    verb: 'criou',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  ORDER_CANCEL: {
    icon: XCircle,
    verb: 'cancelou',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },
  STATUS_CHANGE: {
    icon: Flag,
    verb: 'alterou status',
    text: 'text-indigo-600 dark:text-indigo-200',
    bg: 'bg-indigo-200 dark:bg-indigo-800/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-600',
  },

  // Reservations
  RESERVATION_CREATE: {
    icon: Calendar,
    verb: 'criou',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  RESERVATION_RELEASE: {
    icon: Calendar,
    verb: 'liberou',
    text: 'text-blue-600 dark:text-blue-200',
    bg: 'bg-blue-200 dark:bg-blue-800/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-600',
  },

  // HR - Employees
  EMPLOYEE_HIRE: {
    icon: UserPlus,
    verb: 'contratou',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  EMPLOYEE_TERMINATE: {
    icon: UserMinus,
    verb: 'desligou',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },
  EMPLOYEE_TRANSFER: {
    icon: Users,
    verb: 'transferiu',
    text: 'text-blue-600 dark:text-blue-200',
    bg: 'bg-blue-200 dark:bg-blue-800/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-600',
  },
  EMPLOYEE_LINK_USER: {
    icon: UserCheck,
    verb: 'vinculou usuário',
    text: 'text-indigo-600 dark:text-indigo-200',
    bg: 'bg-indigo-200 dark:bg-indigo-800/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-600',
  },

  // HR - Time
  CLOCK_IN: {
    icon: Clock,
    verb: 'registrou entrada',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  CLOCK_OUT: {
    icon: Clock,
    verb: 'registrou saída',
    text: 'text-blue-600 dark:text-blue-200',
    bg: 'bg-blue-200 dark:bg-blue-800/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-600',
  },
  TIME_CALCULATE: {
    icon: Calculator,
    verb: 'calculou tempo',
    text: 'text-indigo-600 dark:text-indigo-200',
    bg: 'bg-indigo-200 dark:bg-indigo-800/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-600',
  },
  TIME_BANK_CREDIT: {
    icon: TrendingUp,
    verb: 'creditou horas',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  TIME_BANK_DEBIT: {
    icon: TrendingDown,
    verb: 'debitou horas',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },
  TIME_BANK_ADJUST: {
    icon: Clock,
    verb: 'ajustou',
    text: 'text-orange-600 dark:text-orange-200',
    bg: 'bg-orange-200 dark:bg-orange-800/30',
    border: 'border-orange-200 dark:border-orange-900',
    pill: 'bg-orange-600 text-white hover:bg-orange-600',
  },

  // HR - Absences
  ABSENCE_REQUEST: {
    icon: Calendar,
    verb: 'solicitou',
    text: 'text-amber-600 dark:text-amber-200',
    bg: 'bg-amber-200 dark:bg-amber-800/30',
    border: 'border-amber-200 dark:border-amber-900',
    pill: 'bg-amber-600 text-white hover:bg-amber-600',
  },
  ABSENCE_APPROVE: {
    icon: Check,
    verb: 'aprovou',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  ABSENCE_REJECT: {
    icon: XCircle,
    verb: 'rejeitou',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },
  ABSENCE_CANCEL: {
    icon: XCircle,
    verb: 'cancelou',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },
  VACATION_SCHEDULE: {
    icon: Calendar,
    verb: 'agendou',
    text: 'text-blue-600 dark:text-blue-200',
    bg: 'bg-blue-200 dark:bg-blue-800/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-600',
  },
  VACATION_START: {
    icon: Calendar,
    verb: 'iniciou',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  VACATION_COMPLETE: {
    icon: Check,
    verb: 'finalizou',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  VACATION_CANCEL: {
    icon: XCircle,
    verb: 'cancelou',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },
  VACATION_SELL: {
    icon: CreditCard,
    verb: 'vendeu',
    text: 'text-cyan-600 dark:text-cyan-200',
    bg: 'bg-cyan-200 dark:bg-cyan-800/30',
    border: 'border-cyan-200 dark:border-cyan-900',
    pill: 'bg-cyan-600 text-white hover:bg-cyan-600',
  },

  // HR - Overtime
  OVERTIME_REQUEST: {
    icon: Clock,
    verb: 'solicitou',
    text: 'text-amber-600 dark:text-amber-200',
    bg: 'bg-amber-200 dark:bg-amber-800/30',
    border: 'border-amber-200 dark:border-amber-900',
    pill: 'bg-amber-600 text-white hover:bg-amber-600',
  },
  OVERTIME_APPROVE: {
    icon: Check,
    verb: 'aprovou',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },

  // Payroll
  PAYROLL_CREATE: {
    icon: CreditCard,
    verb: 'criou',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  PAYROLL_CALCULATE: {
    icon: Calculator,
    verb: 'calculou',
    text: 'text-indigo-600 dark:text-indigo-200',
    bg: 'bg-indigo-200 dark:bg-indigo-800/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-600',
  },
  PAYROLL_APPROVE: {
    icon: Check,
    verb: 'aprovou',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  PAYROLL_CANCEL: {
    icon: XCircle,
    verb: 'cancelou',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },
  PAYROLL_PAY: {
    icon: CreditCard,
    verb: 'pagou',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },

  // Requests
  REQUEST_CREATE: {
    icon: FileText,
    verb: 'criou',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  REQUEST_ASSIGN: {
    icon: Users,
    verb: 'atribuiu',
    text: 'text-blue-600 dark:text-blue-200',
    bg: 'bg-blue-200 dark:bg-blue-800/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-600',
  },
  REQUEST_COMPLETE: {
    icon: Check,
    verb: 'completou',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  REQUEST_CANCEL: {
    icon: XCircle,
    verb: 'cancelou',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },
  REQUEST_COMMENT: {
    icon: MessageSquare,
    verb: 'comentou',
    text: 'text-blue-600 dark:text-blue-200',
    bg: 'bg-blue-200 dark:bg-blue-800/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-600',
  },
  REQUEST_INFO: {
    icon: MessageSquare,
    verb: 'solicitou informações',
    text: 'text-amber-600 dark:text-amber-200',
    bg: 'bg-amber-200 dark:bg-amber-800/30',
    border: 'border-amber-200 dark:border-amber-900',
    pill: 'bg-amber-600 text-white hover:bg-amber-600',
  },
  REQUEST_INFO_PROVIDE: {
    icon: MessageSquare,
    verb: 'forneceu informações',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },

  // Notifications
  NOTIFICATION_SEND: {
    icon: Send,
    verb: 'enviou',
    text: 'text-blue-600 dark:text-blue-200',
    bg: 'bg-blue-200 dark:bg-blue-800/30',
    border: 'border-blue-200 dark:border-blue-900',
    pill: 'bg-blue-600 text-white hover:bg-blue-600',
  },
  NOTIFICATION_READ: {
    icon: Check,
    verb: 'leu',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  NOTIFICATION_DELETE: {
    icon: Trash2,
    verb: 'excluiu',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },

  // Finance
  PAYMENT_REGISTER: {
    icon: CreditCard,
    verb: 'registrou pagamento',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  PAYMENT_CANCEL: {
    icon: XCircle,
    verb: 'cancelou pagamento',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },
  ENTRY_CANCEL: {
    icon: XCircle,
    verb: 'cancelou',
    text: 'text-red-600 dark:text-red-200',
    bg: 'bg-red-200 dark:bg-red-800/30',
    border: 'border-red-200 dark:border-red-900',
    pill: 'bg-red-600 text-white hover:bg-red-600',
  },
  CONTEMPLATION: {
    icon: Check,
    verb: 'registrou contemplação',
    text: 'text-emerald-600 dark:text-emerald-200',
    bg: 'bg-emerald-200 dark:bg-emerald-800/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    pill: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },

  // Checks
  CHECK_CPF: {
    icon: Search,
    verb: 'verificou CPF',
    text: 'text-indigo-600 dark:text-indigo-200',
    bg: 'bg-indigo-200 dark:bg-indigo-800/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-600',
  },
  CHECK_CNPJ: {
    icon: Briefcase,
    verb: 'verificou CNPJ',
    text: 'text-indigo-600 dark:text-indigo-200',
    bg: 'bg-indigo-200 dark:bg-indigo-800/30',
    border: 'border-indigo-200 dark:border-indigo-900',
    pill: 'bg-indigo-600 text-white hover:bg-indigo-600',
  },

  // System
  EXPORT: {
    icon: UploadCloud,
    verb: 'exportou',
    text: 'text-teal-600 dark:text-teal-200',
    bg: 'bg-teal-200 dark:bg-teal-800/30',
    border: 'border-teal-200 dark:border-teal-900',
    pill: 'bg-teal-600 text-white hover:bg-teal-600',
  },
  IMPORT: {
    icon: DownloadCloud,
    verb: 'importou',
    text: 'text-teal-600 dark:text-teal-200',
    bg: 'bg-teal-200 dark:bg-teal-800/30',
    border: 'border-teal-200 dark:border-teal-900',
    pill: 'bg-teal-600 text-white hover:bg-teal-600',
  },
  SYNC: {
    icon: RefreshCcw,
    verb: 'sincronizou',
    text: 'text-sky-600 dark:text-sky-200',
    bg: 'bg-sky-200 dark:bg-sky-800/30',
    border: 'border-sky-200 dark:border-sky-900',
    pill: 'bg-sky-600 text-white hover:bg-sky-600',
  },
  OTHER: DEFAULT_STYLE,
};

// ============================================
// ENTITY LABELS - Sincronizado com Backend
// ============================================

export const ENTITY_LABELS: Record<string, string> = {
  // Auth & Users
  USER: 'Usuário',
  USER_PROFILE: 'Perfil',
  USER_EMAIL: 'Email',
  USER_PASSWORD: 'Senha',
  USER_USERNAME: 'Username',
  USER_ACCESS_PIN: 'PIN de Acesso',
  USER_ACTION_PIN: 'PIN de Ação',
  SESSION: 'Sessão',
  REFRESH_TOKEN: 'Token de Atualização',

  // RBAC
  PERMISSION: 'Permissão',
  PERMISSION_GROUP: 'Grupo de Permissões',
  PERMISSION_GROUP_PERMISSION: 'Grupo de Permissões',
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

  // Label Templates
  LABEL_TEMPLATE: 'Modelo de Etiqueta',

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

/**
 * Artigos definidos em português para cada entidade.
 * Usado na narrativa: "criou **o** Grupo de Permissões"
 */
export const ENTITY_ARTICLES: Record<string, string> = {
  // Auth & Users
  USER: 'o',
  USER_PROFILE: 'o',
  USER_EMAIL: 'o',
  USER_PASSWORD: 'a',
  USER_USERNAME: 'o',
  USER_ACCESS_PIN: 'o',
  USER_ACTION_PIN: 'o',
  SESSION: 'a',
  REFRESH_TOKEN: 'o',

  // RBAC
  PERMISSION: 'a',
  PERMISSION_GROUP: 'o',
  PERMISSION_GROUP_PERMISSION: 'o',
  USER_PERMISSION_GROUP: 'o',
  USER_DIRECT_PERMISSION: 'a',

  // Stock
  PRODUCT: 'o',
  VARIANT: 'a',
  ITEM: 'o',
  CATEGORY: 'a',
  SUPPLIER: 'o',
  MANUFACTURER: 'o',
  LOCATION: 'a',
  TEMPLATE: 'o',
  ITEM_MOVEMENT: 'a',
  PRODUCT_CATEGORY: 'a',
  VARIANT_PRICE_HISTORY: 'o',
  TAG: 'a',
  PRODUCT_TAG: 'a',
  VARIANT_IMAGE: 'a',
  PURCHASE_ORDER: 'a',
  PURCHASE_ORDER_ITEM: 'o',
  UNIT_CONVERSION: 'a',
  STOCK_SNAPSHOT: 'o',
  VARIANT_SUPPLIER_CODE: 'o',
  VARIANT_PROMOTION: 'a',

  // Label Templates
  LABEL_TEMPLATE: 'o',

  // Sales
  CUSTOMER: 'o',
  SALES_ORDER: 'o',
  SALES_ORDER_ITEM: 'o',
  ITEM_RESERVATION: 'a',

  // Alerts & Notifications
  ALERT: 'o',
  NOTIFICATION: 'a',
  NOTIFICATION_TEMPLATE: 'o',
  NOTIFICATION_PREFERENCE: 'a',

  // Comments
  COMMENT: 'o',

  // Requests
  REQUEST: 'a',
  REQUEST_ATTACHMENT: 'o',
  REQUEST_COMMENT: 'o',
  REQUEST_HISTORY: 'o',

  // HR - Organization
  COMPANY: 'a',
  COMPANY_ADDRESS: 'o',
  COMPANY_CNAE: 'o',
  COMPANY_FISCAL_SETTINGS: 'as',
  COMPANY_STAKEHOLDER: 'o',

  // HR - Structure
  EMPLOYEE: 'o',
  DEPARTMENT: 'o',
  POSITION: 'o',

  // HR - Time
  TIME_ENTRY: 'o',
  WORK_SCHEDULE: 'a',
  OVERTIME: 'a',
  TIME_BANK: 'o',

  // HR - Absences
  ABSENCE: 'a',
  VACATION_PERIOD: 'o',
  VACATION_BALANCE: 'o',

  // Payroll
  PAYROLL: 'a',
  PAYROLL_ITEM: 'o',
  BONUS: 'o',
  DEDUCTION: 'a',

  // Finance
  COST_CENTER: 'o',
  BANK_ACCOUNT: 'a',
  FINANCE_CATEGORY: 'a',
  FINANCE_ENTRY: 'o',
  FINANCE_ENTRY_PAYMENT: 'o',
  FINANCE_ATTACHMENT: 'o',
  LOAN: 'o',
  LOAN_INSTALLMENT: 'a',
  CONSORTIUM: 'o',
  CONSORTIUM_PAYMENT: 'o',

  // System
  OTHER: 'o',
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
    bg: 'bg-emerald-100 dark:bg-emerald-800/30',
    text: 'text-emerald-800 dark:text-emerald-200',
    border: 'border-emerald-200 dark:border-emerald-900',
  },
  RBAC: {
    bg: 'bg-indigo-100 dark:bg-indigo-800/30',
    text: 'text-indigo-800 dark:text-indigo-200',
    border: 'border-indigo-200 dark:border-indigo-900',
  },
  STOCK: {
    bg: 'bg-orange-100 dark:bg-orange-800/30',
    text: 'text-orange-800 dark:text-orange-200',
    border: 'border-orange-200 dark:border-orange-900',
  },
  SALES: {
    bg: 'bg-blue-100 dark:bg-blue-800/30',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-900',
  },
  HR: {
    bg: 'bg-purple-100 dark:bg-purple-800/30',
    text: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-200 dark:border-purple-900',
  },
  PAYROLL: {
    bg: 'bg-cyan-100 dark:bg-cyan-800/30',
    text: 'text-cyan-800 dark:text-cyan-200',
    border: 'border-cyan-200 dark:border-cyan-900',
  },
  FINANCE: {
    bg: 'bg-green-100 dark:bg-green-800/30',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-900',
  },
  NOTIFICATIONS: {
    bg: 'bg-cyan-100 dark:bg-cyan-800/30',
    text: 'text-cyan-800 dark:text-cyan-200',
    border: 'border-cyan-200 dark:border-cyan-900',
  },
  REQUESTS: {
    bg: 'bg-amber-100 dark:bg-amber-800/30',
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

export function getEntityArticle(entity: AuditEntity | string): string {
  return ENTITY_ARTICLES[entity] || 'o';
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
