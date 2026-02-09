'use client';

/**
 * Label Studio - Field Picker Modal
 * Modal de seleção de campo de dados com sidebar de categorias + painel de campos
 */

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  ENTITY_FIELD_REGISTRIES,
  type EntityType,
  type DataFieldCategory,
  type DataField,
} from '../elements/FieldElementRenderer';
import {
  Building2,
  MapPin,
  Package,
  Hash,
  Layers,
  Box,
  Building,
  Info,
  Search,
  type LucideIcon,
} from 'lucide-react';

// ============================================
// ICON MAP
// ============================================

const ICON_MAP: Record<string, LucideIcon> = {
  Building2,
  MapPin,
  Package,
  Hash,
  Layers,
  Box,
  Building,
  Info,
};

function CategoryIcon({
  iconName,
  className,
}: {
  iconName: string;
  className?: string;
}) {
  const Icon = ICON_MAP[iconName];
  if (!Icon) return <Package className={className} />;
  return <Icon className={className} />;
}

// ============================================
// PROPS
// ============================================

interface FieldPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (path: string) => void;
  /** Se true, insere {path} em vez de retornar path direto (para composite/calculated) */
  insertMode?: boolean;
  onInsert?: (text: string) => void;
  /** Valor atualmente selecionado (highlight) */
  currentValue?: string;
  /** Tipo de entidade para carregar categorias corretas */
  entityType?: EntityType;
  /** Título customizado */
  title?: string;
}

// ============================================
// COMPONENT
// ============================================

export function FieldPickerModal({
  open,
  onOpenChange,
  onSelect,
  insertMode = false,
  onInsert,
  currentValue,
  entityType = 'item',
  title,
}: FieldPickerModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ENTITY_FIELD_REGISTRIES[entityType];

  // Busca global: filtra campos por label ou path
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    const results: DataFieldCategory[] = [];

    for (const category of categories) {
      const matchingFields = category.fields.filter(
        f =>
          f.label.toLowerCase().includes(query) ||
          f.path.toLowerCase().includes(query) ||
          (f.description && f.description.toLowerCase().includes(query))
      );
      if (matchingFields.length > 0) {
        results.push({ ...category, fields: matchingFields });
      }
    }

    return results;
  }, [categories, searchQuery]);

  // Categorias a exibir no painel: se buscando, mostra todas filtradas; senão a selecionada
  const displayCategories = useMemo(() => {
    if (searchQuery.trim()) return filteredCategories;
    if (selectedCategoryId) {
      const found = filteredCategories.find(c => c.id === selectedCategoryId);
      return found ? [found] : filteredCategories;
    }
    return filteredCategories;
  }, [filteredCategories, selectedCategoryId, searchQuery]);

  const handleFieldClick = (field: DataField) => {
    if (insertMode && onInsert) {
      onInsert(`{${field.path}}`);
      // Não fecha o modal em insertMode
    } else {
      onSelect(field.path);
      onOpenChange(false);
    }
  };

  // Reset state quando abre/fecha
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchQuery('');
      setSelectedCategoryId(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 max-h-[80vh] flex flex-col">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-base">
            {title ||
              (insertMode ? 'Inserir Campo' : 'Selecionar Campo de Dados')}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar campo..."
              className="h-8 pl-8 text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-1 min-h-0 border-t border-slate-200 dark:border-slate-700">
          {/* Sidebar: categorias */}
          <div className="w-44 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <ScrollArea className="h-[50vh]">
              <div className="py-1">
                {/* "Todos" item */}
                <button
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50',
                    !selectedCategoryId &&
                      !searchQuery &&
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                  )}
                  onClick={() => setSelectedCategoryId(null)}
                >
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Todos</span>
                </button>

                {categories.map(category => (
                  <button
                    key={category.id}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50',
                      selectedCategoryId === category.id &&
                        !searchQuery &&
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                    )}
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setSearchQuery('');
                    }}
                  >
                    <CategoryIcon
                      iconName={category.icon}
                      className="w-3.5 h-3.5 shrink-0"
                    />
                    <span className="truncate">{category.label}</span>
                    <span className="ml-auto text-[10px] text-slate-400">
                      {category.fields.length}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Field cards panel */}
          <div className="flex-1 min-w-0">
            <ScrollArea className="h-[50vh]">
              <div className="p-3 space-y-4">
                {displayCategories.length === 0 && (
                  <div className="text-center py-8 text-sm text-slate-400">
                    Nenhum campo encontrado
                  </div>
                )}

                {displayCategories.map(category => (
                  <div key={category.id}>
                    {/* Category header (only when showing multiple) */}
                    {displayCategories.length > 1 && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <CategoryIcon
                          iconName={category.icon}
                          className="w-3.5 h-3.5 text-slate-400"
                        />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {category.label}
                        </span>
                      </div>
                    )}

                    <div className="space-y-1">
                      {category.fields.map(field => {
                        const isSelected = currentValue === field.path;
                        return (
                          <button
                            key={field.path}
                            className={cn(
                              'w-full text-left rounded-md border px-3 py-2 transition-all',
                              'hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700',
                              isSelected
                                ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-400/50'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                            )}
                            onClick={() => handleFieldClick(field)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                  {insertMode && (
                                    <span className="text-blue-500 mr-1">
                                      {'{'}
                                    </span>
                                  )}
                                  {field.label}
                                  {insertMode && (
                                    <span className="text-blue-500 ml-1">
                                      {'}'}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  {field.path}
                                </div>
                                {field.description && (
                                  <div className="text-[11px] text-slate-400 mt-0.5 italic">
                                    {field.description}
                                  </div>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 shrink-0 bg-slate-100 dark:bg-slate-700 rounded px-1.5 py-0.5 font-mono">
                                {field.example}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer hint */}
        {insertMode && (
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-[11px] text-slate-400 text-center">
              Clique nos campos para inseri-los. Feche o modal quando terminar.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default FieldPickerModal;
