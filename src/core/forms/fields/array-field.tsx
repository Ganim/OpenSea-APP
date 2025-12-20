/**
 * OpenSea OS - Array Field
 * Campo de array dinâmico com adição/remoção de itens
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { FieldConfig } from '@/core/types';
import { FormFieldWrapper } from '../components/form-field-wrapper';
import { Card } from '@/components/ui/card';

export interface ArrayFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: unknown[];
  onChange: (value: unknown[]) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function ArrayField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: ArrayFieldProps<T>) {
  // Evaluate disabled if it's a function
  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function'
      ? formData
        ? field.disabled(formData)
        : false
      : field.disabled);

  const items = value || [];
  const minItems = field.minItems ?? 0;
  const maxItems = field.maxItems ?? Infinity;

  // Add new item
  const handleAdd = () => {
    if (items.length >= maxItems) return;
    onChange([...items, '']);
  };

  // Remove item
  const handleRemove = (index: number) => {
    if (items.length <= minItems) return;
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  // Update item
  const handleUpdate = (index: number, newValue: unknown) => {
    const newItems = [...items];
    newItems[index] = newValue;
    onChange(newItems);
  };

  // Move item up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [
      newItems[index],
      newItems[index - 1],
    ];
    onChange(newItems);
  };

  // Move item down
  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [
      newItems[index + 1],
      newItems[index],
    ];
    onChange(newItems);
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
        {/* Items list */}
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center gap-2">
                  {/* Drag handle */}
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={isDisabled || index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover para cima"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={isDisabled || index === items.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover para baixo"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Item number */}
                  <div className="flex-shrink-0 w-8 text-sm text-muted-foreground font-medium">
                    #{index + 1}
                  </div>

                  {/* Item input */}
                  <Input
                    value={String(item || '')}
                    onChange={e => handleUpdate(index, e.target.value)}
                    placeholder={field.placeholder || 'Item...'}
                    disabled={isDisabled}
                    className="flex-1"
                  />

                  {/* Remove button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    disabled={isDisabled || items.length <= minItems}
                    className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            Nenhum item adicionado
          </div>
        )}

        {/* Add button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={isDisabled || items.length >= maxItems}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Item
          {maxItems !== Infinity && ` (${items.length}/${maxItems})`}
        </Button>

        {/* Info text */}
        <p className="text-xs text-muted-foreground">
          {minItems > 0 && `Mínimo: ${minItems} item(ns) • `}
          {maxItems !== Infinity && `Máximo: ${maxItems} item(ns)`}
        </p>
      </div>
    </FormFieldWrapper>
  );
}

export default ArrayField;
