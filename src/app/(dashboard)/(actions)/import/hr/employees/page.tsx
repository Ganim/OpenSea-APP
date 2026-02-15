'use client';

import { EntityImportPage } from '../../_shared/components/entity-import-page';

export default function ImportEmployeesPage() {
  return (
    <EntityImportPage
      entityType="employees"
      backgroundVariant="none"
      backPath="/hr/employees"
    />
  );
}
