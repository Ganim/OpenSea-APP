'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Tags } from 'lucide-react';
import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';
import dynamic from 'next/dynamic';

import { useWarehouses } from '../src/api';
import { useAllZones } from '../src/api/zones.queries';

// Dynamic import para LabelGenerator (@react-pdf pesado ~400KB)
const LabelGenerator = dynamic(
  () =>
    import('../src/components').then(mod => ({
      default: mod.LabelGenerator,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[300px] rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[250px] rounded-lg" />
          <Skeleton className="h-[120px] rounded-lg" />
          <Skeleton className="h-[100px] rounded-lg" />
        </div>
      </div>
    ),
  }
);

export default function LabelsPage() {
  const {
    data: warehouses,
    isLoading: loadingWarehouses,
    error: warehousesError,
    refetch: refetchWarehouses,
  } = useWarehouses();

  const {
    data: zones,
    isLoading: loadingZones,
    error: zonesError,
    refetch: refetchZones,
  } = useAllZones();

  const isLoading = loadingWarehouses || loadingZones;
  const error = warehousesError || zonesError;

  const handleRefetch = () => {
    refetchWarehouses();
    refetchZones();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb
          items={[
            { label: 'Estoque', href: '/stock' },
            { label: 'Localizações', href: '/stock/locations' },
            { label: 'Etiquetas', href: '/stock/locations/labels' },
          ]}
        />

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gerador de Etiquetas
          </h1>
          <p className="text-muted-foreground">
            Crie etiquetas com QR Code ou código de barras para suas
            localizações
          </p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-destructive">Erro ao carregar dados</p>
          <Button variant="outline" onClick={handleRefetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb
          items={[
            { label: 'Estoque', href: '/stock' },
            { label: 'Localizações', href: '/stock/locations' },
            { label: 'Etiquetas', href: '/stock/locations/labels' },
          ]}
        />

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gerador de Etiquetas
          </h1>
          <p className="text-muted-foreground">
            Crie etiquetas com QR Code ou código de barras para suas
            localizações
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[250px] rounded-lg" />
            <Skeleton className="h-[120px] rounded-lg" />
            <Skeleton className="h-[100px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageBreadcrumb
        items={[
          { label: 'Estoque', href: '/stock' },
          { label: 'Localizações', href: '/stock/locations' },
          { label: 'Etiquetas', href: '/stock/locations/labels' },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Tags className="h-6 w-6" />
          Gerador de Etiquetas
        </h1>
        <p className="text-muted-foreground">
          Crie etiquetas com QR Code ou código de barras para suas localizações
        </p>
      </div>

      {/* Label Generator */}
      <LabelGenerator warehouses={warehouses || []} zones={zones || []} />
    </div>
  );
}
