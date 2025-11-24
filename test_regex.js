
// Teste da regex correta
const HIERARCHY_PATTERN = /^(.+?)\*\((.+?)\)$/;
const BRACE_PATTERN = /^(.*?)\{([^}]+)\}(.*?)$/;

console.log('Teste da regex HIERARCHY_PATTERN:');
const testPattern = '20{2}*(+-[2])';
const match = testPattern.match(HIERARCHY_PATTERN);
console.log('Match result:', match);

if (match) {
  console.log('Base pattern:', match[1]);
  console.log('Sub pattern:', match[2]);
}

