'use client';

import { EntityImportPage } from '../../_shared/components/entity-import-page';

export default function ImportProductCategoriesPage() {
  return (
    <EntityImportPage
      entityType="product-categories"
      backgroundVariant="none"
      backPath="/stock/product-categories"
    />
  );
}
