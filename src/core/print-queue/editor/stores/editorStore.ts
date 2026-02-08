/**
 * Label Studio - Editor Store (Zustand)
 * Gerenciamento de estado do editor de etiquetas
 */

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  EditorStore,
  EditorState,
  LabelElement,
  LabelStudioTemplate,
  CanvasConfig,
  SnapGuide,
  AlignmentType,
  DistributionDirection,
  DEFAULT_CANVAS_CONFIG,
} from '../studio-types';
import { getNextZoomLevel } from '../utils/unitConverter';

/**
 * Estado inicial do editor
 */
const initialState: EditorState = {
  // Template
  templateId: null,
  templateName: 'Nova Etiqueta',
  templateDescription: '',

  // Canvas
  canvasWidth: 60,
  canvasHeight: 40,
  canvasConfig: {
    backgroundColor: '#ffffff',
    showMargins: false,
  },

  // Elementos
  elements: [],

  // Seleção
  selectedIds: [],
  hoveredId: null,

  // Histórico
  history: [[]],
  historyIndex: 0,
  maxHistorySize: 50,

  // Visualização
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  showGrid: true,
  gridSize: 5, // 5mm
  showRulers: true,
  showSnapGuides: true,
  snapEnabled: true,
  snapThreshold: 2, // 2mm

  // Snap guides
  activeSnapGuides: [],

  // Clipboard
  clipboard: [],

  // Estado de edição
  isDragging: false,
  isResizing: false,
  isPanning: false,

  // Edição inline
  editingId: null,

  // Célula de tabela selecionada
  selectedCell: null,

  // Preview
  previewData: null,

  // Scroll lock
  scrollLocked: true,

  // Read-only
  readOnly: false,
};

/**
 * Gera novo zIndex para um elemento
 */
function getNextZIndex(elements: LabelElement[]): number {
  if (elements.length === 0) return 1;
  return Math.max(...elements.map(e => e.zIndex)) + 1;
}

/**
 * Clona um elemento com novo ID
 */
function cloneElement(
  element: LabelElement,
  offsetX = 5,
  offsetY = 5
): LabelElement {
  return {
    ...element,
    id: nanoid(),
    x: element.x + offsetX,
    y: element.y + offsetY,
    name: element.name ? `${element.name} (cópia)` : undefined,
  };
}

/**
 * Store do Editor
 */
export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  // ============================================
  // TEMPLATE
  // ============================================

  newTemplate: (width: number, height: number) => {
    set({
      ...initialState,
      canvasWidth: width,
      canvasHeight: height,
      history: [[]],
      historyIndex: 0,
    });
  },

  loadTemplate: (
    template: LabelStudioTemplate,
    id?: string,
    name?: string,
    description?: string
  ) => {
    set({
      templateId: id ?? null,
      templateName: name ?? 'Etiqueta',
      templateDescription: description ?? '',
      canvasWidth: template.width,
      canvasHeight: template.height,
      canvasConfig: template.canvas,
      elements: template.elements,
      selectedIds: [],
      hoveredId: null,
      history: [template.elements],
      historyIndex: 0,
    });
  },

  setTemplateName: (name: string) => {
    set({ templateName: name });
  },

  setTemplateDescription: (description: string) => {
    set({ templateDescription: description });
  },

  setCanvasSize: (width: number, height: number) => {
    const state = get();
    set({
      canvasWidth: width,
      canvasHeight: height,
    });
    state.saveToHistory();
  },

  setCanvasConfig: (config: Partial<CanvasConfig>) => {
    set(state => ({
      canvasConfig: { ...state.canvasConfig, ...config },
    }));
  },

  // ============================================
  // ELEMENTOS
  // ============================================

  addElement: (element: LabelElement) => {
    const state = get();
    const newElement = {
      ...element,
      id: element.id || nanoid(),
      zIndex: element.zIndex || getNextZIndex(state.elements),
    };

    set({
      elements: [...state.elements, newElement],
      selectedIds: [newElement.id],
    });
    state.saveToHistory();
  },

  updateElement: (id: string, updates: Partial<LabelElement>) => {
    const state = get();
    set({
      elements: state.elements.map(el =>
        el.id === id ? ({ ...el, ...updates } as LabelElement) : el
      ),
    });
  },

  deleteElements: (ids: string[]) => {
    const state = get();
    set({
      elements: state.elements.filter(el => !ids.includes(el.id)),
      selectedIds: state.selectedIds.filter(id => !ids.includes(id)),
    });
    state.saveToHistory();
  },

  duplicateElements: (ids: string[]) => {
    const state = get();
    const elementsToDuplicate = state.elements.filter(el =>
      ids.includes(el.id)
    );
    const newElements = elementsToDuplicate.map(el =>
      cloneElement(el as LabelElement)
    );

    set({
      elements: [...state.elements, ...newElements],
      selectedIds: newElements.map(el => el.id),
    });
    state.saveToHistory();
  },

  // ============================================
  // SELEÇÃO
  // ============================================

  selectElements: (ids: string[], addToSelection = false) => {
    set(state => ({
      selectedIds: addToSelection
        ? [...new Set([...state.selectedIds, ...ids])]
        : ids,
      editingId: null,
      selectedCell: null,
    }));
  },

  selectAll: () => {
    set(state => ({
      selectedIds: state.elements.filter(el => !el.locked).map(el => el.id),
    }));
  },

  clearSelection: () => {
    set({ selectedIds: [], editingId: null, selectedCell: null });
  },

  setHoveredId: (id: string | null) => {
    set({ hoveredId: id });
  },

  // ============================================
  // MOVIMENTO E REDIMENSIONAMENTO
  // ============================================

  moveElements: (ids: string[], deltaX: number, deltaY: number) => {
    set(state => ({
      elements: state.elements.map(el =>
        ids.includes(el.id) && !el.locked
          ? { ...el, x: el.x + deltaX, y: el.y + deltaY }
          : el
      ),
    }));
  },

  resizeElement: (
    id: string,
    width: number,
    height: number,
    _anchor?: string
  ) => {
    set(state => ({
      elements: state.elements.map(el =>
        el.id === id && !el.locked ? { ...el, width, height } : el
      ),
    }));
  },

  // ============================================
  // ALINHAMENTO
  // ============================================

  alignElements: (alignment: AlignmentType) => {
    const state = get();
    const selectedElements = state.elements.filter(el =>
      state.selectedIds.includes(el.id)
    );

    if (selectedElements.length < 2) return;

    const bounds = {
      minX: Math.min(...selectedElements.map(el => el.x)),
      maxX: Math.max(...selectedElements.map(el => el.x + el.width)),
      minY: Math.min(...selectedElements.map(el => el.y)),
      maxY: Math.max(...selectedElements.map(el => el.y + el.height)),
    };

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    set({
      elements: state.elements.map(el => {
        if (!state.selectedIds.includes(el.id) || el.locked) return el;

        switch (alignment) {
          case 'left':
            return { ...el, x: bounds.minX };
          case 'center-h':
            return { ...el, x: centerX - el.width / 2 };
          case 'right':
            return { ...el, x: bounds.maxX - el.width };
          case 'top':
            return { ...el, y: bounds.minY };
          case 'center-v':
            return { ...el, y: centerY - el.height / 2 };
          case 'bottom':
            return { ...el, y: bounds.maxY - el.height };
          default:
            return el;
        }
      }),
    });
    state.saveToHistory();
  },

  distributeElements: (direction: DistributionDirection) => {
    const state = get();
    const selectedElements = state.elements
      .filter(el => state.selectedIds.includes(el.id))
      .sort((a, b) => (direction === 'horizontal' ? a.x - b.x : a.y - b.y));

    if (selectedElements.length < 3) return;

    const isHorizontal = direction === 'horizontal';
    const first = selectedElements[0];
    const last = selectedElements[selectedElements.length - 1];

    const totalSpace = isHorizontal
      ? last.x + last.width - first.x
      : last.y + last.height - first.y;

    const totalElementSize = selectedElements.reduce(
      (sum, el) => sum + (isHorizontal ? el.width : el.height),
      0
    );

    const gap = (totalSpace - totalElementSize) / (selectedElements.length - 1);
    let currentPos = isHorizontal ? first.x : first.y;

    const updatedPositions = new Map<string, number>();
    selectedElements.forEach(el => {
      updatedPositions.set(el.id, currentPos);
      currentPos += (isHorizontal ? el.width : el.height) + gap;
    });

    set({
      elements: state.elements.map(el => {
        if (!updatedPositions.has(el.id) || el.locked) return el;
        const newPos = updatedPositions.get(el.id)!;
        return isHorizontal ? { ...el, x: newPos } : { ...el, y: newPos };
      }),
    });
    state.saveToHistory();
  },

  // ============================================
  // CAMADAS
  // ============================================

  bringToFront: (id: string) => {
    const state = get();
    const maxZIndex = getNextZIndex(state.elements);
    set({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, zIndex: maxZIndex } : el
      ),
    });
    state.saveToHistory();
  },

  sendToBack: (id: string) => {
    const state = get();
    const minZIndex = Math.min(...state.elements.map(el => el.zIndex));
    set({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, zIndex: minZIndex - 1 } : el
      ),
    });
    state.saveToHistory();
  },

  moveForward: (id: string) => {
    const state = get();
    const element = state.elements.find(el => el.id === id);
    if (!element) return;

    const higherElements = state.elements
      .filter(el => el.zIndex > element.zIndex)
      .sort((a, b) => a.zIndex - b.zIndex);

    if (higherElements.length === 0) return;

    const swapWith = higherElements[0];
    set({
      elements: state.elements.map(el => {
        if (el.id === id) return { ...el, zIndex: swapWith.zIndex };
        if (el.id === swapWith.id) return { ...el, zIndex: element.zIndex };
        return el;
      }),
    });
    state.saveToHistory();
  },

  moveBackward: (id: string) => {
    const state = get();
    const element = state.elements.find(el => el.id === id);
    if (!element) return;

    const lowerElements = state.elements
      .filter(el => el.zIndex < element.zIndex)
      .sort((a, b) => b.zIndex - a.zIndex);

    if (lowerElements.length === 0) return;

    const swapWith = lowerElements[0];
    set({
      elements: state.elements.map(el => {
        if (el.id === id) return { ...el, zIndex: swapWith.zIndex };
        if (el.id === swapWith.id) return { ...el, zIndex: element.zIndex };
        return el;
      }),
    });
    state.saveToHistory();
  },

  // ============================================
  // HISTÓRICO
  // ============================================

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        historyIndex: newIndex,
        elements: [...state.history[newIndex]],
        selectedIds: [],
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        historyIndex: newIndex,
        elements: [...state.history[newIndex]],
        selectedIds: [],
      });
    }
  },

  saveToHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push([...state.elements]);

    // Limitar tamanho do histórico
    if (newHistory.length > state.maxHistorySize) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  // ============================================
  // CLIPBOARD
  // ============================================

  copy: () => {
    const state = get();
    const elementsToCopy = state.elements.filter(el =>
      state.selectedIds.includes(el.id)
    );
    set({ clipboard: elementsToCopy });
  },

  paste: () => {
    const state = get();
    if (state.clipboard.length === 0) return;

    const newElements = state.clipboard.map(el =>
      cloneElement(el as LabelElement, 10, 10)
    );

    set({
      elements: [...state.elements, ...newElements],
      selectedIds: newElements.map(el => el.id),
    });
    state.saveToHistory();
  },

  cut: () => {
    const state = get();
    state.copy();
    state.deleteElements(state.selectedIds);
  },

  // ============================================
  // VISUALIZAÇÃO
  // ============================================

  setZoom: (zoom: number) => {
    set({ zoom: Math.max(0.1, Math.min(4, zoom)) });
  },

  zoomIn: () => {
    const state = get();
    set({ zoom: getNextZoomLevel(state.zoom, 'in') });
  },

  zoomOut: () => {
    const state = get();
    set({ zoom: getNextZoomLevel(state.zoom, 'out') });
  },

  fitToScreen: () => {
    // Será implementado pelo componente Canvas que tem acesso ao container
    set({ zoom: 1 });
  },

  setPanOffset: (offset: { x: number; y: number }) => {
    set({ panOffset: offset });
  },

  toggleGrid: () => {
    set(state => ({ showGrid: !state.showGrid }));
  },

  toggleRulers: () => {
    set(state => ({ showRulers: !state.showRulers }));
  },

  toggleSnap: () => {
    set(state => ({ snapEnabled: !state.snapEnabled }));
  },

  toggleScrollLock: () => {
    set(state => ({ scrollLocked: !state.scrollLocked }));
  },

  setSnapGuides: (guides: SnapGuide[]) => {
    set({ activeSnapGuides: guides });
  },

  // ============================================
  // ESTADO DE EDIÇÃO
  // ============================================

  setDragging: (isDragging: boolean) => {
    set({ isDragging });
    if (!isDragging) {
      get().saveToHistory();
    }
  },

  setResizing: (isResizing: boolean) => {
    set({ isResizing });
    if (!isResizing) {
      get().saveToHistory();
    }
  },

  setPanning: (isPanning: boolean) => {
    set({ isPanning });
  },

  setEditingId: (id: string | null) => {
    set({ editingId: id });
  },

  setSelectedCell: (cell: { row: number; col: number } | null) => {
    set({ selectedCell: cell });
  },

  // ============================================
  // PREVIEW
  // ============================================

  setPreviewData: (data: Record<string, unknown> | null) => {
    set({ previewData: data });
  },

  // ============================================
  // READ-ONLY
  // ============================================

  setReadOnly: (readOnly: boolean) => {
    set({ readOnly });
  },

  // ============================================
  // SERIALIZAÇÃO
  // ============================================

  toJSON: (): LabelStudioTemplate => {
    const state = get();
    return {
      version: 2,
      width: state.canvasWidth,
      height: state.canvasHeight,
      canvas: state.canvasConfig,
      elements: state.elements,
    };
  },

  // ============================================
  // RESET
  // ============================================

  reset: () => {
    set(initialState);
  },
}));

/**
 * Selectors para uso com shallow comparison
 */
export const editorSelectors = {
  elements: (state: EditorStore) => state.elements,
  selectedIds: (state: EditorStore) => state.selectedIds,
  selectedElements: (state: EditorStore) =>
    state.elements.filter(el => state.selectedIds.includes(el.id)),
  canUndo: (state: EditorStore) => state.historyIndex > 0,
  canRedo: (state: EditorStore) =>
    state.historyIndex < state.history.length - 1,
  hasSelection: (state: EditorStore) => state.selectedIds.length > 0,
  zoom: (state: EditorStore) => state.zoom,
  canvasSize: (state: EditorStore) => ({
    width: state.canvasWidth,
    height: state.canvasHeight,
  }),
};
