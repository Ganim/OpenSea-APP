'use client';

// ============================================
// STEP PREVIEW COMPONENT
// Passo 4: Preview dos dados agrupados
// ============================================

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Package,
  Layers,
  ChevronDown,
  ChevronRight,
  Search,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import {
  useRowGrouper,
  calculateGroupingStatistics,
  type GroupingStatistics,
} from '../hooks/use-row-grouper';
import type { ParsedSheet } from '../../_shared/utils/excel-parser';
import type {
  ColumnMapping,
  GroupedProduct,
} from '../hooks/use-catalog-import';

// ============================================
// TYPES
// ============================================

interface StepPreviewProps {
  parsedSheet: ParsedSheet;
  columnMapping: ColumnMapping;
  groupedProducts: GroupedProduct[];
  onGroupedProductsChange: (products: GroupedProduct[]) => void;
}

// ============================================
// COMPONENT
// ============================================

export function StepPreview({
  parsedSheet,
  columnMapping,
  groupedProducts,
  onGroupedProductsChange,
}: StepPreviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );
  const [isGrouping, setIsGrouping] = useState(false);

  const { groupRows } = useRowGrouper();

  // ============================================
  // GROUPING EFFECT
  // ============================================

  useEffect(() => {
    if (
      groupedProducts.length === 0 &&
      parsedSheet &&
      columnMapping.groupingColumn
    ) {
      handleRegroup();
    }
  }, [parsedSheet, columnMapping]);

  const handleRegroup = () => {
    setIsGrouping(true);
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const grouped = groupRows(parsedSheet, columnMapping);
      onGroupedProductsChange(grouped);
      setIsGrouping(false);

      // Expand first 3 products by default
      const firstThree = new Set(grouped.slice(0, 3).map(p => p.tempId));
      setExpandedProducts(firstThree);
    }, 100);
  };

  // ============================================
  // STATISTICS
  // ============================================

  const statistics: GroupingStatistics = useMemo(
    () => calculateGroupingStatistics(groupedProducts),
    [groupedProducts]
  );

  // ============================================
  // FILTERING
  // ============================================

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return groupedProducts;
    const term = searchTerm.toLowerCase();
    return groupedProducts.filter(product => {
      const productName = String(product.productData.name || '').toLowerCase();
      if (productName.includes(term)) return true;

      return product.variants.some(v =>
        String(v.data.name || '')
          .toLowerCase()
          .includes(term)
      );
    });
  }, [groupedProducts, searchTerm]);

  // ============================================
  // HANDLERS
  // ============================================

  const toggleProduct = (tempId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(tempId)) {
        next.delete(tempId);
      } else {
        next.add(tempId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedProducts(new Set(filteredProducts.map(p => p.tempId)));
  };

  const collapseAll = () => {
    setExpandedProducts(new Set());
  };

  // ============================================
  // RENDER
  // ============================================

  if (isGrouping) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Agrupando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (groupedProducts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhum produto foi agrupado. Verifique o mapeamento de colunas.
          </p>
          <Button variant="outline" className="mt-4" onClick={handleRegroup}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              Resumo do Agrupamento
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {statistics.totalProducts}
              </p>
              <p className="text-xs text-muted-foreground">Produtos</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {statistics.totalVariants}
              </p>
              <p className="text-xs text-muted-foreground">Variantes</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {statistics.averageVariantsPerProduct.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">
                Média var./produto
              </p>
            </div>
            <div
              className={cn(
                'text-center p-3 rounded-lg',
                statistics.productsWithErrors > 0
                  ? 'bg-red-50 dark:bg-red-950/30'
                  : 'bg-green-50 dark:bg-green-950/30'
              )}
            >
              <p
                className={cn(
                  'text-2xl font-bold',
                  statistics.productsWithErrors > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                )}
              >
                {statistics.productsWithErrors > 0
                  ? statistics.productsWithErrors
                  : statistics.totalProducts}
              </p>
              <p className="text-xs text-muted-foreground">
                {statistics.productsWithErrors > 0 ? 'Com erros' : 'Válidos'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings summary */}
      {(statistics.totalErrors > 0 || statistics.totalWarnings > 0) && (
        <Card
          className={cn(
            'border',
            statistics.totalErrors > 0
              ? 'border-red-200 dark:border-red-900'
              : 'border-amber-200 dark:border-amber-900'
          )}
        >
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              {statistics.totalErrors > 0 ? (
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              )}
              <div className="text-sm">
                {statistics.totalErrors > 0 && (
                  <p className="font-medium text-red-900 dark:text-red-100">
                    {statistics.totalErrors} erro(s) encontrado(s)
                  </p>
                )}
                {statistics.totalWarnings > 0 && (
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    {statistics.totalWarnings} aviso(s) encontrado(s)
                  </p>
                )}
                <p className="mt-1 text-muted-foreground">
                  Revise os itens marcados antes de prosseguir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto ou variante..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expandir todos
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Recolher todos
          </Button>
          <Button variant="outline" size="sm" onClick={handleRegroup}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reagrupar
          </Button>
        </div>
      </div>

      {/* Products list */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="divide-y">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Nenhum produto encontrado para "{searchTerm}"
                  </p>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const isExpanded = expandedProducts.has(product.tempId);
                  const hasErrors = product.errors.length > 0;
                  const hasWarnings = product.warnings.length > 0;

                  return (
                    <Collapsible
                      key={product.tempId}
                      open={isExpanded}
                      onOpenChange={() => toggleProduct(product.tempId)}
                    >
                      <CollapsibleTrigger className="w-full">
                        <div
                          className={cn(
                            'flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                            hasErrors && 'bg-red-50/50 dark:bg-red-950/20',
                            hasWarnings &&
                              !hasErrors &&
                              'bg-amber-50/50 dark:bg-amber-950/20'
                          )}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Package className="h-5 w-5 text-blue-500" />
                          </div>

                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium truncate">
                              {String(product.productData.name || 'Sem nome')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Linhas: {product.rowNumbers.join(', ')}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {hasErrors && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {product.errors.length}
                              </Badge>
                            )}
                            {hasWarnings && (
                              <Badge
                                variant="secondary"
                                className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              >
                                <AlertTriangle className="h-3 w-3" />
                                {product.warnings.length}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="gap-1">
                              <Layers className="h-3 w-3" />
                              {product.variants.length}
                            </Badge>
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-3">
                          {/* Product attributes preview */}
                          {Object.keys(product.productData).length > 1 && (
                            <div className="ml-8 p-3 bg-muted/30 rounded-lg">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Dados do Produto
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                {Object.entries(product.productData).map(
                                  ([key, value]) => {
                                    if (key === 'attributes') {
                                      return Object.entries(
                                        value as Record<string, unknown>
                                      ).map(([attrKey, attrValue]) => (
                                        <div key={`attr-${attrKey}`}>
                                          <span className="text-muted-foreground">
                                            {attrKey}:
                                          </span>{' '}
                                          <span className="font-medium">
                                            {String(attrValue)}
                                          </span>
                                        </div>
                                      ));
                                    }
                                    return (
                                      <div key={key}>
                                        <span className="text-muted-foreground">
                                          {key}:
                                        </span>{' '}
                                        <span className="font-medium">
                                          {String(value)}
                                        </span>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}

                          {/* Errors */}
                          {product.errors.length > 0 && (
                            <div className="ml-8 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
                              <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-2">
                                Erros
                              </p>
                              <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
                                {product.errors.map((error, idx) => (
                                  <li key={idx}>• {error.message}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Warnings */}
                          {product.warnings.length > 0 && (
                            <div className="ml-8 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
                              <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2">
                                Avisos
                              </p>
                              <ul className="space-y-1 text-sm text-amber-600 dark:text-amber-400">
                                {product.warnings.map((warning, idx) => (
                                  <li key={idx}>• {warning.message}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Variants list */}
                          <div className="ml-8 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Variantes ({product.variants.length})
                            </p>
                            {product.variants.map(variant => (
                              <div
                                key={variant.tempId}
                                className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg"
                              >
                                <Layers className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {String(variant.data.name || 'Sem nome')}
                                  </p>
                                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    {variant.data.reference != null && (
                                      <span>
                                        Ref: {String(variant.data.reference)}
                                      </span>
                                    )}
                                    {variant.data.colorHex != null && (
                                      <span className="flex items-center gap-1">
                                        <span
                                          className="w-3 h-3 rounded-full border"
                                          style={{
                                            backgroundColor: String(
                                              variant.data.colorHex
                                            ),
                                          }}
                                        />
                                        {String(variant.data.colorHex)}
                                      </span>
                                    )}
                                    {variant.data.price != null && (
                                      <span>
                                        R${' '}
                                        {Number(variant.data.price).toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-xs flex-shrink-0"
                                >
                                  Linha {variant.rowIndex + 1}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Summary footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {filteredProducts.length} de {groupedProducts.length}{' '}
          produtos
        </span>
        {statistics.productsWithErrors === 0 && (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            Todos os dados estão prontos para validação
          </span>
        )}
      </div>
    </div>
  );
}
