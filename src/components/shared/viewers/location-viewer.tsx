/**
 * Location Viewer
 * Componente para visualização detalhada de localização
 */

'use client';

import { EntityViewer } from '@/components/shared/viewers/entity-viewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EntityViewerConfig } from '@/types/entity-config';
import type { Location } from '@/types/stock';
import { MapPin, Package, Users, Warehouse } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LocationViewerProps {
  location: Location;
  onEdit?: () => void;
  showActions?: boolean;
}

export function LocationViewer({
  location,
  onEdit,
  showActions = true,
}: LocationViewerProps) {
  const router = useRouter();

  const config: EntityViewerConfig = {
    entity: 'Localização',
    data: location,
    allowEdit: showActions,
    editLabel: 'Editar Localização',
    onEdit,
    sections: [
      {
        title: 'Informações Básicas',
        fields: [
          {
            label: 'Código',
            value: location.code,
            type: 'text',
          },
          {
            label: 'Nome',
            value: location.name || '-',
            type: 'text',
          },
          {
            label: 'Tipo',
            value: location.type || 'Não definido',
            type: 'badge',
            render: (value: string) => {
              const typeLabels = {
                WAREHOUSE: 'Armazém',
                ZONE: 'Zona',
                AISLE: 'Corredor',
                SHELF: 'Prateleira',
                BIN: 'Compartimento',
                OTHER: 'Outro',
              };
              return (
                <Badge variant="outline">
                  {typeLabels[value as keyof typeof typeLabels] || value}
                </Badge>
              );
            },
          },
          {
            label: 'Status',
            value: location.isActive ? 'Ativa' : 'Inativa',
            type: 'badge',
            render: (value: string) => (
              <Badge variant={value === 'Ativa' ? 'default' : 'secondary'}>
                {value}
              </Badge>
            ),
          },
        ],
      },
      {
        title: 'Capacidade e Ocupação',
        fields: [
          {
            label: 'Capacidade',
            value: location.capacity ? `${location.capacity} unidades` : '-',
            type: 'text',
          },
          {
            label: 'Ocupação Atual',
            value: location.currentOccupancy
              ? `${location.currentOccupancy} unidades`
              : '-',
            type: 'text',
          },
          {
            label: 'Taxa de Ocupação',
            value:
              location.capacity && location.currentOccupancy
                ? `${Math.round(
                    (location.currentOccupancy / location.capacity) * 100
                  )}%`
                : '-',
            type: 'text',
          },
        ],
      },
      {
        title: 'Hierarquia',
        fields: [
          {
            label: 'Localização Pai',
            value: location.parentId || 'Nenhuma (raiz)',
            type: 'text',
          },
        ],
      },
      {
        title: 'Datas',
        fields: [
          {
            label: 'Criado em',
            value: location.createdAt,
            type: 'date',
          },
          {
            label: 'Última atualização',
            value: location.updatedAt || location.createdAt,
            type: 'date',
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <EntityViewer config={config} />

      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Warehouse className="w-4 h-4" />
              <span>
                Localização do tipo{' '}
                {location.type ? location.type.toLowerCase() : 'não definido'}
              </span>
            </div>
            {location.capacity && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="w-4 h-4" />
                <span>
                  {location.currentOccupancy || 0} / {location.capacity}{' '}
                  unidades
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/stock/locations/${location.id}/sublocations`)
              }
            >
              <Users className="w-4 h-4 mr-2" />
              Gerenciar Sublocalizações
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/stock/locations/${location.id}/edit`)
              }
            >
              <MapPin className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
