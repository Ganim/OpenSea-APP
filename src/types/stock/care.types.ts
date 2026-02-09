// Care Instructions Types (Etiquetas de Conservacao - NBR 16365:2015 / ISO 3758)

export type WashingInstruction =
  | 'HAND_WASH' // Lavar a mao
  | 'MACHINE_30' // Maquina 30C
  | 'MACHINE_40' // Maquina 40C
  | 'MACHINE_60' // Maquina 60C
  | 'DO_NOT_WASH'; // Nao lavar

export type BleachingInstruction =
  | 'ANY_BLEACH' // Pode usar qualquer alvejante
  | 'NON_CHLORINE' // Apenas alvejante sem cloro
  | 'DO_NOT_BLEACH'; // Nao alvejar

export type DryingInstruction =
  | 'TUMBLE_DRY_LOW' // Secadora temperatura baixa
  | 'TUMBLE_DRY_MEDIUM' // Secadora temperatura media
  | 'LINE_DRY' // Secar a sombra
  | 'DRIP_DRY' // Secar pingando
  | 'DO_NOT_TUMBLE_DRY'; // Nao usar secadora

export type IroningInstruction =
  | 'IRON_LOW' // Passar com ferro baixo (110C)
  | 'IRON_MEDIUM' // Passar com ferro medio (150C)
  | 'IRON_HIGH' // Passar com ferro alto (200C)
  | 'DO_NOT_IRON'; // Nao passar

export type ProfessionalCleaningInstruction =
  | 'DRY_CLEAN_ANY' // Limpeza a seco - qualquer solvente
  | 'DRY_CLEAN_PETROLEUM' // Limpeza a seco - so petroleo
  | 'WET_CLEAN' // Limpeza umida profissional
  | 'DO_NOT_DRY_CLEAN'; // Nao fazer limpeza a seco

export interface FiberComposition {
  fiber: string; // Ex: "Algodao", "Poliester", "Elastano"
  percentage: number; // Ex: 95, 5
}

export interface CustomSymbol {
  code: string;
  description: string;
  svgPath?: string; // SVG personalizado
}

export interface CareInstructions {
  // Composicao textil (obrigatorio por lei)
  composition: FiberComposition[];

  // Instrucoes de lavagem
  washing?: WashingInstruction;

  // Instrucoes de alvejamento
  bleaching?: BleachingInstruction;

  // Instrucoes de secagem
  drying?: DryingInstruction;

  // Instrucoes de passagem
  ironing?: IroningInstruction;

  // Limpeza profissional
  professionalCleaning?: ProfessionalCleaningInstruction;

  // Avisos especiais
  warnings?: string[];

  // Simbolos personalizados (para casos especiais)
  customSymbols?: CustomSymbol[];
}

export type CareCategory = 'WASH' | 'BLEACH' | 'DRY' | 'IRON' | 'PROFESSIONAL';

export interface CareOption {
  id: string;
  code: string;
  category: CareCategory;
  assetPath: string;
  label: string;
}

export interface CareOptionsResponse {
  options: {
    WASH: CareOption[];
    BLEACH: CareOption[];
    DRY: CareOption[];
    IRON: CareOption[];
    PROFESSIONAL: CareOption[];
  };
}

export interface SetProductCareRequest {
  careInstructionIds: string[];
}

export interface SetProductCareResponse {
  careInstructionIds: string[];
  careInstructions: CareOption[];
}

export interface CategoryMeta {
  key: CareCategory;
  label: string;
  icon: string;
  description: string;
}
