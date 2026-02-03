/**
 * GrapesJS Plugin - Label Blocks
 * Plugin que adiciona blocos de campos de etiqueta ao editor
 * com estilos visuais claros para fácil manipulação
 */

import type { Editor } from 'grapesjs';
import { FIELD_CATEGORIES } from '../constants';
import type { LabelFieldDefinition } from '../types';

// ==============================================
// ESTILOS BASE PARA VISUALIZAÇÃO NO EDITOR
// ==============================================

// Cores para visualização no editor (bordas tracejadas)
const EDITOR_COLORS = {
  table: '#3b82f6', // Azul
  cell: '#60a5fa', // Azul claro
  row: '#93c5fd', // Azul mais claro
  flexRow: '#8b5cf6', // Roxo
  flexCol: '#a78bfa', // Roxo claro
  box: '#f59e0b', // Laranja
  spacer: '#6b7280', // Cinza
  text: '#10b981', // Verde
};

// Estilos comuns
const CELL_MIN_HEIGHT = '20px';
const CELL_PADDING = '4px';
const CONTAINER_MIN_HEIGHT = '30px';

/**
 * Gera o HTML de um campo de texto
 */
function createTextFieldHtml(field: LabelFieldDefinition): string {
  return `
    <span
      class="label-field label-field-text"
      data-field-id="${field.id}"
      data-field-path="${field.dataPath}"
      data-field-type="${field.type}"
      data-gjs-type="label-field"
      style="
        font-size: 10px;
        font-family: Arial, sans-serif;
        display: inline-block;
        padding: 2px 4px;
        background-color: rgba(16, 185, 129, 0.1);
        border: 1px dashed ${EDITOR_COLORS.text};
        border-radius: 2px;
        min-width: 40px;
      "
    >${field.sampleValue}</span>
  `.trim();
}

/**
 * Gera o HTML de um código de barras
 */
function createBarcodeHtml(field: LabelFieldDefinition): string {
  return `
    <div
      class="label-field barcode-container"
      data-field-id="${field.id}"
      data-field-path="${field.dataPath}"
      data-field-type="barcode"
      data-gjs-type="label-field"
      style="
        width: 120px;
        text-align: center;
        display: inline-block;
        padding: 4px;
        background-color: #fafafa;
        border: 1px dashed #999;
        border-radius: 2px;
      "
    >
      <svg class="barcode-placeholder" width="100" height="35" viewBox="0 0 100 35">
        <rect x="2" y="2" width="2" height="28" fill="#333"/>
        <rect x="6" y="2" width="1" height="28" fill="#333"/>
        <rect x="9" y="2" width="3" height="28" fill="#333"/>
        <rect x="14" y="2" width="1" height="28" fill="#333"/>
        <rect x="17" y="2" width="2" height="28" fill="#333"/>
        <rect x="21" y="2" width="1" height="28" fill="#333"/>
        <rect x="24" y="2" width="3" height="28" fill="#333"/>
        <rect x="29" y="2" width="2" height="28" fill="#333"/>
        <rect x="33" y="2" width="1" height="28" fill="#333"/>
        <rect x="36" y="2" width="2" height="28" fill="#333"/>
        <rect x="40" y="2" width="3" height="28" fill="#333"/>
        <rect x="45" y="2" width="1" height="28" fill="#333"/>
        <rect x="48" y="2" width="2" height="28" fill="#333"/>
        <rect x="52" y="2" width="1" height="28" fill="#333"/>
        <rect x="55" y="2" width="3" height="28" fill="#333"/>
        <rect x="60" y="2" width="2" height="28" fill="#333"/>
        <rect x="64" y="2" width="1" height="28" fill="#333"/>
        <rect x="67" y="2" width="2" height="28" fill="#333"/>
        <rect x="71" y="2" width="3" height="28" fill="#333"/>
        <rect x="76" y="2" width="1" height="28" fill="#333"/>
        <rect x="79" y="2" width="2" height="28" fill="#333"/>
        <rect x="83" y="2" width="1" height="28" fill="#333"/>
        <rect x="86" y="2" width="3" height="28" fill="#333"/>
        <rect x="91" y="2" width="2" height="28" fill="#333"/>
        <rect x="95" y="2" width="3" height="28" fill="#333"/>
      </svg>
      <div style="font-size: 9px; font-family: monospace; margin-top: 2px; color: #333;">${field.sampleValue}</div>
    </div>
  `.trim();
}

/**
 * Gera o HTML de um QR Code
 */
function createQrCodeHtml(field: LabelFieldDefinition): string {
  return `
    <div
      class="label-field qrcode-container"
      data-field-id="${field.id}"
      data-field-path="${field.dataPath}"
      data-field-type="qrcode"
      data-gjs-type="label-field"
      style="
        width: 60px;
        text-align: center;
        display: inline-block;
        padding: 4px;
        background-color: #fafafa;
        border: 1px dashed #999;
        border-radius: 2px;
      "
    >
      <svg class="qrcode-placeholder" width="50" height="50" viewBox="0 0 50 50">
        <rect x="0" y="0" width="50" height="50" fill="white"/>
        <rect x="4" y="4" width="14" height="14" fill="none" stroke="#333" stroke-width="2"/>
        <rect x="7" y="7" width="8" height="8" fill="#333"/>
        <rect x="32" y="4" width="14" height="14" fill="none" stroke="#333" stroke-width="2"/>
        <rect x="35" y="7" width="8" height="8" fill="#333"/>
        <rect x="4" y="32" width="14" height="14" fill="none" stroke="#333" stroke-width="2"/>
        <rect x="7" y="35" width="8" height="8" fill="#333"/>
        <rect x="22" y="4" width="4" height="4" fill="#333"/>
        <rect x="22" y="12" width="4" height="4" fill="#333"/>
        <rect x="22" y="22" width="4" height="4" fill="#333"/>
        <rect x="32" y="22" width="4" height="4" fill="#333"/>
        <rect x="40" y="22" width="4" height="4" fill="#333"/>
        <rect x="22" y="32" width="4" height="4" fill="#333"/>
        <rect x="32" y="32" width="4" height="4" fill="#333"/>
        <rect x="40" y="32" width="4" height="4" fill="#333"/>
        <rect x="32" y="40" width="4" height="4" fill="#333"/>
        <rect x="40" y="40" width="4" height="4" fill="#333"/>
      </svg>
    </div>
  `.trim();
}

/**
 * Gera o HTML baseado no tipo do campo
 */
function createFieldHtml(field: LabelFieldDefinition): string {
  switch (field.type) {
    case 'barcode':
      return createBarcodeHtml(field);
    case 'qrcode':
      return createQrCodeHtml(field);
    default:
      return createTextFieldHtml(field);
  }
}

/**
 * Gera o ícone SVG para o bloco
 */
function getBlockIcon(field: LabelFieldDefinition): string {
  const icons: Record<string, string> = {
    text: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M5 4v3h5.5v12h3V7H19V4H5z"/></svg>',
    number:
      '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M4 17V9h2v8H4zm4-8h6v2H8v2h4v2H8v2h6v2H6V9h2zm10 0h2v8h-2V9z"/></svg>',
    date: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>',
    barcode:
      '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2 4h2v16H2V4zm4 0h1v16H6V4zm3 0h2v16H9V4zm4 0h1v16h-1V4zm3 0h2v16h-2V4zm4 0h2v16h-2V4z"/></svg>',
    qrcode:
      '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 6h2v-2h-2v2zm0-4h2v-2h-2v2zm2 2h2v-2h-2v2zm2 2h2v-2h-2v2zm2-2h2v-2h-2v2zm0-4h2v-2h-2v2zm-4 0h2v-2h-2v2z"/></svg>',
  };

  return icons[field.type] || icons.text;
}

// Ícones SVG para os blocos de layout
const LAYOUT_ICONS = {
  text: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M5 4v3h5.5v12h3V7H19V4H5z"/></svg>',
  line: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M4 11h16v2H4z"/></svg>',
  spacer:
    '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 8h2v8H3V8zm16 0h2v8h-2V8zm-7 0h2v8h-2V8z"/></svg>',
  row: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 5v14h18V5H3zm4 12H5V7h2v10zm4 0H9V7h2v10zm4 0h-2V7h2v10zm4 0h-2V7h2v10z"/></svg>',
  column:
    '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 5v14h18V5H3zm16 4H5V7h14v2zm0 4H5v-2h14v2zm0 4H5v-2h14v2z"/></svg>',
  table:
    '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z"/></svg>',
  tableRow:
    '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 9h18v6H3V9zm2 2v2h14v-2H5z"/></svg>',
  tableCell:
    '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M5 5v14h14V5H5zm12 12H7V7h10v10z"/></svg>',
  box: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>',
};

// ==============================================
// TEMPLATES HTML PARA BLOCOS DE LAYOUT
// ==============================================

// Célula de tabela com estilo visual
const createTableCell = (withBorder = true) => `
  <td style="
    min-height: ${CELL_MIN_HEIGHT};
    padding: ${CELL_PADDING};
    ${withBorder ? `border: 1px dashed ${EDITOR_COLORS.cell};` : ''}
    vertical-align: top;
    background-color: rgba(59, 130, 246, 0.03);
  "></td>
`;

// Linha de tabela
const createTableRow = (cols: number, withBorder = true) => `
  <tr style="min-height: ${CELL_MIN_HEIGHT};">
    ${Array(cols).fill(createTableCell(withBorder)).join('')}
  </tr>
`;

// Tabela completa
const createTable = (rows: number, cols: number, withBorder = true) => `
  <table
    data-gjs-type="table"
    style="
      width: 100%;
      border-collapse: collapse;
      border: 2px dashed ${EDITOR_COLORS.table};
      background-color: rgba(59, 130, 246, 0.02);
      min-height: 30px;
    "
  >
    ${Array(rows).fill(createTableRow(cols, withBorder)).join('')}
  </table>
`;

// Container Flex Row
const createFlexRow = () => `
  <div
    class="row-container"
    data-gjs-type="flex-container"
    style="
      display: flex;
      flex-direction: row;
      gap: 4px;
      align-items: center;
      width: 100%;
      min-height: ${CONTAINER_MIN_HEIGHT};
      padding: 4px;
      border: 2px dashed ${EDITOR_COLORS.flexRow};
      background-color: rgba(139, 92, 246, 0.05);
      border-radius: 3px;
    "
  >
    <span style="color: ${EDITOR_COLORS.flexRow}; font-size: 9px; opacity: 0.7;">Linha Flex - arraste elementos aqui</span>
  </div>
`;

// Container Flex Column
const createFlexColumn = () => `
  <div
    class="column-container"
    data-gjs-type="flex-container"
    style="
      display: flex;
      flex-direction: column;
      gap: 2px;
      width: 100%;
      min-height: ${CONTAINER_MIN_HEIGHT};
      padding: 4px;
      border: 2px dashed ${EDITOR_COLORS.flexCol};
      background-color: rgba(167, 139, 250, 0.05);
      border-radius: 3px;
    "
  >
    <span style="color: ${EDITOR_COLORS.flexCol}; font-size: 9px; opacity: 0.7;">Coluna Flex - arraste elementos aqui</span>
  </div>
`;

// Container Box
const createBox = () => `
  <div
    class="box-container"
    data-gjs-type="flex-container"
    style="
      padding: 8px;
      min-height: ${CONTAINER_MIN_HEIGHT};
      border: 2px dashed ${EDITOR_COLORS.box};
      background-color: rgba(245, 158, 11, 0.05);
      border-radius: 3px;
    "
  >
    <span style="color: ${EDITOR_COLORS.box}; font-size: 9px; opacity: 0.7;">Caixa - arraste elementos aqui</span>
  </div>
`;

// Spacer com visualização
const createSpacer = (height = 10) => `
  <div
    class="spacer"
    data-gjs-type="spacer"
    style="
      height: ${height}px;
      width: 100%;
      background: repeating-linear-gradient(
        90deg,
        transparent,
        transparent 4px,
        ${EDITOR_COLORS.spacer}33 4px,
        ${EDITOR_COLORS.spacer}33 8px
      );
      border-top: 1px dashed ${EDITOR_COLORS.spacer};
      border-bottom: 1px dashed ${EDITOR_COLORS.spacer};
    "
  ></div>
`;

// Texto livre
const createFreeText = () => `
  <span
    class="text-block"
    data-gjs-type="text"
    style="
      font-size: 10px;
      font-family: Arial, sans-serif;
      display: inline-block;
      padding: 2px 6px;
      background-color: rgba(16, 185, 129, 0.1);
      border: 1px dashed ${EDITOR_COLORS.text};
      border-radius: 2px;
      min-width: 50px;
    "
  >Texto</span>
`;

// Linha horizontal
const createHorizontalLine = () => `
  <hr style="
    border: none;
    border-top: 2px solid #333;
    margin: 4px 0;
    width: 100%;
  "/>
`;

/**
 * Plugin principal para adicionar blocos de etiqueta
 */
export function labelBlocksPlugin(editor: Editor): void {
  const blockManager = editor.BlockManager;
  const domComponents = editor.DomComponents;

  // ============================================
  // REGISTRAR TIPOS DE COMPONENTES CUSTOMIZADOS
  // ============================================

  // Tipo base para campos de etiqueta
  domComponents.addType('label-field', {
    isComponent: (el: HTMLElement) => el.classList?.contains('label-field'),
    model: {
      defaults: {
        name: 'Campo',
        droppable: false,
        resizable: true,
        stylable: true,
        highlightable: true,
        badgable: true,
        'style-signature': [
          'font-family',
          'font-size',
          'font-weight',
          'color',
          'text-align',
        ],
      },
    },
  });

  // Tipo para tabelas
  domComponents.addType('table', {
    isComponent: (el: HTMLElement) => el.tagName === 'TABLE',
    model: {
      defaults: {
        name: 'Tabela',
        tagName: 'table',
        droppable: 'tr, tbody, thead, tfoot',
        draggable: true,
        stylable: true,
        highlightable: true,
        badgable: true,
      },
    },
  });

  // Tipo para linhas de tabela
  domComponents.addType('table-row', {
    isComponent: (el: HTMLElement) => el.tagName === 'TR',
    model: {
      defaults: {
        name: 'Linha',
        tagName: 'tr',
        droppable: 'td, th',
        draggable: 'table, tbody, thead, tfoot',
        stylable: true,
        highlightable: true,
      },
    },
  });

  // Tipo para células de tabela
  domComponents.addType('table-cell', {
    isComponent: (el: HTMLElement) =>
      el.tagName === 'TD' || el.tagName === 'TH',
    model: {
      defaults: {
        name: 'Célula',
        tagName: 'td',
        droppable: true,
        draggable: 'tr',
        stylable: true,
        highlightable: true,
        badgable: true,
      },
    },
  });

  // Tipo para containers flex
  domComponents.addType('flex-container', {
    isComponent: (el: HTMLElement) =>
      el.classList?.contains('row-container') ||
      el.classList?.contains('column-container') ||
      el.classList?.contains('box-container'),
    model: {
      defaults: {
        name: 'Container',
        droppable: true,
        resizable: true,
        stylable: true,
        highlightable: true,
        badgable: true,
      },
    },
  });

  // Tipo para spacer
  domComponents.addType('spacer', {
    isComponent: (el: HTMLElement) => el.classList?.contains('spacer'),
    model: {
      defaults: {
        name: 'Espaçador',
        droppable: false,
        resizable: {
          tl: 0,
          tc: 0,
          tr: 0,
          bl: 0,
          bc: 1,
          br: 0,
          cl: 0,
          cr: 0,
        },
        stylable: ['height'],
        highlightable: true,
      },
    },
  });

  // Tipo para texto
  domComponents.addType('text', {
    extend: 'text',
    model: {
      defaults: {
        name: 'Texto',
        droppable: false,
        stylable: true,
        highlightable: true,
        editable: true,
      },
    },
  });

  // ============================================
  // ADICIONAR BLOCOS DE CAMPOS DE ETIQUETA
  // ============================================

  FIELD_CATEGORIES.forEach(category => {
    category.fields.forEach(field => {
      blockManager.add(field.id, {
        label: field.label,
        category: category.label,
        content: createFieldHtml(field),
        media: getBlockIcon(field),
        attributes: {
          class: 'gjs-block-label-field',
          title: field.label,
        },
      });
    });
  });

  // ============================================
  // BLOCOS DE TABELA
  // ============================================

  blockManager.add('table-1x2', {
    label: 'Tabela 1×2',
    category: 'Tabelas',
    media: LAYOUT_ICONS.table,
    content: createTable(1, 2),
  });

  blockManager.add('table-2x2', {
    label: 'Tabela 2×2',
    category: 'Tabelas',
    media: LAYOUT_ICONS.table,
    content: createTable(2, 2),
  });

  blockManager.add('table-3x2', {
    label: 'Tabela 3×2',
    category: 'Tabelas',
    media: LAYOUT_ICONS.table,
    content: createTable(3, 2),
  });

  blockManager.add('table-2x3', {
    label: 'Tabela 2×3',
    category: 'Tabelas',
    media: LAYOUT_ICONS.table,
    content: createTable(2, 3),
  });

  blockManager.add('table-1x3', {
    label: 'Tabela 1×3',
    category: 'Tabelas',
    media: LAYOUT_ICONS.table,
    content: createTable(1, 3),
  });

  blockManager.add('table-row-block', {
    label: '+ Linha',
    category: 'Tabelas',
    media: LAYOUT_ICONS.tableRow,
    content: createTableRow(2),
  });

  blockManager.add('table-cell-block', {
    label: '+ Célula',
    category: 'Tabelas',
    media: LAYOUT_ICONS.tableCell,
    content: createTableCell(),
  });

  // Layout sem bordas (para impressão limpa)
  blockManager.add('layout-2col', {
    label: 'Layout 2 Col',
    category: 'Tabelas',
    media: LAYOUT_ICONS.table,
    content: createTable(1, 2, false),
  });

  blockManager.add('layout-3col', {
    label: 'Layout 3 Col',
    category: 'Tabelas',
    media: LAYOUT_ICONS.table,
    content: createTable(1, 3, false),
  });

  // ============================================
  // BLOCOS DE LAYOUT
  // ============================================

  blockManager.add('text-block', {
    label: 'Texto Livre',
    category: 'Layout',
    content: createFreeText(),
    media: LAYOUT_ICONS.text,
  });

  blockManager.add('line-horizontal', {
    label: 'Linha',
    category: 'Layout',
    content: createHorizontalLine(),
    media: LAYOUT_ICONS.line,
  });

  blockManager.add('spacer-small', {
    label: 'Espaço P',
    category: 'Layout',
    content: createSpacer(5),
    media: LAYOUT_ICONS.spacer,
  });

  blockManager.add('spacer-medium', {
    label: 'Espaço M',
    category: 'Layout',
    content: createSpacer(10),
    media: LAYOUT_ICONS.spacer,
  });

  blockManager.add('spacer-large', {
    label: 'Espaço G',
    category: 'Layout',
    content: createSpacer(20),
    media: LAYOUT_ICONS.spacer,
  });

  blockManager.add('flex-row', {
    label: 'Linha Flex',
    category: 'Layout',
    content: createFlexRow(),
    media: LAYOUT_ICONS.row,
  });

  blockManager.add('flex-column', {
    label: 'Coluna Flex',
    category: 'Layout',
    content: createFlexColumn(),
    media: LAYOUT_ICONS.column,
  });

  blockManager.add('box-container', {
    label: 'Caixa',
    category: 'Layout',
    content: createBox(),
    media: LAYOUT_ICONS.box,
  });
}

export default labelBlocksPlugin;
