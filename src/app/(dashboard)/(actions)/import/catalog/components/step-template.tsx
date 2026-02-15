'use client';

// ============================================
// STEP TEMPLATE COMPONENT
// Passo 2: Seleção do Template de Produto
// ============================================

import { useMemo } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileSpreadsheet,
  Package,
  Layers,
  Box,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useTemplates } from '@/hooks/stock/use-stock-other';
import type { Template, TemplateAttribute } from '@/types/stock';

// ============================================
// TYPES
// ============================================

interface StepTemplateProps {
  selectedTemplate: Template | null;
  onTemplateSelect: (template: Template | null) => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function countAttributes(attrs?: Record<string, TemplateAttribute>): number {
  return attrs ? Object.keys(attrs).length : 0;
}

function getRequiredAttributes(
  attrs?: Record<string, TemplateAttribute>
): string[] {
  if (!attrs) return [];
  return Object.entries(attrs)
    .filter(([, attr]) => attr.required)
    .map(([key, attr]) => attr.label || key);
}

// ============================================
// COMPONENT
// ============================================

export function StepTemplate({
  selectedTemplate,
  onTemplateSelect,
}: StepTemplateProps) {
  const { data: templates, isLoading, isError, error } = useTemplates();

  // ============================================
  // MEMOIZED VALUES
  // ============================================

  const sortedTemplates = useMemo(() => {
    if (!templates) return [];
    return [...templates].sort((a, b) => a.name.localeCompare(b.name));
  }, [templates]);

  // ============================================
  // RENDER
  // ============================================

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="relative">
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Erro ao carregar templates
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Erro desconhecido'}
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">
                Nenhum template encontrado
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Crie um template de produto antes de continuar.
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/stock/templates">Ir para Templates</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info card */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Selecione o Template
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                O template define os atributos customizados disponíveis para
                produtos e variantes. Escolha o template que corresponde aos
                dados que você está importando.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedTemplates.map(template => {
          const isSelected = selectedTemplate?.id === template.id;
          const productAttrCount = countAttributes(template.productAttributes);
          const variantAttrCount = countAttributes(template.variantAttributes);
          const itemAttrCount = countAttributes(template.itemAttributes);
          const requiredProductAttrs = getRequiredAttributes(
            template.productAttributes
          );
          const requiredVariantAttrs = getRequiredAttributes(
            template.variantAttributes
          );

          return (
            <Card
              key={template.id}
              className={cn(
                'relative cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary shadow-md',
                !isSelected && 'hover:border-primary/50'
              )}
              onClick={() => onTemplateSelect(isSelected ? null : template)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="rounded-full bg-primary p-1">
                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'rounded-lg p-2',
                      isSelected ? 'bg-primary/10' : 'bg-muted'
                    )}
                  >
                    <FileSpreadsheet
                      className={cn(
                        'h-6 w-6',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {template.name}
                    </CardTitle>
                    {template.code && (
                      <CardDescription className="font-mono text-xs">
                        {template.code}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Attribute counts */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="gap-1">
                    <Package className="h-3 w-3" />
                    {productAttrCount} produto
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Layers className="h-3 w-3" />
                    {variantAttrCount} variante
                  </Badge>
                  {itemAttrCount > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Box className="h-3 w-3" />
                      {itemAttrCount} item
                    </Badge>
                  )}
                </div>

                {/* Required fields preview */}
                {(requiredProductAttrs.length > 0 ||
                  requiredVariantAttrs.length > 0) && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Obrigatórios:</span>{' '}
                    {[...requiredProductAttrs, ...requiredVariantAttrs]
                      .slice(0, 3)
                      .join(', ')}
                    {requiredProductAttrs.length + requiredVariantAttrs.length >
                      3 && '...'}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected template details */}
      {selectedTemplate && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Template Selecionado: {selectedTemplate.name}
            </CardTitle>
            <CardDescription>
              Campos disponíveis para mapeamento na próxima etapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Product attributes */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  Campos do Produto
                </h4>
                <ScrollArea className="h-[200px] rounded-md border p-3">
                  <div className="space-y-2">
                    {/* Fixed fields */}
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm">Nome</span>
                      <Badge variant="destructive" className="text-xs">
                        Obrigatório
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm">Descrição</span>
                      <Badge variant="outline" className="text-xs">
                        Opcional
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm">CNPJ Fabricante</span>
                      <Badge variant="outline" className="text-xs">
                        Opcional
                      </Badge>
                    </div>

                    {/* Template attributes */}
                    {selectedTemplate.productAttributes &&
                      Object.entries(selectedTemplate.productAttributes).map(
                        ([key, attr]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between py-1"
                          >
                            <span className="text-sm">{attr.label || key}</span>
                            <Badge
                              variant={
                                attr.required ? 'destructive' : 'outline'
                              }
                              className="text-xs"
                            >
                              {attr.required ? 'Obrigatório' : 'Opcional'}
                            </Badge>
                          </div>
                        )
                      )}
                  </div>
                </ScrollArea>
              </div>

              {/* Variant attributes */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-500" />
                  Campos da Variante
                </h4>
                <ScrollArea className="h-[200px] rounded-md border p-3">
                  <div className="space-y-2">
                    {/* Fixed fields */}
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm">Nome da Variante</span>
                      <Badge variant="destructive" className="text-xs">
                        Obrigatório
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm">Referência</span>
                      <Badge variant="outline" className="text-xs">
                        Opcional
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm">Cor (Hex)</span>
                      <Badge variant="outline" className="text-xs">
                        Opcional
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm">Cor (Pantone)</span>
                      <Badge variant="outline" className="text-xs">
                        Opcional
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm">Preço</span>
                      <Badge variant="outline" className="text-xs">
                        Opcional
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm">Código de Barras</span>
                      <Badge variant="outline" className="text-xs">
                        Opcional
                      </Badge>
                    </div>

                    {/* Template attributes */}
                    {selectedTemplate.variantAttributes &&
                      Object.entries(selectedTemplate.variantAttributes).map(
                        ([key, attr]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between py-1"
                          >
                            <span className="text-sm">{attr.label || key}</span>
                            <Badge
                              variant={
                                attr.required ? 'destructive' : 'outline'
                              }
                              className="text-xs"
                            >
                              {attr.required ? 'Obrigatório' : 'Opcional'}
                            </Badge>
                          </div>
                        )
                      )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
