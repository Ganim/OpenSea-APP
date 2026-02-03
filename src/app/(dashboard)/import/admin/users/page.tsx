'use client';

import { EntityImportPage } from '../../_shared/components/entity-import-page';

export default function ImportUsersPage() {
  return (
    <EntityImportPage
      entityType="users"
      backgroundVariant="none"
      backPath="/admin/users"
    />
  );
}
