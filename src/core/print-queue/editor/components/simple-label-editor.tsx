/**
 * Simple Label Editor Component
 * Editor simplificado de etiquetas baseado em templates
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  FileText,
  Maximize2,
  Minimize2,
  Save,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  FIELD_CATEGORIES,
  LABEL_FIELDS,
  LABEL_SIZE_PRESETS,
} from '../constants';
import type { LabelFieldDefinition } from '../types';
import type { LabelTemplatePreset } from '../templates/label-templates-presets';
import { TemplateSelector } from './template-selector';

interface SimpleLabelEditorProps {
  initialTemplate?: LabelTemplatePreset;
  onSave?: (data: SimpleLabelSaveData) => void;
  onCancel?: () => void;
}

export interface SimpleLabelSaveData {
  name: string;
  description: string;
  width: number;
  height: number;
  html: string;
  css: string;
}

const MM_TO_PX = 3.7795275591;
const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200, 300];

/**
 * Componente principal do editor simplificado
 */
export function SimpleLabelEditor({
  initialTemplate,
  onSave,
  onCancel,
}: SimpleLabelEditorProps) {
  const [name, setName] = useState('Nova Etiqueta');
  const [width, setWidth] = useState(60);
  const [height, setHeight] = useState(40);
  const [zoom, setZoom] = useState(200);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] =
    useState(!initialTemplate);
  const [htmlContent, setHtmlContent] = useState('');
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Carregar template inicial
  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name);
      setWidth(initialTemplate.width);
      setHeight(initialTemplate.height);
      setHtmlContent(initialTemplate.html);
    }
  }, [initialTemplate, setHtmlContent]);

  // Atualizar iframe quando conteúdo muda
  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                * { box-sizing: border-box; }
                body {
                  margin: 0;
                  padding: 0;
                  width: ${width}mm;
                  height: ${height}mm;
                  overflow: hidden;
                }
                [data-field] {
                  cursor: pointer;
                  transition: outline 0.2s;
                }
                [data-field]:hover {
                  outline: 2px dashed #3b82f6;
                  outline-offset: 1px;
                }
                [data-field].selected {
                  outline: 2px solid #3b82f6;
                  outline-offset: 1px;
                  background-color: rgba(59, 130, 246, 0.1);
                }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `);
        doc.close();

        // Adicionar listeners para seleção de campos
        const fields = doc.querySelectorAll('[data-field]');
        fields.forEach(field => {
          field.addEventListener('click', e => {
            e.stopPropagation();
            // Remover seleção anterior
            fields.forEach(f => f.classList.remove('selected'));
            // Adicionar seleção
            (field as HTMLElement).classList.add('selected');
            setSelectedField((field as HTMLElement).getAttribute('data-field'));
          });
        });

        // Clicar fora remove seleção
        doc.body.addEventListener('click', () => {
          fields.forEach(f => f.classList.remove('selected'));
          setSelectedField(null);
        });
      }
    }
  }, [htmlContent, width, height]);

  // Substituir campo no template
  const replaceField = useCallback(
    (oldPath: string, newField: LabelFieldDefinition) => {
      if (!htmlContent) return;

      // Substituir o data-field e o conteúdo
      let newHtml = htmlContent;

      // Regex para encontrar o elemento com o data-field específico
      const regex = new RegExp(
        `(<[^>]*data-field="${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>)([^<]*)(<\/[^>]+>)`,
        'g'
      );

      newHtml = newHtml.replace(regex, (match, opening, content, closing) => {
        // Atualizar o data-field
        const newOpening = opening.replace(
          `data-field="${oldPath}"`,
          `data-field="${newField.dataPath}"`
        );
        // Atualizar o tipo se necessário
        const finalOpening =
          newField.type === 'barcode' || newField.type === 'qrcode'
            ? newOpening.replace(
                /data-type="[^"]*"/,
                `data-type="${newField.type}"`
              )
            : newOpening;

        return `${finalOpening}${newField.sampleValue}${closing}`;
      });

      setHtmlContent(newHtml);
      setSelectedField(newField.dataPath);
    },
    [htmlContent]
  );

  // Ao selecionar um template
  const handleSelectTemplate = useCallback((template: LabelTemplatePreset) => {
    setName(template.name);
    setWidth(template.width);
    setHeight(template.height);
    setHtmlContent(template.html);
    setShowTemplateSelector(false);
  }, []);

  // Salvar
  const handleSave = useCallback(() => {
    if (!onSave) return;

    // Extrair CSS do HTML
    const cssMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
    const css = cssMatch ? cssMatch[1] : '';
    const html = htmlContent.replace(/<style>[\s\S]*?<\/style>/, '');

    onSave({
      name,
      description: '',
      width,
      height,
      html,
      css,
    });
  }, [onSave, name, width, height, htmlContent]);

  // Calcular dimensões do canvas
  const scale = zoom / 100;
  const canvasWidth = Math.round(width * MM_TO_PX * scale);
  const canvasHeight = Math.round(height * MM_TO_PX * scale);

  // Campo selecionado atualmente
  const currentField = selectedField
    ? LABEL_FIELDS.find(f => f.dataPath === selectedField)
    : null;

  return (
    <>
      <TemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        onSelectTemplate={handleSelectTemplate}
      />

      <div
        ref={containerRef}
        className={cn(
          'flex flex-col bg-background',
          isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-card">
          {/* Nome */}
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome do template..."
            className="h-8 w-48 text-sm"
          />

          <Separator orientation="vertical" className="h-6" />

          {/* Preset */}
          <Select
            onValueChange={v => {
              const preset = LABEL_SIZE_PRESETS.find(p => p.id === v);
              if (preset) {
                setWidth(preset.width);
                setHeight(preset.height);
              }
            }}
          >
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Tamanho" />
            </SelectTrigger>
            <SelectContent>
              {LABEL_SIZE_PRESETS.map(preset => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Dimensões */}
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={width}
              onChange={e => setWidth(Number(e.target.value) || 10)}
              className="h-8 w-16 text-xs text-center"
            />
            <span className="text-xs text-muted-foreground">×</span>
            <Input
              type="number"
              value={height}
              onChange={e => setHeight(Number(e.target.value) || 10)}
              className="h-8 w-16 text-xs text-center"
            />
            <span className="text-xs text-muted-foreground">mm</span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Zoom */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(Math.max(50, zoom - 25))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs w-12 text-center">{zoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(Math.min(300, zoom + 25))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>

          {/* Trocar Template */}
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setShowTemplateSelector(true)}
          >
            <FileText className="w-4 h-4 mr-1" />
            Templates
          </Button>

          <div className="flex-1" />

          {/* Ações */}
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          {onSave && (
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Salvar
            </Button>
          )}
        </div>

        {/* Área principal */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Sidebar - Campos disponíveis */}
          <div className="w-56 border-r bg-card flex flex-col min-h-0">
            <div className="p-3 border-b shrink-0">
              <h3 className="font-semibold text-sm">Campos Disponíveis</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedField
                  ? 'Clique em um campo para substituir'
                  : 'Selecione um campo na etiqueta'}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-2 space-y-4">
                {FIELD_CATEGORIES.map(category => (
                  <div key={category.id}>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                      {category.label}
                    </h4>
                    <div className="space-y-1">
                      {category.fields.map(field => (
                        <Button
                          key={field.id}
                          variant={
                            currentField?.id === field.id
                              ? 'secondary'
                              : 'ghost'
                          }
                          size="sm"
                          className="w-full justify-start h-auto py-1.5 px-2"
                          disabled={!selectedField}
                          onClick={() =>
                            selectedField && replaceField(selectedField, field)
                          }
                        >
                          <div className="text-left">
                            <div className="text-xs font-medium">
                              {field.label}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {field.sampleValue}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-900 overflow-auto p-8 flex items-start justify-center">
            <div
              className="bg-white shadow-lg"
              style={{
                width: canvasWidth,
                height: canvasHeight,
              }}
            >
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title="Label Preview"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  width: `${width}mm`,
                  height: `${height}mm`,
                }}
              />
            </div>
          </div>

          {/* Sidebar direita - Propriedades */}
          <div className="w-56 border-l bg-card flex flex-col min-h-0">
            <div className="p-3 border-b shrink-0">
              <h3 className="font-semibold text-sm">Propriedades</h3>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-3">
                {selectedField ? (
                  <Card>
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm">
                        Campo Selecionado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-3">
                      <div>
                        <Label className="text-xs">Campo</Label>
                        <p className="text-sm font-medium">
                          {currentField?.label || selectedField}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs">Caminho</Label>
                        <p className="text-xs text-muted-foreground font-mono">
                          {selectedField}
                        </p>
                      </div>
                      {currentField && (
                        <div>
                          <Label className="text-xs">Exemplo</Label>
                          <p className="text-sm">{currentField.sampleValue}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Clique em um campo na etiqueta para ver suas propriedades
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-xs text-muted-foreground border-t flex justify-between">
          <span>
            Tamanho:{' '}
            <strong>
              {width}mm × {height}mm
            </strong>
          </span>
          <span>
            Zoom: <strong>{zoom}%</strong>
          </span>
        </div>
      </div>
    </>
  );
}

export default SimpleLabelEditor;
