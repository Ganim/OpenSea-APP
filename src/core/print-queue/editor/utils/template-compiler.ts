/**
 * Template Compiler
 * Converte templates GrapesJS em HTML pronto para impressão
 */

import type { Editor } from 'grapesjs';
import { logger } from '@/lib/logger';
import type { LabelData } from '../../types';
import { LABEL_FIELDS } from '../constants';

/**
 * Extrai HTML e CSS do editor GrapesJS
 */
export function extractFromEditor(editor: Editor): {
  html: string;
  css: string;
} {
  const html = editor.getHtml() || '';
  const css = editor.getCss() || '';

  return { html, css };
}

/**
 * Resolve o valor de um campo a partir do dataPath
 */
export function resolveFieldValue(dataPath: string, data: LabelData): string {
  const parts = dataPath.split('.');
  let value: unknown = data;

  for (const part of parts) {
    if (value === null || value === undefined) {
      return '';
    }
    value = (value as Record<string, unknown>)[part];
  }

  if (value === null || value === undefined) {
    return '';
  }

  // Formatar datas
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return String(value);
    }
  }

  return String(value);
}

/**
 * Substitui placeholders de campos pelos valores reais
 */
export function compileTemplate(
  html: string,
  css: string,
  data: LabelData
): { html: string; css: string } {
  let compiledHtml = html;

  // Encontrar todos os campos e substituir pelos valores
  LABEL_FIELDS.forEach(field => {
    // Regex para encontrar elementos com data-field-id
    const fieldRegex = new RegExp(
      `(<[^>]*data-field-id="${field.id}"[^>]*>)([^<]*)(<\/[^>]+>)`,
      'gi'
    );

    compiledHtml = compiledHtml.replace(
      fieldRegex,
      (match, openTag, content, closeTag) => {
        const value = resolveFieldValue(field.dataPath, data);
        return `${openTag}${value}${closeTag}`;
      }
    );

    // Também substituir o sample value diretamente se o regex não pegar
    compiledHtml = compiledHtml.replace(
      new RegExp(escapeRegex(field.sampleValue), 'g'),
      resolveFieldValue(field.dataPath, data)
    );
  });

  return { html: compiledHtml, css };
}

/**
 * Escapa caracteres especiais para uso em regex
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Gera o HTML completo da etiqueta para impressão
 */
export function generatePrintableLabel(
  html: string,
  css: string,
  width: number,
  height: number
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: ${width}mm ${height}mm;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: ${width}mm;
      height: ${height}mm;
      overflow: hidden;
      font-family: Arial, sans-serif;
    }
    .label-container {
      width: 100%;
      height: 100%;
      padding: 2mm;
    }
    ${css}
  </style>
</head>
<body>
  <div class="label-container">
    ${html}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Gera múltiplas etiquetas em uma página A4
 */
export function generatePrintablePage(
  labels: Array<{ html: string; css: string }>,
  labelWidth: number,
  labelHeight: number,
  pageSettings: {
    labelsPerRow: number;
    margins: { top: number; right: number; bottom: number; left: number };
    spacing: { horizontal: number; vertical: number };
    paperSize: 'A4' | 'LETTER';
    orientation: 'portrait' | 'landscape';
  }
): string {
  const paperSizes = {
    A4: { width: 210, height: 297 },
    LETTER: { width: 215.9, height: 279.4 },
  };

  const paper = paperSizes[pageSettings.paperSize];
  const pageWidth =
    pageSettings.orientation === 'landscape' ? paper.height : paper.width;
  const pageHeight =
    pageSettings.orientation === 'landscape' ? paper.width : paper.height;

  // CSS compartilhado (pegar do primeiro label)
  const sharedCss = labels[0]?.css || '';

  const labelsHtml = labels
    .map(
      (label, index) => `
      <div class="label" style="
        width: ${labelWidth}mm;
        height: ${labelHeight}mm;
        margin-right: ${pageSettings.spacing.horizontal}mm;
        margin-bottom: ${pageSettings.spacing.vertical}mm;
        overflow: hidden;
        border: 0.1mm solid #eee;
      ">
        ${label.html}
      </div>
    `
    )
    .join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: ${pageWidth}mm ${pageHeight}mm;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: ${pageWidth}mm;
      min-height: ${pageHeight}mm;
      font-family: Arial, sans-serif;
      padding-top: ${pageSettings.margins.top}mm;
      padding-right: ${pageSettings.margins.right}mm;
      padding-bottom: ${pageSettings.margins.bottom}mm;
      padding-left: ${pageSettings.margins.left}mm;
    }
    .labels-container {
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
    }
    .label {
      page-break-inside: avoid;
    }
    ${sharedCss}
  </style>
</head>
<body>
  <div class="labels-container">
    ${labelsHtml}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Serializa o projeto GrapesJS para armazenamento
 */
export function serializeProject(editor: Editor): string {
  const projectData = editor.getProjectData();
  return JSON.stringify(projectData);
}

/**
 * Carrega um projeto GrapesJS serializado
 */
export function loadProject(editor: Editor, serializedData: string): void {
  try {
    const projectData = JSON.parse(serializedData);
    editor.loadProjectData(projectData);
  } catch (error) {
    logger.error(
      'Failed to load project data',
      error instanceof Error ? error : undefined
    );
    throw new Error('Invalid project data');
  }
}
