'use client';

// ============================================
// STEP MAPPING COMPONENT
// Passo 3: Mapeamento de Colunas
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowRight,
  Package,
  Layers,
  Wand2,
  AlertTriangle,
  CheckCircle,
  X,
  Info,
} from 'lucide-react';
import { useColumnMapper, type SystemField } from '../hooks/use-column-mapper';
import type { Template } from '@/types/stock';
import type { ParsedSheet } from '../../_shared/utils/excel-parser';
import type { ColumnMapping } from '../hooks/use-catalog-import';

// ============================================
// TYPES
// ============================================

interface StepMappingProps {
  parsedSheet: ParsedSheet;
  template: Template;
  columnMapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
  onGroupingColumnChange: (column: string) => void;
}

// ============================================
// CONSTANTS
// ============================================

const UNMAPPED_VALUE = '__unmapped__';

// ============================================
// COMPONENT
// ============================================

export function StepMapping({
  parsedSheet,
  template,
  columnMapping,
  onMappingChange,
  onGroupingColumnChange,
}: StepMappingProps) {
  const [showUnmapped, setShowUnmapped] = useState(false);

  const {
    productFields,
    variantFields,
    autoMap,
    validateMapping,
    getUnmappedFileColumns,
    getUnmappedSystemFields,
  } = useColumnMapper(template);

  const fileColumns = parsedSheet.headers;

  // ============================================
  // VALIDATION
  // ============================================

  const validation = useMemo(
    () => validateMapping(columnMapping, fileColumns),
    [columnMapping, fileColumns, validateMapping]
  );

  const unmappedFileColumns = useMemo(
    () => getUnmappedFileColumns(columnMapping, fileColumns),
    [columnMapping, fileColumns, getUnmappedFileColumns]
  );

  const unmappedSystemFields = useMemo(
    () => getUnmappedSystemFields(columnMapping),
    [columnMapping, getUnmappedSystemFields]
  );

  // ============================================
  // AUTO-MAP ON MOUNT
  // ============================================

  useEffect(() => {
    // Auto-map if no mapping exists
    if (
      Object.keys(columnMapping.product).length === 0 &&
      Object.keys(columnMapping.variant).length === 0 &&
      !columnMapping.groupingColumn
    ) {
      const suggested = autoMap(fileColumns);
      if (suggested.product || suggested.variant || suggested.groupingColumn) {
        onMappingChange({
          product: suggested.product || {},
          variant: suggested.variant || {},
          groupingColumn: suggested.groupingColumn || '',
        });
      }
    }
  }, [fileColumns, autoMap, columnMapping, onMappingChange]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleAutoMap = () => {
    const suggested = autoMap(fileColumns);
    onMappingChange({
      product: suggested.product || {},
      variant: suggested.variant || {},
      groupingColumn: suggested.groupingColumn || columnMapping.groupingColumn,
    });
  };

  const handleClearMapping = () => {
    onMappingChange({
      product: {},
      variant: {},
      groupingColumn: '',
    });
  };

  const handleProductMappingChange = (
    fileColumn: string,
    systemField: string
  ) => {
    const newProductMapping = { ...columnMapping.product };

    if (systemField === UNMAPPED_VALUE) {
      delete newProductMapping[fileColumn];
    } else {
      // Remove previous mapping for this system field
      for (const [col, field] of Object.entries(newProductMapping)) {
        if (field === systemField) {
          delete newProductMapping[col];
        }
      }
      newProductMapping[fileColumn] = systemField;
    }

    onMappingChange({
      ...columnMapping,
      product: newProductMapping,
    });
  };

  const handleVariantMappingChange = (
    fileColumn: string,
    systemField: string
  ) => {
    const newVariantMapping = { ...columnMapping.variant };

    if (systemField === UNMAPPED_VALUE) {
      delete newVariantMapping[fileColumn];
    } else {
      // Remove previous mapping for this system field
      for (const [col, field] of Object.entries(newVariantMapping)) {
        if (field === systemField) {
          delete newVariantMapping[col];
        }
      }
      newVariantMapping[fileColumn] = systemField;
    }

    onMappingChange({
      ...columnMapping,
      variant: newVariantMapping,
    });
  };

  const handleGroupingColumnChange = (column: string) => {
    onGroupingColumnChange(column === UNMAPPED_VALUE ? '' : column);
  };

  // ============================================
  // HELPERS
  // ============================================

  const getMappedSystemField = (
    fileColumn: string,
    type: 'product' | 'variant'
  ): string => {
    const mapping =
      type === 'product' ? columnMapping.product : columnMapping.variant;
    return mapping[fileColumn] || UNMAPPED_VALUE;
  };

  const getFieldLabel = (key: string, fields: SystemField[]): string => {
    const field = fields.find(f => f.key === key);
    return field?.label || key;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Mapeamento de Colunas</h3>
          <p className="text-sm text-muted-foreground">
            Associe as colunas do arquivo aos campos do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleClearMapping}>
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
          <Button variant="outline" size="sm" onClick={handleAutoMap}>
            <Wand2 className="h-4 w-4 mr-1" />
            Auto-mapear
          </Button>
        </div>
      </div>

      {/* Validation status */}
      {!validation.valid && validation.missingRequired.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Campos obrigatórios não mapeados
                </p>
                <ul className="mt-2 space-y-1 text-amber-700 dark:text-amber-300">
                  {validation.missingRequired.map((field, idx) => (
                    <li key={idx}>• {field}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {validation.valid && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Todos os campos obrigatórios estão mapeados
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grouping column selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            Coluna de Agrupamento
          </CardTitle>
          <CardDescription>
            Selecione a coluna que identifica o produto. Linhas com o mesmo
            valor serão agrupadas como variantes do mesmo produto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={columnMapping.groupingColumn || UNMAPPED_VALUE}
            onValueChange={handleGroupingColumnChange}
          >
            <SelectTrigger
              className={cn(
                'w-full max-w-md',
                !columnMapping.groupingColumn && 'border-amber-500'
              )}
            >
              <SelectValue placeholder="Selecione a coluna de agrupamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNMAPPED_VALUE}>
                <span className="text-muted-foreground">Nenhuma</span>
              </SelectItem>
              {fileColumns.map(column => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Mapping grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product fields */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              Campos do Produto
            </CardTitle>
            <CardDescription>
              Mapeie as colunas para os campos do produto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-3">
                {fileColumns.map(column => {
                  const mappedField = getMappedSystemField(column, 'product');
                  const isGroupingColumn =
                    column === columnMapping.groupingColumn;

                  return (
                    <div
                      key={`product-${column}`}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border',
                        isGroupingColumn &&
                          'bg-blue-50 dark:bg-blue-950/30 border-blue-200',
                        mappedField !== UNMAPPED_VALUE &&
                          !isGroupingColumn &&
                          'bg-muted/30'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          title={column}
                        >
                          {column}
                        </p>
                        {isGroupingColumn && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Agrupamento
                          </Badge>
                        )}
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                      <Select
                        value={mappedField}
                        onValueChange={value =>
                          handleProductMappingChange(column, value)
                        }
                        disabled={isGroupingColumn}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Não mapeado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UNMAPPED_VALUE}>
                            <span className="text-muted-foreground">
                              Não mapeado
                            </span>
                          </SelectItem>
                          <SelectGroup>
                            <SelectLabel>Campos do Sistema</SelectLabel>
                            {productFields
                              .filter(f => f.source === 'system')
                              .map(field => (
                                <SelectItem key={field.key} value={field.key}>
                                  <span className="flex items-center gap-2">
                                    {field.label}
                                    {field.required && (
                                      <Badge
                                        variant="destructive"
                                        className="text-[10px] px-1"
                                      >
                                        *
                                      </Badge>
                                    )}
                                  </span>
                                </SelectItem>
                              ))}
                          </SelectGroup>
                          {productFields.some(f => f.source === 'template') && (
                            <SelectGroup>
                              <SelectLabel>Campos do Template</SelectLabel>
                              {productFields
                                .filter(f => f.source === 'template')
                                .map(field => (
                                  <SelectItem key={field.key} value={field.key}>
                                    <span className="flex items-center gap-2">
                                      {field.label}
                                      {field.required && (
                                        <Badge
                                          variant="destructive"
                                          className="text-[10px] px-1"
                                        >
                                          *
                                        </Badge>
                                      )}
                                    </span>
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Variant fields */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-500" />
              Campos da Variante
            </CardTitle>
            <CardDescription>
              Mapeie as colunas para os campos da variante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-3">
                {fileColumns.map(column => {
                  const mappedField = getMappedSystemField(column, 'variant');
                  const isGroupingColumn =
                    column === columnMapping.groupingColumn;

                  return (
                    <div
                      key={`variant-${column}`}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border',
                        isGroupingColumn &&
                          'bg-blue-50 dark:bg-blue-950/30 border-blue-200',
                        mappedField !== UNMAPPED_VALUE &&
                          !isGroupingColumn &&
                          'bg-muted/30'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          title={column}
                        >
                          {column}
                        </p>
                        {isGroupingColumn && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Agrupamento
                          </Badge>
                        )}
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                      <Select
                        value={mappedField}
                        onValueChange={value =>
                          handleVariantMappingChange(column, value)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Não mapeado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UNMAPPED_VALUE}>
                            <span className="text-muted-foreground">
                              Não mapeado
                            </span>
                          </SelectItem>
                          <SelectGroup>
                            <SelectLabel>Campos do Sistema</SelectLabel>
                            {variantFields
                              .filter(f => f.source === 'system')
                              .map(field => (
                                <SelectItem key={field.key} value={field.key}>
                                  <span className="flex items-center gap-2">
                                    {field.label}
                                    {field.required && (
                                      <Badge
                                        variant="destructive"
                                        className="text-[10px] px-1"
                                      >
                                        *
                                      </Badge>
                                    )}
                                  </span>
                                </SelectItem>
                              ))}
                          </SelectGroup>
                          {variantFields.some(f => f.source === 'template') && (
                            <SelectGroup>
                              <SelectLabel>Campos do Template</SelectLabel>
                              {variantFields
                                .filter(f => f.source === 'template')
                                .map(field => (
                                  <SelectItem key={field.key} value={field.key}>
                                    <span className="flex items-center gap-2">
                                      {field.label}
                                      {field.required && (
                                        <Badge
                                          variant="destructive"
                                          className="text-[10px] px-1"
                                        >
                                          *
                                        </Badge>
                                      )}
                                    </span>
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Unmapped columns info */}
      {(unmappedFileColumns.length > 0 || unmappedSystemFields.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Resumo do Mapeamento</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUnmapped(!showUnmapped)}
              >
                {showUnmapped ? 'Ocultar detalhes' : 'Ver detalhes'}
              </Button>
            </div>
          </CardHeader>
          {showUnmapped && (
            <CardContent className="pt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-2">
                    Colunas não mapeadas ({unmappedFileColumns.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {unmappedFileColumns.slice(0, 10).map(col => (
                      <Badge key={col} variant="outline" className="text-xs">
                        {col}
                      </Badge>
                    ))}
                    {unmappedFileColumns.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{unmappedFileColumns.length - 10} mais
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">
                    Campos não preenchidos ({unmappedSystemFields.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {unmappedSystemFields.slice(0, 10).map(field => (
                      <Badge
                        key={field.key}
                        variant={field.required ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {field.label}
                      </Badge>
                    ))}
                    {unmappedSystemFields.length > 10 && (
                      <Badge variant="secondary" className="text-xs">
                        +{unmappedSystemFields.length - 10} mais
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
