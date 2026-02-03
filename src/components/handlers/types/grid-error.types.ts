import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Tipos de erro disponíveis
 */
export type ErrorType =
  | 'connection'
  | 'not-found'
  | 'unauthorized'
  | 'forbidden'
  | 'server'
  | 'validation'
  | 'generic';

/**
 * Ação a ser executada (e.g., retry)
 */
export interface ErrorAction {
  /** ID único da ação */
  id?: string;
  /** Rótulo do botão */
  label: string;
  /** Função a ser executada */
  onClick: () => void | Promise<void>;
  /** Variante do botão */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  /** Se está carregando */
  isLoading?: boolean;
  /** Se está desabilitado */
  disabled?: boolean;
}

/**
 * Propriedades do componente GridError
 */
export interface GridErrorProps {
  /** Tipo de erro */
  type?: ErrorType;
  /** Título do erro */
  title?: string;
  /** Mensagem de erro detalhada */
  message?: string | ReactNode;
  /** Ícone customizado */
  icon?: LucideIcon;
  /** Ação principal (e.g., retry) */
  action?: ErrorAction;
  /** Ações adicionais */
  actions?: ErrorAction[];
  /** Se deve mostrar código de erro */
  errorCode?: string | number;
  /** Classes Tailwind para o container */
  className?: string;
  /** Classes para o card */
  cardClassName?: string;
  /** Classes para o ícone */
  iconClassName?: string;
  /** Subdetalhes do erro (stack trace, etc) */
  details?: string;
  /** Se mostrar detalhes */
  showDetails?: boolean;
}
