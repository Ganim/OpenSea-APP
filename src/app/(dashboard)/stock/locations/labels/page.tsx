'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, RefreshCw, Tags } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Voltar para localizações"
          >
            <Link href="/stock/locations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gerador de Etiquetas
            </h1>
            <p className="text-muted-foreground">
              Crie etiquetas com QR Code ou código de barras para suas
              localizações
            </p>
          </div>
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/stock/locations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gerador de Etiquetas
            </h1>
            <p className="text-muted-foreground">
              Crie etiquetas com QR Code ou código de barras para suas
              localizações
            </p>
          </div>
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label="Voltar para localizações"
        >
          <Link href="/stock/locations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Tags className="h-6 w-6" />
            Gerador de Etiquetas
          </h1>
          <p className="text-muted-foreground">
            Crie etiquetas com QR Code ou código de barras para suas
            localizações
          </p>
        </div>
      </div>

      {/* Label Generator */}
      <LabelGenerator warehouses={warehouses || []} zones={zones || []} />
    </div>
  );
}
