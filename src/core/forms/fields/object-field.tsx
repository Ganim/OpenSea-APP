/**
 * OpenSea OS - Object Field
 * Campo de objeto com estrutura chave-valor dinâmica
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { FieldConfig } from '@/core/types';
import { Plus, Trash2 } from 'lucide-react';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface ObjectFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function ObjectField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: ObjectFieldProps<T>) {
  // Evaluate disabled if it's a function
  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function'
      ? formData
        ? field.disabled(formData)
        : false
      : field.disabled);
  const descriptionId = `${String(field.name)}-description`;
  const errorId = `${String(field.name)}-error`;
  const describedBy = error
    ? `${field.description ? `${descriptionId} ` : ''}${errorId}`
    : field.description
      ? descriptionId
      : undefined;

  const obj = value || {};
  const entries = Object.entries(obj);

  // Add new property
  const handleAdd = () => {
    const newKey = `key${entries.length + 1}`;
    onChange({ ...obj, [newKey]: '' });
  };

  // Remove property
  const handleRemove = (key: string) => {
    const newObj = { ...obj };
    delete newObj[key];
    onChange(newObj);
  };

  // Update key
  const handleUpdateKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return;
    if (newKey in obj && newKey !== oldKey) {
      // Key already exists
      alert('Esta chave já existe no objeto');
      return;
    }

    const newObj = { ...obj };
    newObj[newKey] = newObj[oldKey];
    delete newObj[oldKey];
    onChange(newObj);
  };

  // Update value
  const handleUpdateValue = (key: string, newValue: unknown) => {
    onChange({ ...obj, [key]: newValue });
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
      <div className="space-y-3">
        {/* Properties list */}
        {entries.length > 0 ? (
          <div className="space-y-2">
            {entries.map(([key, val], index) => (
              <Card key={`${key}-${index}`} className="p-3">
                <div className="flex items-center gap-2">
                  {/* Key input */}
                  <div className="flex-1">
                    <Input
                      value={key}
                      onChange={e => handleUpdateKey(key, e.target.value)}
                      placeholder={
                        field.keyPlaceholder || field.keyLabel || 'Chave'
                      }
                      disabled={isDisabled}
                      className="font-mono text-sm"
                      aria-invalid={!!error}
                      aria-describedby={describedBy}
                    />
                  </div>

                  {/* Separator */}
                  <span className="text-muted-foreground">:</span>

                  {/* Value input */}
                  <div className="flex-1">
                    <Input
                      value={String(val || '')}
                      onChange={e => handleUpdateValue(key, e.target.value)}
                      placeholder={
                        field.valuePlaceholder || field.valueLabel || 'Valor'
                      }
                      disabled={isDisabled}
                      aria-invalid={!!error}
                      aria-describedby={describedBy}
                    />
                  </div>

                  {/* Remove button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(key)}
                    disabled={isDisabled}
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Remover propriedade"
                    aria-label="Remover propriedade"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            Nenhuma propriedade adicionada
          </div>
        )}

        {/* Add button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={isDisabled}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Propriedade
        </Button>

        <p className="text-xs text-muted-foreground">
          Estrutura de objeto chave-valor • Chaves devem ser únicas
        </p>
      </div>
    </FormFieldWrapper>
  );
}

export default ObjectField;
