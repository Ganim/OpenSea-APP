// ============================================
// DEFAULT DIMENSIONS
// ============================================

/**
 * Dimensões padrão para o mapa 2D (em pixels)
 */
export const MAP_DEFAULTS = {
  // Canvas
  canvasWidth: 1200,
  canvasHeight: 800,
  gridSize: 10,

  // Corredores
  aisleWidth: 60,
  aisleHeight: 400,
  aisleSpacing: 120,

  // Prateleiras
  shelfWidth: 50,
  shelfHeight: 8,
  shelfSpacing: 2,

  // Nichos
  binWidth: 50,
  binHeight: 20,

  // Margens
  marginX: 50,
  marginY: 50,

  // Zoom
  minZoom: 0.25,
  maxZoom: 3,
  zoomStep: 0.1,
};

/**
 * Dimensões físicas padrão (em centímetros)
 */
export const PHYSICAL_DEFAULTS = {
  aisleWidth: 300, // 3 metros
  aisleSpacing: 150, // 1.5 metros entre corredores
  shelfWidth: 100, // 1 metro
  shelfHeight: 40, // 40 cm
  binHeight: 30, // 30 cm por nicho
};

/**
 * Limites de estrutura
 */
export const STRUCTURE_LIMITS = {
  minAisles: 1,
  maxAisles: 99,
  minShelvesPerAisle: 1,
  maxShelvesPerAisle: 999,
  minBinsPerShelf: 1,
  maxBinsPerShelf: 26, // A-Z
};

/**
 * Calcula as dimensões do canvas necessárias para a zona
 */
export function calculateCanvasDimensions(
  aisles: number,
  shelvesPerAisle: number,
  binsPerShelf: number
): { width: number; height: number } {
  const aisleWidth = MAP_DEFAULTS.aisleWidth;
  const aisleSpacing = MAP_DEFAULTS.aisleSpacing;
  const binHeight = MAP_DEFAULTS.binHeight;
  const marginX = MAP_DEFAULTS.marginX;
  const marginY = MAP_DEFAULTS.marginY;

  // Largura: margens + (corredores * largura) + (espaçamentos)
  const width = marginX * 2 + aisles * aisleWidth + (aisles - 1) * aisleSpacing;

  // Altura: margens + (prateleiras * altura do bin * bins por prateleira)
  const totalShelfHeight = binsPerShelf * binHeight + MAP_DEFAULTS.shelfSpacing;
  const height = marginY * 2 + shelvesPerAisle * totalShelfHeight;

  return {
    width: Math.max(width, MAP_DEFAULTS.canvasWidth),
    height: Math.max(height, MAP_DEFAULTS.canvasHeight),
  };
}

/**
 * Calcula a posição X de um corredor
 */
export function calculateAisleX(aisleNumber: number): number {
  const aisleWidth = MAP_DEFAULTS.aisleWidth;
  const aisleSpacing = MAP_DEFAULTS.aisleSpacing;
  const marginX = MAP_DEFAULTS.marginX;

  return marginX + (aisleNumber - 1) * (aisleWidth + aisleSpacing);
}

/**
 * Calcula a posição Y de uma prateleira
 */
export function calculateShelfY(
  shelfNumber: number,
  binsPerShelf: number
): number {
  const binHeight = MAP_DEFAULTS.binHeight;
  const shelfSpacing = MAP_DEFAULTS.shelfSpacing;
  const marginY = MAP_DEFAULTS.marginY;

  const totalShelfHeight = binsPerShelf * binHeight + shelfSpacing;
  return marginY + (shelfNumber - 1) * totalShelfHeight;
}

/**
 * Calcula a posição Y de um nicho dentro da prateleira
 */
export function calculateBinY(
  shelfNumber: number,
  binIndex: number,
  binsPerShelf: number,
  direction: 'bottom-up' | 'top-down'
): number {
  const shelfY = calculateShelfY(shelfNumber, binsPerShelf);
  const binHeight = MAP_DEFAULTS.binHeight;

  if (direction === 'bottom-up') {
    // A está embaixo, D está em cima
    return shelfY + (binsPerShelf - 1 - binIndex) * binHeight;
  } else {
    // A está em cima, D está embaixo
    return shelfY + binIndex * binHeight;
  }
}
