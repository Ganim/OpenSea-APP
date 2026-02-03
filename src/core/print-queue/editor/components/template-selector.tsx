/**
 * Template Selector Component
 * Permite selecionar um template pré-definido para começar
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Box, FileText, Gem, LayoutGrid, Package, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  LABEL_TEMPLATE_PRESETS,
  TEMPLATE_CATEGORIES,
  type LabelTemplatePreset,
} from '../templates/label-templates-presets';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: LabelTemplatePreset) => void;
}

// Mapear ícones
const categoryIcons: Record<string, React.ReactNode> = {
  product: <Package className="w-4 h-4" />,
  inventory: <Box className="w-4 h-4" />,
  shelf: <LayoutGrid className="w-4 h-4" />,
  shipping: <Truck className="w-4 h-4" />,
  jewelry: <Gem className="w-4 h-4" />,
};

/**
 * Preview do template
 */
function TemplatePreview({ template }: { template: LabelTemplatePreset }) {
  // Calcular escala para caber no preview (max 200px largura)
  const scale = Math.min(200 / template.width, 150 / template.height, 3);
  const previewWidth = template.width * scale;
  const previewHeight = template.height * scale;

  return (
    <div
      className="bg-white border rounded shadow-sm overflow-hidden"
      style={{
        width: `${previewWidth}px`,
        height: `${previewHeight}px`,
      }}
    >
      <iframe
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                html, body { margin: 0; padding: 0; overflow: hidden; }
                body { transform: scale(${scale}); transform-origin: top left; }
              </style>
            </head>
            <body style="width: ${template.width}mm; height: ${template.height}mm;">
              ${template.html}
            </body>
          </html>
        `}
        className="w-full h-full border-0"
        title={template.name}
        sandbox="allow-same-origin"
      />
    </div>
  );
}

/**
 * Card de template
 */
function TemplateCard({
  template,
  selected,
  onClick,
}: {
  template: LabelTemplatePreset;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        selected && 'ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm">{template.name}</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {template.width}mm × {template.height}mm
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {categoryIcons[template.category]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex justify-center mb-2">
          <TemplatePreview template={template} />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {template.description}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Componente principal de seleção de template
 */
export function TemplateSelector({
  open,
  onOpenChange,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<LabelTemplatePreset | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Filtrar templates por categoria
  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') {
      return LABEL_TEMPLATE_PRESETS;
    }
    return LABEL_TEMPLATE_PRESETS.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onOpenChange(false);
      setSelectedTemplate(null);
    }
  };

  const handleStartBlank = () => {
    // Template em branco
    const blankTemplate: LabelTemplatePreset = {
      id: 'blank',
      name: 'Em Branco',
      description: 'Comece do zero',
      category: 'product',
      width: 60,
      height: 40,
      html: `
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 10px; }
          .label { width: 100%; height: 100%; padding: 2mm; }
        </style>
        <div class="label"></div>
      `,
    };
    onSelectTemplate(blankTemplate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Escolha um Template
          </DialogTitle>
          <DialogDescription>
            Selecione um template pré-definido para começar. Você pode
            personalizar depois.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="text-xs">
              Todos
            </TabsTrigger>
            {TEMPLATE_CATEGORIES.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                <span className="mr-1">{categoryIcons[cat.id]}</span>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={selectedTemplate?.id === template.id}
                    onClick={() => setSelectedTemplate(template)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-4 pt-4 border-t">
          <Button variant="outline" onClick={handleStartBlank}>
            Começar em Branco
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSelect} disabled={!selectedTemplate}>
              Usar Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TemplateSelector;
