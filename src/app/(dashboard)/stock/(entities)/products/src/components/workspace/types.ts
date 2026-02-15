/**
 * Product Workspace Types
 * Types for the unified product management workspace
 */

import type { Product, Template, Variant, Item } from '@/types/stock';

// ============================================
// HIERARCHY TYPES
// ============================================

export interface HierarchyNode {
  id: string;
  type: 'template' | 'product' | 'variant';
  name: string;
  code?: string;
  children?: HierarchyNode[];
  data: Template | Product | Variant;
  isExpanded?: boolean;
  isSelected?: boolean;
  metadata?: {
    variantCount?: number;
    itemCount?: number;
    totalStock?: number;
    price?: number;
  };
}

export interface HierarchyTreeProps {
  nodes: HierarchyNode[];
  selectedNodeId?: string;
  expandedNodeIds?: Set<string>;
  onNodeSelect: (node: HierarchyNode) => void;
  onNodeExpand: (nodeId: string) => void;
  onNodeCollapse: (nodeId: string) => void;
  onCreateProduct?: (templateId?: string) => void;
  onCreateVariant?: (productId: string) => void;
  isLoading?: boolean;
}

// ============================================
// QUICK ADD TYPES
// ============================================

export interface QuickAddFormData {
  // Step 1: Template
  templateId: string;

  // Step 2: Product
  productName: string;
  productCode?: string;
  productDescription?: string;

  // Step 3: Variant (optional)
  createVariant: boolean;
  variantName?: string;
  variantPrice?: number;
  variantSku?: string;
  variantAttributes?: Record<string, unknown>;

  // Step 4: Initial Stock (optional)
  addInitialStock: boolean;
  stockQuantity?: number;
  stockLocationId?: string;
}

export interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTemplateId?: string;
  defaultProductId?: string;
  onSuccess?: (result: QuickAddResult) => void;
}

export interface QuickAddResult {
  product: Product;
  variant?: Variant;
  items?: Item[];
}

// ============================================
// INLINE CREATOR TYPES
// ============================================

export interface InlineVariantData {
  name: string;
  price: number;
  sku?: string;
  costPrice?: number;
  attributes?: Record<string, unknown>;
  addStock?: boolean;
  stockQuantity?: number;
  stockLocationId?: string;
}

export interface InlineVariantCreatorProps {
  productId: string;
  productName?: string;
  template?: Template;
  onCreated: (variant: Variant) => void;
  onCancel: () => void;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

// ============================================
// BATCH CREATOR TYPES
// ============================================

export interface AttributeOption {
  value: string;
  label: string;
  selected: boolean;
}

export interface AttributeGroup {
  key: string;
  label: string;
  options: AttributeOption[];
}

export interface BatchVariantPreview {
  name: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
}

export interface BatchVariantData {
  attributeGroups: AttributeGroup[];
  basePrice: number;
  skuPrefix: string;
  autoNumberSku: boolean;
}

export interface BatchVariantCreatorProps {
  productId: string;
  productName: string;
  template?: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (variants: Variant[]) => void;
}

// ============================================
// QUICK STOCK ENTRY TYPES
// ============================================

export interface QuickStockEntryData {
  quantity: number;
  locationId: string;
  batchNumber?: string;
  notes?: string;
}

export interface QuickStockEntryProps {
  variantId: string;
  variantName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (item: Item) => void;
}

// ============================================
// WORKSPACE TYPES
// ============================================

export type WorkspaceView = 'hierarchy' | 'grid' | 'table';

export interface WorkspaceState {
  view: WorkspaceView;
  selectedProductId?: string;
  selectedVariantId?: string;
  expandedNodes: Set<string>;
  searchQuery: string;
  isQuickAddOpen: boolean;
  isBatchCreateOpen: boolean;
}

export interface ProductWorkspaceProps {
  initialView?: WorkspaceView;
  initialProductId?: string;
  onProductSelect?: (product: Product) => void;
  onVariantSelect?: (variant: Variant) => void;
}

// ============================================
// DETAIL PANEL TYPES
// ============================================

export interface DetailPanelProps {
  product?: Product;
  variants?: Variant[];
  template?: Template;
  isLoading?: boolean;
  onCreateVariant: () => void;
  onBatchCreate: () => void;
  onEditProduct: () => void;
  onVariantClick: (variant: Variant) => void;
  onQuickStock: (variantId: string) => void;
}

// ============================================
// VARIANT CARD TYPES
// ============================================

export interface VariantCardProps {
  variant: Variant;
  isSelected?: boolean;
  onClick?: () => void;
  onQuickStock?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  stockCount?: number;
}
