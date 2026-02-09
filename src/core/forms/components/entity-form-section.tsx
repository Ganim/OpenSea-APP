/**
 * OpenSea OS - EntityFormSection Component
 * Renderiza uma seção do formulário com seus campos
 */

'use client';

import { Button } from '@/components/ui/button';
import type { BaseEntity } from '@/core/types';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';
import type { RenderSectionProps } from './entity-form.types';

// =============================================================================
// GRID UTILITY
// =============================================================================

function getGridClass(columns: number): string {
  switch (columns) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-1 md:grid-cols-2';
    case 3:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    case 4:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    default:
      return 'grid-cols-1';
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EntityFormSection<T extends BaseEntity>({
  section,
  isCollapsed,
  onToggle,
  renderField,
  formValues,
  config,
}: RenderSectionProps<T>) {
  // Verificar visibilidade
  if (section.showWhen && !section.showWhen(formValues)) {
    return null;
  }

  const columns = section.columns || config.defaultColumns || 1;
  const gridClass = getGridClass(columns);

  return (
    <div className="space-y-4">
      {/* Header da seção */}
      <div
        className={cn(
          'flex items-center justify-between',
          section.collapsible && 'cursor-pointer'
        )}
        onClick={section.collapsible ? onToggle : undefined}
      >
        <div className="flex items-center gap-3">
          {section.icon && (
            <div className="w-5 h-5 text-primary">{section.icon}</div>
          )}
          <div>
            {section.title && (
              <h3 className="font-semibold text-lg">{section.title}</h3>
            )}

            {section.description && (
              <p className="text-sm text-[rgb(var(--color-muted-foreground))]">
                {section.description}
              </p>
            )}
          </div>
        </div>
        {section.collapsible && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label={isCollapsed ? 'Expandir secao' : 'Recolher secao'}
          >
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </Button>
        )}
      </div>

      {/* Campos da seção */}
      {!isCollapsed && (
        <div className={cn('grid gap-4', gridClass)}>
          {section.fields.map(field => renderField(field, columns))}
        </div>
      )}
    </div>
  );
}
