'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
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
    loading: () => <GridLoading count={3} layout="list" size="md" />,
  }
);

const breadcrumbItems = [
  { label: 'Estoque', href: '/stock' },
  { label: 'Localizações', href: '/stock/locations' },
  { label: 'Etiquetas', href: '/stock/locations/labels' },
];

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
      <PageLayout>
        <PageHeader>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
          <Header
            title="Gerador de Etiquetas"
            description="Crie etiquetas com QR Code ou código de barras para suas localizações"
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="server"
            title="Erro ao carregar dados"
            message="Ocorreu um erro ao tentar carregar os armazéns e zonas."
            action={{
              label: 'Tentar Novamente',
              onClick: handleRefetch,
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
          <Header
            title="Gerador de Etiquetas"
            description="Crie etiquetas com QR Code ou código de barras para suas localizações"
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar breadcrumbItems={breadcrumbItems} />
        <Header
          title="Gerador de Etiquetas"
          description="Crie etiquetas com QR Code ou código de barras para suas localizações"
        />
      </PageHeader>

      <PageBody>
        <LabelGenerator warehouses={warehouses || []} zones={zones || []} />
      </PageBody>
    </PageLayout>
  );
}
