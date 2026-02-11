'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Loader2, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SearchBarProps } from './types/search-bar.types';

/**
 * Componente SearchBar reutilizável
 *
 * Renderiza um input de busca com ícones, estados de validação e debounce.
 * Totalmente tipado e customizável.
 *
 * @example
 * <SearchBar
 *   value={query}
 *   placeholder="Procurar..."
 *   onSearch={(value) => setQuery(value)}
 *   onClear={() => setQuery('')}
 *   size="md"
 *   showClear={true}
 * />
 */
export function SearchBar({
  value,
  placeholder = 'Procurar...',
  onSearch,
  onEnter,
  onClear,
  onFocus,
  onBlur,
  size = 'md',
  state = 'default',
  disabled = false,
  showClear = true,
  icons = {},
  debounceDelay = 300,
  className,
  inputClassName,
  wrapperClassName,
  errorMessage,
  successMessage,
  autoFocus = false,
  cardClassName,
  allowEmpty = true,
  maxLength,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Ícones customizáveis
  const SearchIcon = icons.icon || Search;
  const ClearIcon = icons.clearIcon || X;
  const LoadingIcon = icons.loadingIcon || Loader2;
  const iconSize = icons.size || 'w-5 h-5';

  // Tamanhos e espaçamentos
  const sizeMap = {
    sm: {
      padding: 'p-2',
      inputPadding: 'pl-10 pr-10',
      iconSize: 'w-4 h-4',
      textSize: 'text-sm',
    },
    md: {
      padding: 'p-4',
      inputPadding: 'pl-12 pr-12',
      iconSize: 'w-5 h-5',
      textSize: 'text-base',
    },
    lg: {
      padding: 'p-6',
      inputPadding: 'pl-14 pr-14',
      iconSize: 'w-6 h-6',
      textSize: 'text-lg',
    },
  };

  const currentSize = sizeMap[size];

  // Cores de estado
  const stateColors = {
    default: 'text-gray-400',
    loading: 'text-blue-500 animate-spin',
    error: 'text-red-500',
    success: 'text-green-500',
  };

  // Debounce da busca
  // onSearch is stored in a ref to avoid re-triggering the effect when
  // the parent passes a new callback reference (e.g. inline arrow function).
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        const result = onSearchRef.current(value);
        if (result instanceof Promise) {
          await result;
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceDelay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, debounceDelay]);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = useCallback(async () => {
    if (onClear) {
      try {
        setIsLoading(true);
        const result = onClear();
        if (result instanceof Promise) {
          await result;
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [onClear]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onEnter) {
        try {
          setIsLoading(true);
          const result = onEnter(value);
          if (result instanceof Promise) {
            await result;
          }
        } finally {
          setIsLoading(false);
        }
      }
    },
    [value, onEnter]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  // Determina qual ícone mostrar
  const getDisplayIcon = () => {
    if (isLoading || state === 'loading') {
      return (
        <LoadingIcon
          className={cn(currentSize.iconSize, stateColors.loading)}
        />
      );
    }

    if (state === 'error') {
      return (
        <AlertCircle className={cn(currentSize.iconSize, stateColors.error)} />
      );
    }

    if (state === 'success') {
      return (
        <CheckCircle
          className={cn(currentSize.iconSize, stateColors.success)}
        />
      );
    }

    return (
      <SearchIcon className={cn(currentSize.iconSize, stateColors.default)} />
    );
  };

  return (
    <Card
      className={cn(
        'bg-linear-to-r from-white to-gray-100 dark:from-sky-500/10 dark:to-slate-900/20',
        'p-0',
        'border-gray-200/50 dark:border-white/10',
        'transition-all duration-200',
        isFocused &&
          'border-blue-300 dark:border-blue-500 bg-white/50 dark:bg-slate-500/10',
        state === 'error' && 'border-red-300 dark:border-red-500',
        state === 'success' && 'border-green-300 dark:border-green-500',
        cardClassName
      )}
    >
      <div className={cn(currentSize.padding, className)}>
        <div
          className={cn('relative flex items-center gap-2', wrapperClassName)}
        >
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
            {getDisplayIcon()}
          </div>

          {/* Input */}
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={e => {
              const newValue = e.target.value;
              if (allowEmpty || newValue.trim() !== '') {
                onSearch(newValue);
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled || isLoading}
            maxLength={maxLength}
            className={cn(
              currentSize.inputPadding,
              currentSize.textSize,
              'border-0 bg-transparent focus:outline-none focus:ring-0',
              'placeholder:text-gray-400 dark:placeholder:text-gray-400',
              'transition-colors duration-200',
              inputClassName
            )}
          />

          {/* Clear Button */}
          {showClear && value && !isLoading && (
            <button
              onClick={handleClear}
              disabled={disabled}
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2',
                'z-10 flex items-center justify-center',
                'p-1 rounded-md',
                'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
                'hover:bg-gray-200/50 dark:hover:bg-gray-700/50',
                'transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Limpar busca"
            >
              <ClearIcon className={currentSize.iconSize} />
            </button>
          )}
        </div>

        {/* Status Messages */}
        {errorMessage && state === 'error' && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </p>
        )}

        {successMessage && state === 'success' && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            {successMessage}
          </p>
        )}
      </div>
    </Card>
  );
}

export type {
  SearchBarCallbacks,
  SearchBarIcon,
  SearchBarProps,
  SearchBarSize,
  SearchBarState,
} from './types/search-bar.types';
