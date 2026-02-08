/**
 * Label Studio - Type Definitions
 * Tipos para o novo editor de etiquetas
 */

// ============================================
// ELEMENT TYPES
// ============================================

/**
 * Tipos de elementos disponíveis no editor
 */
export type ElementType =
  | 'field' // Campo de dados dinâmico
  | 'text' // Texto livre/estático
  | 'image' // Imagem/logo
  | 'icon' // Ícone vetorial
  | 'arrow' // Seta
  | 'shape' // Forma (retângulo, círculo, etc)
  | 'line' // Linha
  | 'barcode' // Código de barras
  | 'qrcode' // QR Code
  | 'table'; // Tabela

/**
 * Estilo de texto
 */
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  color: string;
  backgroundColor?: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  verticalAlign: 'top' | 'middle' | 'bottom';
  lineHeight: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

/**
 * Estilo de borda
 */
export interface BorderStyle {
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  color: string;
}

/**
 * Elemento base - propriedades comuns a todos os elementos
 */
export interface LabelElementBase {
  id: string;
  type: ElementType;

  // Posição em mm
  x: number;
  y: number;
  width: number;
  height: number;

  // Transformação
  rotation: number;
  opacity: number;

  // Camada
  zIndex: number;
  locked: boolean;
  visible: boolean;

  // Nome para identificação
  name?: string;
}

/**
 * Configuração de campo de dados
 */
export interface FieldConfig {
  type: 'simple' | 'composite' | 'conditional' | 'calculated';

  // Para campo simples
  dataPath?: string;

  // Para campo composto - template com placeholders
  template?: string; // "{product.name} - {variant.name}"

  // Para campo condicional (fallback)
  conditions?: {
    primary: string;
    fallbacks: string[];
  };

  // Para campo calculado
  formula?: string;
  format?: 'number' | 'currency' | 'percentage';
  decimalPlaces?: number;
}

/**
 * Configuração de label (rótulo acima/ao lado do valor)
 */
export interface LabelConfig {
  enabled: boolean;
  text: string;
  position: 'above' | 'left';
  style: Partial<TextStyle>;
}

/**
 * Elemento de Campo de Dados
 */
export interface FieldElement extends LabelElementBase {
  type: 'field';
  fieldConfig: FieldConfig;
  label?: LabelConfig;
  valueStyle: TextStyle;
}

/**
 * Elemento de Texto Livre
 */
export interface TextElement extends LabelElementBase {
  type: 'text';
  content: string;
  style: TextStyle;
}

/**
 * Elemento de Imagem
 */
export interface ImageElement extends LabelElementBase {
  type: 'image';
  src: string;
  alt?: string;
  objectFit: 'contain' | 'cover' | 'fill' | 'none';
  borderRadius?: number;
}

/**
 * Elemento de Ícone
 */
export interface IconElement extends LabelElementBase {
  type: 'icon';
  iconId: string;
  category: string;
  color: string;
}

/**
 * Elemento de Seta
 */
export interface ArrowElement extends LabelElementBase {
  type: 'arrow';
  arrowStyle: 'simple' | 'double' | 'curved' | 'thick';
  headStyle: 'filled' | 'outline' | 'none';
  strokeWidth: number;
  color: string;
}

/**
 * Elemento de Forma
 */
export interface ShapeElement extends LabelElementBase {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'diamond';
  fill: string;
  stroke: BorderStyle;
  borderRadius?: number;
}

/**
 * Elemento de Linha
 */
export interface LineElement extends LabelElementBase {
  type: 'line';
  orientation: 'horizontal' | 'vertical' | 'diagonal';
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  color: string;
}

/**
 * Configuração de Código de Barras
 */
export interface BarcodeConfig {
  source: 'field' | 'custom' | 'composite';
  dataPath?: string;
  customValue?: string;
  template?: string;

  format: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF';

  showText: boolean;
  textStyle?: Partial<TextStyle>;
  barColor: string;
  backgroundColor: string;
}

/**
 * Elemento de Código de Barras
 */
export interface BarcodeElement extends LabelElementBase {
  type: 'barcode';
  barcodeConfig: BarcodeConfig;
}

/**
 * Configuração de QR Code
 */
export interface QRCodeConfig {
  contentType: 'field' | 'composite' | 'url' | 'vcard' | 'custom';

  // Para campo
  dataPath?: string;
  template?: string;

  // Para URL
  urlBase?: string;
  urlParam?: string;

  // Para vCard
  vcard?: {
    name: string;
    phone?: string;
    email?: string;
  };

  // Para custom
  customValue?: string;

  // Aparência
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  moduleColor: string;
  backgroundColor: string;
  logoUrl?: string;
}

/**
 * Elemento de QR Code
 */
export interface QRCodeElement extends LabelElementBase {
  type: 'qrcode';
  qrConfig: QRCodeConfig;
}

/**
 * Célula mesclada da tabela
 */
export interface MergedCell {
  startRow: number;
  startCol: number;
  rowSpan: number;
  colSpan: number;
}

/**
 * Configuração de Tabela
 */
export interface TableConfig {
  rows: number;
  columns: number;

  columnWidths: (number | 'auto')[];
  rowHeights: (number | 'auto')[];

  mergedCells: MergedCell[];

  borders: {
    external: BorderStyle;
    internalHorizontal: BorderStyle;
    internalVertical: BorderStyle;
  };

  cellPadding: number;
}

/**
 * Bordas individuais por lado de uma célula
 */
export interface CellBorderStyle {
  top?: BorderStyle;
  right?: BorderStyle;
  bottom?: BorderStyle;
  left?: BorderStyle;
}

/**
 * Configuração de label dentro de célula de tabela
 */
export interface CellLabelConfig {
  enabled: boolean;
  text: string;
  position: 'above' | 'left';
  style?: Partial<TextStyle>;
  spacing?: number; // mm entre label e valor
}

/**
 * Conteúdo de célula da tabela
 */
export interface TableCell {
  row: number;
  col: number;
  type: 'text' | 'field';
  content?: string;

  // Campo simples
  dataPath?: string;

  // Tipo de campo (default: 'simple')
  fieldType?: 'simple' | 'composite' | 'conditional' | 'calculated';

  // Campo composto
  template?: string;

  // Campo condicional
  conditions?: {
    primary: string;
    fallbacks: string[];
  };

  // Campo calculado
  formula?: string;
  format?: 'number' | 'currency' | 'percentage';
  decimalPlaces?: number;

  // Label/Rótulo
  label?: CellLabelConfig;

  style?: Partial<TextStyle>;
  backgroundColor?: string;
  borders?: CellBorderStyle;
}

/**
 * Elemento de Tabela
 */
export interface TableElement extends LabelElementBase {
  type: 'table';
  tableConfig: TableConfig;
  cells: TableCell[];
}

/**
 * Union type de todos os elementos
 */
export type LabelElement =
  | FieldElement
  | TextElement
  | ImageElement
  | IconElement
  | ArrowElement
  | ShapeElement
  | LineElement
  | BarcodeElement
  | QRCodeElement
  | TableElement;

// ============================================
// CANVAS & TEMPLATE TYPES
// ============================================

/**
 * Configuração de margens
 */
export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Configuração do canvas
 */
export interface CanvasConfig {
  backgroundColor: string;
  margins?: Margins;
  showMargins: boolean;
}

/**
 * Categoria de template
 */
export type TemplateCategory =
  | 'vestuario'
  | 'produto'
  | 'inventario'
  | 'prateleira'
  | 'joalheria'
  | 'envio'
  | 'personalizado';

/**
 * Template de etiqueta (formato do Label Studio)
 * Salvo como JSON no campo grapesJsData do backend
 */
export interface LabelStudioTemplate {
  version: 2; // Para diferenciar do formato GrapesJS (v1)

  // Dimensões em mm
  width: number;
  height: number;

  // Configuração do canvas
  canvas: CanvasConfig;

  // Elementos da etiqueta
  elements: LabelElement[];

  // Metadados
  category?: TemplateCategory;

  // Tipo de entidade (default: 'item')
  entityType?: 'item';
}

// ============================================
// EDITOR STATE TYPES
// ============================================

/**
 * Tipo de alinhamento
 */
export type AlignmentType =
  | 'left'
  | 'center-h'
  | 'right'
  | 'top'
  | 'center-v'
  | 'bottom';

/**
 * Direção de distribuição
 */
export type DistributionDirection = 'horizontal' | 'vertical';

/**
 * Guia de snap
 */
export interface SnapGuide {
  type: 'vertical' | 'horizontal';
  position: number; // em mm
  source: 'element' | 'canvas' | 'center';
}

/**
 * Estado do editor
 */
export interface EditorState {
  // Template atual
  templateId: string | null;
  templateName: string;
  templateDescription: string;

  // Dimensões do canvas em mm
  canvasWidth: number;
  canvasHeight: number;
  canvasConfig: CanvasConfig;

  // Elementos
  elements: LabelElement[];

  // Seleção
  selectedIds: string[];
  hoveredId: string | null;

  // Histórico (undo/redo)
  history: LabelElement[][];
  historyIndex: number;
  maxHistorySize: number;

  // Visualização
  zoom: number;
  panOffset: { x: number; y: number };
  showGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  showSnapGuides: boolean;
  snapEnabled: boolean;
  snapThreshold: number;

  // Guias de snap ativas
  activeSnapGuides: SnapGuide[];

  // Clipboard
  clipboard: LabelElement[];

  // Estado de edição
  isDragging: boolean;
  isResizing: boolean;
  isPanning: boolean;

  // Edição inline
  editingId: string | null;

  // Célula de tabela selecionada
  selectedCell: { row: number; col: number } | null;

  // Dados para preview
  previewData: Record<string, unknown> | null;

  // Scroll lock
  scrollLocked: boolean;

  // Read-only mode
  readOnly: boolean;
}

/**
 * Ações do editor
 */
export interface EditorActions {
  // Template
  newTemplate: (width: number, height: number) => void;
  loadTemplate: (
    template: LabelStudioTemplate,
    id?: string,
    name?: string,
    description?: string
  ) => void;
  setTemplateName: (name: string) => void;
  setTemplateDescription: (description: string) => void;
  setCanvasSize: (width: number, height: number) => void;
  setCanvasConfig: (config: Partial<CanvasConfig>) => void;

  // Elementos
  addElement: (element: LabelElement) => void;
  updateElement: (id: string, updates: Partial<LabelElement>) => void;
  deleteElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;

  // Seleção
  selectElements: (ids: string[], addToSelection?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setHoveredId: (id: string | null) => void;

  // Movimento e redimensionamento
  moveElements: (ids: string[], deltaX: number, deltaY: number) => void;
  resizeElement: (
    id: string,
    width: number,
    height: number,
    anchor?: string
  ) => void;

  // Alinhamento
  alignElements: (alignment: AlignmentType) => void;
  distributeElements: (direction: DistributionDirection) => void;

  // Camadas
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  moveForward: (id: string) => void;
  moveBackward: (id: string) => void;

  // Histórico
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // Clipboard
  copy: () => void;
  paste: () => void;
  cut: () => void;

  // Scroll lock
  toggleScrollLock: () => void;

  // Visualização
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleSnap: () => void;
  setSnapGuides: (guides: SnapGuide[]) => void;

  // Estado de edição
  setDragging: (isDragging: boolean) => void;
  setResizing: (isResizing: boolean) => void;
  setPanning: (isPanning: boolean) => void;
  setEditingId: (id: string | null) => void;
  setSelectedCell: (cell: { row: number; col: number } | null) => void;

  // Preview
  setPreviewData: (data: Record<string, unknown> | null) => void;

  // Read-only
  setReadOnly: (readOnly: boolean) => void;

  // Serialização
  toJSON: () => LabelStudioTemplate;

  // Reset
  reset: () => void;
}

/**
 * Store do editor (state + actions)
 */
export type EditorStore = EditorState & EditorActions;

// ============================================
// HELPER TYPES
// ============================================

/**
 * Posição de um ponto
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Retângulo (bounding box)
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Resultado do cálculo de snap
 */
export interface SnapResult {
  snappedX: number;
  snappedY: number;
  guides: SnapGuide[];
}

/**
 * Estilos padrão
 */
export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Arial',
  fontSize: 6,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  color: '#000000',
  textAlign: 'left',
  verticalAlign: 'top',
  lineHeight: 1.2,
  letterSpacing: 0,
  textTransform: 'none',
};

export const DEFAULT_BORDER_STYLE: BorderStyle = {
  width: 1,
  style: 'solid',
  color: '#000000',
};

export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  backgroundColor: '#ffffff',
  showMargins: false,
};
