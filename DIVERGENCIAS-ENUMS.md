# Divergências de Enums entre Frontend e Backend

## 1. ProductStatus

### Backend (Prisma Schema)
```prisma
enum ProductStatus {
  DRAFT
  ACTIVE
  INACTIVE
  DISCONTINUED
  OUT_OF_STOCK
}
```

### Frontend (product.types.ts)
```typescript
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
```

### Análise
- **Faltam no Frontend**: `DRAFT`, `DISCONTINUED`, `OUT_OF_STOCK`
- **Falta no Backend**: `ARCHIVED`
- **Status comum**: `ACTIVE`, `INACTIVE`

### Impacto
- **Crítico**: O frontend não suporta produtos em rascunho (`DRAFT`)
- **Alto**: Produtos descontinuados (`DISCONTINUED`) não podem ser diferenciados de inativos
- **Médio**: Produtos sem estoque (`OUT_OF_STOCK`) não têm representação no frontend
- **Baixo**: Frontend usa `ARCHIVED` mas backend não reconhece

### Recomendação
Sincronizar os enums para incluir todos os valores do backend no frontend:
```typescript
export type ProductStatus = 
  | 'DRAFT'
  | 'ACTIVE' 
  | 'INACTIVE' 
  | 'DISCONTINUED'
  | 'OUT_OF_STOCK';
```

Remover `ARCHIVED` ou mapear para `DISCONTINUED` se necessário.

---

## 2. UnitOfMeasure

### Backend (Prisma Schema)
```prisma
enum UnitOfMeasure {
  METERS
  KILOGRAMS
  UNITS
}
```

### Frontend (template.types.ts)
```typescript
export type UnitOfMeasure =
  | 'UNITS'
  | 'KILOGRAMS'
  | 'GRAMS'
  | 'LITERS'
  | 'MILLILITERS'
  | 'METERS'
  | 'CENTIMETERS'
  | 'MILLIMETERS'
  | 'SQUARE_METERS'
  | 'CUBIC_METERS'
  | 'PIECES'
  | 'BOXES'
  | 'PACKAGES'
  | 'BAGS'
  | 'BOTTLES'
  | 'CANS'
  | 'TUBES'
  | 'ROLLS'
  | 'SHEETS'
  | 'BARS'
  | 'COILS'
  | 'POUNDS'
  | 'OUNCES'
  | 'GALLONS'
  | 'QUARTS'
  | 'PINTS'
  | 'CUPS'
  | 'TABLESPOONS'
  | 'TEASPOONS'
  | 'CUSTOM';
```

### Análise
- **Backend**: Apenas 3 valores (`METERS`, `KILOGRAMS`, `UNITS`)
- **Frontend**: 30 valores (sistema completo de medidas)
- **Status comum**: `METERS`, `KILOGRAMS`, `UNITS`

### Impacto
- **Crítico**: Frontend permite criar templates com unidades que o backend não aceita
- **Alto**: Validação de formulários não reflete as restrições reais do backend
- **Alto**: Dados podem ser rejeitados silenciosamente ou causar erros 500

### Recomendação
**Opção 1 - Expandir Backend** (Recomendado):
Adicionar todas as unidades de medida ao enum no Prisma:
```prisma
enum UnitOfMeasure {
  // Existentes
  METERS
  KILOGRAMS
  UNITS
  
  // Adicionar
  GRAMS
  LITERS
  MILLILITERS
  CENTIMETERS
  MILLIMETERS
  SQUARE_METERS
  CUBIC_METERS
  PIECES
  BOXES
  PACKAGES
  BAGS
  BOTTLES
  CANS
  TUBES
  ROLLS
  SHEETS
  BARS
  COILS
  POUNDS
  OUNCES
  GALLONS
  QUARTS
  PINTS
  CUPS
  TABLESPOONS
  TEASPOONS
  CUSTOM
}
```

**Opção 2 - Restringir Frontend**:
Limitar frontend a apenas 3 unidades (perda de funcionalidade):
```typescript
export type UnitOfMeasure = 'METERS' | 'KILOGRAMS' | 'UNITS';
```

---

## Prioridade de Correção

1. **UnitOfMeasure** - Crítico
   - Pode causar erros em produção ao criar templates
   - Recomendação: Expandir backend
   
2. **ProductStatus** - Alto
   - Impacta funcionalidades de gerenciamento de produtos
   - Recomendação: Sincronizar tipos

---

## Checklist de Implementação

### Para UnitOfMeasure
- [ ] Atualizar enum no `schema.prisma`
- [ ] Criar migration: `prisma migrate dev --name add-unit-of-measure-values`
- [ ] Verificar se há templates existentes com valores inválidos
- [ ] Atualizar validações no backend (Zod schemas)
- [ ] Testar criação/edição de templates

### Para ProductStatus
- [ ] Decidir: manter `ARCHIVED` ou usar `DISCONTINUED`?
- [ ] Atualizar `product.types.ts` com todos os valores
- [ ] Atualizar componentes que usam ProductStatus (filtros, badges, etc.)
- [ ] Verificar lógica de negócio que depende de status
- [ ] Atualizar testes

---

**Data**: 2024
**Status**: PENDENTE APROVAÇÃO
