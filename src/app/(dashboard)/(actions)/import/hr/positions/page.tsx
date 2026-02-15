'use client';

import { EntityImportPage } from '../../_shared/components/entity-import-page';

export default function ImportPositionsPage() {
  return (
    <EntityImportPage
      entityType="positions"
      backgroundVariant="none"
      backPath="/hr/positions"
    />
  );
}
