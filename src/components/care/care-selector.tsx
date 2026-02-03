'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCareOptions, useProductCare } from '@/hooks/stock';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CareCategorySection } from './care-category-section';
import { CARE_CATEGORIES, MAX_CARE_INSTRUCTIONS } from './constants';
import { SelectedCareList } from './selected-care-list';

interface CareSelectorProps {
  productId: string;
  initialSelectedIds?: string[];
  readOnly?: boolean;
  onSave?: (ids: string[]) => void;
}

/**
 * Componente principal para seleção de instruções de cuidado
 * Apresenta categorias com opções de seleção visual
 */
export function CareSelector({
  productId,
  initialSelectedIds = [],
  readOnly = false,
  onSave,
}: CareSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const { data: options, isLoading, error } = useCareOptions();
  const mutation = useProductCare(productId);

  // Atualizar selectedIds quando initialSelectedIds mudar (ex: após reload da página)
  useEffect(() => {
    setSelectedIds(initialSelectedIds);
  }, [initialSelectedIds]);

  const hasChanges = useMemo(() => {
    const sorted1 = [...selectedIds].sort();
    const sorted2 = [...initialSelectedIds].sort();
    return JSON.stringify(sorted1) !== JSON.stringify(sorted2);
  }, [selectedIds, initialSelectedIds]);

  const handleToggle = useCallback(
    (code: string) => {
      if (readOnly) return;

      setSelectedIds(prev => {
        const isSelected = prev.includes(code);

        if (isSelected) {
          return prev.filter(id => id !== code);
        }

        // Verificar limite
        if (prev.length >= MAX_CARE_INSTRUCTIONS) {
          toast.error(
            `Máximo de ${MAX_CARE_INSTRUCTIONS} instruções permitidas`
          );
          return prev;
        }

        return [...prev, code];
      });
    },
    [readOnly]
  );

  const handleSave = async () => {
    try {
      await mutation.mutateAsync(selectedIds);
      toast.success('Instruções de cuidado atualizadas com sucesso!');
      onSave?.(selectedIds);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao salvar instruções';
      toast.error('Erro ao salvar instruções', { description: message });
    }
  };

  const handleClear = () => {
    setSelectedIds([]);
    toast.success('Instruções limpas');
  };

  // Flatten de todas as opções para busca
  const allOptions = useMemo(() => {
    if (!options) return [];
    return Object.values(options).flat();
  }, [options]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton loader */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-6 gap-3">
                {[...Array(6)].map((_, j) => (
                  <div
                    key={j}
                    className="h-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
          <p className="text-red-700 dark:text-red-300">
            Erro ao carregar opções de cuidado. Por favor, tente novamente.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com contador e ações */}
      <div className="flex items-center justify-between sticky top-0 py-4 z-10 border-b border-gray-200 dark:border-slate-700 -mx-6 px-6 pb-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Instruções de Cuidado (ISO 3758)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {selectedIds.length}/{MAX_CARE_INSTRUCTIONS} instruções selecionadas
          </p>
        </div>

        {!readOnly && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={selectedIds.length === 0 || mutation.isPending}
            >
              Limpar Seleção
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || mutation.isPending}
              className="gap-2"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Salvar Instruções
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Lista de selecionados (preview) */}
      {selectedIds.length > 0 && (
        <SelectedCareList
          allOptions={allOptions}
          selectedIds={selectedIds}
          onRemove={!readOnly ? handleToggle : undefined}
        />
      )}

      {/* Categorias */}
      <div className="space-y-8">
        {CARE_CATEGORIES.map(category => (
          <CareCategorySection
            key={category}
            category={category}
            options={options?.[category] || []}
            selectedIds={selectedIds}
            disabled={readOnly}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Info sobre limite */}
      {!readOnly && (
        <Card className="p-4 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 Você pode selecionar até {MAX_CARE_INSTRUCTIONS} instruções de
            cuidado para este produto. As instruções seguem o padrão ISO 3758
            para etiquetas de cuidado têxtil.
          </p>
        </Card>
      )}
    </div>
  );
}
