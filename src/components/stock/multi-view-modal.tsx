/**
 * Multi View Modal - Customizado
 * Modal para visualização múltipla de templates (até 5 itens)
 * Usa componente compartilhado TemplateViewer
 */

'use client';

import { Button } from '@/components/ui/button';
import { useUpdateTemplate } from '@/hooks/stock';
import { cn } from '@/lib/utils';
import type { Template } from '@/types/stock';
import { Eye, Plus, SquareSplitHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TemplateViewer } from './template-viewer';

// Componente de busca de templates
function SearchTemplates({
  availableTemplates,
  onSelect,
  currentTemplates,
}: {
  availableTemplates: Template[];
  onSelect: (template: Template) => void;
  currentTemplates: Template[];
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const currentIds = currentTemplates.map(t => t.id);
  const filteredTemplates = availableTemplates
    .filter(t => !currentIds.includes(t.id))
    .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <Eye className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'Nenhum template encontrado'
                : 'Todos os templates já estão abertos'}
            </p>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all text-left group"
            >
              <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {template.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Criado em{' '}
                {new Date(template.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// Componente de painel de comparação
function ComparePanel({
  templates,
  selectedIndex,
  onSelectChange,
  showBorder,
  onSave,
}: {
  templates: Template[];
  selectedIndex: number;
  onSelectChange: (index: number) => void;
  showBorder?: boolean;
  onSave?: (data: {
    name: string;
    productAttributes: Record<string, unknown>;
    variantAttributes: Record<string, unknown>;
    itemAttributes: Record<string, unknown>;
  }) => Promise<void>;
}) {
  const handleTemplateChange = (templateId: string) => {
    const newIndex = templates.findIndex(t => t.id === templateId);
    if (newIndex !== -1) {
      onSelectChange(newIndex);
    }
  };

  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto',
        showBorder && 'border-r dark:border-gray-800'
      )}
    >
      <TemplateViewer
        template={templates[selectedIndex]}
        showEditButton={true}
        availableTemplates={templates}
        onTemplateChange={handleTemplateChange}
        onSave={onSave}
        className=""
      />
    </div>
  );
}

interface MultiViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  availableTemplates: Template[];
  onAddTemplate?: (templateId: string) => void;
}

type ViewMode = 'single' | 'compare';

export function MultiViewModal({
  isOpen,
  onClose,
  templates: initialTemplates,
  availableTemplates,
}: MultiViewModalProps) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [compareSlots, setCompareSlots] = useState<[number, number]>([0, 1]);
  const [showSearch, setShowSearch] = useState(false);

  const updateTemplateMutation = useUpdateTemplate();

  const canCompare = templates.length >= 2;
  const modalWidth = viewMode === 'compare' ? 'w-[95vw]' : 'w-[800px]';

  // Função para salvar edições do template
  const handleSaveTemplate = async (data: {
    name: string;
    productAttributes: Record<string, unknown>;
    variantAttributes: Record<string, unknown>;
    itemAttributes: Record<string, unknown>;
  }) => {
    const currentTemplate =
      viewMode === 'single'
        ? templates[activeIndex]
        : templates[compareSlots[0]]; // Salva o template do primeiro painel em modo compare

    console.log('[MODAL] Salvando template:', {
      id: currentTemplate.id,
      name: data.name,
      originalName: currentTemplate.name,
      nameChanged: data.name !== currentTemplate.name,
    });

    // Verificar se houve alguma mudança real
    const hasChanges =
      data.name.trim() !== currentTemplate.name ||
      JSON.stringify(data.productAttributes) !==
        JSON.stringify(currentTemplate.productAttributes) ||
      JSON.stringify(data.variantAttributes) !==
        JSON.stringify(currentTemplate.variantAttributes) ||
      JSON.stringify(data.itemAttributes) !==
        JSON.stringify(currentTemplate.itemAttributes);

    if (!hasChanges) {
      toast.info('Nenhuma alteração detectada');
      return;
    }

    try {
      await updateTemplateMutation.mutateAsync({
        id: currentTemplate.id,
        data,
      });
      toast.success('Template atualizado com sucesso!');

      // Atualizar o template na lista local
      const updatedTemplates = templates.map(t =>
        t.id === currentTemplate.id ? { ...t, ...data } : t
      );
      setTemplates(updatedTemplates);
    } catch (error) {
      console.error('[MODAL] Erro ao salvar template:', error);
      const message =
        error instanceof Error ? error.message : 'Erro ao atualizar template';
      toast.error('Erro ao salvar', { description: message });
      throw error;
    }
  };

  // Sincronizar templates
  useEffect(() => {
    setTemplates(initialTemplates);
  }, [initialTemplates]);

  // Reset ao abrir
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
      setViewMode('single');
      setCompareSlots([0, 1]);
      setShowSearch(false);
    }
  }, [isOpen]);

  // Previne scroll do body quando modal aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (viewMode === 'single') {
        if (e.key === 'ArrowLeft' && activeIndex > 0) {
          setActiveIndex(activeIndex - 1);
        } else if (
          e.key === 'ArrowRight' &&
          activeIndex < templates.length - 1
        ) {
          setActiveIndex(activeIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewMode, activeIndex, templates.length, onClose]);

  const toggleViewMode = () => {
    if (viewMode === 'single' && canCompare) {
      const secondIndex =
        activeIndex + 1 >= templates.length ? 0 : activeIndex + 1;
      setCompareSlots([activeIndex, secondIndex]);
      setViewMode('compare');
    } else {
      setViewMode('single');
    }
  };

  const handleRemove = (index: number) => {
    const newTemplates = templates.filter((_, i) => i !== index);
    setTemplates(newTemplates);

    if (newTemplates.length === 0) {
      setShowSearch(true);
      return;
    }

    // Ajustar índice ativo
    if (activeIndex >= index && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else if (activeIndex >= newTemplates.length) {
      setActiveIndex(newTemplates.length - 1);
    }

    // Resetar para modo single se estava em compare
    if (viewMode === 'compare') {
      setViewMode('single');
    }
  };

  const handleAddTemplate = (template: Template) => {
    if (templates.length >= 5) return;
    setTemplates([...templates, template]);
    setActiveIndex(templates.length);
    setShowSearch(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
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
        <div className="px-4 py-3 border-b dark:border-gray-800 bg-gradient-to-r from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900 rounded-t-2xl shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Lista de Templates */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {templates.map((template, index) => {
                const isActive = viewMode === 'single' && index === activeIndex;
                const isInCompare =
                  viewMode === 'compare' &&
                  (compareSlots[0] === index || compareSlots[1] === index);

                return (
                  <button
                    key={template.id}
                    onClick={() => {
                      setShowSearch(false);
                      if (viewMode === 'single') {
                        setActiveIndex(index);
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
                      {template.name}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                      className="ml-1 hover:bg-white/20 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </button>
                );
              })}

              {/* Botão Adicionar */}
              {templates.length < 5 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSearch(true)}
                  className="shrink-0"
                  title="Adicionar template"
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
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Área de Visualização com componentes nativos */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-gray-50 dark:bg-gray-900">
          {showSearch ? (
            <SearchTemplates
              availableTemplates={availableTemplates}
              onSelect={handleAddTemplate}
              currentTemplates={templates}
            />
          ) : templates.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center max-w-md space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Eye className="w-10 h-10 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Nenhum template selecionado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Clique no botão + para adicionar templates
                  </p>
                </div>
              </div>
            </div>
          ) : viewMode === 'single' ? (
            <div className="w-full h-full overflow-y-auto">
              <TemplateViewer
                template={templates[activeIndex]}
                showEditButton={true}
                onSave={handleSaveTemplate}
                className=""
              />
            </div>
          ) : (
            <>
              <ComparePanel
                templates={templates}
                selectedIndex={compareSlots[0]}
                onSelectChange={index =>
                  setCompareSlots([index, compareSlots[1]])
                }
                onSave={handleSaveTemplate}
                showBorder={true}
              />
              <ComparePanel
                templates={templates}
                selectedIndex={compareSlots[1]}
                onSelectChange={index =>
                  setCompareSlots([compareSlots[0], index])
                }
                onSave={handleSaveTemplate}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
