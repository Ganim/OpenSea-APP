'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MultiViewModalConfig } from '@/types/entity-config';
import { Eye, Plus, SquareSplitHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { EntityViewer } from '../viewers/entity-viewer';

interface MultiViewModalProps<T extends { id: string }> {
  config: MultiViewModalConfig<T>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ViewMode = 'single' | 'compare' | 'search';

/**
 * Modal genérico para visualização múltipla de entidades
 * Suporta modo single, compare e search
 * Mantém o design exato do modal original
 */
export function MultiViewModal<T extends { id: string }>({
  config,
  open,
  onOpenChange,
}: MultiViewModalProps<T>) {
  const {
    entity,
    entityPlural,
    items,
    activeId,
    onActiveChange,
    onClose,
    onCloseAll,
    viewerConfig,
    formConfig,
    compareEnabled = false,
    compareConfig,
    searchEnabled = false,
    searchConfig,
    onSave,
    onDelete,
  } = config;

  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [compareSlots, setCompareSlots] = useState<[number, number]>([0, 1]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const activeIndex = items.findIndex(item => item.id === activeId);
  const canCompare = compareEnabled && items.length >= 2;
  const maxCompareItems = compareConfig?.maxItems || 2;
  const modalWidth = viewMode === 'compare' ? 'w-[95vw]' : 'w-[800px]';

  // Busca
  const handleSearch = async () => {
    if (!searchConfig || !searchTerm) return;

    setIsSearching(true);
    try {
      const results = await searchConfig.onSearch(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar:', error);
      toast.error('Erro ao realizar busca');
    } finally {
      setIsSearching(false);
    }
  };

  // Adiciona entidade da busca
  const handleSelectSearch = (item: T) => {
    if (searchConfig) {
      searchConfig.onSelect(item);
      setShowSearch(false);
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  // Salva entidade
  const handleSave = async (itemId: string, data: Record<string, unknown>) => {
    if (!onSave) return;

    try {
      await onSave(itemId, data);
      toast.success(`${entity} atualizado com sucesso!`);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      const message =
        error instanceof Error
          ? error.message
          : `Erro ao atualizar ${entity.toLowerCase()}`;
      toast.error('Erro ao salvar', { description: message });
      throw error;
    }
  };

  // Remove item
  const handleRemove = (itemId: string) => {
    onClose(itemId);

    // Se não sobrou nenhum item, mostra busca
    if (items.length === 1 && searchEnabled) {
      setShowSearch(true);
    }

    // Reseta para modo single se estava em compare
    if (viewMode === 'compare') {
      setViewMode('single');
    }
  };

  // Toggle modo de visualização
  const toggleViewMode = () => {
    if (viewMode === 'single' && canCompare) {
      const secondIndex = activeIndex + 1 >= items.length ? 0 : activeIndex + 1;
      setCompareSlots([activeIndex, secondIndex]);
      setViewMode('compare');
    } else {
      setViewMode('single');
    }
  };

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setViewMode('single');
      setCompareSlots([0, 1]);
      setShowSearch(false);
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [open]);

  // Previne scroll do body quando modal aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      } else if (viewMode === 'single' && items.length > 0) {
        const currentIndex = activeIndex;
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
          onActiveChange(items[currentIndex - 1].id);
        } else if (e.key === 'ArrowRight' && currentIndex < items.length - 1) {
          onActiveChange(items[currentIndex + 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, viewMode, activeIndex, items, onActiveChange, onOpenChange]);

  // Busca automática ao digitar
  useEffect(() => {
    if (searchTerm && showSearch) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, showSearch]);

  if (!open) {
    return null;
  }

  // Renderiza painel de comparação
  const renderComparePanel = (slotIndex: number, showBorder?: boolean) => {
    const item = items[compareSlots[slotIndex]];
    if (!item) return null;

    const currentViewerConfig = viewerConfig(item);
    const currentFormConfig = formConfig(item);

    return (
      <div
        className={cn(
          'flex-1 overflow-y-auto p-6',
          showBorder && 'border-r dark:border-gray-800'
        )}
      >
        <EntityViewer
          config={currentViewerConfig}
          formConfig={{
            ...currentFormConfig,
            onSubmit: data => handleSave(item.id, data),
          }}
          onSave={data => handleSave(item.id, data)}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Container */}
      <div
        className={cn(
          'relative bg-white dark:bg-gray-950 rounded-2xl shadow-2xl flex flex-col',
          'h-[90vh] max-h-[90vh]',
          modalWidth,
          viewMode === 'compare' && 'max-w-[95vw]'
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b dark:border-gray-800 bg-linear-to-r from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900 rounded-t-2xl shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Lista de itens */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {items.map((item, index) => {
                const isActive = viewMode === 'single' && item.id === activeId;
                const isInCompare =
                  viewMode === 'compare' &&
                  (compareSlots[0] === index || compareSlots[1] === index);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setShowSearch(false);
                      if (viewMode === 'single') {
                        onActiveChange(item.id);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all shrink-0 cursor-pointer',
                      'hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md',
                      isActive &&
                        'bg-blue-500/30 text-blue-700 dark:text-white border-blue-500',
                      isInCompare &&
                        'bg-green-500/30 text-green-700 dark:text-white border-green-500',
                      !isActive &&
                        !isInCompare &&
                        'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <span className="font-medium text-sm truncate max-w-[150px]">
                      {(item as any).name || item.id}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                      className="ml-1 hover:bg-white/20 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </button>
                );
              })}

              {/* Botão Adicionar */}
              {searchEnabled && items.length < 5 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSearch(true)}
                  className="shrink-0"
                  title={`Adicionar ${entity.toLowerCase()}`}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex items-center gap-1 shrink-0">
              {canCompare && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleViewMode}
                  title={
                    viewMode === 'compare' ? 'Modo Único' : 'Modo Comparação'
                  }
                >
                  <SquareSplitHorizontal
                    className={cn(
                      'w-4 h-4',
                      viewMode === 'compare' && 'text-blue-500'
                    )}
                  />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Área de Visualização */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-gray-50 dark:bg-gray-900">
          {showSearch && searchConfig ? (
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      searchConfig.placeholder ||
                      `Buscar ${entityPlural.toLowerCase()}...`
                    }
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <Eye className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {isSearching ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      Buscando...
                    </p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm
                        ? `Nenhum ${entity.toLowerCase()} encontrado`
                        : `Digite para buscar ${entityPlural.toLowerCase()}`}
                    </p>
                  </div>
                ) : (
                  searchResults.map(result => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectSearch(result)}
                      className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all text-left group"
                    >
                      {searchConfig.renderResult ? (
                        searchConfig.renderResult(result)
                      ) : (
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {(result as any).name || result.id}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center max-w-md space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Eye className="w-10 h-10 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Nenhum {entity.toLowerCase()} selecionado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Clique no botão + para adicionar{' '}
                    {entityPlural.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          ) : viewMode === 'single' && activeId ? (
            <div className="w-full h-full overflow-y-auto p-6">
              {(() => {
                const activeItem = items.find(item => item.id === activeId);
                if (!activeItem) return null;

                const currentViewerConfig = viewerConfig(activeItem);
                const currentFormConfig = formConfig(activeItem);

                return (
                  <EntityViewer
                    config={currentViewerConfig}
                    formConfig={{
                      ...currentFormConfig,
                      onSubmit: data => handleSave(activeItem.id, data),
                    }}
                    onSave={data => handleSave(activeItem.id, data)}
                  />
                );
              })()}
            </div>
          ) : viewMode === 'compare' ? (
            <>
              {renderComparePanel(0, true)}
              {renderComparePanel(1, false)}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
