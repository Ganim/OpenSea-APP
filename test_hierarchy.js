
// Teste da nova sintaxe hierárquica
const HIERARCHY_PATTERN = /^(.+?)\\*\\((.+?)\\)$/;
const BRACE_PATTERN = /^(.*?)\\{([^}]+)\\}(.*?)$/;

const formatNumberWithPadding = (num, maxNum) => {
  const maxDigits = maxNum.toString().length;
  return num.toString().padStart(maxDigits, '0');
};

function expandPattern(pattern) {
  // Verificar primeiro padrões de hierarquia: basePattern*(subPattern)
  const hierarchyMatch = pattern.match(HIERARCHY_PATTERN);

  if (hierarchyMatch) {
    const [, basePattern, subPattern] = hierarchyMatch;
    
    // Expandir o padrão base para obter todos os pais
    const baseExpanded = expandPattern(basePattern);
    if (Array.isArray(baseExpanded)) {
      return { 
        parents: baseExpanded, 
        childrenPattern: subPattern 
      };
    }
  }

  // Verificar padrões com chaves: prefix{num}suffix
  const braceMatch = pattern.match(BRACE_PATTERN);
  if (braceMatch) {
    const [, prefix, numRange, suffix] = braceMatch;
    const numCount = parseInt(numRange);
    const results = [];

    for (let i = 1; i <= numCount; i++) {
      const paddedNum = formatNumberWithPadding(i, numCount);
      results.push(prefix + paddedNum + suffix);
    }
    return results;
  }

  return [pattern];
}

function parseLocationStringAdvanced(input) {
  const hierarchyPatterns = [];
  const parts = input.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed) {
      const expanded = expandPattern(trimmed);
      
      if (typeof expanded === 'object' && 'parents' in expanded) {
        hierarchyPatterns.push(expanded);
      }
    }
  }

  const result = [];
  
  for (const hierarchy of hierarchyPatterns) {
    for (const parentName of hierarchy.parents) {
      const children = [];
      
      if (hierarchy.childrenPattern.startsWith('+-[') && hierarchy.childrenPattern.endsWith(']')) {
        const letterCount = parseInt(hierarchy.childrenPattern.match(/\\[(\\d+)\\]/)?.[1] || '1');
        for (let i = 0; i < letterCount; i++) {
          const letter = String.fromCharCode(65 + i);
          children.push({
            name: parentName + '-' + letter,
            children: []
          });
        }
      }
      
      result.push({
        name: parentName,
        children
      });
    }
  }

  return result;
}

console.log('Teste 20{2}*(+-[2]):');
const result = parseLocationStringAdvanced('20{2}*(+-[2])');
console.log(JSON.stringify(result, null, 2));

