'use client';

import { Loader2, Receipt } from 'lucide-react';
import { GridError } from '@/components/handlers/grid-error';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { usePosFiscalConfig } from '@/hooks/sales/use-pos-fiscal-config';
import { FiscalConfigForm } from './_components/fiscal-config-form';

export default function PosFiscalPage() {
  const { data, isLoading, error, refetch } = usePosFiscalConfig();

  const breadcrumbItems = [
    { label: 'Vendas', href: '/sales' },
    { label: 'PDV', href: '/sales/pos' },
    { label: 'Configuração fiscal' },
  ];

  return (
    <PageLayout data-testid="pos-fiscal-page">
      <PageHeader>
        <PageActionBar breadcrumbItems={breadcrumbItems} />
      </PageHeader>
      <PageBody>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Configuração fiscal do POS
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Define quais documentos fiscais este tenant emite pelos terminais
            POS e como a emissão acontece (online, contingência ou nenhuma).
            Esta configuração é singleton — uma por tenant.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <GridError
            title="Erro ao carregar configuração fiscal"
            message={
              error instanceof Error
                ? error.message
                : 'Não foi possível carregar a configuração fiscal.'
            }
            action={{
              label: 'Tentar novamente',
              onClick: () => {
                void refetch();
              },
            }}
          />
        ) : (
          <FiscalConfigForm config={data?.fiscalConfig ?? null} />
        )}
      </PageBody>
    </PageLayout>
  );
}
