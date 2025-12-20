/**
 * OpenSea OS - Image Field
 * Campo de upload de imagem com preview
 */

'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import type { FieldConfig } from '@/core/types';
import { FormFieldWrapper } from '../components/form-field-wrapper';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface ImageFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: File | string | null;
  onChange: (value: File | null) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function ImageField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: ImageFieldProps<T>) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
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
    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validate file size if specified
    if (field.maxFileSize && file.size > field.maxFileSize) {
      const maxSizeMB = (field.maxFileSize / 1024 / 1024).toFixed(2);
      alert(`Imagem muito grande. Tamanho máximo: ${maxSizeMB}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getImageUrl = () => {
    if (preview) return preview;
    if (typeof value === 'string') return value;
    return null;
  };

  const imageUrl = getImageUrl();

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
        {/* Preview */}
        {imageUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized={preview !== null}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isDisabled}
              className="absolute top-2 right-2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Drop zone */}
        {!imageUrl && (
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
              accept="image/*"
              disabled={isDisabled}
            />

            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8 text-gray-400" />
              <div>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => inputRef.current?.click()}
                  disabled={isDisabled}
                  className="text-primary"
                >
                  Escolher imagem
                </Button>
                <span className="text-sm text-muted-foreground">
                  ou arraste aqui
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, WebP
              </p>
              {field.maxFileSize && (
                <p className="text-xs text-muted-foreground">
                  Tamanho máximo: {(field.maxFileSize / 1024 / 1024).toFixed(2)}
                  MB
                </p>
              )}
            </div>
          </div>
        )}

        {/* Change button when image exists */}
        {imageUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isDisabled}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Alterar Imagem
          </Button>
        )}

        {/* Hidden input for changing image */}
        {imageUrl && (
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept="image/*"
            disabled={isDisabled}
          />
        )}
      </div>
    </FormFieldWrapper>
  );
}

export default ImageField;
