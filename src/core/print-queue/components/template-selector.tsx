/**
 * Template Selector
 * Seletor de templates de etiqueta com previews visuais
 * Busca templates da API (Label Studio)
 */

'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { LabelTemplate } from '@/core/print-queue/editor';
import { useLabelTemplates } from '@/hooks/stock/use-label-templates';
import { cn } from '@/lib/utils';
import { Check, ExternalLink, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePrintQueue } from '../context/print-queue-context';

interface TemplateSelectorProps {
  className?: string;
}

export function TemplateSelector({ className }: TemplateSelectorProps) {
  const { state, actions } = usePrintQueue();
  const selectedId = state.selectedTemplateId;
  const router = useRouter();

  const { data, isLoading } = useLabelTemplates({ limit: 100 });
  const templates = data?.templates ?? [];

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        Modelo de Etiqueta
      </h3>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum template encontrado.</p>
          <p className="text-xs mt-1">Crie um template no Studio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedId === template.id}
              onSelect={() => actions.selectTemplate(template.id, { width: template.width, height: template.height })}
            />
          ))}
        </div>
      )}

      <Button
        size="sm"
        className="w-full text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-sm"
        onClick={() => router.push('/print/studio')}
      >
        <ExternalLink className="w-3.5 h-3.5 mr-2" />
        Abrir Studio
      </Button>
    </div>
  );
}

// ============================================
// TEMPLATE CARD WITH VISUAL PREVIEW
// ============================================

interface TemplateCardProps {
  template: LabelTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative p-3 rounded-lg border text-left transition-all',
        'hover:border-blue-300 dark:hover:border-blue-700',
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500'
          : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5'
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center z-10">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Template preview - visual thumbnail */}
      <div className="w-full aspect-[4/3] mb-2 rounded bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden">
        <TemplateThumbnail width={template.width} height={template.height} />
      </div>

      {/* Template info */}
      <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
        {template.name}
      </h4>
      <p className="text-xs text-gray-500 dark:text-white/50">
        {template.width}x{template.height}mm
      </p>
    </button>
  );
}

// ============================================
// TEMPLATE THUMBNAIL - VISUAL PREVIEW
// ============================================

interface TemplateThumbnailProps {
  width: number;
  height: number;
}

function TemplateThumbnail({ width, height }: TemplateThumbnailProps) {
  // Calculate scale to fit in container (max ~70px width or ~50px height)
  const maxWidth = 70;
  const maxHeight = 50;
  const scaleW = maxWidth / width;
  const scaleH = maxHeight / height;
  const scale = Math.min(scaleW, scaleH, 1);

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  // Determine layout type based on dimensions
  const isSmall = width <= 35;
  const isLarge = width >= 80;

  return (
    <div
      className="border border-gray-300 dark:border-white/30 bg-white dark:bg-white/5 rounded-sm shadow-sm flex flex-col overflow-hidden"
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        padding: `${Math.max(2, scale * 3)}px`,
      }}
    >
      {isSmall ? (
        <SmallLabelLayout scale={scale} />
      ) : isLarge ? (
        <LargeLabelLayout scale={scale} />
      ) : (
        <MediumLabelLayout scale={scale} />
      )}
    </div>
  );
}

// Small label layout (25x15mm, 30x20mm)
function SmallLabelLayout({ scale }: { scale: number }) {
  return (
    <div className="flex flex-col h-full justify-between">
      {/* Top: code */}
      <div
        className="bg-gray-300 dark:bg-white/30 rounded-[1px]"
        style={{ height: `${Math.max(2, 4 * scale)}px`, width: '80%' }}
      />
      {/* Barcode area */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="flex gap-[0.5px]"
          style={{ height: `${Math.max(4, 10 * scale)}px` }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 dark:bg-white/80"
              style={{
                width: `${Math.max(1, 2 * scale)}px`,
                height: '100%',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Medium label layout (50x30mm, 60x40mm)
function MediumLabelLayout({ scale }: { scale: number }) {
  return (
    <div className="flex flex-col h-full justify-between gap-px">
      {/* Top row: product name + location */}
      <div className="flex justify-between items-start">
        <div
          className="bg-gray-400 dark:bg-white/40 rounded-[1px]"
          style={{ height: `${Math.max(2, 4 * scale)}px`, width: '60%' }}
        />
        <div
          className="bg-gray-300 dark:bg-white/30 rounded-[1px]"
          style={{ height: `${Math.max(2, 3 * scale)}px`, width: '25%' }}
        />
      </div>

      {/* Variant name */}
      <div
        className="bg-gray-300 dark:bg-white/30 rounded-[1px]"
        style={{ height: `${Math.max(2, 3 * scale)}px`, width: '50%' }}
      />

      {/* Barcode area */}
      <div className="flex-1 flex items-center">
        <div
          className="flex gap-[0.5px]"
          style={{ height: `${Math.max(6, 12 * scale)}px`, width: '100%' }}
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 dark:bg-white/80 flex-1"
              style={{
                height: '100%',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom row: code + qty */}
      <div className="flex justify-between items-end">
        <div
          className="bg-gray-300 dark:bg-white/30 rounded-[1px]"
          style={{ height: `${Math.max(2, 3 * scale)}px`, width: '40%' }}
        />
        <div
          className="bg-gray-300 dark:bg-white/30 rounded-[1px]"
          style={{ height: `${Math.max(2, 3 * scale)}px`, width: '20%' }}
        />
      </div>
    </div>
  );
}

// Large label layout (100x60mm, 100x70mm)
function LargeLabelLayout({ scale }: { scale: number }) {
  return (
    <div className="flex h-full gap-1">
      {/* Left side: text content */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Manufacturer */}
        <div
          className="bg-gray-300 dark:bg-white/30 rounded-[1px]"
          style={{ height: `${Math.max(2, 3 * scale)}px`, width: '40%' }}
        />

        {/* Product name */}
        <div
          className="bg-gray-400 dark:bg-white/40 rounded-[1px]"
          style={{ height: `${Math.max(3, 5 * scale)}px`, width: '70%' }}
        />

        {/* Variant name */}
        <div
          className="bg-gray-300 dark:bg-white/30 rounded-[1px]"
          style={{ height: `${Math.max(2, 4 * scale)}px`, width: '60%' }}
        />

        {/* Reference */}
        <div
          className="bg-gray-200 dark:bg-white/20 rounded-[1px]"
          style={{ height: `${Math.max(2, 3 * scale)}px`, width: '45%' }}
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom row: location + qty */}
        <div className="flex justify-between items-end">
          <div
            className="bg-gray-300 dark:bg-white/30 rounded-[1px]"
            style={{ height: `${Math.max(2, 3 * scale)}px`, width: '35%' }}
          />
          <div
            className="bg-gray-400 dark:bg-white/40 rounded-[1px]"
            style={{ height: `${Math.max(2, 4 * scale)}px`, width: '25%' }}
          />
        </div>
      </div>

      {/* Right side: QR code + item code */}
      <div
        className="flex flex-col items-end justify-between"
        style={{ width: '35%' }}
      >
        {/* QR Code placeholder */}
        <div
          className="border border-gray-300 dark:border-white/30 bg-gray-100 dark:bg-white/10 rounded-[1px] flex items-center justify-center"
          style={{
            width: `${Math.max(12, 20 * scale)}px`,
            height: `${Math.max(12, 20 * scale)}px`,
          }}
        >
          {/* QR pattern */}
          <div
            className="grid grid-cols-3 gap-[0.5px]"
            style={{
              width: `${Math.max(8, 14 * scale)}px`,
              height: `${Math.max(8, 14 * scale)}px`,
            }}
          >
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-[0.5px]',
                  i % 2 === 0
                    ? 'bg-gray-800 dark:bg-white/80'
                    : 'bg-transparent'
                )}
              />
            ))}
          </div>
        </div>

        {/* Item code */}
        <div
          className="bg-gray-400 dark:bg-white/40 rounded-[1px]"
          style={{ height: `${Math.max(2, 3 * scale)}px`, width: '80%' }}
        />
      </div>
    </div>
  );
}
