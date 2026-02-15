'use client';

import { Header } from '@/components/layout/header';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImportMethodSelector } from '../_shared/components/import-method-selector';
import { CSVUpload } from '../_shared/components/csv-upload';
import { ENTITY_DEFINITIONS } from '../_shared/config/entity-definitions';

type ViewMode = 'select' | 'csv';

export default function ImportTemplatesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('select');

  const entityDef = ENTITY_DEFINITIONS.templates;

  const handleMethodSelect = (method: 'config' | 'csv' | 'spreadsheet') => {
    if (method === 'spreadsheet') {
      router.push('/import/templates/sheets');
    } else if (method === 'csv') {
      setViewMode('csv');
    } else {
      // Para templates, config vai direto para sheets
      router.push('/import/templates/sheets');
    }
  };

  const handleBack = () => {
    if (viewMode === 'select') {
      router.push('/import');
    } else {
      setViewMode('select');
    }
  };

  const handleDataParsed = (data: string[][], headers: string[]) => {
    // Store in sessionStorage for the sheets page to pick up
    sessionStorage.setItem(
      'import-templates-data',
      JSON.stringify({ data, headers })
    );
    router.push('/import/templates/sheets');
  };

  return (
    <PageLayout backgroundVariant="none" maxWidth="full">
      <Header
        title={`Importar ${entityDef.labelPlural}`}
        description={entityDef.description}
        buttons={[
          {
            id: 'back',
            title: 'Voltar',
            icon: ArrowLeft,
            variant: 'outline',
            onClick: handleBack,
          },
        ]}
      />

      {viewMode === 'select' && (
        <ImportMethodSelector
          entityLabel={entityDef.labelPlural}
          onSelectMethod={handleMethodSelect}
          hasConfig={false}
        />
      )}

      {viewMode === 'csv' && (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setViewMode('select')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <CSVUpload onDataParsed={handleDataParsed} />
        </div>
      )}
    </PageLayout>
  );
}
