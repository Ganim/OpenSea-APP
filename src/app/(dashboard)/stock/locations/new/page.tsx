/**
 * New Location Page
 * Página completa para criação de localização
 */

'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/stock/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateLocation, useLocations } from '@/hooks/stock/use-stock-other';
import type { CreateLocationRequest, LocationType } from '@/types/stock';
import { Save, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function NewLocationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createLocationMutation = useCreateLocation();
  const { data: locations = [] } = useLocations();

  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [locationType, setLocationType] = useState<string>('WAREHOUSE');
  const [parentId, setParentId] = useState('none');
  const [isActive, setIsActive] = useState(true);

  // Ler parâmetro parentId da URL e definir automaticamente
  useEffect(() => {
    const parentIdParam = searchParams.get('parentId');
    if (parentIdParam && parentIdParam !== 'none') {
      // Verificar se a localização pai existe na lista
      const parentLocation = locations.find(loc => loc.id === parentIdParam);
      if (parentLocation) {
        setParentId(parentIdParam);

        // Ajustar o tipo baseado na localização pai (hierarquia)
        if (parentLocation.type === 'WAREHOUSE') {
          setLocationType('ZONE');
        } else if (parentLocation.type === 'ZONE') {
          setLocationType('AISLE');
        } else if (parentLocation.type === 'AISLE') {
          setLocationType('SHELF');
        } else if (parentLocation.type === 'SHELF') {
          setLocationType('BIN');
        }
      }
    }
  }, [searchParams, locations]);

  // Gerar código automaticamente baseado na descrição
  const generateCode = (description: string): string => {
    return description
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^A-Z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '_') // Substitui espaços por _
      .substring(0, 20); // Limita a 20 caracteres
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (!code || code === generateCode(description)) {
      setCode(generateCode(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setIsLoading(true);
      const data: CreateLocationRequest = {
        titulo: description.trim(),
        type: locationType as LocationType,
        parentId: parentId === 'none' ? undefined : parentId || undefined,
        isActive,
      };

      console.log('[CREATE LOCATION] Iniciando criação');
      console.log(
        '[CREATE LOCATION] Dados enviados para API:',
        JSON.stringify(data, null, 2)
      );

      await createLocationMutation.mutateAsync(data);
      toast.success('Localização criada com sucesso!');
      router.push('/stock/locations');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      const errorDetails = JSON.stringify(
        {
          error: message,
          locationName: description,
          locationCode: code,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );

      toast.error('Erro ao criar localização', {
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

  return (
    <ProtectedRoute requiredRole="MANAGER">
      <div className="pb-8">
        <PageHeader
          title="Nova Localização"
          description="Configure uma nova localização para organizar seu estoque"
          showBackButton={true}
          backUrl="/stock/locations"
          buttons={[
            {
              icon: Save,
              text: 'Criar Localização',
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
              onClick: () => router.push('/stock/locations'),
              variant: 'outline',
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
                  onChange={e => handleDescriptionChange(e.target.value)}
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
      </div>
    </ProtectedRoute>
  );
}
