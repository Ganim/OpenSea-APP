/**
 * Page Layout Calculator
 * Calcula o layout das etiquetas nas páginas
 */

import { PAPER_SIZES } from '../constants';
import type {
  CalculatedLayout,
  LabelData,
  LabelPosition,
  LabelTemplateDefinition,
  PageLayout,
  PageSettings,
} from '../types';

/**
 * Obtém as dimensões do papel em mm
 */
export function getPaperDimensions(settings: PageSettings): {
  width: number;
  height: number;
} {
  if (settings.paperSize === 'CUSTOM' && settings.customDimensions) {
    return settings.customDimensions;
  }

  const baseDimensions =
    settings.paperSize === 'A4'
      ? PAPER_SIZES.A4
      : settings.paperSize === 'LETTER'
        ? PAPER_SIZES.LETTER
        : PAPER_SIZES.A4;

  // Ajustar para orientação
  if (settings.orientation === 'landscape') {
    return {
      width: baseDimensions.height,
      height: baseDimensions.width,
    };
  }

  return baseDimensions;
}

/**
 * Calcula a área útil da página (descontando margens)
 */
export function getUsableArea(
  paperDimensions: { width: number; height: number },
  margins: PageSettings['margins']
): { width: number; height: number } {
  return {
    width: paperDimensions.width - margins.left - margins.right,
    height: paperDimensions.height - margins.top - margins.bottom,
  };
}

/**
 * Calcula quantas etiquetas cabem por linha/coluna
 */
export function calculateLabelsPerPage(
  usableArea: { width: number; height: number },
  labelDimensions: { width: number; height: number },
  spacing: PageSettings['labelSpacing'],
  labelsPerRow: number
): { rows: number; columns: number; total: number } {
  // Usar o número de colunas definido pelo usuário
  const columns = labelsPerRow;

  // Calcular largura efetiva de cada etiqueta + espaçamento
  const effectiveLabelWidth = labelDimensions.width + spacing.horizontal;
  const effectiveLabelHeight = labelDimensions.height + spacing.vertical;

  // Verificar se cabe a quantidade de colunas desejada
  const requiredWidth = columns * effectiveLabelWidth - spacing.horizontal;
  const actualColumns =
    requiredWidth <= usableArea.width
      ? columns
      : Math.floor(
          (usableArea.width + spacing.horizontal) / effectiveLabelWidth
        );

  // Calcular linhas que cabem
  const rows = Math.floor(
    (usableArea.height + spacing.vertical) / effectiveLabelHeight
  );

  return {
    rows: Math.max(1, rows),
    columns: Math.max(1, actualColumns),
    total: Math.max(1, rows) * Math.max(1, actualColumns),
  };
}

/**
 * Calcula a posição de uma etiqueta específica
 */
export function calculateLabelPosition(
  index: number,
  columns: number,
  labelDimensions: { width: number; height: number },
  margins: PageSettings['margins'],
  spacing: PageSettings['labelSpacing'],
  labelsPerPage: number
): LabelPosition {
  const pageIndex = Math.floor(index / labelsPerPage);
  const indexInPage = index % labelsPerPage;

  const row = Math.floor(indexInPage / columns);
  const column = indexInPage % columns;

  const x =
    margins.left + column * (labelDimensions.width + spacing.horizontal);
  const y = margins.top + row * (labelDimensions.height + spacing.vertical);

  return {
    index,
    x,
    y,
    width: labelDimensions.width,
    height: labelDimensions.height,
    page: pageIndex,
    row,
    column,
  };
}

/**
 * Calcula o layout completo de todas as etiquetas
 */
export function calculateLayout(
  labels: LabelData[],
  template: LabelTemplateDefinition,
  settings: PageSettings
): CalculatedLayout {
  const paperDimensions = getPaperDimensions(settings);
  const usableArea = getUsableArea(paperDimensions, settings.margins);

  const {
    rows,
    columns,
    total: labelsPerPage,
  } = calculateLabelsPerPage(
    usableArea,
    template.dimensions,
    settings.labelSpacing,
    settings.labelsPerRow
  );

  const totalLabels = labels.length;
  const totalPages = Math.ceil(totalLabels / labelsPerPage);

  // Gerar páginas
  const pages: PageLayout[] = [];

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const startIndex = pageIndex * labelsPerPage;
    const endIndex = Math.min(startIndex + labelsPerPage, totalLabels);
    const pageLabels = labels.slice(startIndex, endIndex);

    const page: PageLayout = {
      pageIndex,
      labels: pageLabels.map((data, localIndex) => {
        const globalIndex = startIndex + localIndex;
        const position = calculateLabelPosition(
          globalIndex,
          columns,
          template.dimensions,
          settings.margins,
          settings.labelSpacing,
          labelsPerPage
        );

        return { position, data };
      }),
    };

    pages.push(page);
  }

  return {
    totalPages,
    totalLabels,
    labelsPerPage,
    pages,
    paperDimensions,
    labelDimensions: template.dimensions,
  };
}

/**
 * Calcula informações do layout para preview (sem dados)
 */
export function calculateLayoutInfo(
  template: LabelTemplateDefinition,
  settings: PageSettings
): {
  paperDimensions: { width: number; height: number };
  labelDimensions: { width: number; height: number };
  labelsPerPage: number;
  columns: number;
  rows: number;
  positions: LabelPosition[];
} {
  const paperDimensions = getPaperDimensions(settings);
  const usableArea = getUsableArea(paperDimensions, settings.margins);

  const {
    rows,
    columns,
    total: labelsPerPage,
  } = calculateLabelsPerPage(
    usableArea,
    template.dimensions,
    settings.labelSpacing,
    settings.labelsPerRow
  );

  // Gerar posições para uma página
  const positions: LabelPosition[] = [];
  for (let i = 0; i < labelsPerPage; i++) {
    positions.push(
      calculateLabelPosition(
        i,
        columns,
        template.dimensions,
        settings.margins,
        settings.labelSpacing,
        labelsPerPage
      )
    );
  }

  return {
    paperDimensions,
    labelDimensions: template.dimensions,
    labelsPerPage,
    columns,
    rows,
    positions,
  };
}

/**
 * Converte mm para pixels (para renderização em tela)
 * @param mm Valor em milímetros
 * @param dpi DPI da tela (padrão 96)
 */
export function mmToPixels(mm: number, dpi: number = 96): number {
  // 1 polegada = 25.4mm
  return (mm / 25.4) * dpi;
}

/**
 * Converte pixels para mm
 * @param pixels Valor em pixels
 * @param dpi DPI da tela (padrão 96)
 */
export function pixelsToMm(pixels: number, dpi: number = 96): number {
  return (pixels / dpi) * 25.4;
}

/**
 * Escala o layout para caber em um container
 */
export function scaleLayoutToFit(
  paperDimensions: { width: number; height: number },
  containerDimensions: { width: number; height: number },
  padding: number = 20
): number {
  const availableWidth = containerDimensions.width - padding * 2;
  const availableHeight = containerDimensions.height - padding * 2;

  const scaleX = availableWidth / paperDimensions.width;
  const scaleY = availableHeight / paperDimensions.height;

  return Math.min(scaleX, scaleY, 1); // Não escalar acima de 1
}
