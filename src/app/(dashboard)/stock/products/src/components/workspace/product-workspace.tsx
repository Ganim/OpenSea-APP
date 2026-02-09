'use client';

/**
 * ProductWorkspace Component
 * Unified workspace for managing products and variants
 * Features:
 * - Hierarchy tree navigation
 * - Detail panel with variants
 * - Quick add modal
 * - Batch variant creation
 * - Keyboard shortcuts
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Search,
  Plus,
  Sparkles,
  Keyboard,
  ChevronDown,
  LayoutGrid,
  List,
  Package,
  RefreshCw,
} from 'lucide-react';

import { HierarchyTree } from './hierarchy-tree';
import { DetailPanel } from './detail-panel';
import { QuickAddModal } from './quick-add-modal';
import { BatchVariantCreator } from './batch-variant-creator';
import {
  useKeyboardShortcuts,
  ShortcutHint,
  SHORTCUTS,
} from './use-keyboard-shortcuts';
import type {
  ProductWorkspaceProps,
  HierarchyNode,
  WorkspaceView,
} from './types';

import { useProducts } from '@/hooks/stock/use-products';
import { useVariants } from '@/hooks/stock/use-variants';
import { useTemplates } from '@/hooks/stock/use-stock-other';
import type { Product, Variant, Template } from '@/types/stock';

// ============================================
// HOOKS
// ============================================

function useWorkspaceData() {
  const queryClient = useQueryClient();
  const {
    data: productsData,
    isLoading: loadingProducts,
    refetch: refetchProducts,
  } = useProducts();
  const {
    data: variantsData,
    isLoading: loadingVariants,
    refetch: refetchVariants,
  } = useVariants();
  const { data: templates = [], isLoading: loadingTemplates } = useTemplates();

  const products = productsData?.products || [];
  const variants = variantsData?.variants || [];

  const isLoading = loadingProducts || loadingVariants || loadingTemplates;

  const refetch = useCallback(() => {
    refetchProducts();
    refetchVariants();
  }, [refetchProducts, refetchVariants]);

  return {
    products,
    variants,
    templates,
    isLoading,
    refetch,
  };
}

function useHierarchyNodes(
  products: Product[],
  variants: Variant[],
  templates: Template[],
  searchQuery: string
) {
  return useMemo(() => {
    // Filter products by search
    const filteredProducts = searchQuery
      ? products.filter(
          p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.fullCode?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : products;

    // Group products by template
    const productsByTemplate = new Map<string, Product[]>();
    filteredProducts.forEach(product => {
      const templateId = product.templateId || 'no-template';
      if (!productsByTemplate.has(templateId)) {
        productsByTemplate.set(templateId, []);
      }
      productsByTemplate.get(templateId)!.push(product);
    });

    // Build hierarchy nodes
    const nodes: HierarchyNode[] = [];

    // Add template nodes
    templates.forEach(template => {
      const templateProducts = productsByTemplate.get(template.id) || [];
      if (templateProducts.length === 0 && searchQuery) return; // Hide empty templates when searching

      const productNodes: HierarchyNode[] = templateProducts.map(product => {
        const productVariants = variants.filter(
          v => v.productId === product.id
        );

        const variantNodes: HierarchyNode[] = productVariants.map(variant => ({
          id: variant.id,
          type: 'variant' as const,
          name: variant.name,
          code: variant.sku,
          data: variant,
          metadata: {
            price: variant.price,
          },
        }));

        return {
          id: product.id,
          type: 'product' as const,
          name: product.name,
          code: product.fullCode,
          data: product,
          children: variantNodes,
          metadata: {
            variantCount: productVariants.length,
          },
        };
      });

      nodes.push({
        id: template.id,
        type: 'template' as const,
        name: template.name,
        code: template.code,
        data: template,
        children: productNodes,
        metadata: {
          variantCount: templateProducts.length,
        },
      });
    });

    // Add products without template
    const noTemplateProducts = productsByTemplate.get('no-template') || [];
    if (noTemplateProducts.length > 0) {
      noTemplateProducts.forEach(product => {
        const productVariants = variants.filter(
          v => v.productId === product.id
        );

        const variantNodes: HierarchyNode[] = productVariants.map(variant => ({
          id: variant.id,
          type: 'variant' as const,
          name: variant.name,
          code: variant.sku,
          data: variant,
          metadata: {
            price: variant.price,
          },
        }));

        nodes.push({
          id: product.id,
          type: 'product' as const,
          name: product.name,
          code: product.fullCode,
          data: product,
          children: variantNodes,
          metadata: {
            variantCount: productVariants.length,
          },
        });
      });
    }

    return nodes;
  }, [products, variants, templates, searchQuery]);
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ProductWorkspace({
  initialView = 'hierarchy',
  initialProductId,
  onProductSelect,
  onVariantSelect,
}: ProductWorkspaceProps) {
  // Data
  const { products, variants, templates, isLoading, refetch } =
    useWorkspaceData();

  // State
  const [view, setView] = useState<WorkspaceView>(initialView);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(
    initialProductId
  );
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isBatchCreateOpen, setIsBatchCreateOpen] = useState(false);
  const [showInlineCreator, setShowInlineCreator] = useState(false);

  // Derive selected product and its variants
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedNodeId);
  }, [products, selectedNodeId]);

  const selectedProductVariants = useMemo(() => {
    if (!selectedProduct) return [];
    return variants.filter(v => v.productId === selectedProduct.id);
  }, [variants, selectedProduct]);

  const selectedTemplate = useMemo(() => {
    if (!selectedProduct) return undefined;
    return templates.find(t => t.id === selectedProduct.templateId);
  }, [templates, selectedProduct]);

  // Build hierarchy
  const hierarchyNodes = useHierarchyNodes(
    products,
    variants,
    templates,
    searchQuery
  );

  // Handlers
  const handleNodeSelect = useCallback(
    (node: HierarchyNode) => {
      if (node.type === 'product') {
        setSelectedNodeId(node.id);
        onProductSelect?.(node.data as Product);
      } else if (node.type === 'variant') {
        onVariantSelect?.(node.data as Variant);
      } else if (node.type === 'template') {
        // Expand/collapse template
        setExpandedNodes(prev => {
          const next = new Set(prev);
          if (next.has(node.id)) {
            next.delete(node.id);
          } else {
            next.add(node.id);
          }
          return next;
        });
      }
    },
    [onProductSelect, onVariantSelect]
  );

  const handleNodeExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => new Set(prev).add(nodeId));
  }, []);

  const handleNodeCollapse = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
  }, []);

  const handleQuickAddSuccess = useCallback(() => {
    refetch();
    toast.success('Dados atualizados');
  }, [refetch]);

  const handleBatchCreateSuccess = useCallback(
    (newVariants: Variant[]) => {
      refetch();
    },
    [refetch]
  );

  const handleVariantClick = useCallback(
    (variant: Variant) => {
      onVariantSelect?.(variant);
    },
    [onVariantSelect]
  );

  const handleQuickStock = useCallback(
    (variantId: string) => {
      refetch();
    },
    [refetch]
  );

  // Search input ref for keyboard focus
  const searchInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      // Store ref for keyboard shortcut
      (window as unknown as Record<string, unknown>).__workspaceSearchInput =
        node;
    }
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onQuickAdd: () => setIsQuickAddOpen(true),
    onNewVariant: () => {
      if (selectedProduct) {
        setShowInlineCreator(true);
      } else {
        toast.info('Selecione um produto primeiro');
      }
    },
    onSearch: () => {
      const input = (window as unknown as Record<string, unknown>)
        .__workspaceSearchInput as HTMLInputElement | undefined;
      input?.focus();
    },
    onEscape: () => {
      setIsQuickAddOpen(false);
      setIsBatchCreateOpen(false);
      setShowInlineCreator(false);
    },
  });

  // Auto-expand selected product's template
  useEffect(() => {
    if (selectedProduct?.templateId) {
      setExpandedNodes(prev => new Set(prev).add(selectedProduct.templateId));
    }
  }, [selectedProduct]);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 border-b">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          <h1 className="text-lg font-semibold">Produtos</h1>
          <Badge variant="secondary" className="text-xs">
            {products.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
            <ShortcutHint
              shortcut="/"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            />
          </div>

          {/* Refresh */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={refetch}>
                  <RefreshCw
                    className={cn('w-4 h-4', isLoading && 'animate-spin')}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Atualizar</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Quick Add Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Sparkles className="w-4 h-4 mr-2" />
                Quick Add
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsQuickAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
                <ShortcutHint
                  shortcut={SHORTCUTS.QUICK_ADD}
                  className="ml-auto"
                />
              </DropdownMenuItem>
              {selectedProduct && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowInlineCreator(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Variante
                    <ShortcutHint
                      shortcut={SHORTCUTS.NEW_VARIANT}
                      className="ml-auto"
                    />
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsBatchCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Variantes em Lote
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar - Hierarchy Tree */}
          <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
            <div className="h-full flex flex-col border-r">
              <div className="p-3 border-b">
                <span className="text-sm font-medium text-muted-foreground">
                  Hierarquia
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <HierarchyTree
                  nodes={hierarchyNodes}
                  selectedNodeId={selectedNodeId}
                  expandedNodeIds={expandedNodes}
                  onNodeSelect={handleNodeSelect}
                  onNodeExpand={handleNodeExpand}
                  onNodeCollapse={handleNodeCollapse}
                  onCreateProduct={() => setIsQuickAddOpen(true)}
                  onCreateVariant={productId => {
                    setSelectedNodeId(productId);
                    setShowInlineCreator(true);
                  }}
                  isLoading={isLoading}
                />
              </div>

              {/* Keyboard hints */}
              <div className="p-3 border-t bg-muted/30">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Keyboard className="w-3 h-3" />
                  <span>Atalhos disponíveis</span>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Panel - Detail */}
          <ResizablePanel defaultSize={75}>
            <DetailPanel
              product={selectedProduct}
              variants={selectedProductVariants}
              template={selectedTemplate}
              isLoading={isLoading && !selectedProduct}
              onCreateVariant={() => setShowInlineCreator(true)}
              onBatchCreate={() => setIsBatchCreateOpen(true)}
              onEditProduct={() => {
                // TODO: Open edit modal
                toast.info('Em desenvolvimento');
              }}
              onVariantClick={handleVariantClick}
              onQuickStock={handleQuickStock}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Modals */}
      <QuickAddModal
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        onSuccess={handleQuickAddSuccess}
      />

      {selectedProduct && (
        <BatchVariantCreator
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          template={selectedTemplate}
          open={isBatchCreateOpen}
          onOpenChange={setIsBatchCreateOpen}
          onCreated={handleBatchCreateSuccess}
        />
      )}
    </div>
  );
}
