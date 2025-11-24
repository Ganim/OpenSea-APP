
const BRACE_PATTERN = /^(.*?)\{([^}]+)\}(.*?)$/;

const formatNumberWithPadding = (num, maxNum) => {
  const maxDigits = maxNum.toString().length;
  return num.toString().padStart(maxDigits, '0');
};

function expandPattern(pattern) {
  const results = [];
  
  const braceMatch = pattern.match(BRACE_PATTERN);

  if (braceMatch) {
    const [, prefix, numRange, suffix] = braceMatch;
    const numCount = parseInt(numRange);

    for (let i = 1; i <= numCount; i++) {
      const paddedNum = formatNumberWithPadding(i, numCount);
      results.push(prefix + paddedNum + suffix);
    }
  } else {
    results.push(pattern);
  }
  
  return results;
}

console.log('Teste {3}00:');
console.log(expandPattern('{3}00'));

console.log('\nTeste PRT{5}:');
console.log(expandPattern('PRT{5}'));

console.log('\nTeste {2}ABC:');
console.log(expandPattern('{2}ABC'));

console.log('\nTeste ABC{2}XYZ:');
console.log(expandPattern('ABC{2}XYZ'));

