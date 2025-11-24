/**
 * Batch Create Location Modal
 * Modal para criação múltipla de localizações
 * - Permite adicionar vários nomes de uma vez
 * - Código gerado automaticamente para cada um
 * - Tipo definido automaticamente pela hierarquia
 */

'use client';

import { BatchProgressDialog } from '@/components/shared/progress/batch-progress-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateLocation } from '@/hooks/stock/use-stock-other';
import { useBatchOperation } from '@/hooks/use-batch-operation-v2';
import type { CreateLocationRequest, LocationType } from '@/types/stock';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BatchCreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  parentLocation?: {
    id: string;
    type: string;
  };
}

interface LocationItem {
  id: string;
  name: string;
  code: string;
  type: LocationType;
}

export function BatchCreateLocationModal({
  isOpen,
  onClose,
  onSuccess,
  parentLocation,
}: BatchCreateLocationModalProps) {
  const createLocationMutation = useCreateLocation();

  const [locationItems, setLocationItems] = useState<LocationItem[]>([
    { id: '1', name: '', code: '', type: 'WAREHOUSE' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Batch create operation
  const batchCreate = useBatchOperation(
    async (itemData: string) => {
      // itemData é um JSON stringificado com os dados do item
      const item = JSON.parse(itemData);

      const data: CreateLocationRequest = {
        titulo: item.name.trim(),
        type: item.type,
        parentId: parentLocation?.id,
        isActive: true,
      };
      return createLocationMutation.mutateAsync(data);
    },
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onComplete: results => {
        const succeeded = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;

        if (failed === 0) {
          toast.success(
            succeeded === 1
              ? 'Localização criada com sucesso!'
              : `${succeeded} localizações criadas com sucesso!`
          );
        } else if (succeeded > 0) {
          toast.warning(
            `${succeeded} localizações criadas, mas ${failed} falharam.`
          );
        } else {
          toast.error('Erro ao criar localizações');
        }

        onSuccess?.();
        handleClose();
      },
    }
  );

  // Hierarquia automática: Warehouse > Zona > Prateleira > Compartimento > Outro
  const getNextTypeInHierarchy = (parentType?: string): LocationType => {
    const hierarchy: Record<string, LocationType> = {
      WAREHOUSE: 'ZONE',
      ZONE: 'AISLE',
      AISLE: 'SHELF',
      SHELF: 'BIN',
      BIN: 'OTHER',
    };
    return hierarchy[parentType || ''] || 'WAREHOUSE';
  };

  // Gerar código automaticamente (3 primeiros caracteres em maiúsculo)
  const generateCode = (name: string): string => {
    if (!name.trim()) return '';
    return name
      .trim()
      .substring(0, 3)
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^A-Z]/g, ''); // Remove caracteres não alfabéticos
  };

  // Reset form quando modal abre
  useEffect(() => {
    if (isOpen) {
      const defaultType = getNextTypeInHierarchy(parentLocation?.type);
      setLocationItems([{ id: '1', name: '', code: '', type: defaultType }]);
    }
  }, [isOpen, parentLocation]);

  const addLocationItem = () => {
    const newId = Date.now().toString();
    const defaultType = getNextTypeInHierarchy(parentLocation?.type);
    setLocationItems(prev => [
      ...prev,
      { id: newId, name: '', code: '', type: defaultType },
    ]);
  };

  const removeLocationItem = (id: string) => {
    if (locationItems.length > 1) {
      setLocationItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateLocationItem = (id: string, name: string) => {
    setLocationItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, name, code: generateCode(name) } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar se pelo menos um item tem nome
    const validItems = locationItems.filter(item => item.name.trim());
    if (validItems.length === 0) return;

    try {
      setIsLoading(true);

      // Iniciar operação em lote com dados JSON stringificados
      const itemDataList = validItems.map(item =>
        JSON.stringify({
          id: item.id,
          name: item.name.trim(),
          type: item.type,
        })
      );
      await batchCreate.start(itemDataList);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao iniciar criação de localizações', {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setLocationItems([{ id: '1', name: '', code: '', type: 'WAREHOUSE' }]);
    onClose();
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      WAREHOUSE: 'Armazém',
      ZONE: 'Zona',
      AISLE: 'Corredor',
      SHELF: 'Prateleira',
      BIN: 'Compartimento',
      OTHER: 'Outro',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const hasValidItems = locationItems.some(item => item.name.trim());

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <DialogTitle>Criar Múltiplas Localizações</DialogTitle>
            </div>
            <DialogDescription>
              Adicione vários nomes de localização. Os códigos e tipos serão
              gerados automaticamente.
              {parentLocation && (
                <span className="block mt-1 text-sm">
                  Tipo:{' '}
                  {getTypeLabel(getNextTypeInHierarchy(parentLocation.type))}
                  {parentLocation.type &&
                    ` (filho de ${getTypeLabel(parentLocation.type)})`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {locationItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1">
                    <Label
                      htmlFor={`name-${item.id}`}
                      className="text-sm font-medium"
                    >
                      Nome da Localização {index + 1}
                    </Label>
                    <Input
                      id={`name-${item.id}`}
                      placeholder="Ex: Armazém Principal, Prateleira A1..."
                      value={item.name}
                      onChange={e =>
                        updateLocationItem(item.id, e.target.value)
                      }
                      className="mt-1"
                    />
                    {item.name && (
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <div>
                          Código gerado:{' '}
                          <span className="font-mono font-medium">
                            {item.code || '---'}
                          </span>
                        </div>
                        <div>
                          Tipo:{' '}
                          <span className="font-medium">
                            {getTypeLabel(item.type)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {locationItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLocationItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addLocationItem}
                className="w-full"
                disabled={locationItems.length >= 10}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar outra localização
              </Button>

              {locationItems.length >= 10 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Máximo de 10 localizações por vez atingido.
                </p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading || batchCreate.isRunning}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!hasValidItems || isLoading || batchCreate.isRunning}
                className="bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {batchCreate.isRunning
                  ? 'Criando...'
                  : isLoading
                    ? 'Iniciando...'
                    : `Criar ${locationItems.filter(item => item.name.trim()).length} Localização${locationItems.filter(item => item.name.trim()).length !== 1 ? 'ões' : ''}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de progresso para criação em lote */}
      <BatchProgressDialog
        open={!batchCreate.isIdle}
        status={batchCreate.status}
        total={batchCreate.total}
        processed={batchCreate.processed}
        succeeded={batchCreate.succeeded}
        failed={batchCreate.failed}
        progress={batchCreate.progress}
        operationType="create"
        itemName="localizações"
        onClose={() => {
          batchCreate.reset();
          handleClose();
        }}
        onPause={batchCreate.pause}
        onResume={batchCreate.resume}
        onCancel={batchCreate.cancel}
      />
    </>
  );
}
