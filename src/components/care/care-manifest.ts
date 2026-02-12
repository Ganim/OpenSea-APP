/**
 * Care Icons Manifest (ISO 3758)
 * Static typed manifest of all textile care symbols.
 * Avoids runtime fetch of manifest.json.
 */

export interface CareIconEntry {
  code: string;
  category: string;
  label: string;
  assetPath: string;
}

const CARE_CATEGORY_LABELS: Record<string, string> = {
  WASH: 'Lavagem',
  BLEACH: 'Alvejamento',
  DRY: 'Secagem',
  IRON: 'Passadoria',
  PROFESSIONAL: 'Profissional',
};

const CARE_CODE_LABELS: Record<string, string> = {
  // WASH
  WASH_NORMAL: 'Lavagem normal',
  WASH_30: 'Lavagem 30°C',
  WASH_40: 'Lavagem 40°C',
  WASH_50: 'Lavagem 50°C',
  WASH_60: 'Lavagem 60°C',
  WASH_70: 'Lavagem 70°C',
  WASH_95: 'Lavagem 95°C',
  WASH_GENTLE: 'Lavagem delicada',
  WASH_VERY_GENTLE: 'Lavagem muito delicada',
  WASH_HAND: 'Lavagem à mão',
  DO_NOT_WASH: 'Não lavar',
  // BLEACH
  BLEACH_ALLOWED: 'Alvejamento permitido',
  BLEACH_NON_CHLORINE: 'Alvejante sem cloro',
  DO_NOT_BLEACH: 'Não alvejar',
  // DRY
  TUMBLE_DRY_NORMAL: 'Secadora normal',
  TUMBLE_DRY_LOW: 'Secadora baixa',
  TUMBLE_DRY_MEDIUM: 'Secadora média',
  TUMBLE_DRY_HIGH: 'Secadora alta',
  DO_NOT_TUMBLE_DRY: 'Não usar secadora',
  DRY_LINE: 'Secar no varal',
  DRY_LINE_SHADE: 'Secar no varal à sombra',
  DRY_FLAT: 'Secar na horizontal',
  DRY_FLAT_SHADE: 'Secar na horizontal à sombra',
  DRY_DRIP: 'Secar por gotejamento',
  DRY_DRIP_SHADE: 'Secar por gotejamento à sombra',
  // IRON
  IRON_ALLOWED: 'Passar a ferro',
  IRON_110: 'Ferro até 110°C',
  IRON_150: 'Ferro até 150°C',
  IRON_200: 'Ferro até 200°C',
  IRON_NO_STEAM: 'Ferro sem vapor',
  DO_NOT_IRON: 'Não passar a ferro',
  // PROFESSIONAL
  DRYCLEAN_ANY: 'Lavagem a seco (qualquer)',
  DRYCLEAN_P: 'Lavagem a seco (P)',
  DRYCLEAN_P_GENTLE: 'Lavagem a seco (P) delicada',
  DRYCLEAN_P_VERY_GENTLE: 'Lavagem a seco (P) muito delicada',
  DRYCLEAN_F: 'Lavagem a seco (F)',
  DRYCLEAN_F_GENTLE: 'Lavagem a seco (F) delicada',
  DRYCLEAN_F_VERY_GENTLE: 'Lavagem a seco (F) muito delicada',
  DO_NOT_DRYCLEAN: 'Não lavar a seco',
  WETCLEAN_W: 'Wet cleaning (W)',
  WETCLEAN_W_GENTLE: 'Wet cleaning (W) delicado',
  WETCLEAN_W_VERY_GENTLE: 'Wet cleaning (W) muito delicado',
  DO_NOT_WETCLEAN: 'Não wet clean',
};

/**
 * All 43 care icons as a typed array
 */
export const CARE_ICONS: CareIconEntry[] = [
  // WASH
  {
    code: 'WASH_NORMAL',
    category: 'WASH',
    label: CARE_CODE_LABELS.WASH_NORMAL,
    assetPath: 'iso3758/WASH_NORMAL.svg',
  },
  {
    code: 'WASH_30',
    category: 'WASH',
    label: CARE_CODE_LABELS.WASH_30,
    assetPath: 'iso3758/WASH_30.svg',
  },
  {
    code: 'WASH_40',
    category: 'WASH',
    label: CARE_CODE_LABELS.WASH_40,
    assetPath: 'iso3758/WASH_40.svg',
  },
  {
    code: 'WASH_50',
    category: 'WASH',
    label: CARE_CODE_LABELS.WASH_50,
    assetPath: 'iso3758/WASH_50.svg',
  },
  {
    code: 'WASH_60',
    category: 'WASH',
    label: CARE_CODE_LABELS.WASH_60,
    assetPath: 'iso3758/WASH_60.svg',
  },
  {
    code: 'WASH_70',
    category: 'WASH',
    label: CARE_CODE_LABELS.WASH_70,
    assetPath: 'iso3758/WASH_70.svg',
  },
  {
    code: 'WASH_95',
    category: 'WASH',
    label: CARE_CODE_LABELS.WASH_95,
    assetPath: 'iso3758/WASH_95.svg',
  },
  {
    code: 'WASH_GENTLE',
    category: 'WASH',
    label: CARE_CODE_LABELS.WASH_GENTLE,
    assetPath: 'iso3758/WASH_GENTLE.svg',
  },
  {
    code: 'WASH_VERY_GENTLE',
    category: 'WASH',
    label: CARE_CODE_LABELS.WASH_VERY_GENTLE,
    assetPath: 'iso3758/WASH_VERY_GENTLE.svg',
  },
  {
    code: 'WASH_HAND',
    category: 'WASH',
    label: CARE_CODE_LABELS.WASH_HAND,
    assetPath: 'iso3758/WASH_HAND.svg',
  },
  {
    code: 'DO_NOT_WASH',
    category: 'WASH',
    label: CARE_CODE_LABELS.DO_NOT_WASH,
    assetPath: 'iso3758/DO_NOT_WASH.svg',
  },
  // BLEACH
  {
    code: 'BLEACH_ALLOWED',
    category: 'BLEACH',
    label: CARE_CODE_LABELS.BLEACH_ALLOWED,
    assetPath: 'iso3758/BLEACH_ALLOWED.svg',
  },
  {
    code: 'BLEACH_NON_CHLORINE',
    category: 'BLEACH',
    label: CARE_CODE_LABELS.BLEACH_NON_CHLORINE,
    assetPath: 'iso3758/BLEACH_NON_CHLORINE.svg',
  },
  {
    code: 'DO_NOT_BLEACH',
    category: 'BLEACH',
    label: CARE_CODE_LABELS.DO_NOT_BLEACH,
    assetPath: 'iso3758/DO_NOT_BLEACH.svg',
  },
  // DRY
  {
    code: 'TUMBLE_DRY_NORMAL',
    category: 'DRY',
    label: CARE_CODE_LABELS.TUMBLE_DRY_NORMAL,
    assetPath: 'iso3758/TUMBLE_DRY_NORMAL.svg',
  },
  {
    code: 'TUMBLE_DRY_LOW',
    category: 'DRY',
    label: CARE_CODE_LABELS.TUMBLE_DRY_LOW,
    assetPath: 'iso3758/TUMBLE_DRY_LOW.svg',
  },
  {
    code: 'TUMBLE_DRY_MEDIUM',
    category: 'DRY',
    label: CARE_CODE_LABELS.TUMBLE_DRY_MEDIUM,
    assetPath: 'iso3758/TUMBLE_DRY_MEDIUM.svg',
  },
  {
    code: 'TUMBLE_DRY_HIGH',
    category: 'DRY',
    label: CARE_CODE_LABELS.TUMBLE_DRY_HIGH,
    assetPath: 'iso3758/TUMBLE_DRY_HIGH.svg',
  },
  {
    code: 'DO_NOT_TUMBLE_DRY',
    category: 'DRY',
    label: CARE_CODE_LABELS.DO_NOT_TUMBLE_DRY,
    assetPath: 'iso3758/DO_NOT_TUMBLE_DRY.svg',
  },
  {
    code: 'DRY_LINE',
    category: 'DRY',
    label: CARE_CODE_LABELS.DRY_LINE,
    assetPath: 'iso3758/DRY_LINE.svg',
  },
  {
    code: 'DRY_LINE_SHADE',
    category: 'DRY',
    label: CARE_CODE_LABELS.DRY_LINE_SHADE,
    assetPath: 'iso3758/DRY_LINE_SHADE.svg',
  },
  {
    code: 'DRY_FLAT',
    category: 'DRY',
    label: CARE_CODE_LABELS.DRY_FLAT,
    assetPath: 'iso3758/DRY_FLAT.svg',
  },
  {
    code: 'DRY_FLAT_SHADE',
    category: 'DRY',
    label: CARE_CODE_LABELS.DRY_FLAT_SHADE,
    assetPath: 'iso3758/DRY_FLAT_SHADE.svg',
  },
  {
    code: 'DRY_DRIP',
    category: 'DRY',
    label: CARE_CODE_LABELS.DRY_DRIP,
    assetPath: 'iso3758/DRY_DRIP.svg',
  },
  {
    code: 'DRY_DRIP_SHADE',
    category: 'DRY',
    label: CARE_CODE_LABELS.DRY_DRIP_SHADE,
    assetPath: 'iso3758/DRY_DRIP_SHADE.svg',
  },
  // IRON
  {
    code: 'IRON_ALLOWED',
    category: 'IRON',
    label: CARE_CODE_LABELS.IRON_ALLOWED,
    assetPath: 'iso3758/IRON_ALLOWED.svg',
  },
  {
    code: 'IRON_110',
    category: 'IRON',
    label: CARE_CODE_LABELS.IRON_110,
    assetPath: 'iso3758/IRON_110.svg',
  },
  {
    code: 'IRON_150',
    category: 'IRON',
    label: CARE_CODE_LABELS.IRON_150,
    assetPath: 'iso3758/IRON_150.svg',
  },
  {
    code: 'IRON_200',
    category: 'IRON',
    label: CARE_CODE_LABELS.IRON_200,
    assetPath: 'iso3758/IRON_200.svg',
  },
  {
    code: 'IRON_NO_STEAM',
    category: 'IRON',
    label: CARE_CODE_LABELS.IRON_NO_STEAM,
    assetPath: 'iso3758/IRON_NO_STEAM.svg',
  },
  {
    code: 'DO_NOT_IRON',
    category: 'IRON',
    label: CARE_CODE_LABELS.DO_NOT_IRON,
    assetPath: 'iso3758/DO_NOT_IRON.svg',
  },
  // PROFESSIONAL
  {
    code: 'DRYCLEAN_ANY',
    category: 'PROFESSIONAL',
    label: CARE_CODE_LABELS.DRYCLEAN_ANY,
    assetPath: 'iso3758/DRYCLEAN_ANY.svg',
  },
  {
    code: 'DRYCLEAN_P',
    category: 'PROFESSIONAL',
    label: CARE_CODE_LABELS.DRYCLEAN_P,
    assetPath: 'iso3758/DRYCLEAN_P.svg',
  },
  {
    code: 'DRYCLEAN_P_GENTLE',
    category: 'PROFESSIONAL',
    label: CARE_CODE_LABELS.DRYCLEAN_P_GENTLE,
    assetPath: 'iso3758/DRYCLEAN_P_GENTLE.svg',
  },
  {
    code: 'DRYCLEAN_P_VERY_GENTLE',
    category: 'PROFESSIONAL',
    label: CARE_CODE_LABELS.DRYCLEAN_P_VERY_GENTLE,
    assetPath: 'iso3758/DRYCLEAN_P_VERY_GENTLE.svg',
  },
  {
    code: 'DRYCLEAN_F',
    category: 'PROFESSIONAL',
    label: CARE_CODE_LABELS.DRYCLEAN_F,
    assetPath: 'iso3758/DRYCLEAN_F.svg',
  },
  {
    code: 'DRYCLEAN_F_GENTLE',
    category: 'PROFESSIONAL',
    label: CARE_CODE_LABELS.DRYCLEAN_F_GENTLE,
    assetPath: 'iso3758/DRYCLEAN_F_GENTLE.svg',
  },
  {
    code: 'DRYCLEAN_F_VERY_GENTLE',
    category: 'PROFESSIONAL',
    label: CARE_CODE_LABELS.DRYCLEAN_F_VERY_GENTLE,
    assetPath: 'iso3758/DRYCLEAN_F_VERY_GENTLE.svg',
  },
  {
    code: 'DO_NOT_DRYCLEAN',
    category: 'PROFESSIONAL',
    label: CARE_CODE_LABELS.DO_NOT_DRYCLEAN,
    assetPath: 'iso3758/DO_NOT_DRYCLEAN.svg',
  },
  {
    code: 'WETCLEAN_W',
    category: 'PROFESSIONAL',
    label: CARE_CODE_LABELS.WETCLEAN_W,
    assetPath: 'iso3758/WETCLEAN_W.svg',
  },
  {
    code: 'WETCLEAN_W_GENTLE',
    category: 'PROFESSIONAL',
    label: CARE_CODE_LABELS.WETCLEAN_W_GENTLE,
    assetPath: 'iso3758/WETCLEAN_W_GENTLE.svg',
  },
  {
    code: 'WETCLEAN_W_VERY_GENTLE',
    category: 'PROFESSIONAL',
    label: CARE_CODE_LABELS.WETCLEAN_W_VERY_GENTLE,
    assetPath: 'iso3758/WETCLEAN_W_VERY_GENTLE.svg',
  },
  {
    code: 'DO_NOT_WETCLEAN',
    category: 'PROFESSIONAL',
    label: CARE_CODE_LABELS.DO_NOT_WETCLEAN,
    assetPath: 'iso3758/DO_NOT_WETCLEAN.svg',
  },
];

/**
 * Care icons grouped by category
 */
export const CARE_ICONS_BY_CATEGORY: Record<string, CareIconEntry[]> =
  CARE_ICONS.reduce(
    (acc, icon) => {
      if (!acc[icon.category]) acc[icon.category] = [];
      acc[icon.category].push(icon);
      return acc;
    },
    {} as Record<string, CareIconEntry[]>
  );

/**
 * Category display order and labels
 */
export const CARE_CATEGORY_ORDER = [
  'WASH',
  'BLEACH',
  'DRY',
  'IRON',
  'PROFESSIONAL',
] as const;

export function getCategoryLabel(category: string): string {
  return CARE_CATEGORY_LABELS[category] || category;
}

/**
 * Find a care icon by code
 */
export function findCareIcon(code: string): CareIconEntry | undefined {
  return CARE_ICONS.find(i => i.code === code);
}
