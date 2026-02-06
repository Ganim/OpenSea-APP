/**
 * Label Studio - Unit Converter
 * Conversão entre milímetros e pixels
 */

// Referência: 96 DPI (padrão da web)
// 1 polegada = 25.4mm
// 96 pixels / 25.4mm ≈ 3.78 px/mm
const MM_TO_PX_RATIO = 96 / 25.4; // ~3.7795275591

/**
 * Converte milímetros para pixels
 * @param mm Valor em milímetros
 * @param zoom Fator de zoom (padrão 1)
 * @returns Valor em pixels
 */
export function mmToPx(mm: number, zoom = 1): number {
  return mm * MM_TO_PX_RATIO * zoom;
}

/**
 * Converte pixels para milímetros
 * @param px Valor em pixels
 * @param zoom Fator de zoom (padrão 1)
 * @returns Valor em milímetros
 */
export function pxToMm(px: number, zoom = 1): number {
  return px / (MM_TO_PX_RATIO * zoom);
}

/**
 * Arredonda para casas decimais específicas
 * @param value Valor a arredondar
 * @param decimals Número de casas decimais
 */
export function roundTo(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Converte mm para px e arredonda
 */
export function mmToPxRounded(mm: number, zoom = 1, decimals = 0): number {
  return roundTo(mmToPx(mm, zoom), decimals);
}

/**
 * Converte px para mm e arredonda
 */
export function pxToMmRounded(px: number, zoom = 1, decimals = 2): number {
  return roundTo(pxToMm(px, zoom), decimals);
}

/**
 * Obtém o tamanho de uma página em pixels
 */
export function getPageSizeInPx(
  widthMm: number,
  heightMm: number,
  zoom = 1
): { width: number; height: number } {
  return {
    width: mmToPx(widthMm, zoom),
    height: mmToPx(heightMm, zoom),
  };
}

/**
 * Constantes de tamanhos de papel comuns em mm
 */
export const PAPER_SIZES = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  A6: { width: 105, height: 148 },
  LETTER: { width: 215.9, height: 279.4 },
  LEGAL: { width: 215.9, height: 355.6 },
} as const;

/**
 * Níveis de zoom pré-definidos
 */
export const ZOOM_LEVELS = [
  0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4,
] as const;

/**
 * Encontra o próximo nível de zoom
 */
export function getNextZoomLevel(currentZoom: number, direction: 'in' | 'out'): number {
  if (direction === 'in') {
    for (const level of ZOOM_LEVELS) {
      if (level > currentZoom + 0.001) {
        return level;
      }
    }
    return ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
  } else {
    for (let i = ZOOM_LEVELS.length - 1; i >= 0; i--) {
      if (ZOOM_LEVELS[i] < currentZoom - 0.001) {
        return ZOOM_LEVELS[i];
      }
    }
    return ZOOM_LEVELS[0];
  }
}

/**
 * Calcula o zoom para ajustar o canvas na tela
 * @param canvasWidthMm Largura do canvas em mm
 * @param canvasHeightMm Altura do canvas em mm
 * @param containerWidth Largura do container em pixels
 * @param containerHeight Altura do container em pixels
 * @param padding Padding em pixels
 */
export function calculateFitZoom(
  canvasWidthMm: number,
  canvasHeightMm: number,
  containerWidth: number,
  containerHeight: number,
  padding = 40
): number {
  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;

  const canvasWidthPx = mmToPx(canvasWidthMm);
  const canvasHeightPx = mmToPx(canvasHeightMm);

  const zoomX = availableWidth / canvasWidthPx;
  const zoomY = availableHeight / canvasHeightPx;

  // Usa o menor para caber completamente
  return Math.min(zoomX, zoomY, 2); // Max zoom de 2x
}

/**
 * Snap de valor para grid
 * @param value Valor em mm
 * @param gridSize Tamanho do grid em mm
 * @param threshold Threshold para snap em mm (padrão: metade do grid)
 */
export function snapToGrid(
  value: number,
  gridSize: number,
  threshold?: number
): number {
  const snapThreshold = threshold ?? gridSize / 2;
  const remainder = value % gridSize;

  if (remainder < snapThreshold) {
    return value - remainder;
  } else if (gridSize - remainder < snapThreshold) {
    return value + (gridSize - remainder);
  }

  return value;
}
