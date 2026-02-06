/**
 * Label Studio - Snap Calculator
 * Calcula posições de snap para elementos
 */

import type { LabelElement, SnapGuide, SnapResult, Rect, Point } from '../studio-types';

/**
 * Configuração do sistema de snap
 */
export interface SnapConfig {
  enabled: boolean;
  threshold: number; // em mm
  snapToCanvas: boolean;
  snapToElements: boolean;
  snapToCenter: boolean;
  snapToGrid: boolean;
  gridSize: number; // em mm
}

/**
 * Configuração padrão de snap
 */
export const DEFAULT_SNAP_CONFIG: SnapConfig = {
  enabled: true,
  threshold: 2, // 2mm
  snapToCanvas: true,
  snapToElements: true,
  snapToCenter: true,
  snapToGrid: true,
  gridSize: 5, // 5mm
};

/**
 * Pontos de referência de um elemento para snap
 */
interface ElementSnapPoints {
  left: number;
  centerX: number;
  right: number;
  top: number;
  centerY: number;
  bottom: number;
}

/**
 * Obtém os pontos de snap de um elemento
 */
function getElementSnapPoints(element: Rect): ElementSnapPoints {
  return {
    left: element.x,
    centerX: element.x + element.width / 2,
    right: element.x + element.width,
    top: element.y,
    centerY: element.y + element.height / 2,
    bottom: element.y + element.height,
  };
}

/**
 * Obtém os pontos de snap do canvas
 */
function getCanvasSnapPoints(
  canvasWidth: number,
  canvasHeight: number
): ElementSnapPoints {
  return {
    left: 0,
    centerX: canvasWidth / 2,
    right: canvasWidth,
    top: 0,
    centerY: canvasHeight / 2,
    bottom: canvasHeight,
  };
}

/**
 * Resultado de comparação de snap
 */
interface SnapMatch {
  value: number;
  distance: number;
  guide: SnapGuide;
}

/**
 * Encontra o melhor snap para um valor
 */
function findBestSnap(
  currentValue: number,
  snapTargets: { value: number; source: SnapGuide['source'] }[],
  threshold: number,
  isVertical: boolean
): SnapMatch | null {
  let bestMatch: SnapMatch | null = null;

  for (const target of snapTargets) {
    const distance = Math.abs(currentValue - target.value);
    if (distance <= threshold) {
      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = {
          value: target.value,
          distance,
          guide: {
            type: isVertical ? 'vertical' : 'horizontal',
            position: target.value,
            source: target.source,
          },
        };
      }
    }
  }

  return bestMatch;
}

/**
 * Calcula snap para uma posição
 */
export function calculateSnap(
  dragRect: Rect,
  elements: LabelElement[],
  canvasWidth: number,
  canvasHeight: number,
  config: SnapConfig,
  excludeIds: string[] = []
): SnapResult {
  if (!config.enabled) {
    return {
      snappedX: dragRect.x,
      snappedY: dragRect.y,
      guides: [],
    };
  }

  const dragPoints = getElementSnapPoints(dragRect);
  const guides: SnapGuide[] = [];

  // Coleta todos os alvos de snap horizontais e verticais
  const verticalTargets: { value: number; source: SnapGuide['source'] }[] = [];
  const horizontalTargets: { value: number; source: SnapGuide['source'] }[] = [];

  // Snap ao canvas
  if (config.snapToCanvas) {
    const canvasPoints = getCanvasSnapPoints(canvasWidth, canvasHeight);

    verticalTargets.push(
      { value: canvasPoints.left, source: 'canvas' },
      { value: canvasPoints.right, source: 'canvas' }
    );

    horizontalTargets.push(
      { value: canvasPoints.top, source: 'canvas' },
      { value: canvasPoints.bottom, source: 'canvas' }
    );

    if (config.snapToCenter) {
      verticalTargets.push({ value: canvasPoints.centerX, source: 'center' });
      horizontalTargets.push({ value: canvasPoints.centerY, source: 'center' });
    }
  }

  // Snap aos elementos
  if (config.snapToElements) {
    for (const element of elements) {
      if (excludeIds.includes(element.id)) continue;
      if (!element.visible) continue;

      const elPoints = getElementSnapPoints(element);

      verticalTargets.push(
        { value: elPoints.left, source: 'element' },
        { value: elPoints.right, source: 'element' }
      );

      horizontalTargets.push(
        { value: elPoints.top, source: 'element' },
        { value: elPoints.bottom, source: 'element' }
      );

      if (config.snapToCenter) {
        verticalTargets.push({ value: elPoints.centerX, source: 'element' });
        horizontalTargets.push({ value: elPoints.centerY, source: 'element' });
      }
    }
  }

  // Snap ao grid
  if (config.snapToGrid && config.gridSize > 0) {
    // Adiciona linhas do grid como alvos de snap
    for (let x = 0; x <= canvasWidth; x += config.gridSize) {
      verticalTargets.push({ value: x, source: 'canvas' });
    }
    for (let y = 0; y <= canvasHeight; y += config.gridSize) {
      horizontalTargets.push({ value: y, source: 'canvas' });
    }
  }

  // Calcula snap para cada ponto do elemento sendo arrastado
  let snappedX = dragRect.x;
  let snappedY = dragRect.y;
  let bestVerticalMatch: SnapMatch | null = null;
  let bestHorizontalMatch: SnapMatch | null = null;

  // Testa snap para left, center e right
  const xPoints = [
    { offset: 0, value: dragPoints.left },
    { offset: dragRect.width / 2, value: dragPoints.centerX },
    { offset: dragRect.width, value: dragPoints.right },
  ];

  for (const point of xPoints) {
    const match = findBestSnap(point.value, verticalTargets, config.threshold, true);
    if (match && (!bestVerticalMatch || match.distance < bestVerticalMatch.distance)) {
      bestVerticalMatch = match;
      snappedX = match.value - point.offset;
    }
  }

  // Testa snap para top, center e bottom
  const yPoints = [
    { offset: 0, value: dragPoints.top },
    { offset: dragRect.height / 2, value: dragPoints.centerY },
    { offset: dragRect.height, value: dragPoints.bottom },
  ];

  for (const point of yPoints) {
    const match = findBestSnap(point.value, horizontalTargets, config.threshold, false);
    if (match && (!bestHorizontalMatch || match.distance < bestHorizontalMatch.distance)) {
      bestHorizontalMatch = match;
      snappedY = match.value - point.offset;
    }
  }

  // Adiciona guias encontradas
  if (bestVerticalMatch) {
    guides.push(bestVerticalMatch.guide);
  }
  if (bestHorizontalMatch) {
    guides.push(bestHorizontalMatch.guide);
  }

  return {
    snappedX,
    snappedY,
    guides,
  };
}

/**
 * Calcula snap durante redimensionamento
 */
export function calculateResizeSnap(
  resizeRect: Rect,
  anchor: string, // 'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'
  elements: LabelElement[],
  canvasWidth: number,
  canvasHeight: number,
  config: SnapConfig,
  excludeIds: string[] = []
): SnapResult {
  if (!config.enabled) {
    return {
      snappedX: resizeRect.x,
      snappedY: resizeRect.y,
      guides: [],
    };
  }

  const guides: SnapGuide[] = [];
  let snappedX = resizeRect.x;
  let snappedY = resizeRect.y;
  let snappedWidth = resizeRect.width;
  let snappedHeight = resizeRect.height;

  // Coleta alvos de snap
  const verticalTargets: { value: number; source: SnapGuide['source'] }[] = [];
  const horizontalTargets: { value: number; source: SnapGuide['source'] }[] = [];

  // Canvas edges
  if (config.snapToCanvas) {
    verticalTargets.push(
      { value: 0, source: 'canvas' },
      { value: canvasWidth, source: 'canvas' }
    );
    horizontalTargets.push(
      { value: 0, source: 'canvas' },
      { value: canvasHeight, source: 'canvas' }
    );

    if (config.snapToCenter) {
      verticalTargets.push({ value: canvasWidth / 2, source: 'center' });
      horizontalTargets.push({ value: canvasHeight / 2, source: 'center' });
    }
  }

  // Element edges
  if (config.snapToElements) {
    for (const element of elements) {
      if (excludeIds.includes(element.id)) continue;
      if (!element.visible) continue;

      const elPoints = getElementSnapPoints(element);
      verticalTargets.push(
        { value: elPoints.left, source: 'element' },
        { value: elPoints.right, source: 'element' }
      );
      horizontalTargets.push(
        { value: elPoints.top, source: 'element' },
        { value: elPoints.bottom, source: 'element' }
      );
    }
  }

  // Determina quais bordas estão sendo ajustadas
  const adjustingLeft = anchor.includes('w');
  const adjustingRight = anchor.includes('e');
  const adjustingTop = anchor.includes('n');
  const adjustingBottom = anchor.includes('s');

  // Snap bordas horizontais
  if (adjustingLeft) {
    const match = findBestSnap(resizeRect.x, verticalTargets, config.threshold, true);
    if (match) {
      snappedX = match.value;
      snappedWidth = resizeRect.width + (resizeRect.x - match.value);
      guides.push(match.guide);
    }
  }
  if (adjustingRight) {
    const rightEdge = resizeRect.x + resizeRect.width;
    const match = findBestSnap(rightEdge, verticalTargets, config.threshold, true);
    if (match) {
      snappedWidth = match.value - snappedX;
      guides.push(match.guide);
    }
  }

  // Snap bordas verticais
  if (adjustingTop) {
    const match = findBestSnap(resizeRect.y, horizontalTargets, config.threshold, false);
    if (match) {
      snappedY = match.value;
      snappedHeight = resizeRect.height + (resizeRect.y - match.value);
      guides.push(match.guide);
    }
  }
  if (adjustingBottom) {
    const bottomEdge = resizeRect.y + resizeRect.height;
    const match = findBestSnap(bottomEdge, horizontalTargets, config.threshold, false);
    if (match) {
      snappedHeight = match.value - snappedY;
      guides.push(match.guide);
    }
  }

  return {
    snappedX,
    snappedY,
    guides,
  };
}

/**
 * Calcula linhas de distribuição para múltiplos elementos
 */
export function calculateDistributionGuides(
  elements: LabelElement[],
  direction: 'horizontal' | 'vertical'
): SnapGuide[] {
  if (elements.length < 3) return [];

  const guides: SnapGuide[] = [];
  const sorted = [...elements].sort((a, b) =>
    direction === 'horizontal' ? a.x - b.x : a.y - b.y
  );

  // Calcula gaps entre elementos
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const gap =
      direction === 'horizontal'
        ? curr.x - (prev.x + prev.width)
        : curr.y - (prev.y + prev.height);
    gaps.push(gap);
  }

  // Verifica se todos os gaps são iguais (com tolerância)
  const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
  const allEqual = gaps.every(g => Math.abs(g - avgGap) < 0.5);

  if (allEqual) {
    // Adiciona guias entre cada par de elementos
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const position =
        direction === 'horizontal'
          ? prev.x + prev.width + avgGap / 2
          : prev.y + prev.height + avgGap / 2;

      guides.push({
        type: direction === 'horizontal' ? 'vertical' : 'horizontal',
        position,
        source: 'element',
      });
    }
  }

  return guides;
}
