'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Search, FileText, Check, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { templatesService } from '@/services/stock';
import type { Template } from '@/types/stock';

export interface StepTemplateProps {
  selectedTemplate: Template | null;
  onSelect: (template: Template | null) => void;
  errors?: Record<string, string>;
}

export function StepTemplate({
  selectedTemplate,
  onSelect,
  errors,
}: StepTemplateProps) {
  const [search, setSearch] = useState('');

  // Fetch templates
  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesService.listTemplates(),
  });

  const templates = data?.templates || [];

  const filteredTemplates = templates.filter(
    template =>
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.code?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Selecione o Template</h2>
        <p className="text-sm text-muted-foreground">
          O template define os atributos disponíveis para o produto e suas
          variantes.
        </p>
      </div>

      {(errors?.template || queryError) && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {errors?.template || 'Erro ao carregar templates'}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar template..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Template Grid */}
      <ScrollArea className="h-[400px]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(template => {
            const isSelected = selectedTemplate?.id === template.id;
            return (
              <Card
                key={template.id}
                className={cn(
                  'cursor-pointer transition-all hover:border-primary/50',
                  isSelected &&
                    'border-primary ring-2 ring-primary ring-offset-2'
                )}
                onClick={() => onSelect(isSelected ? null : template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">
                        {template.name}
                      </CardTitle>
                    </div>
                    {isSelected && (
                      <div className="rounded-full bg-primary p-1">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  {template.code && (
                    <CardDescription className="font-mono text-xs">
                      {template.code}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {template.unitOfMeasure}
                    </Badge>

                    {/* Show attribute count */}
                    <div className="flex flex-wrap gap-1">
                      {template.productAttributes &&
                        Object.keys(template.productAttributes).length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {Object.keys(template.productAttributes).length}{' '}
                            atrib. produto
                          </span>
                        )}
                      {template.variantAttributes &&
                        Object.keys(template.variantAttributes).length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            • {Object.keys(template.variantAttributes).length}{' '}
                            atrib. variante
                          </span>
                        )}
                    </div>

                    {/* Care instructions indicator */}
                    {template.careInstructions && (
                      <p className="text-xs text-muted-foreground">
                        Inclui instruções de conservação
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Nenhum template encontrado
          </div>
        )}
      </ScrollArea>

      {/* Selected Template Preview */}
      {selectedTemplate && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Template selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{selectedTemplate.name}</p>
              <p className="text-sm text-muted-foreground">
                Unidade de medida: {selectedTemplate.unitOfMeasure}
              </p>

              {selectedTemplate.productAttributes &&
                Object.keys(selectedTemplate.productAttributes).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Atributos do produto:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(selectedTemplate.productAttributes).map(
                        key => (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="text-xs"
                          >
                            {key}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

              {selectedTemplate.variantAttributes &&
                Object.keys(selectedTemplate.variantAttributes).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Atributos da variante:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(selectedTemplate.variantAttributes).map(
                        key => (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="text-xs"
                          >
                            {key}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
