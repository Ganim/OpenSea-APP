'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  onClear: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  onClear,
  onFocus,
  onBlur,
  isLoading = false,
  placeholder = 'Buscar localização (ex: FAB-EST-102-B)',
  disabled = false,
  className,
  autoFocus = false,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length >= 3) {
      debounceRef.current = setTimeout(() => {
        onSearch(value);
      }, 300);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, onSearch]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    // Delay blur to allow clicking on suggestions
    setTimeout(() => {
      setIsFocused(false);
      onBlur?.();
    }, 200);
  }, [onBlur]);

  const handleClear = useCallback(() => {
    onClear();
    inputRef.current?.focus();
  }, [onClear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        if (value) {
          handleClear();
        } else {
          inputRef.current?.blur();
        }
      }
    },
    [value, handleClear]
  );

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        {/* Search icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </div>

        {/* Input */}
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value.toUpperCase())}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            'pl-10 pr-10 font-mono',
            isFocused && 'ring-2 ring-ring ring-offset-2'
          )}
        />

        {/* Clear button */}
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpar</span>
          </Button>
        )}
      </div>

      {/* Helper text */}
      {!value && !disabled && (
        <p className="text-xs text-muted-foreground mt-1">
          Digite pelo menos 3 caracteres para buscar
        </p>
      )}
    </div>
  );
}
