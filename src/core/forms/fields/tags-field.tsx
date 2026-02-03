/**
 * OpenSea OS - Tags Field
 * Campo de tags (múltiplos valores)
 */

'use client';

import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { FieldConfig } from '@/core/types';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface TagsFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function TagsField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: TagsFieldProps<T>) {
  const [inputValue, setInputValue] = useState('');

  // Evaluate disabled if it's a function
  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function'
      ? formData
        ? field.disabled(formData)
        : false
      : field.disabled);

  const tags = value || [];

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <FormFieldWrapper
      id={String(field.name)}
      label={field.label}
      required={field.required}
      description={field.description}
      error={error}
      icon={field.icon}
      colSpan={field.colSpan}
      disabled={isDisabled}
    >
      <div className="space-y-2">
        {/* Tags display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1 group">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  disabled={isDisabled}
                  className="rounded-full p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Input */}
        <Input
          id={String(field.name)}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              addTag(inputValue);
            }
          }}
          placeholder={field.placeholder || 'Digite e pressione Enter...'}
          disabled={isDisabled}
          aria-invalid={!!error}
        />
      </div>
    </FormFieldWrapper>
  );
}

export default TagsField;
