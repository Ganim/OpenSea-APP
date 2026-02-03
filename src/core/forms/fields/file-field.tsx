/**
 * OpenSea OS - File Field
 * Campo de upload de arquivo
 */

'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, File } from 'lucide-react';
import type { FieldConfig } from '@/core/types';
import { FormFieldWrapper } from '../components/form-field-wrapper';
import { cn } from '@/lib/utils';

export interface FileFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: File | string | null;
  onChange: (value: File | null) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function FileField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: FileFieldProps<T>) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Evaluate disabled if it's a function
  const isDisabled =
    disabled ||
    (typeof field.disabled === 'function'
      ? formData
        ? field.disabled(formData)
        : false
      : field.disabled);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (isDisabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type if specified
    if (field.accept) {
      const acceptedTypes = field.accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileExt = '.' + file.name.split('.').pop();

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExt === type;
        }
        return fileType.match(type.replace('*', '.*'));
      });

      if (!isAccepted) {
        alert(`Tipo de arquivo não permitido. Aceitos: ${field.accept}`);
        return;
      }
    }

    // Validate file size if specified
    if (field.maxFileSize && file.size > field.maxFileSize) {
      const maxSizeMB = (field.maxFileSize / 1024 / 1024).toFixed(2);
      alert(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
      return;
    }

    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getFileName = () => {
    if (value instanceof File) {
      return value.name;
    }
    if (typeof value === 'string') {
      return value.split('/').pop() || value;
    }
    return null;
  };

  const fileName = getFileName();

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
        {/* Drop zone */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 dark:border-gray-600',
            isDisabled && 'opacity-50 cursor-not-allowed',
            error && 'border-destructive'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            id={String(field.name)}
            className="hidden"
            onChange={handleChange}
            accept={field.accept}
            disabled={isDisabled}
          />

          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div>
              <Button
                type="button"
                variant="link"
                onClick={() => inputRef.current?.click()}
                disabled={isDisabled}
                className="text-primary"
              >
                Escolher arquivo
              </Button>
              <span className="text-sm text-muted-foreground">
                ou arraste aqui
              </span>
            </div>
            {field.accept && (
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: {field.accept}
              </p>
            )}
            {field.maxFileSize && (
              <p className="text-xs text-muted-foreground">
                Tamanho máximo: {(field.maxFileSize / 1024 / 1024).toFixed(2)}
                MB
              </p>
            )}
          </div>
        </div>

        {/* Selected file */}
        {fileName && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <File className="w-4 h-4 text-primary" />
            <span className="flex-1 text-sm truncate">{fileName}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isDisabled}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </FormFieldWrapper>
  );
}

export default FileField;
