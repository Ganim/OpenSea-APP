/**
 * Helper puro para processar padrões de localização avançados.
 * Fornece funções para: expandir padrões, parsear string avançada para nodes,
 * gerar string avançada a partir de configs básicos e parsear string avançada
 * para configs básicos (aisle configs).
 */

export type LocationType =
  | 'WAREHOUSE'
  | 'ZONE'
  | 'AISLE'
  | 'SHELF'
  | 'BIN'
  | 'OTHER';

export interface AisleConfig {
  name: string;
  columns: number;
  rows: number;
}

export interface LocationNode {
  name: string;
  children: LocationNode[];
}

const COMPLEX_PATTERN_REGEX = /^(.+?)\{([^}]+)\}(.+?)\[([^\]]+)\]$/;
const SIMPLE_BRACKET_PATTERN = /^(.+?)\[([^\]]+)\]$/;
const START_BRACKET_PATTERN = /^\[([^\]]+)\]$/;
const BRACE_PATTERN = /^(.*?)\{([^}]+)\}(.*?)$/;
const COMPLEX_ADVANCED_PATTERN = /^(.+?)\{([^}]+)\}-\[([^\]]+)\]$/;
const COLUMNS_ONLY_PATTERN = /^(.+?)\{([^}]+)\}$/;
const ROWS_ONLY_PATTERN = /^(.+?)\[([^\]]+)\]$/;
const SIMPLE_PATTERN = /^(.+?)$/;
const HIERARCHY_PATTERN = /^(.+?)\*\((.+?)\)$/;

const formatNumberWithPadding = (num: number, maxNum: number): string => {
  const maxDigits = maxNum.toString().length;
  return num.toString().padStart(maxDigits, '0');
};

/** Expande um único padrão (sem vírgula) em uma lista de strings ou objeto de hierarquia */
export function expandPattern(
  pattern: string
): string[] | { parents: string[]; childrenPattern: string } {
  const hierarchyMatch = pattern.match(HIERARCHY_PATTERN);

  if (hierarchyMatch) {
    const [, basePattern, subPattern] = hierarchyMatch;
    const baseExpanded = expandPattern(basePattern);
    if (Array.isArray(baseExpanded)) {
      return {
        parents: baseExpanded,
        childrenPattern: subPattern,
      };
    }
  }

  const results: string[] = [];
  const complexMatch = pattern.match(COMPLEX_PATTERN_REGEX);

  if (complexMatch) {
    const [, prefix, numRange, middle, letterRange] = complexMatch;
    const numCount = parseInt(numRange) || 1;
    const letterCount = parseInt(letterRange) || 1;

    for (let i = 1; i <= numCount; i++) {
      const paddedNum = formatNumberWithPadding(i, numCount);
      for (let j = 0; j < letterCount; j++) {
        const letter = String.fromCharCode(65 + j);
        results.push(`${prefix}${paddedNum}${middle}${letter}`);
      }
    }
    return results;
  }

  const simpleMatch = pattern.match(SIMPLE_BRACKET_PATTERN);
  if (simpleMatch) {
    const [, prefix, letterRange] = simpleMatch;
    const letterCount = parseInt(letterRange) || 1;
    for (let j = 0; j < letterCount; j++) {
      const letter = String.fromCharCode(65 + j);
      results.push(`${prefix}${letter}`);
    }
    return results;
  }

  const startMatch = pattern.match(START_BRACKET_PATTERN);
  if (startMatch) {
    const [, letterRange] = startMatch;
    const letterCount = parseInt(letterRange) || 1;
    for (let j = 0; j < letterCount; j++) {
      const letter = String.fromCharCode(65 + j);
      results.push(letter);
    }
    return results;
  }

  const braceMatch = pattern.match(BRACE_PATTERN);
  if (braceMatch) {
    const [, prefix, numRange, suffix] = braceMatch;
    const numCount = parseInt(numRange) || 1;
    for (let i = 1; i <= numCount; i++) {
      const paddedNum = formatNumberWithPadding(i, numCount);
      results.push(`${prefix}${paddedNum}${suffix}`);
    }
    return results;
  }

  // Caso sem padroes especiais
  results.push(pattern);
  return results;
}

/** Parseia uma string avançada e retorna um array de LocationNode (com hierarquia) */
export function parseLocationStringAdvanced(input: string): LocationNode[] {
  const expandedPatterns: string[] = [];
  const hierarchyPatterns: Array<{
    parents: string[];
    childrenPattern: string;
  }> = [];

  const parts = input.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const expanded = expandPattern(trimmed);
    if (typeof expanded === 'object' && 'parents' in expanded) {
      hierarchyPatterns.push(expanded);
    } else if (Array.isArray(expanded)) {
      expandedPatterns.push(...expanded);
    }
  }

  const result: LocationNode[] = [];
  for (const hierarchy of hierarchyPatterns) {
    for (const parentName of hierarchy.parents) {
      const children: LocationNode[] = [];
      const childrenPattern = hierarchy.childrenPattern;
      if (childrenPattern.startsWith('+-[') && childrenPattern.endsWith(']')) {
        const letterCount = parseInt(
          childrenPattern.match(/\[(\d+)\]/)?.[1] || '1'
        );
        for (let i = 0; i < letterCount; i++) {
          const letter = String.fromCharCode(65 + i);
          children.push({ name: `${parentName}-${letter}`, children: [] });
        }
      } else if (
        childrenPattern.startsWith('+[') &&
        childrenPattern.endsWith(']')
      ) {
        const letterCount = parseInt(
          childrenPattern.match(/\[(\d+)\]/)?.[1] || '1'
        );
        for (let i = 0; i < letterCount; i++) {
          const letter = String.fromCharCode(65 + i);
          children.push({ name: `${parentName}${letter}`, children: [] });
        }
      }
      result.push({ name: parentName, children });
    }
  }

  for (const pattern of expandedPatterns) {
    result.push({ name: pattern, children: [] });
  }

  // Se não houver padrões hierárquicos, tentar parsear por parênteses em uma única string expandida
  if (hierarchyPatterns.length === 0 && expandedPatterns.length > 0) {
    const finalResult: LocationNode[] = [];
    let current = '';
    let depth = 0;
    const stack: LocationNode[][] = [finalResult];
    const fullInput = expandedPatterns.join(', ');
    for (let i = 0; i < fullInput.length; i++) {
      const char = fullInput[i];
      if (char === '(') {
        if (current.trim()) {
          const node: LocationNode = { name: current.trim(), children: [] };
          stack[depth].push(node);
          stack.push(node.children);
          depth++;
          current = '';
        }
      } else if (char === ')') {
        if (current.trim()) {
          const node: LocationNode = { name: current.trim(), children: [] };
          stack[depth].push(node);
        }
        stack.pop();
        depth--;
        current = '';
      } else if (char === ',') {
        if (current.trim()) {
          const node: LocationNode = { name: current.trim(), children: [] };
          stack[depth].push(node);
        }
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      const node: LocationNode = { name: current.trim(), children: [] };
      stack[depth].push(node);
    }
    return finalResult;
  }

  return result;
}

/** Gera string avançada a partir de configs básicos (útil para AISLE) */
export function generateAdvancedTextFromBasic(
  configs: AisleConfig[],
  basicName?: string
): string {
  const validConfigs = configs.filter(c => c.name?.trim());
  try {
    console.log('[E2E-LOG] helper generateAdvancedTextFromBasic', {
      configs,
      basicName,
      validCount: validConfigs.length,
    });
  } catch (_) {}
  if (validConfigs.length === 0) {
    try {
      console.log(
        '[E2E-LOG] helper generateAdvancedTextFromBasic returning empty (no valid configs)'
      );
    } catch (_) {}
    return '';
  }

  const patterns: string[] = [];
  for (const config of validConfigs) {
    if (config.columns === 1 && config.rows === 1) patterns.push(config.name);
    else if (config.columns > 1 && config.rows === 1)
      patterns.push(`${config.name}{${config.columns}}`);
    else if (config.columns === 1 && config.rows > 1)
      patterns.push(`${config.name}[${config.rows}]`);
    else patterns.push(`${config.name}{${config.columns}}-[${config.rows}]`);
  }
  return patterns.join(', ');
}

/** Parseia string avançada e retorna configs básicos para AISLE (se possível) */
export function parseAdvancedTextToAisleConfigs(text: string): AisleConfig[] {
  const parts = text
    .split(',')
    .map(p => p.trim())
    .filter(p => p);
  const configs: AisleConfig[] = [];
  for (const part of parts) {
    let name = '';
    let columns = 1;
    let rows = 1;

    if (COMPLEX_ADVANCED_PATTERN.test(part)) {
      const match = part.match(COMPLEX_ADVANCED_PATTERN);
      if (match) {
        name = match[1];
        columns = parseInt(match[2]) || 1;
        rows = parseInt(match[3]) || 1;
      }
    } else if (COLUMNS_ONLY_PATTERN.test(part)) {
      const match = part.match(COLUMNS_ONLY_PATTERN);
      if (match) {
        name = match[1];
        columns = parseInt(match[2]) || 1;
      }
    } else if (ROWS_ONLY_PATTERN.test(part)) {
      const match = part.match(ROWS_ONLY_PATTERN);
      if (match) {
        name = match[1];
        rows = parseInt(match[2]) || 1;
      }
    } else if (SIMPLE_PATTERN.test(part)) {
      name = part;
    }

    if (name.trim()) configs.push({ name: name.trim(), columns, rows });
  }
  return configs;
}

/** Lê os inputs de DOM para recuperar configs de corredores. */
export function readAisleConfigsFromDOM(maxItems = 20): AisleConfig[] {
  const domConfigs: AisleConfig[] = [];
  for (let i = 0; i < maxItems; i++) {
    const nameEl = document.getElementById(
      `aisle-name-${i}`
    ) as HTMLInputElement | null;
    if (!nameEl) break;
    const columnsEl = document.getElementById(
      `aisle-columns-${i}`
    ) as HTMLInputElement | null;
    const rowsEl = document.getElementById(
      `aisle-rows-${i}`
    ) as HTMLInputElement | null;
    const nameVal = nameEl?.value ?? '';
    const columnsVal = parseInt(columnsEl?.value ?? '') || 1;
    const rowsVal = parseInt(rowsEl?.value ?? '') || 1;
    domConfigs.push({ name: nameVal, columns: columnsVal, rows: rowsVal });
  }
  return domConfigs;
}

/** Export for tests and reuse */
export default {
  expandPattern,
  parseLocationStringAdvanced,
  generateAdvancedTextFromBasic,
  parseAdvancedTextToAisleConfigs,
};
