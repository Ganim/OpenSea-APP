'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormFieldConfig } from '@/types/entity-config';
import React from 'react';

interface DynamicFormFieldProps {
  config: FormFieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

/**
 * Componente para renderizar campos de formulário dinamicamente
 * Suporta múltiplos tipos de campos com validação integrada
 */
export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  config,
  value,
  onChange,
  error,
}) => {
  const {
    name,
    label,
    type,
    placeholder,
    required,
    disabled,
    options,
    description,
    className,
  } = config;

  // Renderiza o campo baseado no tipo
  const renderField = () => {
    switch (type) {
      case 'text':
      case 'number':
        return (
          <Input
            id={name}
            type={type}
            value={value || ''}
            onChange={e =>
              onChange(
                type === 'number' ? Number(e.target.value) : e.target.value
              )
            }
            placeholder={placeholder}
            disabled={disabled}
            className={className}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={name}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            rows={4}
          />
        );

      case 'date':
        return (
          <Input
            id={name}
            type="date"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            className={className}
          />
        );

      case 'select':
        return (
          <Select
            value={value?.toString() || ''}
            onValueChange={val => onChange(val)}
            disabled={disabled}
          >
            <SelectTrigger className={className}>
              <SelectValue placeholder={placeholder || 'Selecione uma opção'} />
            </SelectTrigger>
            <SelectContent>
              {options?.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={name}
              checked={Boolean(value)}
              onCheckedChange={checked => onChange(checked)}
              disabled={disabled}
            />
            {description && (
              <Label htmlFor={name} className="text-sm text-muted-foreground">
                {description}
              </Label>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={Boolean(value)}
              onCheckedChange={checked => onChange(checked)}
              disabled={disabled}
            />
            {description && (
              <Label htmlFor={name} className="text-sm text-muted-foreground">
                {description}
              </Label>
            )}
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <Input
              id={name}
              type="color"
              value={value || '#000000'}
              onChange={e => onChange(e.target.value)}
              disabled={disabled}
              className={`w-20 h-10 cursor-pointer ${className}`}
            />
            <Input
              type="text"
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              placeholder="#000000"
              disabled={disabled}
              className="flex-1"
            />
          </div>
        );

      case 'file':
        return (
          <Input
            id={name}
            type="file"
            onChange={e => {
              const file = e.target.files?.[0];
              onChange(file);
            }}
            disabled={disabled}
            className={className}
          />
        );

      default:
        return (
          <Input
            id={name}
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
          />
        );
    }
  };

  // Não renderiza label para switch e checkbox (já incluídos no campo)
  const shouldRenderLabel = type !== 'switch' && type !== 'checkbox';

  return (
    <div className="space-y-2">
      {shouldRenderLabel && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      {renderField()}

      {description && type !== 'switch' && type !== 'checkbox' && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
