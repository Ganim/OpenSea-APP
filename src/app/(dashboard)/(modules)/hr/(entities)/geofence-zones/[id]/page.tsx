/**
 * OpenSea OS - Geofence Zone Detail Page
 */

'use client';

import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { InfoField } from '@/components/shared/info-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePermissions } from '@/hooks/use-permissions';
import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import type { GeofenceZone } from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Radius,
  Trash,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  deleteGeofenceZone,
  formatCoordinates,
  formatDate,
  formatRadius,
  geofenceZonesApi,
  getGoogleMapsUrl,
} from '../src';
import { logger } from '@/lib/logger';

export default function GeofenceZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const zoneId = params.id as string;
  const { hasPermission } = usePermissions();

  const canDelete = hasPermission(HR_PERMISSIONS.GEOFENCE_ZONES.DELETE);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // Since there is no GET by ID endpoint, we fetch all zones and find the one
  // ============================================================================

  const { data: zone, isLoading } = useQuery<GeofenceZone | null>({
    queryKey: ['geofence-zones', zoneId],
    queryFn: async () => {
      const zones = await geofenceZonesApi.list();
      return zones.find(z => z.id === zoneId) ?? null;
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!zone) return;

    setIsDeleting(true);
    try {
      await deleteGeofenceZone(zone.id);
      await queryClient.invalidateQueries({ queryKey: ['geofence-zones'] });
      toast.success('Zona de geofencing excluída com sucesso!');
      router.push('/hr/geofence-zones');
    } catch (error) {
      logger.error(
        'Erro ao excluir zona de geofencing',
        error instanceof Error ? error : undefined
      );
      toast.error('Erro ao excluir zona de geofencing');
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Zonas de Geofencing', href: '/hr/geofence-zones' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!zone) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Zonas de Geofencing', href: '/hr/geofence-zones' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Zona de geofencing não encontrada
            </h2>
            <Button onClick={() => router.push('/hr/geofence-zones')}>
              Voltar para Zonas de Geofencing
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const mapsUrl = getGoogleMapsUrl(zone.latitude, zone.longitude);

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Zonas de Geofencing', href: '/hr/geofence-zones' },
            { label: zone.name },
          ]}
          buttons={[
            ...(canDelete
              ? [
                  {
                    id: 'delete',
                    title: 'Excluir',
                    icon: Trash,
                    onClick: handleDelete,
                    variant: 'outline' as const,
                    disabled: isDeleting,
                  },
                ]
              : []),
          ]}
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br from-teal-500 to-emerald-600">
              <MapPin className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">
                  {zone.name}
                </h1>
                <Badge variant={zone.isActive ? 'success' : 'secondary'}>
                  {zone.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
              {zone.address && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {zone.address}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 shrink-0 text-sm">
              {zone.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-teal-500" />
                  <span>{formatDate(zone.createdAt)}</span>
                </div>
              )}
              {zone.updatedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>{formatDate(zone.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* Dados da Zona */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
            <MapPin className="h-5 w-5" />
            Dados da Zona
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <InfoField
              label="Nome"
              value={zone.name}
              showCopyButton
              copyTooltip="Copiar Nome"
            />
            <InfoField
              label="Status"
              value={zone.isActive ? 'Ativa' : 'Inativa'}
              badge={
                <Badge variant={zone.isActive ? 'success' : 'secondary'}>
                  {zone.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
              }
            />
            <InfoField
              label="Endereço"
              value={zone.address || 'Não informado'}
              showCopyButton={!!zone.address}
              copyTooltip="Copiar Endereço"
            />
          </div>
        </Card>

        {/* Localização */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
            <Navigation className="h-5 w-5" />
            Localização
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <InfoField
              label="Latitude"
              value={zone.latitude.toFixed(6)}
              showCopyButton
              copyTooltip="Copiar Latitude"
            />
            <InfoField
              label="Longitude"
              value={zone.longitude.toFixed(6)}
              showCopyButton
              copyTooltip="Copiar Longitude"
            />
            <InfoField
              label="Coordenadas"
              value={formatCoordinates(zone.latitude, zone.longitude)}
              showCopyButton
              copyTooltip="Copiar Coordenadas"
            />
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(mapsUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir no Google Maps
            </Button>
          </div>
        </Card>

        {/* Área de Cobertura */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
            <Radius className="h-5 w-5" />
            Área de Cobertura
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoField label="Raio" value={formatRadius(zone.radiusMeters)} />
            <InfoField
              label="Raio (metros)"
              value={`${zone.radiusMeters} m`}
              showCopyButton
              copyTooltip="Copiar Raio"
            />
          </div>
        </Card>

        {/* Metadados */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
            <Clock className="h-5 w-5" />
            Metadados
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoField label="Criado em" value={formatDate(zone.createdAt)} />
            <InfoField
              label="Atualizado em"
              value={formatDate(zone.updatedAt)}
            />
          </div>
        </Card>
      </PageBody>

      {/* Delete PIN Modal */}
      <VerifyActionPinModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={confirmDelete}
        title="Excluir Zona de Geofencing"
        description={`Digite seu PIN de ação para excluir a zona "${zone.name}". Esta ação não pode ser desfeita.`}
      />
    </PageLayout>
  );
}
