'use client';

import { EntityImportPage } from '../../_shared/components/entity-import-page';

export default function ImportDepartmentsPage() {
  return (
    <EntityImportPage
      entityType="departments"
      backgroundVariant="none"
      backPath="/hr/departments"
    />
  );
}
