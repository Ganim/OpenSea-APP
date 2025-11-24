
// Teste da nova sintaxe
const testPattern = '20{2}*(+-[2])';

console.log('Padrão de entrada:', testPattern);

// Simulação do que deveria acontecer:
// 1. 20{2} deveria expandir para ['201', '202']
// 2. *(+-[2]) deveria criar sublocalizações para cada uma
// 3. +-[2] significa usar nome do pai + letras A, B

// Resultado esperado:
// 201 (201-A, 201-B)
// 202 (202-A, 202-B)

console.log('Resultado esperado:');
console.log('201 (201-A, 201-B)');
console.log('202 (202-A, 202-B)');

