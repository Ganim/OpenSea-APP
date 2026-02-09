/**
 * Label Studio - Print Renderer
 * Funções para renderizar templates para impressão
 */

import type {
  LabelStudioTemplate,
  LabelElement,
  FieldConfig,
} from '../studio-types';
import { mmToPx } from './unitConverter';

/**
 * DPI para impressão (padrão 300 DPI para impressoras de etiqueta)
 */
export const PRINT_DPI = 300;
const MM_TO_PRINT_PX = PRINT_DPI / 25.4; // ~11.81 px/mm

/**
 * Converte mm para pixels de impressão
 */
export function mmToPrintPx(mm: number): number {
  return Math.round(mm * MM_TO_PRINT_PX);
}

/**
 * Resolve um dataPath em dados reais
 */
function resolveDataPath(data: Record<string, unknown>, path: string): string {
  const value = path.split('.').reduce<unknown>((obj, key) => {
    if (obj && typeof obj === 'object') {
      return (obj as Record<string, unknown>)[key];
    }
    return undefined;
  }, data);

  if (value == null) return '';
  return String(value);
}

/**
 * Resolve o valor de um campo baseado no FieldConfig
 */
export function resolveFieldValue(
  fieldConfig: FieldConfig,
  data: Record<string, unknown>
): string {
  switch (fieldConfig.type) {
    case 'simple':
      return resolveDataPath(data, fieldConfig.dataPath || '');

    case 'composite':
      if (!fieldConfig.template) return '';
      return fieldConfig.template.replace(/\{([^}]+)\}/g, (_, path) => {
        return resolveDataPath(data, path);
      });

    case 'conditional':
      if (!fieldConfig.conditions) return '';
      const primary = resolveDataPath(data, fieldConfig.conditions.primary);
      if (primary) return primary;
      for (const fallback of fieldConfig.conditions.fallbacks) {
        const value = resolveDataPath(data, fallback);
        if (value) return value;
      }
      return '';

    case 'calculated':
      if (!fieldConfig.formula) return '';
      try {
        // Resolve campo references na fórmula
        const resolvedFormula = fieldConfig.formula.replace(
          /\{([^}]+)\}/g,
          (_, path) => {
            const val = resolveDataPath(data, path);
            return val || '0';
          }
        );
        // Calcula o resultado (apenas operações matemáticas simples)
        const result = Function(`'use strict'; return (${resolvedFormula})`)();
        const decimals = fieldConfig.decimalPlaces ?? 2;
        switch (fieldConfig.format) {
          case 'currency':
            return `R$ ${Number(result).toFixed(decimals).replace('.', ',')}`;
          case 'percentage':
            return `${Number(result).toFixed(decimals)}%`;
          default:
            return Number(result).toFixed(decimals);
        }
      } catch {
        return 'ERRO';
      }

    default:
      return '';
  }
}

/**
 * Gera HTML de um template para impressão
 * Este HTML pode ser renderizado em um iframe invisível e impresso via window.print()
 */
export function generatePrintHTML(
  template: LabelStudioTemplate,
  data: Record<string, unknown>,
  options: {
    dpi?: number;
    copies?: number;
    showBorder?: boolean;
  } = {}
): string {
  const { dpi = 300, copies = 1, showBorder = false } = options;
  const scale = dpi / 25.4; // px per mm at target DPI

  const widthPx = Math.round(template.width * scale);
  const heightPx = Math.round(template.height * scale);

  // Gera HTML para cada elemento
  const elementsHTML = template.elements
    .filter(el => el.visible)
    .sort((a, b) => a.zIndex - b.zIndex)
    .map(el => renderElementToHTML(el, data, scale))
    .join('\n');

  // HTML de uma etiqueta
  const singleLabel = `
    <div class="label" style="
      position: relative;
      width: ${widthPx}px;
      height: ${heightPx}px;
      background: ${template.canvas.backgroundColor};
      overflow: hidden;
      page-break-inside: avoid;
      ${showBorder ? 'border: 1px solid #ccc;' : ''}
    ">
      ${elementsHTML}
    </div>
  `;

  // Repete para o número de cópias
  const labels = Array.from({ length: copies }, () => singleLabel).join('\n');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: ${template.width}mm ${template.height}mm;
          margin: 0;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: Arial, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .label { margin: 0; }
        @media print {
          .label { page-break-after: always; }
          .label:last-child { page-break-after: auto; }
        }
      </style>
    </head>
    <body>
      ${labels}
    </body>
    </html>
  `;
}

/**
 * Renderiza um elemento para HTML
 */
function renderElementToHTML(
  element: LabelElement,
  data: Record<string, unknown>,
  scale: number
): string {
  const x = Math.round(element.x * scale);
  const y = Math.round(element.y * scale);
  const w = Math.round(element.width * scale);
  const h = Math.round(element.height * scale);
  const rotate = element.rotation
    ? `transform: rotate(${element.rotation}deg);`
    : '';
  const opacity = element.opacity < 1 ? `opacity: ${element.opacity};` : '';

  const baseStyle = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: ${w}px;
    height: ${h}px;
    ${rotate}
    ${opacity}
    overflow: hidden;
  `;

  switch (element.type) {
    case 'text': {
      const fontSize = Math.round(element.style.fontSize * scale);
      return `<div style="${baseStyle}
        font-family: ${element.style.fontFamily};
        font-size: ${fontSize}px;
        font-weight: ${element.style.fontWeight};
        font-style: ${element.style.fontStyle || 'normal'};
        color: ${element.style.color};
        text-align: ${element.style.textAlign};
        line-height: ${element.style.lineHeight || 1.2};
        display: flex;
        align-items: ${element.style.verticalAlign === 'top' ? 'flex-start' : element.style.verticalAlign === 'bottom' ? 'flex-end' : 'center'};
      ">${element.content || ''}</div>`;
    }

    case 'field': {
      const value = resolveFieldValue(element.fieldConfig, data);
      const fontSize = Math.round(element.valueStyle.fontSize * scale);
      const labelHTML = element.label?.enabled
        ? `<div style="
            font-size: ${Math.round((element.label.style?.fontSize || 2) * scale)}px;
            color: ${element.label.style?.color || '#666'};
            font-weight: ${element.label.style?.fontWeight || 'bold'};
            margin-bottom: ${Math.round(0.5 * scale)}px;
          ">${element.label.text || ''}</div>`
        : '';

      return `<div style="${baseStyle}
        display: flex;
        flex-direction: ${element.label?.position === 'left' ? 'row' : 'column'};
        padding: ${Math.round(0.5 * scale)}px;
      ">
        ${labelHTML}
        <div style="
          font-family: ${element.valueStyle.fontFamily};
          font-size: ${fontSize}px;
          font-weight: ${element.valueStyle.fontWeight};
          color: ${element.valueStyle.color};
          text-align: ${element.valueStyle.textAlign};
          flex: 1;
          display: flex;
          align-items: ${element.valueStyle.verticalAlign === 'top' ? 'flex-start' : element.valueStyle.verticalAlign === 'bottom' ? 'flex-end' : 'center'};
        ">${value}</div>
      </div>`;
    }

    case 'shape': {
      const borderRadius =
        element.shapeType === 'circle' || element.shapeType === 'ellipse'
          ? '50%'
          : element.borderRadius
            ? `${Math.round(element.borderRadius * scale)}px`
            : '0';
      const strokeW = Math.round(element.stroke.width * scale);
      const border =
        element.stroke.style !== 'none'
          ? `border: ${strokeW}px ${element.stroke.style} ${element.stroke.color};`
          : '';
      return `<div style="${baseStyle}
        background: ${element.fill};
        ${border}
        border-radius: ${borderRadius};
      "></div>`;
    }

    case 'line': {
      const strokeW = Math.round(element.strokeWidth * scale);
      return `<div style="${baseStyle}">
        <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          <line
            x1="${element.orientation === 'vertical' ? w / 2 : 0}"
            y1="${element.orientation === 'horizontal' ? h / 2 : 0}"
            x2="${element.orientation === 'vertical' ? w / 2 : w}"
            y2="${element.orientation === 'horizontal' ? h / 2 : h}"
            stroke="${element.color}"
            stroke-width="${strokeW}"
            ${element.strokeStyle === 'dashed' ? 'stroke-dasharray="8,4"' : ''}
            ${element.strokeStyle === 'dotted' ? 'stroke-dasharray="2,2"' : ''}
          />
        </svg>
      </div>`;
    }

    case 'image': {
      if (!element.src) return `<div style="${baseStyle}"></div>`;
      return `<div style="${baseStyle}">
        <img src="${element.src}" alt="" style="width:100%;height:100%;object-fit:${element.objectFit};" />
      </div>`;
    }

    case 'barcode': {
      // Barcode will be rendered client-side via JsBarcode
      // For print, we generate a placeholder that the print renderer should hydrate
      const barcodeValue =
        element.barcodeConfig.source === 'custom'
          ? element.barcodeConfig.customValue || ''
          : resolveDataPath(data, element.barcodeConfig.dataPath || '');
      return `<div style="${baseStyle}"
        data-barcode="${barcodeValue}"
        data-format="${element.barcodeConfig.format}"
        data-show-text="${element.barcodeConfig.showText}"
        data-bar-color="${element.barcodeConfig.barColor}"
        data-bg-color="${element.barcodeConfig.backgroundColor}"
        class="barcode-placeholder"
      ></div>`;
    }

    case 'qrcode': {
      const qrValue =
        element.qrConfig.contentType === 'field'
          ? resolveDataPath(data, element.qrConfig.dataPath || '')
          : element.qrConfig.template || '';
      return `<div style="${baseStyle}"
        data-qr="${qrValue}"
        data-error-level="${element.qrConfig.errorCorrectionLevel}"
        data-module-color="${element.qrConfig.moduleColor}"
        data-bg-color="${element.qrConfig.backgroundColor}"
        class="qr-placeholder"
      ></div>`;
    }

    default:
      return `<div style="${baseStyle}"></div>`;
  }
}
