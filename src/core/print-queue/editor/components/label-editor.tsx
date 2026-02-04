/**
 * Label Editor Component
 * Editor WYSIWYG para criar templates de etiquetas usando GrapesJS
 */

'use client';

import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import GjsEditor, { Canvas, useEditorMaybe } from '@grapesjs/react';
import type { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import {
  Grid3X3,
  Maximize2,
  Minimize2,
  Redo2,
  RotateCcw,
  Save,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { EditorRuler, RulerCorner } from './editor-ruler';

import { EDITOR_CANVAS_CSS, LABEL_SIZE_PRESETS } from '../constants';
import { labelBlocksPlugin } from '../plugins/label-blocks-plugin';
import type { LabelEditorProps, LabelEditorSaveData } from '../types';
import {
  extractFromEditor,
  loadProject,
  serializeProject,
} from '../utils/template-compiler';

// Níveis de zoom disponíveis
const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200, 300, 400];
const DEFAULT_ZOOM = 200;
const MM_TO_PX = 3.7795275591; // Conversão mm para px (96dpi)

// Estilos customizados para o editor
const editorStyles = `
  .gjs-one-bg {
    background-color: hsl(var(--background));
  }
  .gjs-two-color {
    color: hsl(var(--foreground));
  }
  .gjs-three-bg {
    background-color: hsl(var(--muted));
  }
  .gjs-four-color, .gjs-four-color-h:hover {
    color: hsl(var(--primary));
  }
  .gjs-block {
    padding: 8px;
    margin: 4px;
    border-radius: 4px;
    border: 1px solid hsl(var(--border));
    background: hsl(var(--card));
  }
  .gjs-block:hover {
    border-color: hsl(var(--primary));
  }
  .gjs-block-label {
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }
  .gjs-category-title {
    font-weight: 600;
    padding: 10px;
    border-bottom: 1px solid hsl(var(--border));
  }
  .gjs-sm-sector-title {
    font-weight: 600;
    padding: 8px 10px;
    background: hsl(var(--muted));
  }
  .gjs-clm-tags {
    padding: 8px;
  }
  .gjs-frame-wrapper {
    background: white !important;
  }
  .canvas-grid {
    background-image:
      linear-gradient(to right, rgba(200,200,200,0.5) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(200,200,200,0.5) 1px, transparent 1px);
    background-size: 10px 10px;
  }
  .canvas-grid-fine {
    background-image:
      linear-gradient(to right, rgba(180,180,180,0.3) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(180,180,180,0.3) 1px, transparent 1px),
      linear-gradient(to right, rgba(150,150,150,0.5) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(150,150,150,0.5) 1px, transparent 1px);
    background-size: 5px 5px, 5px 5px, 10px 10px, 10px 10px;
  }
`;

/**
 * Toolbar do Editor
 */
function EditorToolbar({
  name,
  setName,
  width,
  setWidth,
  height,
  setHeight,
  zoom,
  setZoom,
  showGrid,
  setShowGrid,
  isFullscreen,
  setIsFullscreen,
  onSave,
  onCancel,
  readOnly,
}: {
  name: string;
  setName: (v: string) => void;
  width: number;
  setWidth: (v: number) => void;
  height: number;
  setHeight: (v: number) => void;
  zoom: number;
  setZoom: (v: number) => void;
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (v: boolean) => void;
  onSave?: (data: LabelEditorSaveData) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}) {
  const editor = useEditorMaybe();

  const handleSave = useCallback(() => {
    if (!onSave || !editor) return;

    const { html, css } = extractFromEditor(editor);
    const grapesJsData = serializeProject(editor);

    onSave({
      name,
      description: '',
      width,
      height,
      grapesJsData,
      compiledHtml: html,
      compiledCss: css,
    });
  }, [editor, onSave, name, width, height]);

  const handlePresetChange = useCallback(
    (presetId: string) => {
      const preset = LABEL_SIZE_PRESETS.find(p => p.id === presetId);
      if (preset) {
        setWidth(preset.width);
        setHeight(preset.height);
      }
    },
    [setWidth, setHeight]
  );

  const handleUndo = useCallback(() => editor?.UndoManager.undo(), [editor]);
  const handleRedo = useCallback(() => editor?.UndoManager.redo(), [editor]);

  const handleZoomIn = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  }, [zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    }
  }, [zoom, setZoom]);

  const handleResetZoom = useCallback(() => setZoom(DEFAULT_ZOOM), [setZoom]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-card/95 backdrop-blur-sm">
        {/* Nome do Template */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome do template..."
            disabled={readOnly}
            className="h-8 text-sm"
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Preset de Tamanho */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">
            Preset:
          </Label>
          <Select onValueChange={handlePresetChange} disabled={readOnly}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Personalizado" />
            </SelectTrigger>
            <SelectContent>
              {LABEL_SIZE_PRESETS.map(preset => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Dimensões */}
        <div className="flex items-center gap-1.5">
          <Label className="text-xs text-muted-foreground">L:</Label>
          <Input
            type="number"
            value={width}
            onChange={e => setWidth(Number(e.target.value) || 10)}
            min={10}
            max={999}
            disabled={readOnly}
            className="h-8 w-[70px] text-xs text-center tabular-nums"
          />
          <span className="text-xs text-muted-foreground">mm</span>

          <X className="w-3 h-3 text-muted-foreground mx-1" />

          <Label className="text-xs text-muted-foreground">A:</Label>
          <Input
            type="number"
            value={height}
            onChange={e => setHeight(Number(e.target.value) || 10)}
            min={10}
            max={999}
            disabled={readOnly}
            className="h-8 w-[70px] text-xs text-center tabular-nums"
          />
          <span className="text-xs text-muted-foreground">mm</span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Controles de Zoom */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomOut}
                disabled={zoom <= ZOOM_LEVELS[0]}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Diminuir zoom</TooltipContent>
          </Tooltip>

          <Select value={String(zoom)} onValueChange={v => setZoom(Number(v))}>
            <SelectTrigger className="h-8 w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ZOOM_LEVELS.map(level => (
                <SelectItem key={level} value={String(level)}>
                  {level}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomIn}
                disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Aumentar zoom</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleResetZoom}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Resetar zoom ({DEFAULT_ZOOM}%)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Grid Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showGrid ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {showGrid ? 'Ocultar grid' : 'Mostrar grid'}
          </TooltipContent>
        </Tooltip>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleUndo}
                disabled={readOnly}
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Desfazer (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleRedo}
                disabled={readOnly}
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refazer (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Fullscreen */}
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            {isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          </TooltipContent>
        </Tooltip>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Ações */}
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          {onSave && !readOnly && (
            <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
              <Save className="w-4 h-4 mr-1" />
              Salvar
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * Componente principal do editor de etiquetas
 */
// Constante para o tamanho da régua
const RULER_SIZE = 20;

export function LabelEditor({
  template,
  initialWidth = 60,
  initialHeight = 40,
  onSave,
  onCancel,
  readOnly = false,
}: LabelEditorProps) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [width, setWidth] = useState(template?.width || initialWidth);
  const [height, setHeight] = useState(template?.height || initialHeight);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [showGrid, setShowGrid] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Função para sincronizar estilos CSS para inline no componente selecionado
  const syncStylesToComponent = useCallback((editor: Editor) => {
    const selected = editor.getSelected();
    if (!selected) return;

    // Obter os seletores do componente
    const selectors = selected.getSelectors();
    if (!selectors || selectors.length === 0) return;

    // Buscar todas as regras CSS que correspondem aos seletores do componente
    const cssComposer = editor.CssComposer;
    const allRules = cssComposer.getAll();
    const styles: Record<string, string> = {};

    allRules.forEach((rule: any) => {
      const ruleSelectors = rule.getSelectors();
      let matches = false;

      // Verificar se algum seletor da regra corresponde aos seletores do componente
      ruleSelectors.forEach((ruleSel: any) => {
        const ruleSelName =
          ruleSel.get('name') || ruleSel.getFullName?.() || '';
        selectors.forEach((compSel: any) => {
          const compSelName =
            compSel.get('name') || compSel.getFullName?.() || '';
          if (ruleSelName && compSelName && ruleSelName === compSelName) {
            matches = true;
          }
        });
      });

      if (matches) {
        const ruleStyle = rule.getStyle();
        Object.assign(styles, ruleStyle);
      }
    });

    // Aplicar estilos inline ao componente
    if (Object.keys(styles).length > 0) {
      const currentStyle = selected.getStyle() || {};
      selected.setStyle({ ...currentStyle, ...styles });
    }
  }, []);

  // Configuração do GrapesJS
  const onEditor = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      // Carregar projeto existente se houver
      if (template?.grapesJsData) {
        try {
          loadProject(editor, template.grapesJsData);
        } catch (error) {
          logger.error('Failed to load template', error as Error, {
            component: 'label-editor',
            templateId: template.id,
          });
        }
      }

      // Configurar canvas CSS
      const frameEl = editor.Canvas.getFrameEl();
      if (frameEl) {
        const doc = frameEl.contentDocument;
        if (doc) {
          const style = doc.createElement('style');
          style.innerHTML = EDITOR_CANVAS_CSS;
          doc.head.appendChild(style);
        }
      }

      // SOLUÇÃO: Usar o evento correto do StyleManager
      // O StyleManager emite eventos quando propriedades são alteradas

      // 1. Quando uma propriedade de estilo é atualizada
      editor.on('style:property:update', (prop: any, val: any) => {
        const selected = editor.getSelected();
        if (selected) {
          const property = prop?.get?.('property') || prop?.property || prop;
          const value = val || prop?.get?.('value') || prop?.getFullValue?.();
          if (property && value) {
            selected.addStyle({ [property]: value });
          }
        }
      });

      // 2. Monitorar mudanças no target do StyleManager
      editor.on('style:target', (target: any) => {
        // Quando o target muda, sincronizar estilos
        setTimeout(() => syncStylesToComponent(editor), 100);
      });

      // 3. Monitorar mudanças gerais de estilo
      editor.on('style:change', () => {
        setTimeout(() => syncStylesToComponent(editor), 100);
      });

      // 4. Quando componente é selecionado
      editor.on('component:selected', (component: any) => {
        if (component) {
          setTimeout(() => syncStylesToComponent(editor), 100);
        }
      });

      // 5. Monitorar mudanças em regras CSS específicas
      const cssRules = editor.CssComposer.getAll();
      cssRules.on('change', () => {
        setTimeout(() => syncStylesToComponent(editor), 100);
      });

      // 6. Adicionar listener ao StyleManager para cada setor/propriedade
      editor.on('load', () => {
        const sm = editor.StyleManager;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sm.getSectors().forEach((sector: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sector.getProperties().forEach((prop: any) => {
            prop.on('change', () => {
              const selected = editor.getSelected();
              if (selected) {
                const propName = prop.get('property');
                const propValue = prop.getFullValue();
                if (propName && propValue) {
                  selected.addStyle({ [propName]: propValue });
                }
              }
            });
          });
        });
      });
    },
    [template, syncStylesToComponent]
  );

  // Calcular dimensões do canvas baseado no zoom
  const scale = zoom / 100;
  const canvasWidthPx = Math.round(width * MM_TO_PX * scale);
  const canvasHeightPx = Math.round(height * MM_TO_PX * scale);

  // Atualizar device quando dimensões mudam
  useEffect(() => {
    if (editorRef.current) {
      const dm = editorRef.current.DeviceManager;
      const device = dm.get('label');
      if (device) {
        device.set('width', `${canvasWidthPx}px`);
        device.set('height', `${canvasHeightPx}px`);
      }
    }
  }, [canvasWidthPx, canvasHeightPx]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col bg-background',
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
      )}
    >
      <style>{editorStyles}</style>

      <GjsEditor
        className="flex-1 flex flex-col min-h-0"
        grapesjs="https://unpkg.com/grapesjs"
        options={{
          height: '100%',
          storageManager: false,
          undoManager: { trackSelection: false },
          // Configurar para usar estilos inline
          selectorManager: {
            componentFirst: true,
            // Configurar para aplicar estilos diretamente no componente
          },
          // Configuração para evitar uso de classes CSS
          avoidInlineStyle: false, // Permitir estilos inline
          blockManager: {
            appendTo: '#blocks-container',
          },
          styleManager: {
            appendTo: '#styles-container',
            sectors: [
              {
                name: 'Tipografia',
                open: true,
                properties: [
                  {
                    property: 'font-family',
                    type: 'select',
                    defaults: 'Arial, sans-serif',
                    options: [
                      { id: 'Arial, sans-serif', label: 'Arial' },
                      { id: 'Helvetica, sans-serif', label: 'Helvetica' },
                      { id: 'Verdana, sans-serif', label: 'Verdana' },
                      {
                        id: '"Times New Roman", serif',
                        label: 'Times New Roman',
                      },
                      { id: 'Georgia, serif', label: 'Georgia' },
                      { id: '"Courier New", monospace', label: 'Courier New' },
                      { id: 'monospace', label: 'Monospace' },
                      { id: '"Roboto", sans-serif', label: 'Roboto' },
                      { id: '"Open Sans", sans-serif', label: 'Open Sans' },
                    ],
                  },
                  {
                    property: 'font-size',
                    type: 'integer',
                    units: ['px', 'pt', 'em'],
                    defaults: '10px',
                    min: 6,
                    max: 72,
                  },
                  {
                    property: 'font-weight',
                    type: 'select',
                    defaults: 'normal',
                    options: [
                      { id: 'normal', label: 'Normal' },
                      { id: 'bold', label: 'Negrito' },
                      { id: '100', label: 'Thin (100)' },
                      { id: '300', label: 'Light (300)' },
                      { id: '500', label: 'Medium (500)' },
                      { id: '600', label: 'Semi-Bold (600)' },
                      { id: '700', label: 'Bold (700)' },
                      { id: '900', label: 'Black (900)' },
                    ],
                  },
                  {
                    property: 'color',
                    type: 'color',
                    defaults: '#000000',
                  },
                  {
                    property: 'text-align',
                    type: 'radio',
                    defaults: 'left',
                    options: [
                      { id: 'left', label: 'E' },
                      { id: 'center', label: 'C' },
                      { id: 'right', label: 'D' },
                      { id: 'justify', label: 'J' },
                    ],
                  },
                  {
                    property: 'line-height',
                    type: 'integer',
                    units: ['px', 'em', '%'],
                    defaults: 'normal',
                  },
                  {
                    property: 'letter-spacing',
                    type: 'integer',
                    units: ['px', 'em'],
                    defaults: 'normal',
                  },
                  {
                    property: 'text-decoration',
                    type: 'select',
                    defaults: 'none',
                    options: [
                      { id: 'none', label: 'Nenhum' },
                      { id: 'underline', label: 'Sublinhado' },
                      { id: 'line-through', label: 'Tachado' },
                      { id: 'overline', label: 'Sobrelinha' },
                    ],
                  },
                  {
                    property: 'text-transform',
                    type: 'select',
                    defaults: 'none',
                    options: [
                      { id: 'none', label: 'Normal' },
                      { id: 'uppercase', label: 'MAIÚSCULAS' },
                      { id: 'lowercase', label: 'minúsculas' },
                      { id: 'capitalize', label: 'Capitalizar' },
                    ],
                  },
                ],
              },
              {
                name: 'Dimensões',
                open: false,
                properties: [
                  {
                    property: 'width',
                    type: 'integer',
                    units: ['px', 'mm', '%', 'auto'],
                    defaults: 'auto',
                  },
                  {
                    property: 'height',
                    type: 'integer',
                    units: ['px', 'mm', '%', 'auto'],
                    defaults: 'auto',
                  },
                  {
                    property: 'min-width',
                    type: 'integer',
                    units: ['px', 'mm', '%'],
                  },
                  {
                    property: 'max-width',
                    type: 'integer',
                    units: ['px', 'mm', '%'],
                  },
                ],
              },
              {
                name: 'Espaçamento',
                open: false,
                properties: [
                  {
                    property: 'padding',
                    type: 'composite',
                    properties: [
                      {
                        property: 'padding-top',
                        type: 'integer',
                        units: ['px', 'mm', '%'],
                        defaults: '0',
                      },
                      {
                        property: 'padding-right',
                        type: 'integer',
                        units: ['px', 'mm', '%'],
                        defaults: '0',
                      },
                      {
                        property: 'padding-bottom',
                        type: 'integer',
                        units: ['px', 'mm', '%'],
                        defaults: '0',
                      },
                      {
                        property: 'padding-left',
                        type: 'integer',
                        units: ['px', 'mm', '%'],
                        defaults: '0',
                      },
                    ],
                  },
                  {
                    property: 'margin',
                    type: 'composite',
                    properties: [
                      {
                        property: 'margin-top',
                        type: 'integer',
                        units: ['px', 'mm', '%', 'auto'],
                        defaults: '0',
                      },
                      {
                        property: 'margin-right',
                        type: 'integer',
                        units: ['px', 'mm', '%', 'auto'],
                        defaults: '0',
                      },
                      {
                        property: 'margin-bottom',
                        type: 'integer',
                        units: ['px', 'mm', '%', 'auto'],
                        defaults: '0',
                      },
                      {
                        property: 'margin-left',
                        type: 'integer',
                        units: ['px', 'mm', '%', 'auto'],
                        defaults: '0',
                      },
                    ],
                  },
                ],
              },
              {
                name: 'Bordas',
                open: false,
                properties: [
                  {
                    property: 'border-width',
                    type: 'integer',
                    units: ['px'],
                    defaults: '0',
                  },
                  {
                    property: 'border-style',
                    type: 'select',
                    defaults: 'none',
                    options: [
                      { id: 'none', label: 'Nenhum' },
                      { id: 'solid', label: 'Sólido' },
                      { id: 'dashed', label: 'Tracejado' },
                      { id: 'dotted', label: 'Pontilhado' },
                      { id: 'double', label: 'Duplo' },
                    ],
                  },
                  {
                    property: 'border-color',
                    type: 'color',
                    defaults: '#000000',
                  },
                ],
              },
              {
                name: 'Fundo',
                open: false,
                properties: [
                  {
                    property: 'background-color',
                    type: 'color',
                    defaults: 'transparent',
                  },
                ],
              },
              {
                name: 'Layout',
                open: false,
                properties: [
                  {
                    property: 'display',
                    type: 'select',
                    defaults: 'block',
                    options: [
                      { id: 'block', label: 'Block' },
                      { id: 'inline', label: 'Inline' },
                      { id: 'inline-block', label: 'Inline Block' },
                      { id: 'flex', label: 'Flex' },
                      { id: 'none', label: 'Oculto' },
                    ],
                  },
                  {
                    property: 'flex-direction',
                    type: 'select',
                    defaults: 'row',
                    options: [
                      { id: 'row', label: 'Linha' },
                      { id: 'row-reverse', label: 'Linha Reversa' },
                      { id: 'column', label: 'Coluna' },
                      { id: 'column-reverse', label: 'Coluna Reversa' },
                    ],
                  },
                  {
                    property: 'justify-content',
                    type: 'select',
                    defaults: 'flex-start',
                    options: [
                      { id: 'flex-start', label: 'Início' },
                      { id: 'flex-end', label: 'Fim' },
                      { id: 'center', label: 'Centro' },
                      { id: 'space-between', label: 'Espaço Entre' },
                      { id: 'space-around', label: 'Espaço ao Redor' },
                      { id: 'space-evenly', label: 'Espaço Igual' },
                    ],
                  },
                  {
                    property: 'align-items',
                    type: 'select',
                    defaults: 'stretch',
                    options: [
                      { id: 'stretch', label: 'Esticar' },
                      { id: 'flex-start', label: 'Início' },
                      { id: 'flex-end', label: 'Fim' },
                      { id: 'center', label: 'Centro' },
                      { id: 'baseline', label: 'Linha Base' },
                    ],
                  },
                  {
                    property: 'gap',
                    type: 'integer',
                    units: ['px', 'mm'],
                    defaults: '0',
                  },
                  {
                    property: 'vertical-align',
                    type: 'select',
                    defaults: 'baseline',
                    options: [
                      { id: 'baseline', label: 'Linha Base' },
                      { id: 'top', label: 'Topo' },
                      { id: 'middle', label: 'Meio' },
                      { id: 'bottom', label: 'Inferior' },
                    ],
                  },
                ],
              },
            ],
          },
          traitManager: {
            appendTo: '#traits-container',
          },
          layerManager: {
            appendTo: '#layers-container',
          },
          canvas: {
            styles: [EDITOR_CANVAS_CSS],
          },
          deviceManager: {
            devices: [
              {
                id: 'label',
                name: 'Etiqueta',
                width: `${canvasWidthPx}px`,
                height: `${canvasHeightPx}px`,
              },
            ],
          },
        }}
        plugins={[labelBlocksPlugin]}
        onEditor={onEditor}
      >
        {/* Toolbar superior */}
        <EditorToolbar
          name={name}
          setName={setName}
          width={width}
          setWidth={setWidth}
          height={height}
          setHeight={setHeight}
          zoom={zoom}
          setZoom={setZoom}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          onSave={onSave}
          onCancel={onCancel}
          readOnly={readOnly}
        />

        {/* Área principal do editor */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Sidebar esquerda - Blocos */}
          <div className="w-60 border-r bg-card flex flex-col shrink-0">
            <div className="p-3 border-b bg-card">
              <h3 className="font-semibold text-sm">Campos Disponíveis</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Arraste os campos para a etiqueta
              </p>
            </div>
            <div id="blocks-container" className="flex-1 overflow-y-auto p-2" />
          </div>

          {/* Canvas central */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-900 min-h-0">
            {/* Canvas container com réguas */}
            <div className="flex-1 overflow-auto min-h-0">
              <div className="inline-flex flex-col min-w-full min-h-full">
                {/* Linha superior: Corner + Régua Horizontal */}
                <div className="flex sticky top-0 z-10 bg-slate-100 dark:bg-slate-900">
                  <RulerCorner />
                  <EditorRuler
                    orientation="horizontal"
                    size={canvasWidthPx}
                    zoom={zoom}
                    sizeInMm={width}
                    mmToPx={MM_TO_PX}
                  />
                </div>

                {/* Linha principal: Régua Vertical + Canvas */}
                <div className="flex flex-1">
                  <div className="sticky left-0 z-10 bg-slate-100 dark:bg-slate-900">
                    <EditorRuler
                      orientation="vertical"
                      size={canvasHeightPx}
                      zoom={zoom}
                      sizeInMm={height}
                      mmToPx={MM_TO_PX}
                    />
                  </div>

                  {/* Canvas container - Alinhado com o início das réguas */}
                  <div
                    className={cn(
                      'bg-white shadow-lg transition-all relative',
                      showGrid && 'canvas-grid'
                    )}
                    style={{
                      width: `${canvasWidthPx}px`,
                      height: `${canvasHeightPx}px`,
                      minWidth: `${canvasWidthPx}px`,
                      minHeight: `${canvasHeightPx}px`,
                      boxShadow:
                        '0 0 0 1px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Canvas />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Info bar */}
            <div className="flex items-center justify-between py-1.5 px-4 bg-slate-200/90 dark:bg-slate-800/90 text-xs text-muted-foreground border-t shrink-0">
              <div className="flex items-center gap-4">
                <span>
                  Tamanho:{' '}
                  <strong className="text-foreground">
                    {width}mm × {height}mm
                  </strong>
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span>
                  Canvas:{' '}
                  <strong className="text-foreground">
                    {canvasWidthPx}px × {canvasHeightPx}px
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono">
                  1mm = {(MM_TO_PX * scale).toFixed(2)}px
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span>
                  Zoom: <strong className="text-foreground">{zoom}%</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar direita - Estilos */}
          <div className="w-60 border-l bg-card flex flex-col shrink-0">
            <div className="p-3 border-b bg-card">
              <h3 className="font-semibold text-sm">Propriedades</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione um elemento para editar
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div id="styles-container" />
              <div id="traits-container" />
              <div id="layers-container" />
            </div>
          </div>
        </div>
      </GjsEditor>
    </div>
  );
}

export default LabelEditor;
