import type { LucideIcon } from 'lucide-react';

/**
 * Tamanhos disponíveis para o SearchBar
 */
export type SearchBarSize = 'sm' | 'md' | 'lg';

/**
 * Estados de validação do SearchBar
 */
export type SearchBarState = 'default' | 'loading' | 'error' | 'success';

/**
 * Configuração de ícone customizado
 */
export interface SearchBarIcon {
  /** Ícone Lucide React para o input */
  icon?: LucideIcon;
  /** Ícone para limpar busca */
  clearIcon?: LucideIcon;
  /** Ícone para estado de loading */
  loadingIcon?: LucideIcon;
  /** Tamanho dos ícones */
  size?: 'w-3 h-3' | 'w-4 h-4' | 'w-5 h-5';
}

/**
 * Callbacks do SearchBar
 */
export interface SearchBarCallbacks {
  /** Chamado quando o valor muda */
  onSearch: (value: string) => void | Promise<void>;
  /** Chamado ao pressionar Enter */
  onEnter?: (value: string) => void | Promise<void>;
  /** Chamado ao limpar a busca */
  onClear?: () => void | Promise<void>;
  /** Chamado ao focar */
  onFocus?: () => void;
  /** Chamado ao desfocar */
  onBlur?: () => void;
}

/**
 * Propriedades do componente SearchBar
 */
export interface SearchBarProps extends SearchBarCallbacks {
  /** Valor atual da busca */
  value: string;
  /** Placeholder do input */
  placeholder?: string;
  /** Tamanho do SearchBar */
  size?: SearchBarSize;
  /** Estado atual do SearchBar */
  state?: SearchBarState;
  /** Se o input está desabilitado */
  disabled?: boolean;
  /** Se deve mostrar botão de limpar */
  showClear?: boolean;
  /** Configuração de ícones */
  icons?: SearchBarIcon;
  /** Delay para debounce (ms) */
  debounceDelay?: number;
  /** Classes Tailwind customizadas para o container */
  className?: string;
  /** Classes Tailwind customizadas para o input */
  inputClassName?: string;
  /** Classes Tailwind customizadas para o wrapper */
  wrapperClassName?: string;
  /** Mensagem de erro */
  errorMessage?: string;
  /** Mensagem de sucesso */
  successMessage?: string;
  /** Se deve auto-focar */
  autoFocus?: boolean;
  /** Tema da card wrapper */
  cardClassName?: string;
  /** Permitir busca vazia */
  allowEmpty?: boolean;
  /** Comprimento máximo do input */
  maxLength?: number;
}
