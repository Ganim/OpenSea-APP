'use client';

/**
 * Product Workspace Page
 * Unified product management with hierarchy tree, quick add, and batch operations
 *
 * Features:
 * - Sidebar with hierarchical product tree
 * - Detail panel with variants
 * - Quick add modal (3 clicks to create product)
 * - Inline variant creation
 * - Batch variant creation
 * - Keyboard shortcuts
 */

import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';
import { ProductWorkspace } from '../src/components/workspace';

export default function ProductWorkspacePage() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <PageBreadcrumb
          items={[
            { label: 'Estoque', href: '/stock' },
            { label: 'Produtos', href: '/stock/products' },
            { label: 'Workspace', href: '/stock/products/workspace' },
          ]}
        />
      </div>
      <div className="flex-1 min-h-0">
        <ProductWorkspace />
      </div>
    </div>
  );
}
