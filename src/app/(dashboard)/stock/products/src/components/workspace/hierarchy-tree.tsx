'use client';

/**
 * HierarchyTree Component
 * Navigable tree view of products and variants
 */

import { cn } from '@/lib/utils';
import type { HierarchyNode, HierarchyTreeProps } from './types';
import {
  ChevronDown,
  ChevronRight,
  Package,
  Palette,
  FileStack,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const NODE_ICONS = {
  template: FileStack,
  product: Package,
  variant: Palette,
} as const;

const NODE_COLORS = {
  template: 'text-amber-500',
  product: 'text-blue-500',
  variant: 'text-purple-500',
} as const;

interface TreeNodeProps {
  node: HierarchyNode;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  onCreateChild?: () => void;
}

function TreeNode({
  node,
  level,
  isSelected,
  isExpanded,
  onSelect,
  onExpand,
  onCollapse,
  onCreateChild,
}: TreeNodeProps) {
  const Icon = NODE_ICONS[node.type];
  const colorClass = NODE_COLORS[node.type];
  const hasChildren = node.children && node.children.length > 0;
  const canHaveChildren = node.type === 'template' || node.type === 'product';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpanded) {
      onCollapse();
    } else {
      onExpand();
    }
  };

  const handleCreateChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateChild?.();
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors',
        'hover:bg-muted/50',
        isSelected && 'bg-primary/10 text-primary'
      )}
      style={{ paddingLeft: `${level * 16 + 8}px` }}
      onClick={onSelect}
      onDoubleClick={hasChildren || canHaveChildren ? handleToggle : undefined}
    >
      {/* Expand/Collapse button */}
      <button
        onClick={handleToggle}
        className={cn(
          'w-4 h-4 flex items-center justify-center rounded hover:bg-muted',
          !hasChildren && !canHaveChildren && 'invisible'
        )}
      >
        {hasChildren || canHaveChildren ? (
          isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )
        ) : null}
      </button>

      {/* Icon */}
      <Icon className={cn('w-4 h-4 shrink-0', colorClass)} />

      {/* Name */}
      <span className="flex-1 truncate text-sm">{node.name}</span>

      {/* Metadata */}
      {node.metadata && (
        <span className="text-xs text-muted-foreground">
          {node.type === 'product' &&
            node.metadata.variantCount !== undefined && (
              <span>{node.metadata.variantCount} var</span>
            )}
          {node.type === 'variant' &&
            node.metadata.totalStock !== undefined && (
              <span>{node.metadata.totalStock} un</span>
            )}
        </span>
      )}

      {/* Quick add button */}
      {canHaveChildren && onCreateChild && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCreateChild}
                className={cn(
                  'w-5 h-5 flex items-center justify-center rounded',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  'hover:bg-primary/20 text-primary'
                )}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {node.type === 'template' ? 'Novo Produto' : 'Nova Variante'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export function HierarchyTree({
  nodes,
  selectedNodeId,
  expandedNodeIds = new Set(),
  onNodeSelect,
  onNodeExpand,
  onNodeCollapse,
  onCreateProduct,
  onCreateVariant,
  isLoading,
}: HierarchyTreeProps) {
  const renderNode = (node: HierarchyNode, level: number) => {
    const isSelected = selectedNodeId === node.id;
    const isExpanded = expandedNodeIds.has(node.id);

    const handleCreateChild = () => {
      if (node.type === 'template') {
        onCreateProduct?.(node.id);
      } else if (node.type === 'product') {
        onCreateVariant?.(node.id);
      }
    };

    return (
      <div key={node.id}>
        <TreeNode
          node={node}
          level={level}
          isSelected={isSelected}
          isExpanded={isExpanded}
          onSelect={() => onNodeSelect(node)}
          onExpand={() => onNodeExpand(node.id)}
          onCollapse={() => onNodeCollapse(node.id)}
          onCreateChild={
            node.type === 'template' || node.type === 'product'
              ? handleCreateChild
              : undefined
          }
        />
        {isExpanded && node.children && (
          <div>{node.children.map(child => renderNode(child, level + 1))}</div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center p-4">
        <Package className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Nenhum produto encontrado
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => onCreateProduct?.()}
        >
          <Plus className="w-4 h-4 mr-1" />
          Criar Produto
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2">{nodes.map(node => renderNode(node, 0))}</div>
    </ScrollArea>
  );
}
