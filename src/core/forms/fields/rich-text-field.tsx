/**
 * OpenSea OS - Rich Text Field
 * Campo de texto rico com suporte a markdown
 */

'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { FieldConfig } from '@/core/types';
import {
  Bold,
  Code,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
} from 'lucide-react';
import { useState } from 'react';
import { FormFieldWrapper } from '../components/form-field-wrapper';

export interface RichTextFieldProps<T = unknown> {
  field: FieldConfig<T>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  formData?: T;
}

export function RichTextField<T = unknown>({
  field,
  value,
  onChange,
  error,
  disabled,
  formData,
}: RichTextFieldProps<T>) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

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

  // Helper to insert markdown syntax
  const insertMarkdown = (syntax: string, placeholder: string = 'texto') => {
    const textarea = document.getElementById(
      String(field.name)
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    let newText = '';
    let newCursorPos = start;

    // Handle different markdown syntaxes
    if (syntax === 'bold') {
      newText = `${beforeText}**${selectedText}**${afterText}`;
      newCursorPos = start + 2 + selectedText.length + 2;
    } else if (syntax === 'italic') {
      newText = `${beforeText}_${selectedText}_${afterText}`;
      newCursorPos = start + 1 + selectedText.length + 1;
    } else if (syntax === 'code') {
      newText = `${beforeText}\`${selectedText}\`${afterText}`;
      newCursorPos = start + 1 + selectedText.length + 1;
    } else if (syntax === 'quote') {
      newText = `${beforeText}\n> ${selectedText}\n${afterText}`;
      newCursorPos = start + 3 + selectedText.length + 1;
    } else if (syntax === 'link') {
      newText = `${beforeText}[${selectedText}](url)${afterText}`;
      newCursorPos = start + 1 + selectedText.length + 2;
    } else if (syntax === 'ul') {
      newText = `${beforeText}\n- ${selectedText}\n${afterText}`;
      newCursorPos = start + 3 + selectedText.length + 1;
    } else if (syntax === 'ol') {
      newText = `${beforeText}\n1. ${selectedText}\n${afterText}`;
      newCursorPos = start + 4 + selectedText.length + 1;
    }

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Simple markdown preview (basic conversion)
  const renderPreview = (text: string) => {
    let html = text;

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    // Code
    html = html.replace(
      /`(.+?)`/g,
      '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>'
    );
    // Links
    html = html.replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" class="text-primary underline">$1</a>'
    );
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(
      /(<li>.*<\/li>)/s,
      '<ul class="list-disc list-inside">$1</ul>'
    );
    // Quotes
    html = html.replace(
      /^> (.+)$/gm,
      '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>'
    );
    // Line breaks
    html = html.replace(/\n/g, '<br/>');

    return html;
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
      <Tabs value={tab} onValueChange={v => setTab(v as 'write' | 'preview')}>
        <TabsList className="w-full">
          <TabsTrigger value="write" className="flex-1">
            Escrever
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1">
            Visualizar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-2">
          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-900">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('bold', 'negrito')}
              disabled={isDisabled}
              title="Negrito"
              aria-label="Negrito"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('italic', 'itálico')}
              disabled={isDisabled}
              title="Itálico"
              aria-label="Italico"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('code', 'código')}
              disabled={isDisabled}
              title="Código"
              aria-label="Codigo"
            >
              <Code className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('ul', 'item')}
              disabled={isDisabled}
              title="Lista"
              aria-label="Lista"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('ol', 'item')}
              disabled={isDisabled}
              title="Lista Numerada"
              aria-label="Lista numerada"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('link', 'texto do link')}
              disabled={isDisabled}
              title="Link"
              aria-label="Link"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('quote', 'citação')}
              disabled={isDisabled}
              title="Citação"
              aria-label="Citacao"
            >
              <Quote className="w-4 h-4" />
            </Button>
          </div>

          {/* Textarea */}
          <Textarea
            id={String(field.name)}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder || 'Digite seu texto...'}
            disabled={isDisabled}
            readOnly={field.readOnly}
            rows={field.rows || 8}
            className="font-mono"
            aria-invalid={!!error}
            aria-describedby={describedBy}
          />

          <p className="text-xs text-muted-foreground">
            Suporte a Markdown: **negrito**, _itálico_, `código`, [link](url)
          </p>
        </TabsContent>

        <TabsContent value="preview">
          <div
            className="min-h-[200px] p-4 border rounded-md bg-white dark:bg-gray-900 prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: renderPreview(value || 'Nada para visualizar...'),
            }}
          />
        </TabsContent>
      </Tabs>
    </FormFieldWrapper>
  );
}

export default RichTextField;
