
// Teste simples da regex
const HIERARCHY_PATTERN = /^(.+?)\*\((.+?)\)$/;
const BRACE_PATTERN = /^(.*?)\{([^}]+)\}(.*?)$/;

const formatNumberWithPadding = (num, maxNum) => {
  const maxDigits = maxNum.toString().length;
  return num.toString().padStart(maxDigits, '0');
};

function expandPattern(pattern) {
  console.log('Processando padrão:', pattern);
  
  // Verificar primeiro padrões de hierarquia: basePattern*(subPattern)
  const hierarchyMatch = pattern.match(HIERARCHY_PATTERN);
  console.log('Hierarchy match:', hierarchyMatch);

  if (hierarchyMatch) {
    const [, basePattern, subPattern] = hierarchyMatch;
    console.log('Base pattern:', basePattern, 'Sub pattern:', subPattern);
    
    // Expandir o padrão base para obter todos os pais
    const baseExpanded = expandPattern(basePattern);
    console.log('Base expanded:', baseExpanded);
    
    if (Array.isArray(baseExpanded)) {
      return { 
        parents: baseExpanded, 
        childrenPattern: subPattern 
      };
    }
  }

  // Verificar padrões com chaves: prefix{num}suffix
  const braceMatch = pattern.match(BRACE_PATTERN);
  console.log('Brace match:', braceMatch);
  
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

console.log('=== Teste 20{2}*(+-[2]) ===');
const result = expandPattern('20{2}*(+-[2])');
console.log('Resultado final:', JSON.stringify(result, null, 2));

