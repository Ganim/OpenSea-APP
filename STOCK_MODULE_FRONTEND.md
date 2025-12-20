# 📦 Módulo Stock - Guia de Implementação para Front-end

> **Versão**: 1.0.0  
> **Última Atualização**: 03 de Dezembro de 2025  
> **Tipo**: Documentação da API REST

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Entidades e Tipos](#entidades-e-tipos)
4. [Endpoints](#endpoints)
5. [Códigos de Erro](#códigos-de-erro)
6. [Exemplos de Requisição](#exemplos-de-requisição)
7. [Exemplos de Resposta](#exemplos-de-resposta)

---

## 🎯 Visão Geral

O módulo **Stock** gerencia:

- ✅ **Produtos** - Cadastro e gestão de produtos
- ✅ **Templates** - Modelos reutilizáveis para produtos (Novo: contém `unitOfMeasure`)
- ✅ **Variantes** - Variações de produtos (SKU opcional)
- ✅ **Itens** - Instâncias físicas de variantes em estoque
- ✅ **Locais** - Pontos de armazenamento
- ✅ **Fornecedores** - Suppliers com gestão de código sequencial
- ✅ **Fabricantes** - Manufacturers com códigos únicos
- ✅ **Categorias** - Classificação hierárquica
- ✅ **Tags** - Etiquetas para produtos
- ✅ **Movimentações** - Rastreamento de entrada/saída/transferência
- ✅ **Ordens de Compra** - Gestão de purchase orders

### 📌 Principais Mudanças (Fase 1)

| Campo | De | Para | Razão |
|-------|----|----|-------|
| `unitOfMeasure` | Produto | **Template** | Medida unificada para todos os produtos da linha |
| `code` | Obrigatório | **Opcional** | Geração automática via `sequentialCode` |
| `SKU` | Obrigatório | **Opcional** | Identificação flexível de variantes |
| `uniqueCode` | Obrigatório | **Opcional** | Auto-gerado como UUID se não fornecido |
| `locationId` | Obrigatório | **Opcional** | Itens sem localização fixa |

---

## 🔐 Autenticação

Todas as requisições **exceto** `/health` requerem:

```http
Authorization: Bearer <JWT_TOKEN>
```

**Roles Necessários**:
- `ADMIN` - Acesso total
- `MANAGER` - Gestão de estoque
- `USER` - Visualização

---

## 📊 Entidades e Tipos

### 1️⃣ Template (Nova estrutura)

```typescript
interface Template {
  id: string;                      // UUID
  name: string;                    // 1-128 caracteres
  description?: string;            // Opcional
  
  // Novo - Unidade de medida centralizada
  unitOfMeasure: "UNITS" | "KILOGRAMS" | "METERS";
  
  // Novo - Rótulo de cuidado (textil)
  careLabel?: {
    symbol: string;
    description: string;
    instructions: string[];
  };
  
  // Novo - Códigos sequenciais
  sequentialCode: number;          // Auto-increment
  fullCode: string;                // Formato: "TPL-00001"
  
  // Atributos de produto
  productAttributes: Record<string, "string" | "number" | "boolean">;
  
  // Atributos de item (opcional)
  itemAttributes?: Record<string, "string" | "number" | "boolean">;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
```

### 2️⃣ Product

```typescript
interface Product {
  id: string;                      // UUID
  name: string;                    // 1-200 caracteres
  code?: string;                   // Opcional (auto-gerado)
  fullCode?: string;               // "PRD-00001"
  sequentialCode?: number;
  description?: string;            // Máx 1000 caracteres
  
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
  
  // Referências
  templateId: string;              // UUID
  supplierId?: string;             // Opcional
  manufacturerId?: string;         // Opcional
  
  // Atributos customizados por template
  attributes: Record<string, any>;
  
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
```

### 3️⃣ Variant

```typescript
interface Variant {
  id: string;
  productId: string;
  
  // SKU agora é opcional
  sku?: string;                    // Máx 100 caracteres
  fullCode?: string;               // Auto-gerado
  sequentialCode?: number;
  
  name: string;
  price: number;                   // ≥ 0
  imageUrl?: string;               // URL válida
  
  // Códigos de barras
  barcode?: string;
  qrCode?: string;
  eanCode?: string;
  upcCode?: string;
  
  // Cores
  colorHex?: string;               // Ex: "#FF5733"
  colorPantone?: string;           // Ex: "Red 032 C"
  
  // Controle de estoque
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  
  // Custos
  costPrice?: number;
  profitMargin?: number;
  
  // Dados
  attributes: Record<string, any>;
  isActive: boolean;
  
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
```

### 4️⃣ Item

```typescript
interface Item {
  id: string;
  variantId: string;
  
  // Localização agora é opcional
  locationId?: string;
  
  // Códigos
  uniqueCode?: string;             // Auto-gerado como UUID se não fornecido
  fullCode?: string;
  sequentialCode?: number;
  
  // Quantidades
  initialQuantity: number;
  currentQuantity: number;
  
  // Custos
  unitCost?: number;
  totalCost?: number;
  
  // Status
  status: "AVAILABLE" | "RESERVED" | "SOLD" | "DAMAGED";
  
  // Datas
  entryDate: Date;
  manufacturingDate?: Date;
  expiryDate?: Date;
  
  // Atributos
  attributes: Record<string, any>;
  batchNumber?: string;
  
  // Dados de referência (leitura)
  productCode?: string;
  productName?: string;
  variantSku?: string;
  variantName?: string;
  
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
```

### 5️⃣ Location

```typescript
interface Location {
  id: string;
  code: string;                    // Máx 5 caracteres
  titulo: string;                  // Nome
  description?: string;
  
  type: "WAREHOUSE" | "STORE" | "TRANSIT" | "RETURN";
  
  // Endereço
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  
  // Referência
  parentLocationId?: string;       // Para sub-locais
  
  // Label (novo)
  label?: string;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
```

### 6️⃣ Supplier

```typescript
interface Supplier {
  id: string;
  name: string;
  cnpj: string;                    // Única
  
  // Código sequencial (novo)
  sequentialCode: number;
  
  email?: string;
  phone?: string;
  
  // Endereço
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  
  // Banco de dados
  bankCode?: string;
  accountNumber?: string;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
```

### 7️⃣ ItemMovement

```typescript
interface ItemMovement {
  id: string;
  itemId: string;
  userId: string;
  
  // Movimento
  quantity: number;
  quantityBefore?: number;
  quantityAfter?: number;
  
  movementType: "ENTRY" | "EXIT" | "TRANSFER" | "ADJUSTMENT";
  reasonCode?: string;
  
  // Referências
  destinationRef?: string;         // Para transferências
  salesOrderId?: string;           // Se de uma venda
  
  // Lote
  batchNumber?: string;
  notes?: string;
  approvedBy?: string;
  
  createdAt: Date;
}
```

### 8️⃣ Category

```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  
  parentId?: string;               // Para subcategorias
  
  displayOrder: number;
  isActive: boolean;
  
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
```

---

## 🌐 Endpoints

### 📦 Products

#### ✏️ CREATE - Criar Produto

```http
POST /api/v1/stock/products
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Camiseta Premium",
  "code": "CAM-001",              // Opcional
  "description": "Camiseta de alta qualidade",
  "status": "ACTIVE",              // Padrão: ACTIVE
  "templateId": "uuid-template",
  "supplierId": "uuid-supplier",   // Opcional
  "manufacturerId": "uuid-mfg",    // Opcional
  "attributes": {
    "size": "M",
    "material": "100% Algodão"
  }
}
```

**Resposta 201**:
```json
{
  "product": {
    "id": "uuid-product",
    "name": "Camiseta Premium",
    "code": "CAM-001",
    "fullCode": "PRD-00042",
    "sequentialCode": 42,
    "status": "ACTIVE",
    "templateId": "uuid-template",
    "attributes": {
      "size": "M",
      "material": "100% Algodão"
    },
    "createdAt": "2025-12-03T20:00:00Z"
  }
}
```

#### 📖 READ - Obter Produto

```http
GET /api/v1/stock/products/:id
Authorization: Bearer <TOKEN>
```

**Resposta 200**: [Igual ao CREATE]

#### 📋 LIST - Listar Produtos

```http
GET /api/v1/stock/products?page=1&limit=20&status=ACTIVE
Authorization: Bearer <TOKEN>
```

**Query Parameters**:
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 20)
- `status`: Filtrar por status
- `name`: Buscar por nome
- `templateId`: Filtrar por template

**Resposta 200**:
```json
{
  "products": [
    { /* ... */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### 🔄 UPDATE - Atualizar Produto

```http
PATCH /api/v1/stock/products/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "description": "Nova descrição",
  "status": "INACTIVE"
}
```

**Resposta 200**: [Igual ao CREATE]

#### 🗑️ DELETE - Deletar Produto

```http
DELETE /api/v1/stock/products/:id
Authorization: Bearer <TOKEN>
```

**Resposta 204**: Sem conteúdo

---

### 🎨 Templates

#### ✏️ CREATE - Criar Template

```http
POST /api/v1/stock/templates
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Camiseta Básica",
  "description": "Template para camisetas",
  
  // NOVO: Unidade de medida centralizada
  "unitOfMeasure": "UNITS",
  
  // NOVO: Rótulo de cuidado
  "careLabel": {
    "symbol": "30°C",
    "description": "Lavar em água fria",
    "instructions": [
      "Usar sabão neutro",
      "Não usar alvejante"
    ]
  },
  
  "productAttributes": {
    "size": "string",
    "material": "string",
    "color": "string"
  },
  
  "itemAttributes": {
    "batchNumber": "string",
    "lotNumber": "string"
  }
}
```

**Resposta 201**:
```json
{
  "template": {
    "id": "uuid-template",
    "name": "Camiseta Básica",
    "unitOfMeasure": "UNITS",
    "careLabel": {
      "symbol": "30°C",
      "description": "Lavar em água fria",
      "instructions": ["Usar sabão neutro", "Não usar alvejante"]
    },
    "sequentialCode": 5,
    "fullCode": "TPL-00005",
    "productAttributes": { /* ... */ },
    "isActive": true,
    "createdAt": "2025-12-03T20:00:00Z"
  }
}
```

#### 📖 READ - Obter Template

```http
GET /api/v1/stock/templates/:id
Authorization: Bearer <TOKEN>
```

#### 📋 LIST - Listar Templates

```http
GET /api/v1/stock/templates?page=1&limit=20
Authorization: Bearer <TOKEN>
```

#### 🔄 UPDATE - Atualizar Template

```http
PATCH /api/v1/stock/templates/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "unitOfMeasure": "KILOGRAMS",
  "productAttributes": {
    "size": "string",
    "weight": "number"
  }
}
```

#### 🗑️ DELETE - Deletar Template

```http
DELETE /api/v1/stock/templates/:id
Authorization: Bearer <TOKEN>
```

---

### 🎭 Variants

#### ✏️ CREATE - Criar Variante

```http
POST /api/v1/stock/variants
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "productId": "uuid-product",
  "sku": "CAM-001-M-RED",          // Opcional
  "name": "Camiseta M Vermelha",
  "price": 79.90,
  "costPrice": 35.00,
  "profitMargin": 128,
  
  // Códigos
  "barcode": "1234567890",
  "eanCode": "1234567890123",
  
  // Cores
  "colorHex": "#FF0000",
  "colorPantone": "Bright Red",
  
  // Estoque
  "minStock": 10,
  "maxStock": 500,
  "reorderPoint": 50,
  "reorderQuantity": 100,
  
  "isActive": true
}
```

**Resposta 201**:
```json
{
  "variant": {
    "id": "uuid-variant",
    "productId": "uuid-product",
    "sku": "CAM-001-M-RED",
    "fullCode": "VAR-00012",
    "sequentialCode": 12,
    "name": "Camiseta M Vermelha",
    "price": 79.90,
    "costPrice": 35.00,
    "profitMargin": 128,
    "barcode": "1234567890",
    "colorHex": "#FF0000",
    "minStock": 10,
    "maxStock": 500,
    "isActive": true,
    "createdAt": "2025-12-03T20:00:00Z"
  }
}
```

#### 📖 READ - Obter Variante

```http
GET /api/v1/stock/variants/:id
Authorization: Bearer <TOKEN>
```

#### 📋 LIST - Listar Variantes por Produto

```http
GET /api/v1/stock/products/:productId/variants
Authorization: Bearer <TOKEN>
```

**Resposta 200**:
```json
{
  "variants": [
    {
      "id": "uuid-variant",
      "productCode": "PRD-00001",
      "productName": "Camiseta Premium",
      "sku": "CAM-001-M-RED",
      "fullCode": "VAR-00012",
      "name": "Camiseta M Vermelha",
      "price": 79.90,
      "itemCount": 150,
      "totalCurrentQuantity": 150,
      "isActive": true
    }
  ]
}
```

#### 🔄 UPDATE - Atualizar Variante

```http
PATCH /api/v1/stock/variants/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "price": 89.90,
  "minStock": 20
}
```

#### 🗑️ DELETE - Deletar Variante (Soft Delete)

```http
DELETE /api/v1/stock/variants/:id
Authorization: Bearer <TOKEN>
```

---

### 📦 Items (Itens de Estoque)

#### ✏️ REGISTER ENTRY - Registrar Entrada

```http
POST /api/v1/stock/items/register-entry
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "variantId": "uuid-variant",
  "locationId": "uuid-location",     // Opcional
  "uniqueCode": "ITEM-2025-001",     // Opcional (auto-gerado)
  "quantity": 100,
  "unitCost": 35.00,
  
  "batchNumber": "LOTE-001-2025",
  "manufacturingDate": "2025-11-01",
  "expiryDate": "2027-11-01",
  
  "attributes": {
    "supplier": "Supplier A"
  }
}
```

**Resposta 201**:
```json
{
  "item": {
    "id": "uuid-item",
    "variantId": "uuid-variant",
    "locationId": "uuid-location",
    "uniqueCode": "550e8400-e29b-41d4-a716-446655440000",
    "fullCode": "ITM-00234",
    "sequentialCode": 234,
    "initialQuantity": 100,
    "currentQuantity": 100,
    "unitCost": 35.00,
    "totalCost": 3500.00,
    "status": "AVAILABLE",
    "entryDate": "2025-12-03T20:00:00Z",
    "batchNumber": "LOTE-001-2025",
    "manufacturingDate": "2025-11-01T00:00:00Z",
    "expiryDate": "2027-11-01T00:00:00Z",
    "productCode": "PRD-00001",
    "productName": "Camiseta Premium",
    "variantSku": "CAM-001-M-RED",
    "variantName": "Camiseta M Vermelha"
  },
  "movement": {
    "id": "uuid-movement",
    "itemId": "uuid-item",
    "userId": "uuid-user",
    "quantity": 100,
    "quantityBefore": 0,
    "quantityAfter": 100,
    "movementType": "INVENTORY_ADJUSTMENT",
    "reasonCode": "ENTRY",
    "createdAt": "2025-12-03T20:00:00Z"
  }
}
```

#### ✏️ REGISTER EXIT - Registrar Saída

```http
POST /api/v1/stock/items/register-exit
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "itemId": "uuid-item",
  "quantity": 10,
  "reasonCode": "SALE",
  "salesOrderId": "uuid-order",      // Opcional
  "notes": "Venda para cliente X"
}
```

**Resposta 201**: [Estrutura Similar ao ENTRY]

#### 🔄 TRANSFER - Transferir Item

```http
POST /api/v1/stock/items/:id/transfer
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "destinationLocationId": "uuid-location-dest",
  "reasonCode": "RELOCATION",
  "notes": "Transferência entre armazéns"
}
```

**Resposta 200**:
```json
{
  "item": { /* ... */ },
  "movement": { /* ... */ }
}
```

#### 📖 READ - Obter Item

```http
GET /api/v1/stock/items/:id
Authorization: Bearer <TOKEN>
```

#### 📋 LIST - Listar Itens

```http
GET /api/v1/stock/items?page=1&limit=20&variantId=uuid&status=AVAILABLE
Authorization: Bearer <TOKEN>
```

**Query Parameters**:
- `page`, `limit`: Paginação
- `variantId`: Filtrar por variante
- `locationId`: Filtrar por local
- `status`: Filtrar por status
- `batchNumber`: Filtrar por lote

---

### 📍 Locations

#### ✏️ CREATE - Criar Local

```http
POST /api/v1/stock/locations
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "code": "WH-A",                  // Máx 5 caracteres
  "titulo": "Warehouse Principal",
  "type": "WAREHOUSE",
  "address": "Rua X, 123",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brazil",
  "zipCode": "01000-000",
  "label": "Prateleira A"           // Novo
}
```

**Resposta 201**:
```json
{
  "location": {
    "id": "uuid-location",
    "code": "WH-A",
    "titulo": "Warehouse Principal",
    "type": "WAREHOUSE",
    "address": "Rua X, 123",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brazil",
    "zipCode": "01000-000",
    "label": "Prateleira A",
    "isActive": true,
    "createdAt": "2025-12-03T20:00:00Z"
  }
}
```

#### 📖 READ - Obter Local

```http
GET /api/v1/stock/locations/:id
Authorization: Bearer <TOKEN>
```

#### 📋 LIST - Listar Locais

```http
GET /api/v1/stock/locations?page=1&limit=20&type=WAREHOUSE
Authorization: Bearer <TOKEN>
```

#### 🔄 UPDATE - Atualizar Local

```http
PATCH /api/v1/stock/locations/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "titulo": "Warehouse Secundário",
  "label": "Prateleira B"
}
```

#### 🗑️ DELETE - Deletar Local

```http
DELETE /api/v1/stock/locations/:id
Authorization: Bearer <TOKEN>
```

---

### 👥 Suppliers

#### ✏️ CREATE - Criar Fornecedor

```http
POST /api/v1/stock/suppliers
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Supplier A LTDA",
  "cnpj": "12.345.678/0001-90",
  "email": "contato@suppliera.com",
  "phone": "+55 11 3000-0000",
  "address": "Rua Y, 456",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brazil"
}
```

**Resposta 201**:
```json
{
  "supplier": {
    "id": "uuid-supplier",
    "name": "Supplier A LTDA",
    "cnpj": "12.345.678/0001-90",
    "sequentialCode": 1,           // Novo
    "email": "contato@suppliera.com",
    "phone": "+55 11 3000-0000",
    "address": "Rua Y, 456",
    "isActive": true,
    "createdAt": "2025-12-03T20:00:00Z"
  }
}
```

#### 📋 LIST - Listar Fornecedores

```http
GET /api/v1/stock/suppliers?page=1&limit=20
Authorization: Bearer <TOKEN>
```

---

### 🏭 Manufacturers

#### ✏️ CREATE - Criar Fabricante

```http
POST /api/v1/stock/manufacturers
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Manufacturer XYZ",
  "country": "Brazil",
  "email": "info@mfg.com"
}
```

**Resposta 201**:
```json
{
  "manufacturer": {
    "id": "uuid-mfg",
    "name": "Manufacturer XYZ",
    "country": "Brazil",
    "sequentialCode": 1,           // Novo
    "email": "info@mfg.com",
    "isActive": true,
    "createdAt": "2025-12-03T20:00:00Z"
  }
}
```

---

### 📊 Item Movements

#### 📋 LIST - Listar Movimentações

```http
GET /api/v1/stock/items/:itemId/movements?page=1&limit=20
Authorization: Bearer <TOKEN>
```

**Resposta 200**:
```json
{
  "movements": [
    {
      "id": "uuid-movement-1",
      "itemId": "uuid-item",
      "userId": "uuid-user",
      "quantity": 100,
      "quantityBefore": 0,
      "quantityAfter": 100,
      "movementType": "ENTRY",
      "reasonCode": "PURCHASE",
      "batchNumber": "LOTE-001",
      "createdAt": "2025-12-03T20:00:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

## ❌ Códigos de Erro

### 4xx - Erros do Cliente

| Código | Mensagem | Causa |
|--------|----------|-------|
| **400** | `"Name is required"` | Campo obrigatório faltando |
| **400** | `"Code must be at most 50 characters long"` | Campo excede limite |
| **400** | `"Invalid status"` | Status não reconhecido |
| **400** | `"Product with this name already exists"` | Duplicata de nome |
| **400** | `"CNPJ already exists"` | CNPJ duplicado |
| **400** | `"Invalid attributes"` | Atributos não definidos no template |
| **400** | `"Duplicate unique code"` | Código único já existe |
| **400** | `"Quantity must be greater than 0"` | Quantidade inválida |
| **400** | `"Manufacturing date must be before expiry date"` | Datas inconsistentes |
| **400** | `"Expiry date cannot be in the past"` | Data expirada |
| **401** | `"Unauthorized"` | Token inválido/ausente |
| **403** | `"Forbidden"` | Permissões insuficientes |
| **404** | `"Product not found"` | Recurso não encontrado |
| **404** | `"Template not found"` | Template não existe |
| **404** | `"Variant not found"` | Variante não existe |
| **404** | `"Item not found"` | Item não existe |
| **404** | `"Location not found"` | Local não existe |
| **404** | `"Supplier not found"` | Fornecedor não existe |

### 5xx - Erros do Servidor

| Código | Mensagem | Causa |
|--------|----------|-------|
| **500** | `"Internal server error"` | Erro não tratado |
| **500** | `"Database error"` | Falha na conexão/transação |

---

## 📝 Exemplos de Requisição

### Exemplo 1: Fluxo Completo de Produto

```typescript
// 1. Criar template
const templateRes = await fetch('/api/v1/stock/templates', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Camiseta',
    unitOfMeasure: 'UNITS',
    productAttributes: { size: 'string', color: 'string' }
  })
});
const { template } = await templateRes.json();

// 2. Criar produto
const productRes = await fetch('/api/v1/stock/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Camiseta Premium',
    templateId: template.id,
    attributes: { size: 'M', color: 'Azul' }
  })
});
const { product } = await productRes.json();

// 3. Criar variante
const variantRes = await fetch('/api/v1/stock/variants', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productId: product.id,
    name: 'Camiseta M Azul',
    price: 79.90,
    sku: 'CAM-M-BLUE'
  })
});
const { variant } = await variantRes.json();

// 4. Registrar entrada
const itemRes = await fetch('/api/v1/stock/items/register-entry', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    variantId: variant.id,
    locationId: location.id,
    quantity: 100,
    unitCost: 35.00
  })
});
const { item } = await itemRes.json();
```

### Exemplo 2: Busca com Filtros

```typescript
// Listar produtos ativos de um template específico
const response = await fetch(
  '/api/v1/stock/products?status=ACTIVE&templateId=uuid&page=1&limit=50',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const { products, pagination } = await response.json();

console.log(`Total: ${pagination.total} produtos`);
console.log(`Página ${pagination.page} de ${pagination.totalPages}`);
```

### Exemplo 3: Transferência de Item

```typescript
const transferRes = await fetch('/api/v1/stock/items/uuid-item/transfer', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    destinationLocationId: 'uuid-new-location',
    reasonCode: 'RELOCATION',
    notes: 'Transferência para armazém secundário'
  })
});
const { item, movement } = await transferRes.json();
```

---

## 📤 Exemplos de Resposta

### Resposta de Erro (400)

```json
{
  "message": "Product with this name already exists",
  "statusCode": 400,
  "timestamp": "2025-12-03T20:00:00Z",
  "path": "/api/v1/stock/products"
}
```

### Resposta de Sucesso com Paginação (200)

```json
{
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Camiseta Premium",
      "code": "CAM-001",
      "status": "ACTIVE",
      "templateId": "550e8400-e29b-41d4-a716-446655440001",
      "createdAt": "2025-12-03T20:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 🔗 Relacionamentos

```
Template
  ├── unitOfMeasure (novo)
  ├── careLabel (novo)
  └── productAttributes

  └─→ Product
        ├── code (opcional)
        ├── fullCode
        ├── sequentialCode
        ├── supplierId → Supplier
        └── manufacturerId → Manufacturer
        
        └─→ Variant
              ├── sku (opcional)
              ├── fullCode
              └── sequentialCode
              
              └─→ Item
                    ├── uniqueCode (opcional, auto-gerado)
                    ├── fullCode
                    ├── sequentialCode
                    ├── locationId → Location
                    └── ItemMovement[]
```

---

## 🚀 Boas Práticas

1. **Sempre validar templates antes de criar produtos**
2. **Use locationId apenas quando realmente necessário**
3. **Aproveite a geração automática de códigos (não force IDs)**
4. **Sincronize unitOfMeasure via Template, não via Product**
5. **Implemente cache para Templates (não mudam frequentemente)**
6. **Validate careLabelInfo para produtos têxteis**
7. **Use sequentialCode para relatórios e reconciliação**

---

## 📞 Suporte

Para dúvidas, consulte:
- **Documentação Técnica**: `/docs/STOCK_MODULE_IMPLEMENTATION.md`
- **Schemas Zod**: `/src/http/schemas/stock.schema.ts`
- **Entidades**: `/src/entities/stock/`

---

**Última Atualização**: 03/12/2025  
**Versão da API**: v1.0.0  
**Status**: ✅ Produção
