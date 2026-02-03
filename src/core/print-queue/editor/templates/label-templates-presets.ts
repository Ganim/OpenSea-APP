/**
 * Templates de Etiquetas Pré-definidos
 * Templates prontos para uso que podem ser customizados
 */

export interface LabelTemplatePreset {
  id: string;
  name: string;
  description: string;
  category: 'product' | 'inventory' | 'shipping' | 'shelf' | 'jewelry';
  width: number; // mm
  height: number; // mm
  html: string;
  thumbnail?: string;
}

// Estilos base para todas as etiquetas
const baseStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 10px; }
  .label { width: 100%; height: 100%; padding: 2mm; }
  .title { font-weight: bold; font-size: 12px; margin-bottom: 2px; }
  .subtitle { font-size: 9px; color: #666; margin-bottom: 4px; }
  .field-row { display: flex; margin-bottom: 2px; align-items: baseline; }
  .field-label { font-size: 8px; color: #666; min-width: 50px; text-transform: uppercase; }
  .field-value { font-size: 10px; font-weight: 500; }
  .field-value-large { font-size: 14px; font-weight: bold; }
  .barcode-area { text-align: center; margin: 4px 0; }
  .qr-area { text-align: center; }
  .divider { border-top: 1px solid #ddd; margin: 4px 0; }
  .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
  .grid-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-small { font-size: 8px; }
  .text-large { font-size: 14px; }
  .text-bold { font-weight: bold; }
  .mt-1 { margin-top: 2px; }
  .mt-2 { margin-top: 4px; }
  .mb-1 { margin-bottom: 2px; }
  .mb-2 { margin-bottom: 4px; }
`;

/**
 * Templates pré-definidos
 */
export const LABEL_TEMPLATE_PRESETS: LabelTemplatePreset[] = [
  // ========================================
  // ETIQUETAS DE PRODUTO
  // ========================================
  {
    id: 'product-basic',
    name: 'Produto Básico',
    description: 'Nome do produto, SKU e código de barras',
    category: 'product',
    width: 60,
    height: 40,
    html: `
      <style>${baseStyles}</style>
      <div class="label">
        <div class="title" data-field="product.name">Nome do Produto</div>
        <div class="field-row">
          <span class="field-label">SKU:</span>
          <span class="field-value" data-field="variant.sku">SKU-001</span>
        </div>
        <div class="barcode-area">
          <div data-field="variant.barcode" data-type="barcode" style="height: 20px;"></div>
          <div class="text-small" data-field="variant.barcode">7891234567890</div>
        </div>
      </div>
    `,
  },
  {
    id: 'product-complete',
    name: 'Produto Completo',
    description: 'Informações completas do produto com variante',
    category: 'product',
    width: 80,
    height: 50,
    html: `
      <style>${baseStyles}</style>
      <div class="label">
        <div class="title" data-field="product.name">Nome do Produto</div>
        <div class="subtitle" data-field="variant.name">Variante</div>
        <div class="divider"></div>
        <div class="grid-2col">
          <div class="field-row">
            <span class="field-label">Cód:</span>
            <span class="field-value" data-field="product.code">PROD-001</span>
          </div>
          <div class="field-row">
            <span class="field-label">SKU:</span>
            <span class="field-value" data-field="variant.sku">SKU-001</span>
          </div>
          <div class="field-row">
            <span class="field-label">Ref:</span>
            <span class="field-value" data-field="variant.reference">REF-001</span>
          </div>
          <div class="field-row">
            <span class="field-label">Fab:</span>
            <span class="field-value" data-field="product.manufacturer.name">Fabricante</span>
          </div>
        </div>
        <div class="barcode-area">
          <div data-field="variant.barcode" data-type="barcode" style="height: 18px;"></div>
          <div class="text-small" data-field="variant.barcode">7891234567890</div>
        </div>
      </div>
    `,
  },
  {
    id: 'product-with-price',
    name: 'Produto com Preço',
    description: 'Etiqueta de prateleira com preço',
    category: 'shelf',
    width: 60,
    height: 35,
    html: `
      <style>${baseStyles}
        .price { font-size: 20px; font-weight: bold; text-align: right; }
        .price-currency { font-size: 12px; }
      </style>
      <div class="label">
        <div class="title" data-field="product.name" style="font-size: 11px;">Nome do Produto</div>
        <div class="text-small" data-field="variant.name">Variante</div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 4px;">
          <div>
            <div class="text-small" data-field="variant.sku">SKU-001</div>
            <div data-field="variant.barcode" data-type="barcode" style="height: 15px; width: 60px;"></div>
          </div>
          <div class="price">
            <span class="price-currency">R$</span>
            <span data-field="variant.price">99,90</span>
          </div>
        </div>
      </div>
    `,
  },

  // ========================================
  // ETIQUETAS DE INVENTÁRIO
  // ========================================
  {
    id: 'inventory-item',
    name: 'Item de Inventário',
    description: 'Código do item, localização e QR Code',
    category: 'inventory',
    width: 60,
    height: 40,
    html: `
      <style>${baseStyles}</style>
      <div class="label">
        <div style="display: flex; justify-content: space-between;">
          <div style="flex: 1;">
            <div class="field-value-large" data-field="item.uniqueCode">ITM-001</div>
            <div class="field-row mt-1">
              <span class="field-label">Local:</span>
              <span class="field-value text-bold" data-field="item.resolvedAddress">A-01-02-03</span>
            </div>
            <div class="field-row">
              <span class="field-label">Qtd:</span>
              <span class="field-value" data-field="item.currentQuantity">10</span>
            </div>
            <div class="field-row">
              <span class="field-label">Lote:</span>
              <span class="field-value" data-field="item.batchNumber">LOTE-001</span>
            </div>
          </div>
          <div class="qr-area" style="width: 30px;">
            <div data-field="item.uniqueCode" data-type="qrcode" style="width: 28px; height: 28px;"></div>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'inventory-full',
    name: 'Inventário Completo',
    description: 'Todas as informações do item com produto',
    category: 'inventory',
    width: 100,
    height: 60,
    html: `
      <style>${baseStyles}</style>
      <div class="label">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <div class="title" data-field="product.name">Nome do Produto</div>
          <div class="field-value-large" data-field="item.uniqueCode">ITM-001</div>
        </div>
        <div class="subtitle" data-field="variant.name">Variante</div>
        <div class="divider"></div>
        <div class="grid-3col">
          <div class="field-row">
            <span class="field-label">SKU:</span>
            <span class="field-value" data-field="variant.sku">SKU-001</span>
          </div>
          <div class="field-row">
            <span class="field-label">Local:</span>
            <span class="field-value text-bold" data-field="item.resolvedAddress">A-01-02</span>
          </div>
          <div class="field-row">
            <span class="field-label">Qtd:</span>
            <span class="field-value" data-field="item.currentQuantity">10</span>
          </div>
          <div class="field-row">
            <span class="field-label">Lote:</span>
            <span class="field-value" data-field="item.batchNumber">LOTE-001</span>
          </div>
          <div class="field-row">
            <span class="field-label">Entrada:</span>
            <span class="field-value" data-field="item.entryDate">01/01/2024</span>
          </div>
          <div class="field-row">
            <span class="field-label">Validade:</span>
            <span class="field-value" data-field="item.expiryDate">01/01/2025</span>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 4px;">
          <div class="barcode-area" style="flex: 1;">
            <div data-field="variant.barcode" data-type="barcode" style="height: 18px;"></div>
            <div class="text-small" data-field="variant.barcode">7891234567890</div>
          </div>
          <div class="qr-area" style="margin-left: 8px;">
            <div data-field="item.uniqueCode" data-type="qrcode" style="width: 30px; height: 30px;"></div>
          </div>
        </div>
      </div>
    `,
  },

  // ========================================
  // ETIQUETAS DE LOCALIZAÇÃO
  // ========================================
  {
    id: 'location-simple',
    name: 'Localização Simples',
    description: 'Endereço grande para identificação de prateleira',
    category: 'shelf',
    width: 80,
    height: 30,
    html: `
      <style>${baseStyles}
        .address-large { font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 2px; }
      </style>
      <div class="label text-center">
        <div class="address-large" data-field="item.resolvedAddress">A-01-02-03</div>
        <div class="text-small mt-1" data-field="item.bin.zone.name">Zona A</div>
      </div>
    `,
  },
  {
    id: 'location-qr',
    name: 'Localização com QR',
    description: 'Endereço com QR Code para scan rápido',
    category: 'shelf',
    width: 50,
    height: 50,
    html: `
      <style>${baseStyles}
        .address-medium { font-size: 16px; font-weight: bold; text-align: center; }
      </style>
      <div class="label text-center">
        <div class="address-medium" data-field="item.resolvedAddress">A-01-02-03</div>
        <div class="qr-area mt-2">
          <div data-field="item.resolvedAddress" data-type="qrcode" style="width: 32px; height: 32px; margin: 0 auto;"></div>
        </div>
        <div class="text-small mt-1" data-field="item.bin.zone.warehouse.code">WH-01</div>
      </div>
    `,
  },

  // ========================================
  // ETIQUETAS ESPECIAIS
  // ========================================
  {
    id: 'jewelry-small',
    name: 'Joalheria Pequena',
    description: 'Etiqueta pequena para joias',
    category: 'jewelry',
    width: 22,
    height: 10,
    html: `
      <style>${baseStyles}
        .label { padding: 0.5mm; }
        .tiny { font-size: 6px; }
      </style>
      <div class="label">
        <div class="tiny text-bold" data-field="variant.sku">SKU-001</div>
        <div class="tiny" data-field="variant.reference">REF-001</div>
      </div>
    `,
  },
  {
    id: 'shipping-label',
    name: 'Etiqueta de Envio',
    description: 'Para pacotes e caixas',
    category: 'shipping',
    width: 100,
    height: 70,
    html: `
      <style>${baseStyles}
        .shipping-header { background: #000; color: #fff; padding: 2px 4px; font-weight: bold; }
        .big-text { font-size: 18px; font-weight: bold; }
      </style>
      <div class="label">
        <div class="shipping-header">CONTEÚDO DO PACOTE</div>
        <div style="padding: 4px;">
          <div class="big-text" data-field="product.name">Nome do Produto</div>
          <div class="subtitle" data-field="variant.name">Variante</div>
          <div class="divider"></div>
          <div class="grid-2col">
            <div class="field-row">
              <span class="field-label">Código:</span>
              <span class="field-value" data-field="item.uniqueCode">ITM-001</span>
            </div>
            <div class="field-row">
              <span class="field-label">Qtd:</span>
              <span class="field-value text-bold" data-field="item.currentQuantity">10 un</span>
            </div>
            <div class="field-row">
              <span class="field-label">Origem:</span>
              <span class="field-value" data-field="item.resolvedAddress">A-01-02</span>
            </div>
            <div class="field-row">
              <span class="field-label">Lote:</span>
              <span class="field-value" data-field="item.batchNumber">LOTE-001</span>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px;">
            <div data-field="variant.barcode" data-type="barcode" style="height: 22px; flex: 1;"></div>
            <div data-field="item.uniqueCode" data-type="qrcode" style="width: 35px; height: 35px; margin-left: 8px;"></div>
          </div>
        </div>
      </div>
    `,
  },

  // ========================================
  // TEMPLATES GENÉRICOS
  // ========================================
  {
    id: 'generic-2fields',
    name: 'Dois Campos',
    description: 'Template simples com 2 campos personalizáveis',
    category: 'product',
    width: 50,
    height: 25,
    html: `
      <style>${baseStyles}</style>
      <div class="label">
        <div class="title" data-field="product.name">Campo Principal</div>
        <div class="field-value" data-field="variant.sku">Campo Secundário</div>
      </div>
    `,
  },
  {
    id: 'generic-barcode-only',
    name: 'Apenas Código de Barras',
    description: 'Somente o código de barras com número',
    category: 'product',
    width: 50,
    height: 20,
    html: `
      <style>${baseStyles}</style>
      <div class="label text-center">
        <div data-field="variant.barcode" data-type="barcode" style="height: 14px;"></div>
        <div class="text-small" data-field="variant.barcode">7891234567890</div>
      </div>
    `,
  },
  {
    id: 'generic-qr-only',
    name: 'Apenas QR Code',
    description: 'Somente o QR Code',
    category: 'inventory',
    width: 30,
    height: 30,
    html: `
      <style>${baseStyles}</style>
      <div class="label text-center">
        <div data-field="item.uniqueCode" data-type="qrcode" style="width: 24px; height: 24px; margin: 0 auto;"></div>
        <div class="text-small mt-1" data-field="item.uniqueCode">ITM-001</div>
      </div>
    `,
  },

  // ========================================
  // ETIQUETA TÊXTIL 100x100mm
  // ========================================
  {
    id: 'textile-identification',
    name: 'Identificação de Produto Têxtil',
    description: 'Etiqueta completa 100x100mm para tecidos e produtos têxteis',
    category: 'product',
    width: 100,
    height: 100,
    html: `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 9px; line-height: 1.2; }
        .label { width: 100%; height: 100%; padding: 2mm; display: flex; flex-direction: column; overflow: hidden; }
        .header { text-align: center; font-weight: bold; font-size: 11px; margin-bottom: 1.5mm; text-transform: uppercase; }
        .info-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
        .info-table td { border: 1px solid #000; padding: 0.8mm 1.5mm; vertical-align: middle; }
        .info-table .label-cell { font-weight: bold; font-size: 8px; }
        .info-table .value-cell { font-size: 9px; }
        .highlight-section { margin-top: 1.5mm; }
        .highlight-table { width: 100%; border-collapse: collapse; border: 1.5px solid #000; }
        .highlight-table td { border: 1.5px solid #000; padding: 1mm; text-align: center; }
        .highlight-table .header-cell { font-weight: bold; font-size: 10px; }
        .highlight-table .value-cell { font-size: 12px; font-weight: bold; }
        .barcode-section { margin-top: 1.5mm; text-align: center; }
        .barcode-number { font-size: 8px; margin-top: 0.5mm; font-family: monospace; }
      </style>
      <div class="label">
        <div class="header" data-field="custom.title">IDENTIFICAÇÃO DE PRODUTO</div>

        <table class="info-table">
          <tr>
            <td class="label-cell" style="width: 50%;">Fabricante:</td>
            <td class="label-cell" style="width: 50%;">Localização Estoque</td>
          </tr>
          <tr>
            <td class="value-cell" data-field="product.manufacturer.name">Santista</td>
            <td class="value-cell" data-field="item.resolvedAddress">FB-108-E</td>
          </tr>
          <tr>
            <td class="label-cell">Produto:</td>
            <td class="label-cell">Código</td>
          </tr>
          <tr>
            <td class="value-cell" data-field="product.name">Solasol</td>
            <td class="value-cell" data-field="variant.sku">5.1.1.2.901.23</td>
          </tr>
          <tr>
            <td class="label-cell">Composição:</td>
            <td class="label-cell">Qualidade:</td>
          </tr>
          <tr>
            <td class="value-cell" data-field="variant.attributes.composicao">100% Algodão</td>
            <td class="value-cell" data-field="variant.attributes.qualidade">-</td>
          </tr>
          <tr>
            <td class="label-cell">Cor:</td>
            <td class="label-cell">Nuance:</td>
          </tr>
          <tr>
            <td class="value-cell" data-field="variant.attributes.cor">901 - Preto</td>
            <td class="value-cell" data-field="variant.attributes.nuance">-</td>
          </tr>
          <tr>
            <td class="label-cell">Dimensões:</td>
            <td class="label-cell">Gramatura:</td>
          </tr>
          <tr>
            <td class="value-cell" data-field="variant.attributes.dimensoes">L: 1,62m</td>
            <td class="value-cell" data-field="variant.attributes.gramatura">260 g/m²</td>
          </tr>
        </table>

        <div class="highlight-section">
          <table class="highlight-table">
            <tr>
              <td class="header-cell" style="width: 50%;">#ID DA PEÇA</td>
              <td class="header-cell" style="width: 50%;">QUANTIDADE</td>
            </tr>
            <tr>
              <td class="value-cell" data-field="item.uniqueCode">AA00023-1</td>
              <td class="value-cell" data-field="item.currentQuantity">±9 m</td>
            </tr>
          </table>
        </div>

        <div class="barcode-section">
          <div data-field="item.barcodeData" data-type="barcode" style="height: 12mm; width: 100%;"></div>
          <div class="barcode-number" data-field="item.barcodeData">5.1.1.2.901.23/AA00023-1</div>
        </div>
      </div>
    `,
  },

  // Versão simplificada da etiqueta têxtil
  {
    id: 'textile-simple',
    name: 'Têxtil Simplificada',
    description: 'Versão compacta para tecidos - 80x60mm',
    category: 'product',
    width: 80,
    height: 60,
    html: `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 9px; }
        .label { width: 100%; height: 100%; padding: 2mm; display: flex; flex-direction: column; }
        .header { text-align: center; font-weight: bold; font-size: 11px; margin-bottom: 2mm; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #000; border: 1px solid #000; }
        .info-cell { background: #fff; padding: 1mm; }
        .info-cell.label { font-weight: bold; font-size: 8px; }
        .info-cell.value { font-size: 9px; }
        .highlight-row { display: flex; margin-top: 2mm; border: 2px solid #000; }
        .highlight-cell { flex: 1; text-align: center; padding: 1.5mm; }
        .highlight-cell.header { font-weight: bold; font-size: 9px; border-bottom: 2px solid #000; }
        .highlight-cell.value { font-size: 12px; font-weight: bold; }
        .highlight-cell:first-child { border-right: 2px solid #000; }
        .barcode-section { margin-top: auto; text-align: center; padding-top: 2mm; }
        .barcode-number { font-size: 8px; font-family: monospace; }
      </style>
      <div class="label">
        <div class="header" data-field="custom.title">IDENTIFICAÇÃO</div>

        <div class="info-grid">
          <div class="info-cell label">Fabricante:</div>
          <div class="info-cell label">Local:</div>
          <div class="info-cell value" data-field="product.manufacturer.name">Fabricante</div>
          <div class="info-cell value" data-field="item.resolvedAddress">A-01-02</div>
          <div class="info-cell label">Produto:</div>
          <div class="info-cell label">Código:</div>
          <div class="info-cell value" data-field="product.name">Produto</div>
          <div class="info-cell value" data-field="variant.sku">SKU-001</div>
          <div class="info-cell label">Cor:</div>
          <div class="info-cell label">Composição:</div>
          <div class="info-cell value" data-field="variant.attributes.cor">Cor</div>
          <div class="info-cell value" data-field="variant.attributes.composicao">Composição</div>
        </div>

        <div class="highlight-row">
          <div style="flex: 1; border-right: 2px solid #000;">
            <div class="highlight-cell header">#ID PEÇA</div>
            <div class="highlight-cell value" data-field="item.uniqueCode">ITM-001</div>
          </div>
          <div style="flex: 1;">
            <div class="highlight-cell header">QTD</div>
            <div class="highlight-cell value" data-field="item.currentQuantity">10 m</div>
          </div>
        </div>

        <div class="barcode-section">
          <div data-field="item.barcodeData" data-type="barcode" style="height: 12mm;"></div>
          <div class="barcode-number" data-field="item.barcodeData">SKU/ITM-001</div>
        </div>
      </div>
    `,
  },
];

/**
 * Obtém templates por categoria
 */
export function getTemplatesByCategory(
  category: LabelTemplatePreset['category']
): LabelTemplatePreset[] {
  return LABEL_TEMPLATE_PRESETS.filter(t => t.category === category);
}

/**
 * Obtém um template por ID
 */
export function getTemplateById(id: string): LabelTemplatePreset | undefined {
  return LABEL_TEMPLATE_PRESETS.find(t => t.id === id);
}

/**
 * Categorias disponíveis
 */
export const TEMPLATE_CATEGORIES = [
  { id: 'product', name: 'Produto', icon: 'Package' },
  { id: 'inventory', name: 'Inventário', icon: 'Box' },
  { id: 'shelf', name: 'Prateleira', icon: 'LayoutGrid' },
  { id: 'shipping', name: 'Envio', icon: 'Truck' },
  { id: 'jewelry', name: 'Joalheria', icon: 'Gem' },
] as const;
