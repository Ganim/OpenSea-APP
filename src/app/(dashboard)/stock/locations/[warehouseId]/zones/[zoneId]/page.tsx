'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Settings,
  RefreshCw,
  LayoutGrid,
  Info,
  Layers,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

import {
  useWarehouse,
  useZone,
  useBinOccupancy,
  useZoneItemStats,
  API_ENDPOINTS,
  QUERY_KEYS,
} from '../../../src/api';
import { ZoneMap } from '../../../src/components';
import type { BinOccupancy, BinResponse } from '../../../src/types';
import { apiClient } from '@/lib/api-client';
import { itemsService } from '@/services/stock/items.service';
import { useQueryClient } from '@tanstack/react-query';

interface PageProps {
  params: Promise<{
    warehouseId: string;
    zoneId: string;
  }>;
}

export default function ZoneMapPage({ params }: PageProps) {
  const { warehouseId, zoneId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Validar se os IDs são válidos (não "undefined")
  const isValidWarehouseId =
    warehouseId && warehouseId !== 'undefined' && warehouseId.length === 36;
  const isValidZoneId =
    zoneId && zoneId !== 'undefined' && zoneId.length === 36;

  // URL params para highlight de bin
  const highlightBinId = searchParams.get('highlight') || undefined;

  // Data fetching - apenas se IDs são válidos
  const { data: warehouse, isLoading: isLoadingWarehouse } = useWarehouse(
    isValidWarehouseId ? warehouseId : ''
  );
  const { data: zone, isLoading: isLoadingZone } = useZone(
    isValidZoneId ? zoneId : ''
  );
  const {
    data: occupancyData,
    isLoading: isLoadingBins,
    error,
    refetch,
  } = useBinOccupancy(isValidZoneId ? zoneId : '');
  const { data: itemStats } = useZoneItemStats(isValidZoneId ? zoneId : '');
  const queryClient = useQueryClient();

  const handleMoveItem = async (
    itemId: string,
    targetBinAddress: string,
    quantity: number
  ) => {
    // Resolve address to bin ID
    const binResponse = await apiClient.get<BinResponse>(
      API_ENDPOINTS.bins.getByAddress(targetBinAddress)
    );
    const targetBin = binResponse.bin;

    await itemsService.transferItem({
      itemId,
      destinationBinId: targetBin.id,
    });

    toast.success(`Item transferido para ${targetBinAddress}`);

    // Invalidate occupancy data to refresh the map
    refetch();
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.zoneItemStats(zoneId),
    });
  };

  const handlePrintLabels = (binIds: string[]) => {
    // TODO: Implementar impressão de etiquetas
    toast.info(`Gerando ${binIds.length} etiquetas...`);
    console.log('Print labels for bins:', binIds);
  };

  const handleConfigure = () => {
    router.push(`/stock/locations/${warehouseId}/zones/${zoneId}/structure`);
  };

  const handleEditLayout = () => {
    router.push(`/stock/locations/${warehouseId}/zones/${zoneId}/layout`);
  };

  // Invalid IDs state
  if (!isValidWarehouseId || !isValidZoneId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <MapPin className="h-12 w-12 text-muted-foreground/50" />
        <div className="text-center">
          <p className="text-lg font-medium">URL inválida</p>
          <p className="text-sm text-muted-foreground mt-1">
            Os parâmetros da URL são inválidos. Por favor, acesse a zona através
            do menu de localizações.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/stock/locations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ir para Localizações
          </Link>
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoadingZone || isLoadingWarehouse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Skeleton className="h-4 w-24" />
          <span>/</span>
          <Skeleton className="h-4 w-16" />
          <span>/</span>
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Erro ao carregar dados da zona</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  // Zone not found
  if (!zone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <MapPin className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-medium">Zona não encontrada</p>
        <Button variant="outline" asChild>
          <Link href={`/stock/locations/${warehouseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para zonas
          </Link>
        </Button>
      </div>
    );
  }

  // Structure not configured
  if (!zone.structure) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/stock/locations"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Localizações
          </Link>
          <span>/</span>
          <Link
            href={`/stock/locations/${warehouseId}`}
            className="hover:text-foreground transition-colors"
          >
            {warehouse?.code}
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">{zone.code}</span>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 rounded-lg border border-dashed p-8">
          <Settings className="h-12 w-12 text-muted-foreground/50" />
          <div className="text-center">
            <p className="text-lg font-medium">Estrutura não configurada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Configure a estrutura de corredores, prateleiras e nichos
            </p>
          </div>
          <Button onClick={handleConfigure}>
            <Settings className="mr-2 h-4 w-4" />
            Configurar Estrutura
          </Button>
        </div>
      </div>
    );
  }

  const bins: BinOccupancy[] = occupancyData?.bins || [];
  const stats = occupancyData?.stats;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/stock/locations"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Localizações
        </Link>
        <span>/</span>
        <Link
          href={`/stock/locations/${warehouseId}`}
          className="hover:text-foreground transition-colors"
        >
          {warehouse?.code}
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{zone.code}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <Layers className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{zone.name}</h1>
              <Badge variant={zone.isActive ? 'default' : 'secondary'}>
                {zone.isActive ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {warehouse?.code}-{zone.code}
              {zone.description && ` • ${zone.description}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEditLayout}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Layout
          </Button>
          <Button variant="outline" onClick={handleConfigure}>
            <Settings className="mr-2 h-4 w-4" />
            Estrutura
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && stats.total !== undefined && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total de Nichos
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.total?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ocupados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.occupied?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vazios</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.empty?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ocupação</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {stats.occupancyPercentage?.toFixed(1) || '0'}%
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Info className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Blocked Bins Alert */}
      {itemStats &&
        itemStats.blockedBins > 0 &&
        itemStats.itemsInBlockedBins > 0 && (
          <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-900/20">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-300">
              {itemStats.blockedBins} nicho(s) bloqueado(s) com itens
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              <span>
                {itemStats.itemsInBlockedBins} item(ns) precisam ser realocados.
                Use o filtro &quot;Bloqueados&quot; no mapa para visualizá-los e
                mover os itens individualmente.
              </span>
            </AlertDescription>
          </Alert>
        )}

      {/* Zone Map */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Mapa da Zona
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ZoneMap
            zone={zone}
            bins={bins}
            isLoading={isLoadingBins}
            onPrintLabels={handlePrintLabels}
            highlightBinId={highlightBinId}
            onMoveItem={handleMoveItem}
          />
        </CardContent>
      </Card>

      {/* Structure Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            Informações da Estrutura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Corredores</p>
              <p className="text-lg font-semibold">{zone.structure.aisles}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Prateleiras por Corredor
              </p>
              <p className="text-lg font-semibold">
                {zone.structure.shelvesPerAisle}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Nichos por Prateleira
              </p>
              <p className="text-lg font-semibold">
                {zone.structure.binsPerShelf}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Direção dos Nichos
              </p>
              <p className="text-lg font-semibold">
                {zone.structure.codePattern.binDirection.toUpperCase() ===
                'BOTTOM_UP'
                  ? 'Baixo → Cima'
                  : 'Cima → Baixo'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
