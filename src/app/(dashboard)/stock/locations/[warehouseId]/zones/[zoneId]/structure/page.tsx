'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/stock/locations"
            className="hover:text-foreground transition-colors"
          >
            Localizações
          </Link>
          <span>/</span>
          {isLoadingWarehouse ? (
            <Skeleton className="h-4 w-12" />
          ) : (
            <Link
              href={`/stock/locations/${warehouseId}`}
              className="hover:text-foreground transition-colors"
            >
              {warehouse?.code}
            </Link>
          )}
          <span>/</span>
          {isLoadingZone ? (
            <Skeleton className="h-4 w-12" />
          ) : (
            <span className="font-medium text-foreground">{zone?.code}</span>
          )}
          <span>/</span>
          <span className="font-medium text-foreground">
            Configurar Estrutura
          </span>
        </div>

        {/* Título */}
        <div className="flex items-center gap-4">
          <Link
            href={`/stock/locations/${warehouseId}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
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
                    Configurar Estrutura
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
            Configure a quantidade de corredores, prateleiras e nichos desta
            zona. Após confirmar, todos os nichos serão criados automaticamente.
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
