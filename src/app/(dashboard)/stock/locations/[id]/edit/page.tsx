/**
 * Edit Location Page
 * Página de edição de localização
 */

'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/stock/page-header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useDeleteLocation,
  useLocation,
  useLocations,
  useUpdateLocation,
} from '@/hooks/stock/use-stock-other';
import type { LocationType, UpdateLocationRequest } from '@/types/stock';
import { Save, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: locationId } = use(params);

  const { data: location, isLoading: isLoadingLocation } =
    useLocation(locationId);
  const { data: locations = [] } = useLocations();
  const updateLocationMutation = useUpdateLocation();
  const deleteLocationMutation = useDeleteLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [locationType, setLocationType] = useState<string>('WAREHOUSE');
  const [parentId, setParentId] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Carregar dados da localização quando disponível
  useEffect(() => {
    if (location) {
      setDescription(location.name || '');
      setLocationType(location.type || '');
      setParentId(location.parentId || 'none');
      setIsActive(location.isActive ?? true);
    }
  }, [location]);

  // Filtrar localizações disponíveis para parent (excluindo a própria e suas sublocalizações)
  const availableParents = locations.filter(l => {
    // Não pode ser pai de si mesma
    if (l.id === locationId) return false;

    // Não pode ser pai de suas próprias sublocalizações (para evitar ciclos)
    const isDescendant = (parentId: string, childId: string): boolean => {
      const child = locations.find(l => l.id === childId);
      if (!child || !child.parentId) return false;
      if (child.parentId === parentId) return true;
      return isDescendant(parentId, child.parentId);
    };

    return !isDescendant(locationId, l.id);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setIsLoading(true);
      const data: UpdateLocationRequest = {
        titulo: description.trim(),
        type: locationType as LocationType,
        parentId: parentId === 'none' ? undefined : parentId || undefined,
        isActive,
      };

      console.log('[EDIT LOCATION] Iniciando atualização');
      console.log('[EDIT LOCATION] Location ID:', locationId);
      console.log('[EDIT LOCATION] Dados:', JSON.stringify(data, null, 2));

      const result = await updateLocationMutation.mutateAsync({
        id: locationId,
        data,
      });

      console.log('[EDIT LOCATION] Sucesso! Resultado:', result);
      toast.success('Localização atualizada com sucesso!');
      router.push(`/stock/locations/${locationId}`);
    } catch (error) {
      console.error('[EDIT LOCATION] Erro capturado:', error);
      console.error('[EDIT LOCATION] Tipo do erro:', error?.constructor?.name);
      console.error(
        '[EDIT LOCATION] Stack:',
        error instanceof Error ? error.stack : 'N/A'
      );

      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      const errorDetails = JSON.stringify(
        {
          error: message,
          locationId,
          errorType: error?.constructor?.name,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );

      toast.error('Erro ao atualizar localização', {
        description: message,
        action: {
          label: 'Copiar erro',
          onClick: () => {
            navigator.clipboard.writeText(errorDetails);
            toast.success('Erro copiado para área de transferência');
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteLocationMutation.mutateAsync(locationId);
      toast.success('Localização excluída com sucesso!');
      router.push('/stock/locations');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao excluir localização', {
        description: message,
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoadingLocation) {
    return (
      <ProtectedRoute requiredRole="MANAGER">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Carregando localização...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="MANAGER">
      <div className="pb-8">
        <PageHeader
          title="Editar Localização"
          description="Atualize as configurações da localização"
          showBackButton={true}
          backUrl={`/stock/locations/${locationId}`}
          buttons={[
            {
              icon: Save,
              text: 'Salvar Alterações',
              onClick: () => {
                const event = { preventDefault: () => {} } as React.FormEvent;
                handleSubmit(event);
              },
              variant: 'default',
              disabled: !description.trim(),
            },
            {
              icon: X,
              text: 'Cancelar',
              onClick: () => router.push(`/stock/locations/${locationId}`),
              variant: 'outline',
            },
            {
              icon: Trash2,
              text: 'Excluir Localização',
              onClick: handleDeleteClick,
              variant: 'destructive',
            },
          ]}
        />

        <form className="space-y-6">
          {/* Campos principais */}
          <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">
                  Nome da Localização <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="description"
                  placeholder="Ex: Armazém Principal, Prateleira A1..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={locationType} onValueChange={setLocationType}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WAREHOUSE">Armazém</SelectItem>
                    <SelectItem value="ZONE">Zona</SelectItem>
                    <SelectItem value="AISLE">Corredor</SelectItem>
                    <SelectItem value="SHELF">Prateleira</SelectItem>
                    <SelectItem value="BIN">Compartimento</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">Localização Pai</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione a localização pai (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Nenhuma (localização raiz)
                    </SelectItem>
                    {availableParents.map(parent => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.name || parent.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive" className="text-sm">
                Localização ativa
              </Label>
            </div>
          </div>
        </form>

        {/* Alert Dialog para confirmação de exclusão */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Tem certeza que deseja excluir esta localização?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A localização &quot;
                {description}
                &quot; será permanentemente removida do sistema, incluindo todas
                as suas sublocalizações.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir Localização'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
