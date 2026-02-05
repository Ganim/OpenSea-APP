/**
 * Label Template Editor - Types
 * Tipos para o editor de templates de etiquetas
 */

import type { Editor } from 'grapesjs';

/**
 * Campo disponível para arrastar no editor
 */
export interface LabelFieldDefinition {
  /** ID único do campo */
  id: string;
  /** Nome exibido no painel */
  label: string;
  /** Categoria do campo */
  category:
    | 'product'
    | 'variant'
    | 'item'
    | 'location'
    | 'codes'
    | 'custom'
    | 'attributes';
  /** Caminho para resolver o valor (ex: "product.name") */
  dataPath: string;
  /** Tipo do campo */
  type: 'text' | 'number' | 'date' | 'barcode' | 'qrcode' | 'image';
  /** Valor de exemplo para preview */
  sampleValue: string;
  /** Ícone lucide-react */
  icon?: string;
  /** Se o campo é obrigatório */
  required?: boolean;
}

/**
 * Categoria de campos
 */
export interface FieldCategory {
  id: string;
  label: string;
  icon: string;
  fields: LabelFieldDefinition[];
}

/**
 * Template de etiqueta salvo
 */
export interface LabelTemplate {
  id: string;
  name: string;
  description?: string;
  /** Se é um template do sistema (não editável) */
  isSystem: boolean;
  /** Largura em mm */
  width: number;
  /** Altura em mm */
  height: number;
  /** Dados do projeto GrapesJS (JSON stringified) */
  grapesJsData: string;
  /** HTML compilado para impressão */
  compiledHtml?: string;
  /** CSS compilado para impressão */
  compiledCss?: string;
  /** URL da thumbnail */
  thumbnailUrl?: string;
  /** ID do usuário que criou */
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/**
 * Input para criar template
 */
export interface CreateLabelTemplateInput {
  name: string;
  description?: string;
  width: number;
  height: number;
  grapesJsData: string;
  compiledHtml?: string;
  compiledCss?: string;
}

/**
 * Input para atualizar template
 */
export interface UpdateLabelTemplateInput {
  name?: string;
  description?: string;
  width?: number;
  height?: number;
  grapesJsData?: string;
  compiledHtml?: string;
  compiledCss?: string;
}

/**
 * Props do componente LabelEditor
 */
export interface LabelEditorProps {
  /** Template sendo editado (null para novo) */
  template?: LabelTemplate | null;
  /** Largura inicial em mm */
  initialWidth?: number;
  /** Altura inicial em mm */
  initialHeight?: number;
  /** Callback ao salvar */
  onSave?: (data: LabelEditorSaveData) => void;
  /** Callback ao cancelar */
  onCancel?: () => void;
  /** Modo somente leitura */
  readOnly?: boolean;
}

/**
 * Dados retornados ao salvar
 */
export interface LabelEditorSaveData {
  name: string;
  description?: string;
  width: number;
  height: number;
  grapesJsData: string;
  compiledHtml: string;
  compiledCss: string;
}

/**
 * Configuração do GrapesJS
 */
export interface GrapesJsConfig {
  container: string | HTMLElement;
  width: string;
  height: string;
  storageManager: boolean;
  plugins: ((editor: Editor) => void)[];
  pluginsOpts: Record<string, unknown>;
}

/**
 * Block do GrapesJS
 */
export interface GrapesJsBlock {
  id: string;
  label: string;
  category: string;
  content:
    | string
    | { type: string; content?: string; attributes?: Record<string, string> };
  attributes?: Record<string, string>;
  media?: string;
}

/**
 * Resposta da API de templates
 */
export interface LabelTemplatesResponse {
  templates: LabelTemplate[];
  total: number;
}

/**
 * Resposta da API de template único
 */
export interface LabelTemplateResponse {
  template: LabelTemplate;
}
