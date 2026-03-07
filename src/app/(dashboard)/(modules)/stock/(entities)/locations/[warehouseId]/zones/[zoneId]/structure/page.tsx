'use client';

import React, { use } from 'react';
import { Settings } from 'lucide-react';
import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { useWarehouse, useZone } from '../../../../src/api';
import { StructureWizard } from '../../../../src/components/structure-wizard';

interface PageProps {
  params: Promise<{ warehouseId: string; zoneId: string }>;
}

export default function ZoneStructurePage({ params }: PageProps) {
  const { warehouseId, zoneId } = use(params);

  // Data fetching
  const { data: warehouse, isLoading: isLoadingWarehouse } =
    useWarehouse(warehouseId);
  const { data: zone, isLoading: isLoadingZone } = useZone(zoneId);

  const isLoading = isLoadingWarehouse || isLoadingZone;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumb */}
        <PageBreadcrumb
          items={[
            { label: 'Estoque', href: '/stock' },
            { label: 'Localizações', href: '/stock/locations' },
            {
              label: warehouse?.name || '...',
              href: `/stock/locations/${warehouseId}`,
            },
            {
              label: zone?.name || '...',
              href: `/stock/locations/${warehouseId}/zones/${zoneId}`,
            },
            {
              label: 'Estrutura',
              href: `/stock/locations/${warehouseId}/zones/${zoneId}/structure`,
            },
          ]}
        />

        {/* Título */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <Settings className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-6 w-48 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold tracking-tight">
                    {zone?.structure?.aisles ? 'Reconfigurar' : 'Configurar'}{' '}
                    Estrutura
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {zone?.code} - {zone?.name}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <Card>
        <CardHeader className="border-b">
          <p className="text-sm text-muted-foreground">
            {zone?.structure?.aisles
              ? 'Ajuste a estrutura existente. Nichos com a mesma posição física serão preservados automaticamente.'
              : 'Configure a quantidade de corredores, prateleiras e nichos desta zona. Após confirmar, todos os nichos serão criados automaticamente.'}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <StructureWizard warehouseId={warehouseId} zoneId={zoneId} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
