# OpenSea APP - Sistema de Estoque
## Roadmap de Reestruturação e Novas Funcionalidades

**Data:** 03/12/2025
**Versão:** 1.0
**Status:** Planejamento

---

## 📋 Índice

1. [Análise da Estrutura Atual](#1-análise-da-estrutura-atual)
2. [Necessidades Identificadas](#2-necessidades-identificadas)
3. [Alterações Necessárias](#3-alterações-necessárias)
4. [Novas Funcionalidades](#4-novas-funcionalidades)
5. [Roadmap de Implementação](#5-roadmap-de-implementação)
6. [Estrutura de Dados Proposta](#6-estrutura-de-dados-proposta)
7. [APIs e Endpoints Necessários](#7-apis-e-endpoints-necessários)

---

## 1. Análise da Estrutura Atual

### 1.1 Hierarquia de Entidades Existente

```
Template (Define atributos customizados)
    ↓
Product (Produto físico - com unitOfMeasure)
    ↓
Variant (Variação: cor, estampa, tamanho)
    ↓
Item (Instância física no estoque)
    ↓
ItemMovement (Histórico de movimentações)
```

### 1.2 Campos Obrigatórios Atuais

**Template:**
- ✅ id, name, createdAt
- ❌ Falta: unitOfMeasure

**Product:**
- ✅ id, name, code, status, unitOfMeasure, templateId, createdAt
- ⚠️ Problema: code é obrigatório (deveria ser opcional e auto-gerado)
- ⚠️ Problema: unitOfMeasure deveria estar no Template

**Variant:**
- ✅ id, productId, sku, name, price, createdAt
- ⚠️ Problema: sku é obrigatório (deveria ser opcional e auto-gerado)

**Item:**
- ✅ id, variantId, locationId, uniqueCode, initialQuantity, currentQuantity, status, entryDate, createdAt
- ⚠️ Problema: uniqueCode é obrigatório (deveria ser auto-gerado)

### 1.3 Funcionalidades Existentes

✅ **Implementado:**
- CRUD completo de Templates, Products, Variants, Items
- Sistema de movimentação (Entry, Exit, Transfer)
- Histórico de movimentações
- Sistema de localização hierárquico
- Códigos múltiplos (barcode, QR, EAN, UPC)
- Atributos customizados (JSON)
- Rastreabilidade (lote, fabricação, validade)
- Purchase Orders

❌ **Não Implementado:**
- Sistema de etiquetas de conservação
- Geração automática de códigos
- Status automático ACTIVE
- Simplificação de cadastros
- Sistema de geração de etiquetas com código de barras
- Importação em lote
- Importação por nota fiscal
- Relatórios (Curva ABC, etc.)

---

## 2. Necessidades Identificadas

### 2.1 Alterações Estruturais

| # | Necessidade | Status | Prioridade |
|---|------------|--------|-----------|
| 1 | Mover `unitOfMeasure` de Product para Template | ⚠️ Breaking Change | ALTA |
| 2 | Tornar todos os códigos opcionais e auto-gerados | ⚠️ Breaking Change | ALTA |
| 3 | Status ACTIVE como padrão em todos cadastros | 🟢 Simples | ALTA |
| 4 | Simplificar campos obrigatórios nos formulários | 🟢 Frontend | ALTA |
| 5 | Adicionar sistema de etiquetas de conservação | 🟡 Nova Feature | MÉDIA |

### 2.2 Novas Funcionalidades

| # | Funcionalidade | Complexidade | Prioridade |
|---|---------------|--------------|-----------|
| 1 | Sistema de geração de etiquetas com código de barras | 🔴 Alta | ALTA |
| 2 | Importação em lote de produtos | 🟡 Média | ALTA |
| 3 | Importação via nota fiscal (NF-e) | 🔴 Alta | MÉDIA |
| 4 | Relatório Curva ABC | 🟡 Média | MÉDIA |
| 5 | Relatórios de estoque diversos | 🟡 Média | MÉDIA |
| 6 | Equiparação automática de itens NF-e | 🔴 Alta | BAIXA |

---

## 3. Alterações Necessárias

### 3.1 FASE 1: Reestruturação de Dados (Breaking Changes)

#### 3.1.1 Mover unitOfMeasure para Template

**Alterações necessárias:**

**Backend (API):**
```typescript
// src/types/stock.ts

interface Template {
  id: string;
  name: string;
  unitOfMeasure: UnitOfMeasure; // ← NOVO CAMPO OBRIGATÓRIO
  productAttributes?: Record<string, unknown>;
  variantAttributes?: Record<string, unknown>;
  itemAttributes?: Record<string, unknown>;
  careInstructions?: CareInstructions; // ← NOVO: Etiquetas de conservação
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface Product {
  id: string;
  name: string;
  code?: string; // ← OPCIONAL agora
  description?: string;
  status: ProductStatus;
  // unitOfMeasure: UnitOfMeasure; ← REMOVER
  attributes: Record<string, any>;
  templateId: string;
  supplierId?: string;
  manufacturerId?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
```

**Impacto:**
- ⚠️ Migração de dados existentes necessária
- ⚠️ Todos os templates precisam receber unitOfMeasure
- ⚠️ Produtos herdarão unitOfMeasure do template
- ⚠️ Atualizar todas as queries que usam Product.unitOfMeasure

**Script de Migração:**
```sql
-- 1. Adicionar coluna unitOfMeasure em templates
ALTER TABLE templates ADD COLUMN unit_of_measure VARCHAR(20);

-- 2. Popular unitOfMeasure nos templates baseado em seus produtos
UPDATE templates t
SET unit_of_measure = (
  SELECT p.unit_of_measure
  FROM products p
  WHERE p.template_id = t.id
  LIMIT 1
);

-- 3. Tornar campo obrigatório
ALTER TABLE templates ALTER COLUMN unit_of_measure SET NOT NULL;

-- 4. Remover coluna de products (após garantir que todas as consultas foram atualizadas)
-- ALTER TABLE products DROP COLUMN unit_of_measure;
```

#### 3.1.2 Códigos Opcionais e Auto-gerados

**Lógica de geração automática:**

```typescript
// Backend: src/utils/code-generator.ts

export class CodeGenerator {
  /**
   * Gera código baseado no nome
   * Exemplo: "Tecido Denim Santista" → "TEC-DEN-SAN-001"
   */
  static generateFromName(name: string, prefix: string, existingCodes: string[]): string {
    // 1. Extrair iniciais das palavras principais
    const words = name
      .toUpperCase()
      .split(' ')
      .filter(w => w.length > 2); // Ignora palavras pequenas

    const initials = words
      .slice(0, 3)
      .map(w => w.substring(0, 3))
      .join('-');

    // 2. Encontrar próximo número sequencial
    const pattern = new RegExp(`^${prefix}-${initials}-(\\d+)$`);
    const numbers = existingCodes
      .filter(code => pattern.test(code))
      .map(code => parseInt(code.match(pattern)![1], 10));

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

    // 3. Retornar código formatado
    return `${prefix}-${initials}-${String(nextNumber).padStart(3, '0')}`;
  }

  /**
   * Exemplos de uso:
   * - Template: "Tecido" → "TPL-TEC-001"
   * - Product: "Tecido Denim Santista" → "PRD-TEC-DEN-SAN-001"
   * - Variant: "Azul Royal" → "VAR-AZU-ROY-001"
   * - Item: Auto-incremento → "ITM-000001"
   */
}

// Aplicar em cada service:

class ProductService {
  async create(data: CreateProductInput): Promise<Product> {
    // Se código não fornecido, gerar automaticamente
    if (!data.code) {
      const existingCodes = await this.getAllProductCodes();
      data.code = CodeGenerator.generateFromName(
        data.name,
        'PRD',
        existingCodes
      );
    }

    // Status padrão ACTIVE
    data.status = data.status || 'ACTIVE';

    return this.repository.create(data);
  }
}
```

**Alterações nos schemas:**
```typescript
// Tornar códigos opcionais em todos os schemas de criação

interface CreateProductInput {
  name: string;
  code?: string; // Opcional
  description?: string;
  // status?: ProductStatus; // Padrão ACTIVE
  templateId: string;
  supplierId?: string;
  manufacturerId?: string;
  attributes?: Record<string, any>;
}

interface CreateVariantInput {
  productId: string;
  sku?: string; // Opcional
  name: string;
  price: number;
  // ... outros campos
}

interface CreateItemInput {
  variantId: string;
  locationId: string;
  uniqueCode?: string; // Opcional
  quantity: number; // Simplificado: apenas quantidade
  // initialQuantity e currentQuantity = quantity
  // status: 'AVAILABLE' por padrão
  batchNumber?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  attributes?: Record<string, any>;
}
```

#### 3.1.3 Simplificação de Campos Obrigatórios

**Novos requisitos mínimos:**

```typescript
// Template: apenas nome e unidade de medida
interface CreateTemplateInput {
  name: string;
  unitOfMeasure: UnitOfMeasure;
  // Tudo mais é opcional
  productAttributes?: Record<string, unknown>;
  variantAttributes?: Record<string, unknown>;
  itemAttributes?: Record<string, unknown>;
  careInstructions?: CareInstructions;
}

// Product: apenas template e nome
interface CreateProductInput {
  templateId: string;
  name: string;
  // code: auto-gerado se não fornecido
  // status: 'ACTIVE' por padrão
  // Tudo mais é opcional
  description?: string;
  supplierId?: string;
  manufacturerId?: string;
  attributes?: Record<string, any>;
}

// Variant: apenas produto e nome
interface CreateVariantInput {
  productId: string;
  name: string;
  // sku: auto-gerado se não fornecido
  // price: pode ser 0.00 por padrão ou obrigatório?
  price: number; // Manter obrigatório
  // Tudo mais é opcional
  imageUrl?: string;
  attributes?: Record<string, unknown>;
  costPrice?: number;
  profitMargin?: number;
}

// Item: apenas variante e quantidade
interface CreateItemInput {
  variantId: string;
  quantity: number;
  // locationId: pode ser "ENTRADA" por padrão?
  locationId: string; // Manter obrigatório (onde será armazenado)
  // uniqueCode: auto-gerado
  // initialQuantity = currentQuantity = quantity
  // status: 'AVAILABLE'
  // entryDate: Date.now()
  batchNumber?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  attributes?: Record<string, any>;
}
```

**⚠️ Decisão necessária para PRICE em Variant:**
- Opção A: Manter obrigatório (mais seguro para controle financeiro)
- Opção B: Tornar opcional com valor 0.00 (permite cadastro rápido)
- **Recomendação:** Manter obrigatório

### 3.2 FASE 2: Sistema de Etiquetas de Conservação

#### 3.2.1 Estrutura de Dados

```typescript
// src/types/stock.ts

/**
 * Etiqueta de conservação conforme legislação brasileira
 * NBR 16365:2015 - Etiquetagem de produtos têxteis
 */
interface CareInstructions {
  // Composição têxtil (obrigatório por lei)
  composition: FiberComposition[];

  // Instruções de lavagem
  washing?: WashingInstruction;

  // Instruções de alvejamento
  bleaching?: BleachingInstruction;

  // Instruções de secagem
  drying?: DryingInstruction;

  // Instruções de passagem
  ironing?: IroningInstruction;

  // Limpeza profissional
  professionalCleaning?: ProfessionalCleaningInstruction;

  // Avisos especiais
  warnings?: string[];

  // Símbolos personalizados (para casos especiais)
  customSymbols?: CustomSymbol[];
}

interface FiberComposition {
  fiber: string; // Ex: "Algodão", "Poliéster", "Elastano"
  percentage: number; // Ex: 95, 5
}

type WashingInstruction =
  | 'HAND_WASH' // Lavar à mão
  | 'MACHINE_30' // Máquina 30°C
  | 'MACHINE_40' // Máquina 40°C
  | 'MACHINE_60' // Máquina 60°C
  | 'DO_NOT_WASH'; // Não lavar

type BleachingInstruction =
  | 'ANY_BLEACH' // Pode usar qualquer alvejante
  | 'NON_CHLORINE' // Apenas alvejante sem cloro
  | 'DO_NOT_BLEACH'; // Não alvejar

type DryingInstruction =
  | 'TUMBLE_DRY_LOW' // Secadora temperatura baixa
  | 'TUMBLE_DRY_MEDIUM' // Secadora temperatura média
  | 'LINE_DRY' // Secar à sombra
  | 'DRIP_DRY' // Secar pingando
  | 'DO_NOT_TUMBLE_DRY'; // Não usar secadora

type IroningInstruction =
  | 'IRON_LOW' // Passar com ferro baixo (110°C)
  | 'IRON_MEDIUM' // Passar com ferro médio (150°C)
  | 'IRON_HIGH' // Passar com ferro alto (200°C)
  | 'DO_NOT_IRON'; // Não passar

type ProfessionalCleaningInstruction =
  | 'DRY_CLEAN_ANY' // Limpeza a seco - qualquer solvente
  | 'DRY_CLEAN_PETROLEUM' // Limpeza a seco - só petróleo
  | 'WET_CLEAN' // Limpeza úmida profissional
  | 'DO_NOT_DRY_CLEAN'; // Não fazer limpeza a seco

interface CustomSymbol {
  code: string;
  description: string;
  svgPath?: string; // SVG personalizado
}

// Exemplo de uso:
const cuidadosTecido: CareInstructions = {
  composition: [
    { fiber: 'Algodão', percentage: 95 },
    { fiber: 'Elastano', percentage: 5 }
  ],
  washing: 'MACHINE_30',
  bleaching: 'NON_CHLORINE',
  drying: 'LINE_DRY',
  ironing: 'IRON_MEDIUM',
  professionalCleaning: 'DO_NOT_DRY_CLEAN',
  warnings: [
    'Não torcer',
    'Lavar cores separadas'
  ]
};
```

#### 3.2.2 Interface de Cadastro

```tsx
// src/components/stock/care-instructions-form.tsx

<CareInstructionsForm>
  <Section title="Composição Têxtil" required>
    <FiberCompositionInput />
    {/* Lista de fibras com % - total deve ser 100% */}
  </Section>

  <Section title="Instruções de Cuidado">
    <SymbolPicker
      type="washing"
      options={WASHING_OPTIONS}
      visual={true} // Mostra símbolos visuais
    />
    <SymbolPicker type="bleaching" options={BLEACHING_OPTIONS} />
    <SymbolPicker type="drying" options={DRYING_OPTIONS} />
    <SymbolPicker type="ironing" options={IRONING_OPTIONS} />
    <SymbolPicker type="professionalCleaning" options={CLEANING_OPTIONS} />
  </Section>

  <Section title="Avisos Especiais">
    <WarningsInput />
  </Section>

  <Preview>
    {/* Visualização da etiqueta como será impressa */}
    <CareLabel data={careInstructions} />
  </Preview>
</CareInstructionsForm>
```

---

## 4. Novas Funcionalidades

### 4.1 Sistema de Geração de Etiquetas

#### 4.1.1 Estrutura de Dados da Etiqueta

```typescript
// src/types/label.ts

interface ItemLabel {
  // Identificação
  itemId: string;
  itemCode: string; // uniqueCode do item

  // Produto
  productName: string;
  variantName: string;

  // Fabricante
  manufacturer?: {
    name: string;
    logo?: string;
  };

  // Localização
  location: {
    code: string;
    fullPath: string; // Ex: "MATRIZ > ZONA-A > CORREDOR-3 > PRATELEIRA-5"
  };

  // Quantidade
  quantity: number;
  unitOfMeasure: string; // Ex: "metros", "kg", "unidades"

  // Atributos customizados (marcados para exibição)
  customAttributes: LabelAttribute[];

  // Código de barras
  barcode: string; // Code128, EAN-13, etc.
  barcodeType: BarcodeType;

  // Etiqueta de conservação (se aplicável)
  careInstructions?: CareInstructions;

  // Metadados
  printedAt: Date;
  printedBy: string;
  labelSize: LabelSize; // 50x30mm, 100x50mm, etc.
}

interface LabelAttribute {
  key: string;
  label: string;
  value: string;
  showOnLabel: boolean; // ← Marcação no template
}

type BarcodeType =
  | 'CODE128' // Padrão alfanumérico
  | 'EAN13' // Varejo
  | 'QR' // QR Code (pode ter mais dados)
  | 'DATAMATRIX'; // Indústria

type LabelSize =
  | '50x30' // Pequena
  | '100x50' // Média
  | '100x100'; // Grande (com etiqueta de conservação)
```

#### 4.1.2 Componente de Geração de Etiquetas

```tsx
// src/components/stock/label-generator.tsx

interface LabelGeneratorProps {
  items: Item[]; // Itens selecionados
  onGenerate: (labels: ItemLabel[]) => void;
}

<LabelGenerator items={selectedItems}>
  {/* Configurações da etiqueta */}
  <LabelSettings>
    <Select label="Tamanho" options={LABEL_SIZES} />
    <Select label="Tipo de código" options={BARCODE_TYPES} />
    <Checkbox label="Incluir etiqueta de conservação" />
    <Checkbox label="Incluir logo do fabricante" />
  </LabelSettings>

  {/* Seleção de atributos customizados */}
  <AttributeSelector>
    {availableAttributes.map(attr => (
      <Checkbox
        key={attr.key}
        label={attr.label}
        checked={attr.showOnLabel}
      />
    ))}
  </AttributeSelector>

  {/* Preview */}
  <LabelPreview>
    {labels.map(label => (
      <LabelCard key={label.itemId} data={label} />
    ))}
  </LabelPreview>

  {/* Ações */}
  <Actions>
    <Button onClick={downloadPDF}>Baixar PDF</Button>
    <Button onClick={print}>Imprimir</Button>
  </Actions>
</LabelGenerator>
```

#### 4.1.3 Template de Etiqueta (Exemplo 100x50mm)

```tsx
// src/components/stock/label-templates/label-100x50.tsx

<LabelTemplate size="100x50">
  {/* Header com fabricante */}
  <Header>
    {manufacturer?.logo && <Logo src={manufacturer.logo} />}
    <Title>{productName}</Title>
  </Header>

  {/* Corpo principal */}
  <Body>
    <Row>
      <Label>Código:</Label>
      <Value>{itemCode}</Value>
    </Row>

    <Row>
      <Label>Variante:</Label>
      <Value>{variantName}</Value>
    </Row>

    <Row>
      <Label>Localização:</Label>
      <Value>{location.code}</Value>
    </Row>

    <Row>
      <Label>Quantidade:</Label>
      <Value>{quantity} {unitOfMeasure}</Value>
    </Row>

    {/* Atributos customizados */}
    {customAttributes.map(attr => (
      <Row key={attr.key}>
        <Label>{attr.label}:</Label>
        <Value>{attr.value}</Value>
      </Row>
    ))}
  </Body>

  {/* Footer com código de barras */}
  <Footer>
    <Barcode type={barcodeType} value={barcode} />
    <BarcodeText>{barcode}</BarcodeText>
  </Footer>
</LabelTemplate>
```

#### 4.1.4 Geração de PDF/Impressão

```typescript
// src/services/label-printer.service.ts

import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

class LabelPrinterService {
  /**
   * Gera PDF com etiquetas em grid
   * Suporta múltiplas etiquetas por página (3x8 para 50x30mm)
   */
  async generatePDF(labels: ItemLabel[], settings: LabelSettings): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const layout = this.calculateLayout(settings.labelSize);

    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const position = this.calculatePosition(i, layout);

      // Nova página se necessário
      if (i > 0 && position.page > Math.floor((i - 1) / layout.perPage)) {
        pdf.addPage();
      }

      // Renderizar etiqueta
      await this.renderLabel(pdf, label, position, settings);
    }

    return pdf.output('blob');
  }

  private async renderLabel(
    pdf: jsPDF,
    label: ItemLabel,
    position: Position,
    settings: LabelSettings
  ): Promise<void> {
    const { x, y, width, height } = position;

    // Borda da etiqueta
    pdf.rect(x, y, width, height);

    // Título
    pdf.setFontSize(10);
    pdf.text(label.productName, x + 2, y + 5);

    // Dados
    let currentY = y + 10;
    pdf.setFontSize(8);

    pdf.text(`Código: ${label.itemCode}`, x + 2, currentY);
    currentY += 4;

    pdf.text(`Variante: ${label.variantName}`, x + 2, currentY);
    currentY += 4;

    pdf.text(`Local: ${label.location.code}`, x + 2, currentY);
    currentY += 4;

    pdf.text(`Qtd: ${label.quantity} ${label.unitOfMeasure}`, x + 2, currentY);
    currentY += 4;

    // Atributos customizados
    for (const attr of label.customAttributes) {
      if (attr.showOnLabel) {
        pdf.text(`${attr.label}: ${attr.value}`, x + 2, currentY);
        currentY += 4;
      }
    }

    // Código de barras
    const barcodeImage = await this.generateBarcode(
      label.barcode,
      label.barcodeType
    );

    pdf.addImage(
      barcodeImage,
      'PNG',
      x + 2,
      y + height - 15,
      width - 4,
      12
    );
  }

  private async generateBarcode(code: string, type: BarcodeType): Promise<string> {
    if (type === 'QR') {
      return await QRCode.toDataURL(code);
    }

    const canvas = document.createElement('canvas');
    JsBarcode(canvas, code, {
      format: type === 'EAN13' ? 'EAN13' : 'CODE128',
      width: 2,
      height: 40,
      displayValue: false
    });

    return canvas.toDataURL('image/png');
  }

  /**
   * Envia para impressora térmica
   * Usa protocolo ESC/POS para impressoras Zebra, Brother, etc.
   */
  async printToThermalPrinter(labels: ItemLabel[]): Promise<void> {
    // Implementar integração com impressora térmica
    // Pode usar bibliotecas como: node-escpos, node-thermal-printer
  }
}
```

### 4.2 Importação em Lote

#### 4.2.1 Estrutura de Importação

```typescript
// src/types/import.ts

interface BulkImport {
  id: string;
  fileName: string;
  fileSize: number;
  status: ImportStatus;
  entityType: 'PRODUCT' | 'VARIANT' | 'ITEM';
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

type ImportStatus =
  | 'PENDING' // Aguardando processamento
  | 'VALIDATING' // Validando dados
  | 'PROCESSING' // Processando
  | 'COMPLETED' // Concluído
  | 'FAILED' // Falhou
  | 'PARTIAL'; // Parcialmente concluído (alguns erros)

interface ImportError {
  row: number;
  field?: string;
  message: string;
  data: any;
}

// Formato do Excel/CSV
interface ProductImportRow {
  // Obrigatórios
  template: string; // Nome ou código do template
  name: string;

  // Opcionais
  code?: string; // Gerado se vazio
  description?: string;
  supplier?: string; // Nome ou código
  manufacturer?: string; // Nome ou código

  // Atributos customizados (colunas dinâmicas)
  [key: string]: any;
}

interface VariantImportRow {
  // Obrigatórios
  product: string; // Código do produto
  name: string;
  price: number;

  // Opcionais
  sku?: string;
  costPrice?: number;
  barcode?: string;

  // Atributos customizados
  [key: string]: any;
}

interface ItemImportRow {
  // Obrigatórios
  variant: string; // SKU da variante
  quantity: number;
  location: string; // Código da localização

  // Opcionais
  batchNumber?: string;
  manufacturingDate?: string; // ISO date
  expiryDate?: string; // ISO date

  // Atributos customizados
  [key: string]: any;
}
```

#### 4.2.2 Interface de Importação

```tsx
// src/app/(dashboard)/stock/import/page.tsx

<BulkImportPage>
  {/* Step 1: Seleção do tipo */}
  <Step1>
    <Title>Selecione o tipo de importação</Title>
    <Options>
      <Card onClick={() => setType('PRODUCT')}>
        <Icon name="package" />
        <Title>Produtos</Title>
        <Description>Importar lista de produtos</Description>
      </Card>
      <Card onClick={() => setType('VARIANT')}>
        <Icon name="palette" />
        <Title>Variantes</Title>
        <Description>Importar variantes de produtos</Description>
      </Card>
      <Card onClick={() => setType('ITEM')}>
        <Icon name="box" />
        <Title>Itens</Title>
        <Description>Dar entrada de itens no estoque</Description>
      </Card>
    </Options>
  </Step1>

  {/* Step 2: Download do template */}
  <Step2>
    <Title>Baixe o template Excel</Title>
    <Description>
      O template contém as colunas necessárias e exemplos de preenchimento
    </Description>
    <Button onClick={downloadTemplate}>
      <Icon name="download" />
      Baixar Template {entityType}.xlsx
    </Button>
  </Step2>

  {/* Step 3: Upload do arquivo */}
  <Step3>
    <Title>Faça upload do arquivo preenchido</Title>
    <FileUploader
      accept=".xlsx,.xls,.csv"
      onUpload={handleUpload}
    />

    {/* Validação prévia */}
    {validationResult && (
      <ValidationResults>
        <Summary>
          <Stat label="Total de linhas" value={validationResult.totalRows} />
          <Stat label="Válidas" value={validationResult.validRows} color="green" />
          <Stat label="Com erro" value={validationResult.errorRows} color="red" />
        </Summary>

        {validationResult.errors.length > 0 && (
          <ErrorsList>
            {validationResult.errors.map(error => (
              <ErrorRow key={error.row}>
                <Icon name="alert" color="red" />
                Linha {error.row}: {error.message}
                {error.field && <FieldBadge>{error.field}</FieldBadge>}
              </ErrorRow>
            ))}
          </ErrorsList>
        )}
      </ValidationResults>
    )}
  </Step3>

  {/* Step 4: Confirmação e processamento */}
  <Step4>
    <Title>Confirmar importação</Title>
    <Summary>
      <p>{validationResult.validRows} registros serão importados</p>
      {validationResult.errorRows > 0 && (
        <Alert type="warning">
          {validationResult.errorRows} registros com erro serão ignorados
        </Alert>
      )}
    </Summary>

    <Actions>
      <Button variant="secondary" onClick={goBack}>Voltar</Button>
      <Button onClick={processImport}>
        Processar Importação
      </Button>
    </Actions>
  </Step4>

  {/* Step 5: Progresso */}
  <Step5>
    <Title>Processando importação...</Title>
    <ProgressBar
      value={progress.processed}
      max={progress.total}
    />
    <Stats>
      <Stat label="Processados" value={progress.processed} />
      <Stat label="Sucesso" value={progress.success} color="green" />
      <Stat label="Erros" value={progress.errors} color="red" />
    </Stats>

    {/* Real-time errors */}
    <ErrorsFeed>
      {realtimeErrors.map(error => (
        <ErrorItem key={error.row}>
          Linha {error.row}: {error.message}
        </ErrorItem>
      ))}
    </ErrorsFeed>
  </Step5>

  {/* Step 6: Resultado */}
  <Step6>
    <ResultSummary>
      <Icon name={result.status === 'COMPLETED' ? 'check-circle' : 'alert-circle'} />
      <Title>
        {result.status === 'COMPLETED' ? 'Importação concluída!' : 'Importação finalizada com erros'}
      </Title>
      <Stats>
        <Stat label="Total processado" value={result.processedRows} />
        <Stat label="Sucesso" value={result.successCount} color="green" />
        <Stat label="Erros" value={result.errorCount} color="red" />
      </Stats>
    </ResultSummary>

    {result.errorCount > 0 && (
      <Button onClick={downloadErrorReport}>
        <Icon name="download" />
        Baixar relatório de erros
      </Button>
    )}

    <Actions>
      <Button onClick={goToList}>Ver registros importados</Button>
      <Button variant="secondary" onClick={newImport}>Nova importação</Button>
    </Actions>
  </Step6>
</BulkImportPage>
```

#### 4.2.3 Serviço de Importação

```typescript
// src/services/import.service.ts

import * as XLSX from 'xlsx';

class ImportService {
  /**
   * Processa arquivo Excel/CSV
   */
  async processFile(
    file: File,
    entityType: 'PRODUCT' | 'VARIANT' | 'ITEM'
  ): Promise<BulkImport> {
    // 1. Ler arquivo
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    // 2. Criar registro de importação
    const importRecord = await this.createImport({
      fileName: file.name,
      fileSize: file.size,
      entityType,
      totalRows: rows.length,
      status: 'PENDING'
    });

    // 3. Validar dados
    const validation = await this.validateRows(rows, entityType);

    if (validation.errors.length > 0) {
      await this.updateImport(importRecord.id, {
        status: 'VALIDATING',
        errors: validation.errors
      });
    }

    // 4. Processar em background (fila)
    await this.queueProcessing(importRecord.id, rows, entityType);

    return importRecord;
  }

  /**
   * Valida dados antes de processar
   */
  private async validateRows(
    rows: any[],
    entityType: string
  ): Promise<ValidationResult> {
    const errors: ImportError[] = [];
    let validRows = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 porque Excel começa em 1 e tem header

      try {
        await this.validateRow(row, entityType);
        validRows++;
      } catch (error) {
        errors.push({
          row: rowNumber,
          field: error.field,
          message: error.message,
          data: row
        });
      }
    }

    return {
      totalRows: rows.length,
      validRows,
      errorRows: errors.length,
      errors
    };
  }

  /**
   * Processa importação em background
   */
  private async processImport(
    importId: string,
    rows: any[],
    entityType: string
  ): Promise<void> {
    await this.updateImport(importId, {
      status: 'PROCESSING',
      startedAt: new Date()
    });

    let successCount = 0;
    let errorCount = 0;
    const errors: ImportError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      try {
        await this.importRow(row, entityType);
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({
          row: rowNumber,
          message: error.message,
          data: row
        });
      }

      // Atualizar progresso a cada 10 linhas
      if (i % 10 === 0) {
        await this.updateImport(importId, {
          processedRows: i + 1,
          successCount,
          errorCount
        });
      }
    }

    // Finalizar
    await this.updateImport(importId, {
      status: errorCount === 0 ? 'COMPLETED' : 'PARTIAL',
      processedRows: rows.length,
      successCount,
      errorCount,
      errors,
      completedAt: new Date()
    });
  }

  /**
   * Importa uma linha
   */
  private async importRow(row: any, entityType: string): Promise<void> {
    switch (entityType) {
      case 'PRODUCT':
        return this.importProduct(row);
      case 'VARIANT':
        return this.importVariant(row);
      case 'ITEM':
        return this.importItem(row);
    }
  }

  private async importProduct(row: ProductImportRow): Promise<void> {
    // Buscar template
    const template = await templatesService.findByNameOrCode(row.template);
    if (!template) {
      throw new Error(`Template "${row.template}" não encontrado`);
    }

    // Buscar supplier (se fornecido)
    let supplierId: string | undefined;
    if (row.supplier) {
      const supplier = await suppliersService.findByNameOrCode(row.supplier);
      supplierId = supplier?.id;
    }

    // Buscar manufacturer (se fornecido)
    let manufacturerId: string | undefined;
    if (row.manufacturer) {
      const manufacturer = await manufacturersService.findByNameOrCode(row.manufacturer);
      manufacturerId = manufacturer?.id;
    }

    // Extrair atributos customizados
    const attributes = this.extractCustomAttributes(row, template.productAttributes);

    // Criar produto
    await productsService.createProduct({
      name: row.name,
      code: row.code, // Opcional - será gerado se vazio
      description: row.description,
      templateId: template.id,
      supplierId,
      manufacturerId,
      attributes
    });
  }

  /**
   * Gera template Excel para download
   */
  async generateTemplate(entityType: 'PRODUCT' | 'VARIANT' | 'ITEM'): Promise<Blob> {
    let headers: string[];
    let examples: any[];

    switch (entityType) {
      case 'PRODUCT':
        headers = ['template*', 'name*', 'code', 'description', 'supplier', 'manufacturer'];
        examples = [
          {
            template: 'Tecido',
            name: 'Tecido Denim Santista',
            code: 'PRD-001',
            description: 'Tecido 100% algodão',
            supplier: 'Fornecedor ABC',
            manufacturer: 'Santista'
          }
        ];
        break;

      case 'VARIANT':
        headers = ['product*', 'name*', 'price*', 'sku', 'costPrice', 'barcode'];
        examples = [
          {
            product: 'PRD-001',
            name: 'Azul Royal',
            price: 45.90,
            sku: 'VAR-001',
            costPrice: 30.00,
            barcode: '7891234567890'
          }
        ];
        break;

      case 'ITEM':
        headers = ['variant*', 'quantity*', 'location*', 'batchNumber', 'manufacturingDate', 'expiryDate'];
        examples = [
          {
            variant: 'VAR-001',
            quantity: 100,
            location: 'ZONA-A-01',
            batchNumber: 'LOTE-2025-001',
            manufacturingDate: '2025-01-15',
            expiryDate: '2026-01-15'
          }
        ];
        break;
    }

    // Criar workbook
    const worksheet = XLSX.utils.json_to_sheet(examples, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Importação');

    // Adicionar instruções em outra aba
    const instructions = this.generateInstructions(entityType);
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instruções');

    // Gerar arquivo
    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
}
```

### 4.3 Importação por Nota Fiscal (NF-e)

#### 4.3.1 Estrutura da NF-e

```typescript
// src/types/nfe.ts

interface NFe {
  id: string;
  number: string; // Número da NF-e
  series: string;
  accessKey: string; // Chave de acesso (44 dígitos)
  issueDate: Date;

  // Emitente (fornecedor)
  issuer: {
    cnpj: string;
    name: string;
    tradeName: string;
  };

  // Destinatário (sua empresa)
  recipient: {
    cnpj: string;
    name: string;
  };

  // Itens da nota
  items: NFeItem[];

  // Valores
  total: number;

  // Status
  status: NFeStatus;
  importStatus?: ImportStatus;

  // Arquivo XML
  xmlFile?: string;

  createdAt: Date;
}

interface NFeItem {
  id: string;
  itemNumber: number; // Número sequencial na NF

  // Identificação
  code: string; // Código do produto no fornecedor
  ean?: string; // Código de barras EAN
  description: string;

  // NCM (Nomenclatura Comum do Mercosul)
  ncm: string;

  // Quantidade e unidade
  quantity: number;
  unit: string; // "UN", "KG", "MT", etc.

  // Valores
  unitPrice: number;
  totalPrice: number;

  // Matching com sistema
  matchedVariantId?: string; // Variante correspondente no sistema
  matchConfidence?: number; // 0-100% confiança do matching
  matchMethod?: 'EXACT' | 'FUZZY' | 'MANUAL'; // Como foi feito o match
}

type NFeStatus =
  | 'PENDING' // Aguardando processamento
  | 'MATCHED' // Itens equiparados
  | 'PARTIALLY_MATCHED' // Alguns itens equiparados
  | 'IMPORTED' // Importado para estoque
  | 'REJECTED'; // Rejeitado
```

#### 4.3.2 Interface de Importação NF-e

```tsx
// src/app/(dashboard)/stock/nfe-import/page.tsx

<NFeImportPage>
  {/* Step 1: Upload XML */}
  <Step1>
    <Title>Importar Nota Fiscal Eletrônica</Title>
    <Description>
      Faça upload do arquivo XML da NF-e para importar os itens automaticamente
    </Description>

    <FileUploader
      accept=".xml"
      onUpload={handleXMLUpload}
    />

    <OrDivider />

    <ManualInput>
      <Label>Ou digite a chave de acesso (44 dígitos):</Label>
      <Input
        placeholder="1234 5678 9012 3456 7890 1234 5678 9012 3456 7890 1234"
        maxLength={44}
        onChange={handleAccessKeyChange}
      />
      <Button onClick={fetchFromSefaz}>
        Buscar na SEFAZ
      </Button>
    </ManualInput>
  </Step1>

  {/* Step 2: Visualização da NF-e */}
  <Step2>
    <NFeHeader>
      <Info>
        <Label>Nota Fiscal</Label>
        <Value>#{nfe.number} - Série {nfe.series}</Value>
      </Info>
      <Info>
        <Label>Emissão</Label>
        <Value>{format(nfe.issueDate, 'dd/MM/yyyy')}</Value>
      </Info>
      <Info>
        <Label>Fornecedor</Label>
        <Value>{nfe.issuer.tradeName}</Value>
      </Info>
      <Info>
        <Label>Valor Total</Label>
        <Value>{formatCurrency(nfe.total)}</Value>
      </Info>
    </NFeHeader>

    <Title>Itens da Nota Fiscal ({nfe.items.length})</Title>
    <Description>
      Equipare os itens da nota com produtos cadastrados no sistema
    </Description>

    <ItemsList>
      {nfe.items.map(item => (
        <NFeItemCard key={item.id} item={item}>
          {/* Informações do item da NF */}
          <ItemInfo>
            <Code>{item.code}</Code>
            <Description>{item.description}</Description>
            <Details>
              {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.totalPrice)}
            </Details>
            {item.ean && <EAN>EAN: {item.ean}</EAN>}
          </ItemInfo>

          {/* Matching com sistema */}
          <MatchingSection>
            {item.matchedVariantId ? (
              // Já equiparado
              <MatchedVariant>
                <Icon name="check-circle" color="green" />
                <VariantInfo variant={getVariant(item.matchedVariantId)} />
                <Confidence>
                  {item.matchConfidence}% de confiança
                  {item.matchMethod === 'MANUAL' && ' (manual)'}
                </Confidence>
                <Actions>
                  <Button variant="ghost" onClick={() => rematch(item)}>
                    Alterar
                  </Button>
                </Actions>
              </MatchedVariant>
            ) : (
              // Aguardando equiparação
              <MatchingOptions>
                {/* Sugestões automáticas */}
                {suggestions[item.id]?.length > 0 ? (
                  <>
                    <Title>Sugestões:</Title>
                    {suggestions[item.id].map(suggestion => (
                      <SuggestionCard
                        key={suggestion.variantId}
                        variant={suggestion.variant}
                        confidence={suggestion.confidence}
                        onClick={() => match(item, suggestion.variantId)}
                      />
                    ))}
                  </>
                ) : (
                  <NoSuggestions>
                    <Icon name="alert-circle" />
                    Nenhuma correspondência automática encontrada
                  </NoSuggestions>
                )}

                {/* Busca manual */}
                <ManualSearch>
                  <SearchInput
                    placeholder="Buscar variante manualmente..."
                    onSearch={query => searchVariants(query, item)}
                  />
                </ManualSearch>

                {/* Criar novo */}
                <CreateNew>
                  <Button
                    variant="secondary"
                    onClick={() => createNewVariant(item)}
                  >
                    <Icon name="plus" />
                    Criar nova variante
                  </Button>
                </CreateNew>
              </MatchingOptions>
            )}
          </MatchingSection>
        </NFeItemCard>
      ))}
    </ItemsList>

    {/* Resumo do matching */}
    <MatchingSummary>
      <Stat
        label="Equiparados"
        value={matchedCount}
        total={nfe.items.length}
        color="green"
      />
      <Stat
        label="Pendentes"
        value={pendingCount}
        total={nfe.items.length}
        color="orange"
      />
    </MatchingSummary>

    <Actions>
      <Button
        variant="secondary"
        onClick={autoMatch}
        disabled={isAutoMatching}
      >
        {isAutoMatching ? 'Equiparando...' : 'Equiparar Automaticamente'}
      </Button>
      <Button
        onClick={proceedToImport}
        disabled={matchedCount === 0}
      >
        Prosseguir para Importação ({matchedCount} itens)
      </Button>
    </Actions>
  </Step2>

  {/* Step 3: Configuração de entrada */}
  <Step3>
    <Title>Configurar Entrada no Estoque</Title>

    <GlobalSettings>
      <Field>
        <Label>Localização padrão</Label>
        <LocationSelect
          value={defaultLocation}
          onChange={setDefaultLocation}
        />
      </Field>

      <Field>
        <Label>Número do lote</Label>
        <Input
          value={batchNumber}
          onChange={setBatchNumber}
          placeholder="Ex: LOTE-2025-001"
        />
      </Field>

      <Field>
        <Label>Data de fabricação</Label>
        <DatePicker
          value={manufacturingDate}
          onChange={setManufacturingDate}
        />
      </Field>
    </GlobalSettings>

    <Divider />

    <Title>Itens a serem importados</Title>
    <ItemsTable>
      <Headers>
        <Th>Produto</Th>
        <Th>Quantidade</Th>
        <Th>Localização</Th>
        <Th>Lote</Th>
        <Th>Ações</Th>
      </Headers>
      <Body>
        {matchedItems.map(item => (
          <Row key={item.id}>
            <Td>
              <VariantInfo variant={getVariant(item.matchedVariantId!)} />
            </Td>
            <Td>{item.quantity} {item.unit}</Td>
            <Td>
              <LocationSelect
                value={item.locationId || defaultLocation}
                onChange={loc => updateItem(item.id, { locationId: loc })}
              />
            </Td>
            <Td>
              <Input
                value={item.batchNumber || batchNumber}
                onChange={e => updateItem(item.id, { batchNumber: e.target.value })}
              />
            </Td>
            <Td>
              <IconButton
                icon="trash"
                onClick={() => removeItem(item.id)}
              />
            </Td>
          </Row>
        ))}
      </Body>
    </ItemsTable>

    <Actions>
      <Button variant="secondary" onClick={goBack}>Voltar</Button>
      <Button onClick={importToStock}>
        Importar para Estoque ({matchedItems.length} itens)
      </Button>
    </Actions>
  </Step3>

  {/* Step 4: Processamento */}
  <Step4>
    <Title>Importando itens...</Title>
    <ProgressBar value={progress} max={matchedItems.length} />
    <Status>{progress} de {matchedItems.length} itens processados</Status>
  </Step4>

  {/* Step 5: Resultado */}
  <Step5>
    <ResultSummary status={result.status}>
      <Icon name="check-circle" color="green" />
      <Title>Importação concluída!</Title>
      <Stats>
        <Stat label="Itens importados" value={result.successCount} />
        <Stat label="Erros" value={result.errorCount} />
      </Stats>
    </ResultSummary>

    {result.errorCount > 0 && (
      <ErrorsList errors={result.errors} />
    )}

    <Actions>
      <Button onClick={goToItems}>Ver itens importados</Button>
      <Button variant="secondary" onClick={newImport}>Nova importação</Button>
    </Actions>
  </Step5>
</NFeImportPage>
```

#### 4.3.3 Serviço de Matching Automático

```typescript
// src/services/nfe-matching.service.ts

class NFeMatchingService {
  /**
   * Equipara itens da NF-e com variantes do sistema
   */
  async autoMatch(nfeItems: NFeItem[]): Promise<MatchResult[]> {
    const results: MatchResult[] = [];

    for (const item of nfeItems) {
      const suggestions = await this.findMatches(item);

      if (suggestions.length > 0 && suggestions[0].confidence >= 80) {
        // Match automático se confiança >= 80%
        results.push({
          itemId: item.id,
          variantId: suggestions[0].variantId,
          confidence: suggestions[0].confidence,
          method: 'EXACT'
        });
      } else {
        results.push({
          itemId: item.id,
          suggestions,
          matched: false
        });
      }
    }

    return results;
  }

  /**
   * Busca possíveis matches para um item
   */
  private async findMatches(nfeItem: NFeItem): Promise<MatchSuggestion[]> {
    const suggestions: MatchSuggestion[] = [];

    // 1. Match exato por EAN
    if (nfeItem.ean) {
      const byEAN = await variantsService.findByBarcode(nfeItem.ean);
      if (byEAN) {
        suggestions.push({
          variantId: byEAN.id,
          variant: byEAN,
          confidence: 100,
          reason: 'EAN exato'
        });
        return suggestions; // Match perfeito, retornar imediatamente
      }
    }

    // 2. Match por código do fornecedor
    const byCode = await variantsService.findBySupplierCode(nfeItem.code);
    if (byCode) {
      suggestions.push({
        variantId: byCode.id,
        variant: byCode,
        confidence: 95,
        reason: 'Código do fornecedor'
      });
    }

    // 3. Match fuzzy por nome
    const byName = await this.fuzzySearchByName(nfeItem.description);
    suggestions.push(...byName);

    // 4. Match por NCM (produtos similares)
    const byNCM = await this.searchByNCM(nfeItem.ncm);
    suggestions.push(...byNCM);

    // Ordenar por confiança
    suggestions.sort((a, b) => b.confidence - a.confidence);

    // Retornar top 5
    return suggestions.slice(0, 5);
  }

  /**
   * Busca fuzzy por nome/descrição
   */
  private async fuzzySearchByName(description: string): Promise<MatchSuggestion[]> {
    // Usar algoritmo de similaridade de strings
    // Exemplo: Levenshtein distance, Jaro-Winkler, etc.

    const allVariants = await variantsService.listAll();
    const results: MatchSuggestion[] = [];

    for (const variant of allVariants) {
      const similarity = this.calculateSimilarity(
        description.toLowerCase(),
        variant.name.toLowerCase()
      );

      if (similarity >= 0.6) { // 60% de similaridade mínima
        results.push({
          variantId: variant.id,
          variant,
          confidence: Math.round(similarity * 100),
          reason: `Similaridade no nome (${Math.round(similarity * 100)}%)`
        });
      }
    }

    return results;
  }

  /**
   * Calcula similaridade entre strings (0-1)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    // Implementar algoritmo de similaridade
    // Ex: Levenshtein distance, Jaro-Winkler, etc.
    // Por simplicidade, usando um exemplo básico:

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Parser de XML da NF-e
   */
  async parseNFeXML(xmlContent: string): Promise<NFe> {
    // Usar biblioteca xml2js ou fast-xml-parser
    const parser = new XMLParser();
    const json = parser.parse(xmlContent);

    // Extrair dados da estrutura da NF-e
    const nfe = json.nfeProc.NFe.infNFe;

    return {
      id: generateId(),
      number: nfe.ide.nNF,
      series: nfe.ide.serie,
      accessKey: nfe.$.Id.replace('NFe', ''),
      issueDate: new Date(nfe.ide.dhEmi),
      issuer: {
        cnpj: nfe.emit.CNPJ,
        name: nfe.emit.xNome,
        tradeName: nfe.emit.xFant
      },
      recipient: {
        cnpj: nfe.dest.CNPJ,
        name: nfe.dest.xNome
      },
      items: nfe.det.map((det: any, index: number) => ({
        id: generateId(),
        itemNumber: index + 1,
        code: det.prod.cProd,
        ean: det.prod.cEAN !== 'SEM GTIN' ? det.prod.cEAN : undefined,
        description: det.prod.xProd,
        ncm: det.prod.NCM,
        quantity: parseFloat(det.prod.qCom),
        unit: det.prod.uCom,
        unitPrice: parseFloat(det.prod.vUnCom),
        totalPrice: parseFloat(det.prod.vProd)
      })),
      total: parseFloat(nfe.total.ICMSTot.vNF),
      status: 'PENDING',
      xmlFile: xmlContent,
      createdAt: new Date()
    };
  }
}
```

### 4.4 Relatórios

#### 4.4.1 Curva ABC

```typescript
// src/types/reports.ts

interface ABCCurveReport {
  period: {
    start: Date;
    end: Date;
  };
  items: ABCCurveItem[];
  summary: {
    totalRevenue: number;
    classA: {
      count: number;
      percentage: number;
      revenue: number;
      revenuePercentage: number;
    };
    classB: {
      count: number;
      percentage: number;
      revenue: number;
      revenuePercentage: number;
    };
    classC: {
      count: number;
      percentage: number;
      revenue: number;
      revenuePercentage: number;
    };
  };
}

interface ABCCurveItem {
  variantId: string;
  variant: Variant;
  product: Product;

  // Vendas
  quantity: number;
  revenue: number;

  // Posição na curva
  rank: number;
  cumulativeRevenue: number;
  cumulativePercentage: number;

  // Classificação
  class: 'A' | 'B' | 'C';
}

// Critérios da Curva ABC:
// Classe A: 20% dos produtos que representam 80% do faturamento
// Classe B: 30% dos produtos que representam 15% do faturamento
// Classe C: 50% dos produtos que representam 5% do faturamento
```

```tsx
// src/app/(dashboard)/stock/reports/abc-curve/page.tsx

<ABCCurveReportPage>
  {/* Filtros */}
  <Filters>
    <DateRangePicker
      label="Período"
      value={period}
      onChange={setPeriod}
      presets={['last-30-days', 'last-90-days', 'last-year']}
    />

    <CategoryFilter
      label="Categoria"
      value={category}
      onChange={setCategory}
    />

    <Button onClick={generateReport}>
      <Icon name="bar-chart" />
      Gerar Relatório
    </Button>
  </Filters>

  {/* Resumo */}
  <Summary>
    <Card>
      <Title>Classe A</Title>
      <Value>{report.summary.classA.count} produtos</Value>
      <Subtitle>{report.summary.classA.percentage}% do total</Subtitle>
      <Revenue>{formatCurrency(report.summary.classA.revenue)}</Revenue>
      <SubtitleRevenue>
        {report.summary.classA.revenuePercentage}% do faturamento
      </SubtitleRevenue>
    </Card>

    <Card>
      <Title>Classe B</Title>
      {/* Similar */}
    </Card>

    <Card>
      <Title>Classe C</Title>
      {/* Similar */}
    </Card>
  </Summary>

  {/* Gráfico */}
  <Chart>
    <LineChart
      data={report.items}
      xAxis="rank"
      yAxis="cumulativePercentage"
      areas={[
        { start: 0, end: 20, label: 'A', color: 'green' },
        { start: 20, end: 50, label: 'B', color: 'yellow' },
        { start: 50, end: 100, label: 'C', color: 'red' }
      ]}
    />
  </Chart>

  {/* Tabela de produtos */}
  <ProductsTable>
    <Tabs>
      <Tab label="Classe A" active={activeTab === 'A'} />
      <Tab label="Classe B" active={activeTab === 'B'} />
      <Tab label="Classe C" active={activeTab === 'C'} />
    </Tabs>

    <Table>
      <Headers>
        <Th>Posição</Th>
        <Th>Produto</Th>
        <Th>Qtd Vendida</Th>
        <Th>Faturamento</Th>
        <Th>% Acumulado</Th>
      </Headers>
      <Body>
        {filteredItems.map(item => (
          <Row key={item.variantId} className={`class-${item.class}`}>
            <Td>{item.rank}º</Td>
            <Td>
              <ProductInfo>
                <Name>{item.product.name}</Name>
                <Variant>{item.variant.name}</Variant>
              </ProductInfo>
            </Td>
            <Td>{item.quantity}</Td>
            <Td>{formatCurrency(item.revenue)}</Td>
            <Td>
              <Progress value={item.cumulativePercentage} />
              {item.cumulativePercentage.toFixed(1)}%
            </Td>
          </Row>
        ))}
      </Body>
    </Table>
  </ProductsTable>

  {/* Ações */}
  <Actions>
    <Button variant="secondary" onClick={exportExcel}>
      <Icon name="download" />
      Exportar Excel
    </Button>
    <Button variant="secondary" onClick={exportPDF}>
      <Icon name="file-text" />
      Exportar PDF
    </Button>
  </Actions>
</ABCCurveReportPage>
```

#### 4.4.2 Outros Relatórios

```typescript
// Relatório de Estoque
interface StockReport {
  totalValue: number;
  itemsCount: number;
  byLocation: LocationStock[];
  byProduct: ProductStock[];
  lowStockAlerts: LowStockAlert[];
}

// Relatório de Movimentação
interface MovementReport {
  period: DateRange;
  entries: number;
  exits: number;
  transfers: number;
  byType: { type: MovementType; count: number; }[];
  byUser: { userId: string; count: number; }[];
}

// Relatório de Validade
interface ExpiryReport {
  expiringSoon: Item[]; // Próximo de vencer (30 dias)
  expired: Item[]; // Vencidos
  byProduct: { productId: string; count: number; }[];
}

// Relatório de Giro de Estoque
interface StockTurnoverReport {
  period: DateRange;
  items: {
    variantId: string;
    averageStock: number;
    totalSales: number;
    turnoverRate: number; // vendas / estoque médio
    daysOfInventory: number; // 365 / turnoverRate
  }[];
}
```

---

## 5. Roadmap de Implementação

### 5.1 Priorização

#### FASE 1: Reestruturação Base (2-3 semanas)
**Objetivo:** Ajustar estrutura de dados e simplificar cadastros

| Tarefa | Complexidade | Tempo | Dependências |
|--------|-------------|-------|--------------|
| 1.1 Mover unitOfMeasure para Template | Alta | 3 dias | Script de migração |
| 1.2 Adicionar CareInstructions ao Template | Média | 2 dias | - |
| 1.3 Tornar códigos opcionais no backend | Média | 2 dias | - |
| 1.4 Implementar geração automática de códigos | Média | 3 dias | 1.3 |
| 1.5 Status ACTIVE como padrão | Baixa | 1 dia | - |
| 1.6 Atualizar schemas de criação | Média | 2 dias | 1.3, 1.4, 1.5 |
| 1.7 Atualizar formulários frontend | Média | 3 dias | 1.6 |
| 1.8 Testes e ajustes | Alta | 2 dias | Todos |

**Entregáveis:**
- ✅ Templates com unitOfMeasure
- ✅ Códigos auto-gerados
- ✅ Formulários simplificados
- ✅ Status padrão ACTIVE
- ✅ Migração de dados existentes

#### FASE 2: Sistema de Etiquetas (2 semanas)
**Objetivo:** Implementar geração e impressão de etiquetas

| Tarefa | Complexidade | Tempo | Dependências |
|--------|-------------|-------|--------------|
| 2.1 Interface de cadastro CareInstructions | Média | 3 dias | Fase 1 |
| 2.2 Componente de seleção de símbolos | Média | 2 dias | 2.1 |
| 2.3 Preview da etiqueta de conservação | Baixa | 1 dia | 2.1 |
| 2.4 Estrutura de dados ItemLabel | Baixa | 1 dia | - |
| 2.5 Componente LabelGenerator | Alta | 3 dias | 2.4 |
| 2.6 Templates de etiqueta (50x30, 100x50, 100x100) | Média | 2 dias | 2.5 |
| 2.7 Geração de código de barras | Média | 2 dias | - |
| 2.8 Geração de PDF | Alta | 3 dias | 2.6, 2.7 |
| 2.9 Integração com impressora térmica | Alta | 3 dias | 2.8 |

**Entregáveis:**
- ✅ Cadastro de etiquetas de conservação
- ✅ Gerador de etiquetas com preview
- ✅ Impressão em PDF
- ✅ Impressão térmica (opcional)

#### FASE 3: Importação em Lote (2 semanas)
**Objetivo:** Permitir importação rápida via Excel

| Tarefa | Complexidade | Tempo | Dependências |
|--------|-------------|-------|--------------|
| 3.1 Estrutura de dados BulkImport | Baixa | 1 dia | - |
| 3.2 Geração de templates Excel | Média | 2 dias | - |
| 3.3 Parser de Excel/CSV | Média | 2 dias | - |
| 3.4 Validação de dados | Alta | 3 dias | 3.3 |
| 3.5 Processamento em background | Alta | 3 dias | 3.4 |
| 3.6 Interface de importação (6 steps) | Alta | 4 dias | 3.2, 3.3 |
| 3.7 Relatório de erros | Média | 1 dia | 3.5 |
| 3.8 Testes com grandes volumes | Alta | 2 dias | Todos |

**Entregáveis:**
- ✅ Importação de Produtos
- ✅ Importação de Variantes
- ✅ Importação de Itens (entrada em lote)
- ✅ Templates Excel
- ✅ Validação e relatório de erros

#### FASE 4: Importação NF-e (3 semanas)
**Objetivo:** Automatizar entrada via nota fiscal

| Tarefa | Complexidade | Tempo | Dependências |
|--------|-------------|-------|--------------|
| 4.1 Parser de XML NF-e | Alta | 3 dias | - |
| 4.2 Integração com SEFAZ (busca por chave) | Alta | 3 dias | - |
| 4.3 Algoritmo de matching por EAN | Média | 2 dias | - |
| 4.4 Algoritmo de matching fuzzy | Alta | 4 dias | 4.3 |
| 4.5 Interface de matching manual | Alta | 3 dias | 4.4 |
| 4.6 Criação de variante a partir da NF | Média | 2 dias | - |
| 4.7 Configuração de entrada | Média | 2 dias | - |
| 4.8 Processamento e importação | Alta | 3 dias | Todos |
| 4.9 Testes com NF-e reais | Alta | 2 dias | Todos |

**Entregáveis:**
- ✅ Upload de XML NF-e
- ✅ Busca por chave de acesso
- ✅ Matching automático (EAN, código, nome)
- ✅ Matching manual
- ✅ Importação para estoque

#### FASE 5: Relatórios (2 semanas)
**Objetivo:** Análises e insights do estoque

| Tarefa | Complexidade | Tempo | Dependências |
|--------|-------------|-------|--------------|
| 5.1 Relatório Curva ABC | Alta | 4 dias | - |
| 5.2 Relatório de Estoque | Média | 2 dias | - |
| 5.3 Relatório de Movimentação | Média | 2 dias | - |
| 5.4 Relatório de Validade | Média | 2 dias | - |
| 5.5 Relatório de Giro de Estoque | Alta | 3 dias | - |
| 5.6 Exportação Excel/PDF | Média | 2 dias | Todos |
| 5.7 Dashboards visuais | Alta | 3 dias | Todos |

**Entregáveis:**
- ✅ Curva ABC
- ✅ Relatório de estoque por localização
- ✅ Relatório de movimentações
- ✅ Alertas de validade
- ✅ Análise de giro de estoque

### 5.2 Timeline Total

```
FASE 1: Reestruturação Base         [3 semanas] ██████████████████
FASE 2: Sistema de Etiquetas         [2 semanas]                   ████████████
FASE 3: Importação em Lote           [2 semanas]                               ████████████
FASE 4: Importação NF-e              [3 semanas]                                           ██████████████████
FASE 5: Relatórios                   [2 semanas]                                                             ████████████

Total: 12 semanas (~3 meses)
```

### 5.3 Recursos Necessários

**Equipe:**
- 1 Backend Developer (Full-time)
- 1 Frontend Developer (Full-time)
- 1 QA Tester (Part-time a partir da Fase 2)

**Infraestrutura:**
- Fila de processamento (Redis/BullMQ) para importações
- Storage para XMLs de NF-e (S3 ou similar)
- Impressora térmica para testes (opcional)

**Bibliotecas:**
- `jspdf` - Geração de PDFs
- `jsbarcode` / `qrcode` - Geração de códigos de barras
- `xlsx` - Manipulação de Excel
- `fast-xml-parser` - Parse de XML NF-e
- `bullmq` - Filas de processamento

---

## 6. Estrutura de Dados Proposta

### 6.1 Schemas Atualizados

```prisma
// schema.prisma

model Template {
  id                String   @id @default(uuid())
  name              String
  code              String?  @unique // Auto-gerado
  unitOfMeasure     UnitOfMeasure // ← MOVIDO DE PRODUCT

  // Atributos customizados
  productAttributes  Json?
  variantAttributes  Json?
  itemAttributes     Json?

  // Etiqueta de conservação
  careInstructions   Json? // CareInstructions

  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?

  // Relações
  products          Product[]

  @@index([name])
  @@index([code])
}

model Product {
  id              String   @id @default(uuid())
  name            String
  code            String?  @unique // Opcional - auto-gerado
  description     String?
  status          ProductStatus @default(ACTIVE) // ← PADRÃO ACTIVE
  attributes      Json?

  // Relações
  templateId      String
  template        Template @relation(fields: [templateId], references: [id])
  supplierId      String?
  supplier        Supplier? @relation(fields: [supplierId], references: [id])
  manufacturerId  String?
  manufacturer    Manufacturer? @relation(fields: [manufacturerId], references: [id])

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  // Relações
  variants        Variant[]

  @@index([name])
  @@index([code])
  @@index([templateId])
}

model Variant {
  id              String   @id @default(uuid())
  productId       String
  sku             String?  @unique // Opcional - auto-gerado
  name            String
  price           Decimal  @db.Decimal(10, 2)
  imageUrl        String?
  attributes      Json?

  // Preços
  costPrice       Decimal? @db.Decimal(10, 2)
  profitMargin    Decimal? @db.Decimal(5, 2)

  // Códigos
  barcode         String?  @unique
  qrCode          String?  @unique
  eanCode         String?  @unique
  upcCode         String?  @unique

  // Controle de estoque
  minStock        Int?
  maxStock        Int?
  reorderPoint    Int?
  reorderQuantity Int?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  // Relações
  product         Product  @relation(fields: [productId], references: [id])
  items           Item[]

  @@index([productId])
  @@index([sku])
  @@index([barcode])
  @@index([eanCode])
}

model Item {
  id                String   @id @default(uuid())
  variantId         String
  locationId        String
  uniqueCode        String   @unique // Auto-gerado
  initialQuantity   Decimal  @db.Decimal(10, 3)
  currentQuantity   Decimal  @db.Decimal(10, 3)
  status            ItemStatus @default(AVAILABLE) // ← PADRÃO AVAILABLE
  entryDate         DateTime @default(now())
  attributes        Json?

  // Rastreabilidade
  batchNumber       String?
  manufacturingDate DateTime?
  expiryDate        DateTime?

  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?

  // Relações
  variant           Variant  @relation(fields: [variantId], references: [id])
  location          Location @relation(fields: [locationId], references: [id])
  movements         ItemMovement[]

  @@index([variantId])
  @@index([locationId])
  @@index([uniqueCode])
  @@index([batchNumber])
  @@index([status])
}

// Novas tabelas

model BulkImport {
  id            String       @id @default(uuid())
  fileName      String
  fileSize      Int
  status        ImportStatus @default(PENDING)
  entityType    EntityType
  totalRows     Int
  processedRows Int          @default(0)
  successCount  Int          @default(0)
  errorCount    Int          @default(0)
  errors        Json?        // ImportError[]

  createdBy     String
  createdAt     DateTime     @default(now())
  startedAt     DateTime?
  completedAt   DateTime?
}

model NFe {
  id            String       @id @default(uuid())
  number        String
  series        String
  accessKey     String       @unique
  issueDate     DateTime

  // Emitente (fornecedor)
  issuerCNPJ    String
  issuerName    String
  issuerTrade   String

  // Destinatário
  recipientCNPJ String
  recipientName String

  // Dados
  items         Json         // NFeItem[]
  total         Decimal      @db.Decimal(10, 2)

  // Status
  status        NFeStatus    @default(PENDING)
  importStatus  ImportStatus?

  // Arquivo
  xmlFile       String?      @db.Text

  createdAt     DateTime     @default(now())

  @@index([accessKey])
  @@index([number, series])
}

enum UnitOfMeasure {
  METERS
  KILOGRAMS
  UNITS
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

enum ItemStatus {
  AVAILABLE
  RESERVED
  SOLD
  DAMAGED
}

enum ImportStatus {
  PENDING
  VALIDATING
  PROCESSING
  COMPLETED
  FAILED
  PARTIAL
}

enum EntityType {
  PRODUCT
  VARIANT
  ITEM
}

enum NFeStatus {
  PENDING
  MATCHED
  PARTIALLY_MATCHED
  IMPORTED
  REJECTED
}
```

---

## 7. APIs e Endpoints Necessários

### 7.1 Novos Endpoints

```typescript
// === CÓDIGO AUTO-GERADO ===

// GET /api/v1/code-generator/preview
// Gera preview de código sem persistir
interface CodePreviewRequest {
  entityType: 'TEMPLATE' | 'PRODUCT' | 'VARIANT' | 'ITEM';
  name: string;
}
interface CodePreviewResponse {
  code: string;
}

// === ETIQUETAS ===

// POST /api/v1/labels/generate
// Gera etiquetas para itens selecionados
interface GenerateLabelsRequest {
  itemIds: string[];
  settings: {
    labelSize: '50x30' | '100x50' | '100x100';
    barcodeType: 'CODE128' | 'EAN13' | 'QR' | 'DATAMATRIX';
    includeCareLabel: boolean;
    includeManufacturerLogo: boolean;
    customAttributes: string[]; // IDs dos atributos a exibir
  };
}
interface GenerateLabelsResponse {
  labels: ItemLabel[];
}

// POST /api/v1/labels/print-pdf
// Gera PDF com etiquetas
interface PrintPDFRequest {
  labels: ItemLabel[];
}
interface PrintPDFResponse {
  pdfUrl: string;
}

// POST /api/v1/labels/print-thermal
// Envia para impressora térmica
interface PrintThermalRequest {
  labels: ItemLabel[];
  printerName: string;
}

// === IMPORTAÇÃO EM LOTE ===

// POST /api/v1/bulk-import/upload
// Upload de arquivo para importação
interface BulkImportUploadRequest {
  file: File; // multipart/form-data
  entityType: 'PRODUCT' | 'VARIANT' | 'ITEM';
}
interface BulkImportUploadResponse {
  importId: string;
  validationResult: ValidationResult;
}

// GET /api/v1/bulk-import/:id
// Status da importação
interface BulkImportStatusResponse {
  import: BulkImport;
}

// POST /api/v1/bulk-import/:id/process
// Processar importação
interface ProcessImportRequest {
  importId: string;
}

// GET /api/v1/bulk-import/template/:entityType
// Baixar template Excel
interface DownloadTemplateResponse {
  fileUrl: string;
}

// === IMPORTAÇÃO NF-e ===

// POST /api/v1/nfe/upload
// Upload de XML NF-e
interface NFeUploadRequest {
  file: File; // XML
}
interface NFeUploadResponse {
  nfe: NFe;
}

// POST /api/v1/nfe/fetch-by-key
// Buscar NF-e por chave de acesso
interface NFeFetchRequest {
  accessKey: string;
}
interface NFeFetchResponse {
  nfe: NFe;
}

// POST /api/v1/nfe/:id/auto-match
// Equiparação automática
interface NFeAutoMatchRequest {
  nfeId: string;
}
interface NFeAutoMatchResponse {
  matches: MatchResult[];
}

// POST /api/v1/nfe/:id/manual-match
// Equiparação manual
interface NFeManualMatchRequest {
  nfeId: string;
  itemId: string;
  variantId: string;
}

// POST /api/v1/nfe/:id/import
// Importar para estoque
interface NFeImportRequest {
  nfeId: string;
  items: {
    itemId: string;
    variantId: string;
    locationId: string;
    batchNumber?: string;
    manufacturingDate?: Date;
  }[];
}
interface NFeImportResponse {
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  createdItems: Item[];
}

// === RELATÓRIOS ===

// GET /api/v1/reports/abc-curve
// Relatório Curva ABC
interface ABCCurveRequest {
  startDate: Date;
  endDate: Date;
  categoryId?: string;
}
interface ABCCurveResponse {
  report: ABCCurveReport;
}

// GET /api/v1/reports/stock
// Relatório de estoque
interface StockReportRequest {
  locationId?: string;
  categoryId?: string;
}
interface StockReportResponse {
  report: StockReport;
}

// GET /api/v1/reports/movements
// Relatório de movimentações
interface MovementReportRequest {
  startDate: Date;
  endDate: Date;
  movementType?: MovementType;
  userId?: string;
}
interface MovementReportResponse {
  report: MovementReport;
}

// GET /api/v1/reports/expiry
// Relatório de validade
interface ExpiryReportResponse {
  report: ExpiryReport;
}

// GET /api/v1/reports/turnover
// Relatório de giro de estoque
interface TurnoverReportRequest {
  startDate: Date;
  endDate: Date;
}
interface TurnoverReportResponse {
  report: StockTurnoverReport;
}
```

### 7.2 Endpoints Modificados

```typescript
// POST /api/v1/templates
// Adicionar unitOfMeasure obrigatório e careInstructions opcional
interface CreateTemplateRequest {
  name: string;
  unitOfMeasure: UnitOfMeasure; // ← NOVO OBRIGATÓRIO
  productAttributes?: Record<string, unknown>;
  variantAttributes?: Record<string, unknown>;
  itemAttributes?: Record<string, unknown>;
  careInstructions?: CareInstructions; // ← NOVO OPCIONAL
}

// POST /api/v1/products
// Remover unitOfMeasure, tornar code opcional
interface CreateProductRequest {
  name: string;
  code?: string; // ← OPCIONAL
  description?: string;
  // status: 'ACTIVE' por padrão no backend
  templateId: string;
  supplierId?: string;
  manufacturerId?: string;
  attributes?: Record<string, any>;
}

// POST /api/v1/variants
// Tornar sku opcional
interface CreateVariantRequest {
  productId: string;
  sku?: string; // ← OPCIONAL
  name: string;
  price: number;
  imageUrl?: string;
  attributes?: Record<string, unknown>;
  costPrice?: number;
  profitMargin?: number;
  barcode?: string;
  qrCode?: string;
  eanCode?: string;
  upcCode?: string;
}

// POST /api/v1/items/entry
// Simplificar campos
interface RegisterItemEntryRequest {
  variantId: string;
  locationId: string;
  uniqueCode?: string; // ← OPCIONAL - auto-gerado
  quantity: number; // ← Simplificado (initialQuantity = currentQuantity = quantity)
  batchNumber?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  attributes?: Record<string, any>;
}
```

---

## 8. Considerações Finais

### 8.1 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Breaking changes na migração | Alta | Alto | Script de migração robusto + rollback plan |
| Performance em importações grandes | Média | Médio | Fila de processamento + chunks |
| Matching NF-e incorreto | Alta | Alto | Revisão manual + threshold de confiança |
| Impressão térmica não funcionar | Média | Baixo | Manter PDF como alternativa |
| Dados de NF-e incompletos | Média | Médio | Validação robusta + fallbacks |

### 8.2 Testes Críticos

**Fase 1:**
- ✅ Migração de dados existentes
- ✅ Geração de códigos únicos
- ✅ Formulários simplificados funcionando

**Fase 2:**
- ✅ Geração de código de barras legível
- ✅ PDF imprimível em impressora comum
- ✅ Impressão térmica (se implementado)

**Fase 3:**
- ✅ Importação de 10.000+ linhas
- ✅ Tratamento de erros diversos
- ✅ Performance aceitável

**Fase 4:**
- ✅ Parse de NF-e de diversos fornecedores
- ✅ Matching com taxa de acerto > 70%
- ✅ Tratamento de NF-e mal formatadas

**Fase 5:**
- ✅ Cálculos corretos em todos os relatórios
- ✅ Performance com grande volume de dados
- ✅ Exportação de relatórios

### 8.3 Documentação Necessária

- [ ] Manual de migração (Fase 1)
- [ ] Guia de uso do sistema de etiquetas
- [ ] Tutorial de importação em lote
- [ ] Guia de importação NF-e
- [ ] Documentação de relatórios
- [ ] API Reference atualizada

### 8.4 Próximos Passos

1. **Aprovação do roadmap** - Revisar e aprovar o plano
2. **Setup do ambiente** - Configurar ferramentas e infraestrutura
3. **Iniciar Fase 1** - Começar pela reestruturação base
4. **Revisões semanais** - Acompanhar progresso e ajustar

---

## 📊 Resumo Executivo

**Situação Atual:**
- Sistema funcional com CRUD completo
- Hierarquia de dados estabelecida
- Sistema de movimentação operacional

**Gaps Identificados:**
- unitOfMeasure no lugar errado (Product → Template)
- Códigos obrigatórios (devem ser opcionais/auto-gerados)
- Falta sistema de etiquetas de conservação
- Sem importação em lote
- Sem importação por NF-e
- Sem relatórios gerenciais

**Solução Proposta:**
- 5 fases de implementação
- 12 semanas de desenvolvimento
- Breaking changes controlados com migração
- Funcionalidades incrementais

**Benefícios Esperados:**
- ✅ Cadastro 70% mais rápido (menos campos obrigatórios)
- ✅ Conformidade legal (etiquetas de conservação)
- ✅ Produtividade 10x na entrada (importação em lote)
- ✅ Automação de entrada (importação NF-e)
- ✅ Decisões baseadas em dados (relatórios)

**Investimento:**
- 2 desenvolvedores full-time
- 1 QA part-time
- Infraestrutura de filas
- Total: ~3 meses

---

**Documento gerado em:** 03/12/2025
**Responsável:** Sistema OpenSea OS
**Versão:** 1.0
