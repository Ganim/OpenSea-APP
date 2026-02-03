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

import { ProductWorkspace } from '../src/components/workspace';

export default function ProductWorkspacePage() {
  return (
    <div className="h-[calc(100vh-64px)]">
      <ProductWorkspace />
    </div>
  );
}
