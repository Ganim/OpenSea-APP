/**
 * Label Studio - Template Serializer
 * Funções de serialização/deserialização de templates
 */

import type {
  LabelStudioTemplate,
  LabelElement,
  CanvasConfig,
} from '../studio-types';
import { DEFAULT_TEXT_STYLE, DEFAULT_BORDER_STYLE } from '../studio-types';

/**
 * Versão atual do formato de template
 */
export const CURRENT_TEMPLATE_VERSION = 2;

/**
 * Valida um template carregado
 */
export function validateTemplate(data: unknown): {
  valid: boolean;
  errors: string[];
  template?: LabelStudioTemplate;
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Template inválido: dados não são um objeto'],
    };
  }

  const obj = data as Record<string, unknown>;

  // Verifica versão
  if (obj.version !== 2) {
    errors.push(
      `Versão de template não suportada: ${obj.version}. Esperado: 2`
    );
  }

  // Verifica dimensões
  if (typeof obj.width !== 'number' || obj.width <= 0) {
    errors.push('Largura inválida');
  }
  if (typeof obj.height !== 'number' || obj.height <= 0) {
    errors.push('Altura inválida');
  }

  // Verifica canvas
  if (!obj.canvas || typeof obj.canvas !== 'object') {
    errors.push('Configuração de canvas ausente');
  }

  // Verifica elementos
  if (!Array.isArray(obj.elements)) {
    errors.push('Lista de elementos inválida');
  } else {
    for (let i = 0; i < obj.elements.length; i++) {
      const el = obj.elements[i] as Record<string, unknown>;
      if (!el.id || !el.type) {
        errors.push(`Elemento ${i}: id ou type ausente`);
      }
      if (typeof el.x !== 'number' || typeof el.y !== 'number') {
        errors.push(`Elemento ${i}: posição inválida`);
      }
      if (typeof el.width !== 'number' || typeof el.height !== 'number') {
        errors.push(`Elemento ${i}: dimensões inválidas`);
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], template: data as LabelStudioTemplate };
}

/**
 * Serializa um template para JSON string
 */
export function serializeTemplate(template: LabelStudioTemplate): string {
  return JSON.stringify(template, null, 2);
}

/**
 * Deserializa um template de JSON string
 */
export function deserializeTemplate(json: string): {
  valid: boolean;
  errors: string[];
  template?: LabelStudioTemplate;
} {
  try {
    const data = JSON.parse(json);
    return validateTemplate(data);
  } catch (e) {
    return { valid: false, errors: ['JSON inválido'] };
  }
}

/**
 * Cria um template vazio
 */
export function createEmptyTemplate(
  width: number,
  height: number,
  name?: string
): LabelStudioTemplate {
  return {
    version: 2,
    width,
    height,
    canvas: {
      backgroundColor: '#ffffff',
      showMargins: false,
    },
    elements: [],
    category: undefined,
  };
}

/**
 * Template presets para etiquetas comuns
 */
export const LABEL_TEMPLATE_PRESETS_V2: Array<{
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  category: string;
  template: LabelStudioTemplate;
}> = [
  {
    id: 'product-basic',
    name: 'Produto Básico',
    description: 'Etiqueta simples com nome e preço',
    width: 60,
    height: 40,
    category: 'product',
    template: {
      version: 2,
      width: 60,
      height: 40,
      canvas: { backgroundColor: '#ffffff', showMargins: false },
      category: 'produto',
      elements: [
        {
          id: 'prod-name',
          type: 'field',
          x: 2,
          y: 2,
          width: 56,
          height: 10,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          locked: false,
          visible: true,
          name: 'Nome do Produto',
          fieldConfig: { type: 'simple', dataPath: 'product.name' },
          valueStyle: {
            ...DEFAULT_TEXT_STYLE,
            fontSize: 4,
            fontWeight: 'bold',
          },
        },
        {
          id: 'prod-price',
          type: 'field',
          x: 2,
          y: 14,
          width: 30,
          height: 10,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          locked: false,
          visible: true,
          name: 'Preço',
          fieldConfig: { type: 'simple', dataPath: 'variant.price' },
          label: {
            enabled: true,
            text: 'Preço',
            position: 'above',
            style: { fontSize: 2, color: '#666666' },
          },
          valueStyle: {
            ...DEFAULT_TEXT_STYLE,
            fontSize: 5,
            fontWeight: 'bold',
          },
        },
        {
          id: 'prod-barcode',
          type: 'barcode',
          x: 5,
          y: 26,
          width: 50,
          height: 12,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          locked: false,
          visible: true,
          name: 'Código de Barras',
          barcodeConfig: {
            source: 'field',
            dataPath: 'variant.barcode',
            format: 'EAN13',
            showText: true,
            barColor: '#000000',
            backgroundColor: '#ffffff',
          },
        },
      ] as LabelElement[],
    },
  },
  {
    id: 'item-tracking',
    name: 'Rastreamento de Item',
    description: 'Etiqueta com QR Code e informações do item',
    width: 50,
    height: 30,
    category: 'item',
    template: {
      version: 2,
      width: 50,
      height: 30,
      canvas: { backgroundColor: '#ffffff', showMargins: false },
      category: 'inventario',
      elements: [
        {
          id: 'item-qr',
          type: 'qrcode',
          x: 2,
          y: 2,
          width: 15,
          height: 15,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          locked: false,
          visible: true,
          name: 'QR Code',
          qrConfig: {
            contentType: 'field',
            dataPath: 'item.uid',
            errorCorrectionLevel: 'M',
            moduleColor: '#000000',
            backgroundColor: '#ffffff',
          },
        },
        {
          id: 'item-uid',
          type: 'field',
          x: 19,
          y: 2,
          width: 29,
          height: 6,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          locked: false,
          visible: true,
          name: 'UID',
          fieldConfig: { type: 'simple', dataPath: 'item.uid' },
          valueStyle: {
            ...DEFAULT_TEXT_STYLE,
            fontSize: 3,
            fontWeight: 'bold',
          },
        },
        {
          id: 'item-product',
          type: 'field',
          x: 19,
          y: 9,
          width: 29,
          height: 5,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          locked: false,
          visible: true,
          name: 'Produto',
          fieldConfig: { type: 'simple', dataPath: 'product.name' },
          valueStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 2.5 },
        },
        {
          id: 'item-location',
          type: 'field',
          x: 2,
          y: 20,
          width: 25,
          height: 8,
          rotation: 0,
          opacity: 1,
          zIndex: 4,
          locked: false,
          visible: true,
          name: 'Localização',
          fieldConfig: { type: 'simple', dataPath: 'item.lastKnownAddress' },
          label: {
            enabled: true,
            text: 'Local',
            position: 'above',
            style: { fontSize: 2, color: '#666666' },
          },
          valueStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 3 },
        },
        {
          id: 'item-date',
          type: 'field',
          x: 30,
          y: 20,
          width: 18,
          height: 8,
          rotation: 0,
          opacity: 1,
          zIndex: 5,
          locked: false,
          visible: true,
          name: 'Data',
          fieldConfig: { type: 'simple', dataPath: 'meta.printDate' },
          label: {
            enabled: true,
            text: 'Impresso',
            position: 'above',
            style: { fontSize: 2, color: '#666666' },
          },
          valueStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 2.5 },
        },
      ] as LabelElement[],
    },
  },
  {
    id: 'blank-60x40',
    name: 'Em Branco 60x40mm',
    description: 'Template em branco 60x40mm',
    width: 60,
    height: 40,
    category: 'blank',
    template: createEmptyTemplate(60, 40),
  },
  {
    id: 'blank-100x50',
    name: 'Em Branco 100x50mm',
    description: 'Template em branco 100x50mm',
    width: 100,
    height: 50,
    category: 'blank',
    template: createEmptyTemplate(100, 50),
  },
  {
    id: 'blank-40x25',
    name: 'Em Branco 40x25mm',
    description: 'Template em branco 40x25mm',
    width: 40,
    height: 25,
    category: 'blank',
    template: createEmptyTemplate(40, 25),
  },
];

/**
 * Exporta template para download
 */
export function exportTemplateAsFile(
  template: LabelStudioTemplate,
  filename: string
): void {
  const json = serializeTemplate(template);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Importa template de arquivo
 */
export function importTemplateFromFile(): Promise<{
  valid: boolean;
  errors: string[];
  template?: LabelStudioTemplate;
  filename?: string;
}> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve({ valid: false, errors: ['Nenhum arquivo selecionado'] });
        return;
      }

      try {
        const text = await file.text();
        const result = deserializeTemplate(text);
        resolve({ ...result, filename: file.name.replace('.json', '') });
      } catch {
        resolve({ valid: false, errors: ['Erro ao ler arquivo'] });
      }
    };
    input.click();
  });
}
