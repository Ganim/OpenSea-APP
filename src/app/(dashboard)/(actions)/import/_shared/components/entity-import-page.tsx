'use client';

import { Header } from '@/components/layout/header';
import { PageLayout } from '@/components/layout/page-layout';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ENTITY_DEFINITIONS, getBasePath } from '../config/entity-definitions';
import type { ImportEntityType } from '../types';
import { CSVUpload } from './csv-upload';
import { ImportMethodSelector } from './import-method-selector';

type ViewMode = 'select' | 'csv';

interface EntityImportPageProps {
  entityType: ImportEntityType;
  backgroundVariant?: 'default' | 'purple' | 'blue' | 'slate' | 'none';
  backPath?: string;
}

export function EntityImportPage({
  entityType,
  backgroundVariant = 'purple',
  backPath = '/import',
}: EntityImportPageProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('select');

  const entityDef = ENTITY_DEFINITIONS[entityType];
  const basePath = getBasePath(entityType);

  if (!entityDef) {
    return (
      <PageLayout backgroundVariant={backgroundVariant} maxWidth="full">
        <div className="text-center py-12">
          <p className="text-destructive">
            Entidade não encontrada: {entityType}
          </p>
        </div>
      </PageLayout>
    );
  }

  const handleMethodSelect = (method: 'config' | 'csv' | 'spreadsheet') => {
    if (method === 'config') {
      router.push(`${basePath}/config`);
    } else if (method === 'spreadsheet') {
      router.push(`${basePath}/sheets`);
    } else {
      setViewMode('csv');
    }
  };

  const handleBack = () => {
    if (viewMode === 'select') {
      router.push(backPath);
    } else {
      setViewMode('select');
    }
  };

  const handleCSVComplete = () => {
    router.push(`${basePath}/sheets`);
  };

  const handleDataParsed = (data: string[][], headers: string[]) => {
    // Store in sessionStorage for the sheets page to pick up
    sessionStorage.setItem(
      `import-${entityType}-data`,
      JSON.stringify({ data, headers })
    );
    handleCSVComplete();
  };

  return (
    <PageLayout backgroundVariant={backgroundVariant} maxWidth="full">
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

      {viewMode === 'csv' && <CSVUpload onDataParsed={handleDataParsed} />}
    </PageLayout>
  );
}
