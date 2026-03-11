# Module: Stock (Frontend)

## Overview

O módulo de Estoque é o núcleo operacional do OpenSea-APP. Ele oferece uma interface completa para gestão de catálogo de produtos, rastreamento físico de itens em armazéns, movimentações de entrada e saída, ordens de compra, inventário cíclico, geração de etiquetas e análise de desempenho do estoque.

O módulo está organizado sob o route group `(dashboard)/(modules)/stock` e se integra também ao route group `(dashboard)/(actions)` para funcionalidades de importação e ao route group `(dashboard)/(actions)/print` para o Label Studio.

**Dependências com outros módulos:**

- `hr/` — Empresas (fornecedores, fabricantes podem ter CNPJ consultado via BrasilAPI)
- `finance/` — Ordens de compra geram lançamentos financeiros; fornecedores são compartilhados
- `sales/` — Saídas por venda (`MovementType.SALE`) são geradas pelo módulo de vendas
- `admin/` — Permissões RBAC controlam quais seções cada usuário acessa

---

## Route Structure

### Route Tree

```
/stock                                          # Landing page — painel de navegação com contadores reais
/stock/overview/list                            # Estoque Geral — tabela virtualizada com colunas dinâmicas
/stock/overview/movements                       # Histórico de movimentações com filtros e aprovação
/stock/actions/quick-scan                       # Leitor de código de barras/QR (5 modos de operação)
/stock/actions/volumes                          # Gestão de volumes de expedição
/stock/actions/volumes/[id]                     # Detalhe de um volume (romaneio, itens, status)
/stock/products                                 # Lista de produtos (grid/lista, filtros URL, seleção em lote)
/stock/products/[id]                            # Detalhe de produto (abas: variantes, itens, histórico)
/stock/products/[id]/edit                       # Edição completa de produto
/stock/products/workspace                       # Workspace unificado (árvore hierárquica + painel de detalhe)
/stock/templates                                # Lista de templates de produto
/stock/templates/[id]                           # Detalhe de template (atributos por nível)
/stock/templates/[id]/edit                      # Edição de template (atributos dinâmicos)
/stock/manufacturers                            # Lista de fabricantes
/stock/manufacturers/[id]                       # Detalhe de fabricante (endereço, CNPJ, produtos)
/stock/manufacturers/[id]/edit                  # Edição de fabricante
/stock/locations                                # Lista de armazéns
/stock/locations/[warehouseId]                  # Detalhe do armazém (zonas)
/stock/locations/[warehouseId]/zones/[zoneId]   # Visão geral de zona
/stock/locations/[warehouseId]/zones/[zoneId]/layout    # Editor visual de layout da zona
/stock/locations/[warehouseId]/zones/[zoneId]/structure # Wizard de criação de estrutura de bins
/stock/locations/labels                         # Gerador de etiquetas de bins (PDF via react-pdf)
/stock/product-categories                       # Lista de categorias (reordenação drag-and-drop)
/stock/product-categories/[id]                  # Detalhe de categoria (subcategorias, produtos)
/stock/product-categories/[id]/edit             # Edição de categoria
/stock/requests/purchase-orders                 # Lista de ordens de compra
/import/stock/products/home                     # Hub de importação de produtos
/import/stock/products                          # Importação simples de produtos (planilha)
/import/stock/variants                          # Importação de variantes (planilha)
/import/stock/items                             # Importação de itens (planilha)
/import/stock/product-categories               # Importação de categorias
/import/stock/manufacturers                    # Importação de fabricantes
/import/catalog                                 # Wizard unificado (produtos + variantes em uma planilha)
/print/studio                                   # Label Studio — lista de templates de etiqueta
/print/studio/label/[id]                        # Visualização de template de etiqueta
/print/studio/label/[id]/edit                   # Editor de etiqueta (drag-and-drop)
```

### Layout Hierarchy

```
(dashboard)/layout.tsx          # Navbar principal + NavigationMenu
  └── (modules)/stock/page.tsx  # Landing page de Estoque
  └── Páginas de entidades       # PageLayout > PageHeader > PageBody
```

Todas as páginas do módulo usam o padrão de layout `PageLayout / PageHeader / PageBody / PageActionBar` com breadcrumbs próprios.

---

## Page Structure

### Component Tree por Página

#### `/stock` — Landing Page

```
StockLandingPage
  ├── PageActionBar              # Botões: "Importação", "Ordens de Compra"
  ├── PageHeroBanner             # Banner com botões: "Consultar Estoque", "Consultar Movimentações"
  └── PageDashboardSections      # Seção "Cadastros" com cards: Templates, Produtos, Fabricantes, Localizações, Categorias
```

Os contadores de cada card são carregados via `Promise.allSettled()` paralelo na montagem da página, consultando diretamente os services de stock.

#### `/stock/products` — Lista de Produtos

```
ProductsPage (Suspense)
  └── ProductsPageContent
      ├── CoreProvider (namespace: "products")
      ├── PageLayout
      │   ├── PageActionBar      # Breadcrumb + botões Importar/Novo Produto
      │   ├── SearchBar          # Busca client-side (nome, código, descrição)
      │   ├── EntityGrid         # Grid ou lista, com toolbar de filtros URL
      │   │   ├── FilterDropdown (Template)
      │   │   ├── FilterDropdown (Fabricante)
      │   │   └── FilterDropdown (Categoria) — inclui opção "Sem categoria"
      │   └── SelectionToolbar   # Aparece quando há itens selecionados
      ├── Dialog (Create)        # Modal com CreateProductForm
      ├── Dialog (Edit)          # Modal com EditProductForm
      ├── VerifyActionPinModal   # Confirmação de exclusão com PIN
      ├── RenameProductModal     # Renomear produto (context menu)
      ├── AssignCategoryModal    # Atribuir categoria em lote
      ├── AssignManufacturerModal # Atribuir fabricante em lote
      └── ProductVariantsItemsModal # Modal de duas colunas: variantes + itens
```

Os filtros de Template, Fabricante e Categoria usam a URL como estado (`?template=id1,id2&manufacturer=id&category=id`). Os filtros são interdependentes: ao selecionar um fabricante, apenas os templates presentes nos produtos desse fabricante são exibidos como opções.

#### `/stock/overview/list` — Estoque Geral

```
StockOverviewListPage
  ├── PageActionBar              # Botões: Imprimir (todos), Atualizar
  ├── SearchBar                  # Busca: código, produto, fabricante, localização, lote
  ├── FilterDropdown (Fabricante)
  ├── FilterDropdown (Zona)
  ├── FilterDropdown (Localização/Bin)
  ├── Switch "Ocultar saídas"
  ├── FilterDropdown (Colunas)   # Seleção de colunas visíveis
  └── Tabela virtualizada (TanStack Virtual)
      ├── Colunas fixas: Cor, Item
      ├── Colunas opcionais: Fabricante, Localização, Quantidade
      └── Colunas dinâmicas: atributos do Template (enableView=true)
```

A tabela utiliza `useVirtualizer` do TanStack Virtual para renderização eficiente de grandes listas. Duplo clique em uma linha abre o `ItemHistoryModal`. Clique simples seleciona o item; a barra de seleção flutuante exibe totais por unidade de medida e permite imprimir a seleção via janela nativa do navegador.

#### `/stock/products/workspace` — Workspace de Produtos

```
ProductWorkspacePage
  └── ProductWorkspace
      ├── HierarchyTree          # Árvore lateral: Template > Produto > Variante
      ├── DetailPanel            # Painel central: detalhes e itens da entidade selecionada
      ├── InlineVariantCreator   # Criação inline de variante na árvore
      ├── BatchVariantCreator    # Criação em lote de variantes por atributos
      ├── QuickAddModal          # 3 cliques: Template > Nome > Criar
      ├── QuickStockEntry        # Entrada rápida de estoque
      └── useKeyboardShortcuts   # Atalhos de teclado (n=novo, e=editar, del=excluir)
```

O Workspace é uma interface avançada para usuários que precisam criar e gerenciar produtos em alta velocidade. A árvore hierárquica exibe todos os templates com seus produtos e variantes aninhados.

#### `/stock/locations/[warehouseId]/zones/[zoneId]/structure` — Wizard de Estrutura

```
StructureWizardPage
  └── StructureWizard
      ├── StepAisles             # Definição do número de corredores
      ├── StepDimensions         # Dimensões: prateleiras e posições
      ├── StepCodePattern        # Padrão de código dos bins (ex: FAB-EST-{aisle}-{shelf}-{pos})
      ├── StepPreview            # Pré-visualização dos bins gerados
      └── StepConfirm            # Confirmação e criação em lote
```

---

## Types

Todos os tipos de stock estão em `src/types/stock/` com barrel re-export via `src/types/stock/index.ts`.

### product.types.ts

| Interface/Type              | Descrição                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `ProductStatus`             | `DRAFT`, `ACTIVE`, `INACTIVE`, `DISCONTINUED`, `OUT_OF_STOCK`                                            |
| `PRODUCT_STATUS_LABELS`     | Mapa para labels em PT-BR                                                                                |
| `Product`                   | Entidade completa com relações expandidas (template, supplier, manufacturer, variants, categories, tags) |
| `CreateProductRequest`      | Criação: name, templateId, description?, supplierId?, manufacturerId?, attributes?                       |
| `UpdateProductRequest`      | Atualização parcial: inclui status, outOfLine, categoryIds                                               |
| `ProductsQuery`             | Filtros: templateId, categoryId, status, search, manufacturerId, supplierId + paginação                  |
| `PaginatedProductsResponse` | `{ products, pagination }`                                                                               |

Observação: `fullCode` e `sequentialCode` são gerados pelo backend e não devem ser enviados na criação.

### variant.types.ts

| Interface/Type         | Descrição                                                                                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Variant`              | Variante completa com campos de cor (colorHex, colorPantone), códigos (barcode, qrCode, eanCode, upcCode), controle de estoque (minStock, maxStock, reorderPoint, reorderQuantity) |
| `CreateVariantRequest` | Criação com todos os campos opcionais exceto name (obrigatório)                                                                                                                    |
| `UpdateVariantRequest` | Atualização parcial                                                                                                                                                                |
| `VariantWithCost`      | Extende Variant com averageCost, lastCost, totalCostValue, totalQuantity                                                                                                           |
| `VariantStockSummary`  | Totais de estoque: available, reserved, averageCost, totalValue                                                                                                                    |

### item.types.ts

| Interface/Type             | Descrição                                                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ItemStatus`               | `AVAILABLE`, `RESERVED`, `IN_TRANSIT`, `DAMAGED`, `EXPIRED`, `DISPOSED`                                                                                    |
| `MovementType`             | 10 tipos: `PURCHASE`, `CUSTOMER_RETURN`, `SALE`, `PRODUCTION`, `SAMPLE`, `LOSS`, `SUPPLIER_RETURN`, `TRANSFER`, `INVENTORY_ADJUSTMENT`, `ZONE_RECONFIGURE` |
| `Item`                     | Item físico com endereçamento: binId, resolvedAddress, lastKnownAddress; dados desnormalizados de produto/variante                                         |
| `ItemLabelData`            | Dados completos para impressão de etiqueta (item + variante + produto + fabricante + fornecedor + template + localização + tenant)                         |
| `RegisterItemEntryRequest` | Entrada: variantId, quantity, binId?, movementType?, unitCost?, batchNumber?, expiryDate?                                                                  |
| `RegisterItemExitRequest`  | Saída: itemId, quantity, movementType (ExitMovementType), reasonCode?, notes?                                                                              |
| `TransferItemRequest`      | Transferência: itemId, destinationBinId, notes?                                                                                                            |
| `ItemMovement`             | Registro de movimentação com quantityBefore/quantityAfter                                                                                                  |
| `ItemMovementExtended`     | Movimentação com workflow de aprovação: status, approver, invoice fields                                                                                   |
| `BatchEntryRequest`        | Entrada em lote com dados comuns (nota fiscal)                                                                                                             |
| `MovementHistoryQuery`     | Filtros por produto, variante, item, localização, tipo, status, período                                                                                    |

### warehouse.types.ts

| Interface/Type | Descrição                                                                               |
| -------------- | --------------------------------------------------------------------------------------- |
| `LocationType` | `WAREHOUSE`, `ZONE`, `AISLE`, `RACK`, `SHELF`, `BIN`, `FLOOR`, `ROOM`, `OTHER` (legado) |
| `Location`     | Localização legada — marcada como `@deprecated`. Usar hierarquia Warehouse > Zone > Bin |

O sistema atual utiliza APIs específicas de Warehouse, Zone e Bin (com hooks em `use-stock-other.ts`), não mais a `Location` genérica.

### template.types.ts

| Interface/Type          | Descrição                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `TemplateAttributeType` | `string`, `number`, `boolean`, `date`, `select`                                                                                  |
| `TemplateAttribute`     | Definição de atributo: type, label, required, defaultValue, unitOfMeasure, mask, placeholder, enablePrint, enableView, options[] |
| `TemplateAttributes`    | `Record<string, TemplateAttribute>` — chave é o slug do atributo                                                                 |
| `UnitOfMeasure`         | `METERS`, `KILOGRAMS`, `UNITS`                                                                                                   |
| `Template`              | Template de produto com productAttributes, variantAttributes, itemAttributes e careLabel                                         |
| `TemplateRequest`       | Solicitação de novo template pelo usuário (workflow de aprovação)                                                                |

### volume.types.ts

| Interface/Type          | Descrição                                                              |
| ----------------------- | ---------------------------------------------------------------------- |
| `VolumeStatus`          | `OPEN`, `CLOSED`, `DELIVERED`, `RETURNED`                              |
| `SerializedLabelStatus` | `AVAILABLE`, `USED`, `VOIDED`                                          |
| `ScanEntityType`        | `ITEM`, `VARIANT`, `PRODUCT`, `LOCATION`, `VOLUME`, `LABEL`            |
| `Volume`                | Volume de expedição com itens agrupados e romaneio                     |
| `SerializedLabel`       | Etiqueta serializada com código único, vinculada a entidade do sistema |

### analytics.types.ts

| Interface/Type     | Descrição                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| `StockSummary`     | totais (products, variants, items, value), byWarehouse[], byCategory[], lowStockAlerts[]                  |
| `MovementsSummary` | período, entradas/saídas/transferências/ajustes, byDay[]                                                  |
| `DashboardData`    | Dados completos do dashboard: stockSummary, movementsSummary, recentMovements, pendingApprovals, alerts[] |

### inventory.types.ts

| Interface/Type         | Descrição                                                                |
| ---------------------- | ------------------------------------------------------------------------ |
| `InventoryCycleStatus` | `DRAFT`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`                         |
| `InventoryCountStatus` | `PENDING`, `COUNTED`, `ADJUSTED`, `VERIFIED`                             |
| `InventoryCycle`       | Ciclo de inventário com progresso (totalBins, countedBins, adjustedBins) |
| `InventoryCount`       | Contagem de um bin: expectedQuantity, countedQuantity, variance          |

### care.types.ts

| Interface/Type | Descrição                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `CareLabel`    | Instruções de conservação por campo (washing, drying, ironing, bleaching, dryClean, composition) — segue NBR 16365:2015 / ISO 3758 |
| `CareOption`   | Ícone de cuidado: id, code, category, assetPath, label                                                                             |
| `CareCategory` | `WASH`, `BLEACH`, `DRY`, `IRON`, `PROFESSIONAL`                                                                                    |

### import.types.ts

| Interface/Type           | Descrição                                                                   |
| ------------------------ | --------------------------------------------------------------------------- |
| `ImportStatus`           | `VALIDATING`, `VALIDATED`, `IMPORTING`, `COMPLETED`, `FAILED`               |
| `ImportValidationResult` | Resultado de validação com erros e warnings por linha                       |
| `ImportRequest`          | Requisição de importação com opções: skipDuplicates, updateExisting, dryRun |
| `ImportResult`           | Resultado: importedRows, skippedRows, failedRows, createdIds[]              |

### scan.types.ts

| Interface/Type | Descrição                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| `ScanRequest`  | Código + contexto: `ENTRY`, `EXIT`, `TRANSFER`, `INFO`, `INVENTORY`                                     |
| `ScanResult`   | Entidade identificada (Item, Variant, Product, Location, Volume ou SerializedLabel) + sugestões de ação |

### label.types.ts

| Interface/Type         | Descrição                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `GenerateLabelRequest` | entityType, entityIds[], labelType (QR/BARCODE/COMBINED), format (PDF/PNG/ZPL), options |

### Sincronização com Backend

| Arquivo                   | Backend Schema                         | Sincronizado?           |
| ------------------------- | -------------------------------------- | ----------------------- |
| `product.types.ts`        | `product.schema.ts`                    | Sim                     |
| `variant.types.ts`        | `variant.schema.ts`                    | Sim                     |
| `item.types.ts`           | `item.schema.ts`                       | Sim                     |
| `warehouse.types.ts`      | legado — hierarquia de bins não tipada | Parcial                 |
| `template.types.ts`       | `template.schema.ts`                   | Sim                     |
| `purchase-order.types.ts` | `purchase-order.schema.ts`             | Sim (datas como string) |
| `analytics.types.ts`      | endpoints de analytics                 | Sim                     |
| `inventory.types.ts`      | `inventory-cycle.schema.ts`            | Sim                     |
| `care.types.ts`           | `care-label.schema.ts`                 | Sim                     |

---

## Hooks

Todos os hooks de stock estão em `src/hooks/stock/` com barrel via `src/hooks/stock/index.ts`.

### Hooks de Produtos

| Hook                           | Query Key                          | Endpoint                  | Notas                                            |
| ------------------------------ | ---------------------------------- | ------------------------- | ------------------------------------------------ |
| `useProducts()`                | `['products']`                     | `GET /v1/products`        | Lista completa (legacy)                          |
| `useProductsPaginated(query?)` | `['products', 'paginated', query]` | `GET /v1/products`        | Com paginação, `keepPreviousData`, staleTime 30s |
| `useProduct(id)`               | `['products', id]`                 | `GET /v1/products/:id`    | Ativado quando id presente                       |
| `useCreateProduct()`           | —                                  | `POST /v1/products`       | Invalida `['products']`                          |
| `useUpdateProduct()`           | —                                  | `PATCH /v1/products/:id`  | Invalida lista e item                            |
| `useDeleteProduct()`           | —                                  | `DELETE /v1/products/:id` | Invalida lista                                   |

### Hooks de Variantes

| Hook                            | Query Key                            | Endpoint                      | Notas                                       |
| ------------------------------- | ------------------------------------ | ----------------------------- | ------------------------------------------- |
| `useVariants()`                 | `['variants']`                       | `GET /v1/variants`            | Lista completa (legacy)                     |
| `useVariantsPaginated(query?)`  | `['variants', 'paginated', query]`   | `GET /v1/variants`            | Com paginação                               |
| `useProductVariants(productId)` | `['variants', 'product', productId]` | `GET /v1/variants?productId=` | staleTime=0, refetchOnMount=true            |
| `useVariant(id)`                | `['variants', id]`                   | `GET /v1/variants/:id`        | —                                           |
| `useCreateVariant()`            | —                                    | `POST /v1/variants`           | Invalida lista e variantes do produto       |
| `useUpdateVariant()`            | —                                    | `PATCH /v1/variants/:id`      | Invalida por productId extraído da resposta |
| `useDeleteVariant()`            | —                                    | `DELETE /v1/variants/:id`     | Aceita string ou `{ id, productId }`        |

### Hooks de Itens

| Hook                         | Query Key                         | Endpoint                   | Notas                      |
| ---------------------------- | --------------------------------- | -------------------------- | -------------------------- |
| `useItems()`                 | `['items']`                       | `GET /v1/items`            | Lista completa             |
| `useItemsPaginated(query?)`  | `['items', 'paginated', query]`   | `GET /v1/items`            | Com paginação              |
| `useVariantItems(variantId)` | `['items', 'variant', variantId]` | `GET /v1/items?variantId=` | —                          |
| `useItem(id)`                | `['items', id]`                   | `GET /v1/items/:id`        | —                          |
| `useRegisterItemEntry()`     | —                                 | `POST /v1/items/entry`     | Invalida items e movements |
| `useRegisterItemExit()`      | —                                 | `POST /v1/items/exit`      | Invalida items e movements |
| `useTransferItem()`          | —                                 | `POST /v1/items/transfer`  | Invalida items e movements |
| `useItemMovements(query?)`   | `['item-movements', query?]`      | `GET /v1/item-movements`   | —                          |

### Hooks de Movimentações

| Hook                             | Query Key                             | Endpoint                             | Notas                     |
| -------------------------------- | ------------------------------------- | ------------------------------------ | ------------------------- |
| `useMovements(query?)`           | `['movements', query]`                | `GET /v1/item-movements`             | —                         |
| `useMovementHistory(query?)`     | `['movements', 'history', query]`     | `GET /v1/movements/history`          | —                         |
| `useProductMovements(productId)` | `['movements', 'product', productId]` | `GET /v1/products/:id/movements`     | —                         |
| `useVariantMovements(variantId)` | `['movements', 'variant', variantId]` | `GET /v1/variants/:id/movements`     | —                         |
| `useBinMovements(binId)`         | `['movements', 'bin', binId]`         | `GET /v1/bins/:id/movements`         | —                         |
| `usePendingApprovals()`          | `['movements', 'pending-approvals']`  | `GET /v1/movements/pending-approval` | refetchInterval 2 min     |
| `useApproveMovement()`           | —                                     | `POST /v1/movements/:id/approve`     | Invalida items e variants |
| `useRejectMovement()`            | —                                     | `POST /v1/movements/:id/reject`      | —                         |
| `useBatchApproveMovements()`     | —                                     | `POST /v1/movements/approve/batch`   | —                         |

### Hooks de Ordens de Compra

| Hook                             | Query Key                            | Endpoint                               | Notas                                   |
| -------------------------------- | ------------------------------------ | -------------------------------------- | --------------------------------------- |
| `usePurchaseOrders(query?)`      | `['purchase-orders', 'list', query]` | `GET /v1/purchase-orders`              | keepPreviousData                        |
| `usePurchaseOrder(id)`           | `['purchase-orders', id]`            | `GET /v1/purchase-orders/:id`          | —                                       |
| `useCreatePurchaseOrder()`       | —                                    | `POST /v1/purchase-orders`             | —                                       |
| `useUpdatePurchaseOrderStatus()` | —                                    | `PATCH /v1/purchase-orders/:id/status` | —                                       |
| `useCancelPurchaseOrder()`       | —                                    | `POST /v1/purchase-orders/:id/cancel`  | —                                       |
| `useReceivePurchaseOrder()`      | —                                    | `POST /v1/purchase-orders/:id/receive` | Invalida items (criados no recebimento) |

### Hooks de Volumes

| Hook                        | Query Key                     | Endpoint                               | Notas                               |
| --------------------------- | ----------------------------- | -------------------------------------- | ----------------------------------- |
| `useVolumes(query?)`        | `['volumes', query]`          | `GET /v1/volumes`                      | —                                   |
| `useVolume(id)`             | `['volumes', id]`             | `GET /v1/volumes/:id`                  | —                                   |
| `useVolumeRomaneio(id)`     | `['volumes', id, 'romaneio']` | `GET /v1/volumes/:id/romaneio`         | —                                   |
| `useCreateVolume()`         | —                             | `POST /v1/volumes`                     | —                                   |
| `useAddItemToVolume()`      | —                             | `POST /v1/volumes/:id/items`           | Invalida items                      |
| `useRemoveItemFromVolume()` | —                             | `DELETE /v1/volumes/:id/items/:itemId` | Invalida items                      |
| `useCloseVolume()`          | —                             | `POST /v1/volumes/:id/close`           | Invalida movements                  |
| `useReopenVolume()`         | —                             | `POST /v1/volumes/:id/reopen`          | —                                   |
| `useDeliverVolume()`        | —                             | `POST /v1/volumes/:id/deliver`         | —                                   |
| `useReturnVolume()`         | —                             | `POST /v1/volumes/:id/return`          | Invalida items (retorno ao estoque) |
| `useScanVolume()`           | —                             | `POST /v1/volumes/scan`                | Mutation sem cache                  |

### Hooks de Analytics

| Hook                          | Query Key                                   | Endpoint                              | Notas                                         |
| ----------------------------- | ------------------------------------------- | ------------------------------------- | --------------------------------------------- |
| `useStockSummary(query?)`     | `['analytics', 'stock-summary', query]`     | `GET /v1/analytics/stock-summary`     | staleTime 1 min                               |
| `useMovementsSummary(query?)` | `['analytics', 'movements-summary', query]` | `GET /v1/analytics/movements-summary` | staleTime 1 min                               |
| `useABCCurve(query?)`         | `['analytics', 'abc-curve', query]`         | `GET /v1/analytics/abc-curve`         | staleTime 5 min (query cara)                  |
| `useStockTurnover(query?)`    | `['analytics', 'stock-turnover', query]`    | `GET /v1/analytics/stock-turnover`    | staleTime 5 min                               |
| `useStockDashboard()`         | `['analytics', 'dashboard']`                | `GET /v1/dashboard/stock`             | staleTime 1 min, refetchInterval 5 min        |
| `useLowStockAlerts()`         | `['analytics', 'low-stock-alerts']`         | —                                     | refetchInterval 10 min                        |
| `useDashboardData()`          | —                                           | —                                     | Hook combinado: dashboard + lowStock + weekly |

### Hooks de Inventário

| Hook                                 | Query Key                                   | Endpoint                                 | Notas                     |
| ------------------------------------ | ------------------------------------------- | ---------------------------------------- | ------------------------- |
| `useInventoryCycles(query?)`         | `['inventory-cycles', query]`               | `GET /v1/inventory-cycles`               | —                         |
| `useInventoryCycle(id)`              | `['inventory-cycles', id]`                  | `GET /v1/inventory-cycles/:id`           | —                         |
| `useActiveInventoryCycles()`         | `['inventory-cycles', 'active']`            | —                                        | —                         |
| `useInventoryCycleCounts(cycleId)`   | `['inventory-cycles', cycleId, 'counts']`   | `GET /v1/inventory-cycles/:id/counts`    | —                         |
| `useInventoryCycleProgress(cycleId)` | `['inventory-cycles', cycleId, 'progress']` | —                                        | refetchInterval 1 min     |
| `useCreateInventoryCycle()`          | —                                           | `POST /v1/inventory-cycles`              | —                         |
| `useStartInventoryCycle()`           | —                                           | `POST /v1/inventory-cycles/:id/start`    | Invalida ciclos ativos    |
| `useCompleteInventoryCycle()`        | —                                           | `POST /v1/inventory-cycles/:id/complete` | Invalida items e variants |
| `useSubmitInventoryCount()`          | —                                           | `POST /v1/inventory-counts/:id/count`    | —                         |
| `useAdjustInventoryCount()`          | —                                           | `POST /v1/inventory-counts/:id/adjust`   | Invalida items e variants |

### Hooks de Templates de Etiqueta (Label Studio)

| Hook                            | Query Key                             | Endpoint                                  | Notas                                 |
| ------------------------------- | ------------------------------------- | ----------------------------------------- | ------------------------------------- |
| `useLabelTemplates(params?)`    | `['label-templates', 'list', params]` | `GET /v1/label-templates`                 | staleTime 5 min                       |
| `useLabelTemplate(id)`          | `['label-templates', 'detail', id]`   | `GET /v1/label-templates/:id`             | —                                     |
| `useSystemLabelTemplates()`     | `['label-templates', 'system']`       | —                                         | staleTime 30 min                      |
| `useCreateLabelTemplate()`      | —                                     | `POST /v1/label-templates`                | Toast de sucesso/erro                 |
| `useUpdateLabelTemplate()`      | —                                     | `PATCH /v1/label-templates/:id`           | Trata `CANNOT_EDIT_SYSTEM_TEMPLATE`   |
| `useDeleteLabelTemplate()`      | —                                     | `DELETE /v1/label-templates/:id`          | Trata `CANNOT_DELETE_SYSTEM_TEMPLATE` |
| `useDuplicateLabelTemplate()`   | —                                     | `POST /v1/label-templates/:id/duplicate`  | Trata `TEMPLATE_NAME_EXISTS`          |
| `useUpdateThumbnail()`          | —                                     | `PATCH /v1/label-templates/:id/thumbnail` | Blob upload                           |
| `useLabelTemplateCrud(params?)` | —                                     | —                                         | Hook combinado para operações CRUD    |

### Outros Hooks de Stock

| Hook                                                                              | Arquivo               | Endpoint                         |
| --------------------------------------------------------------------------------- | --------------------- | -------------------------------- |
| `useManufacturers()` / `useManufacturer(id)`                                      | `use-stock-other.ts`  | `GET /v1/manufacturers`          |
| `useCreateManufacturer()` / `useUpdateManufacturer()` / `useDeleteManufacturer()` | `use-stock-other.ts`  | CRUD `/v1/manufacturers`         |
| `useSuppliers()` / `useSupplier(id)`                                              | `use-stock-other.ts`  | `GET /v1/suppliers`              |
| `useTemplates()` / `useTemplate(id)`                                              | `use-stock-other.ts`  | `GET /v1/templates`              |
| `useTags()` / `useCreateTag()`                                                    | `use-tags.ts`         | `GET /v1/tags`                   |
| `useCategories()` / `useCategory(id)`                                             | `use-categories.ts`   | `GET /v1/categories`             |
| `useReorderCategories()`                                                          | `use-categories.ts`   | `PATCH /v1/categories/reorder`   |
| `useScanMode()`                                                                   | `use-scan.ts`         | `POST /v1/scan`                  |
| `useCareOptions()`                                                                | `use-care-options.ts` | `GET /v1/care-instructions`      |
| `useProductCare()`                                                                | `use-product-care.ts` | `GET/POST /v1/products/:id/care` |

---

## Components

### Componentes Compartilhados (`_shared/components/`)

| Componente          | Responsabilidade                                                    | Usado em             |
| ------------------- | ------------------------------------------------------------------- | -------------------- |
| `KpiCard`           | Card de KPI com valor, variação e ícone                             | Dashboard de estoque |
| `QuickActionButton` | Botão de ação rápida estilizado com gradiente                       | Landing page         |
| `StockAlerts`       | Lista de alertas de estoque baixo, expiração e aprovações pendentes | Dashboard            |
| `StockFilterBar`    | Barra de filtros compartilhada (template, status, fabricante)       | Páginas de lista     |
| `MovementFeed`      | Feed de movimentações recentes com tipo e quantidade                | Dashboard            |
| `StockBadge`        | Badge de status de item e tipo de movimento com cores semânticas    | Tabelas e listas     |

### Componentes de Produto

#### Workspace

| Componente             | Responsabilidade                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `ProductWorkspace`     | Container principal: divide tela em sidebar (árvore) + painel de detalhe              |
| `HierarchyTree`        | Árvore collapsible: Template > Produto > Variante, com contadores e busca inline      |
| `DetailPanel`          | Painel direito: exibe variantes e itens do produto/variante selecionado               |
| `InlineVariantCreator` | Campo de criação inline diretamente na árvore (aparece ao pressionar +)               |
| `BatchVariantCreator`  | Criação em lote por combinação de atributos (ex: 3 cores × 5 tamanhos = 15 variantes) |
| `QuickAddModal`        | Modal de 3 passos: selecionar template → digitar nome → confirmar                     |
| `QuickStockEntry`      | Formulário compacto de entrada de estoque com scan de código                          |
| `useKeyboardShortcuts` | Hook de atalhos: N (novo), E (editar), Del (excluir), Esc (fechar)                    |

#### Modais de Produto

| Componente                  | Responsabilidade                                                                  |
| --------------------------- | --------------------------------------------------------------------------------- |
| `ProductVariantsItemsModal` | Modal de duas colunas: lista de variantes à esquerda, itens da variante à direita |
| `VariantFormModal`          | Formulário completo de criação/edição de variante (preço, SKU, cor, códigos)      |
| `ItemEntryFormModal`        | Formulário de entrada de item: quantidade, bin, custo, nota fiscal, lote          |
| `ExitItemsModal`            | Formulário de saída de itens com tipo de movimentação                             |
| `ChangeLocationModal`       | Transferência de item entre bins                                                  |
| `ItemHistoryModal`          | Histórico de movimentações do item com timeline                                   |
| `RenameProductModal`        | Renomear produto com campo único                                                  |
| `AssignCategoryModal`       | Seletor de categoria para atribuição a um ou mais produtos                        |
| `AssignManufacturerModal`   | Seletor de fabricante para atribuição em lote                                     |

### Componentes de Localização

#### Mapa de Zona

| Componente       | Responsabilidade                                                        |
| ---------------- | ----------------------------------------------------------------------- |
| `ZoneMap`        | Mapa visual da zona: grid de corredores com bins coloridos por ocupação |
| `AisleRow`       | Linha de corredor no mapa com bins lado a lado                          |
| `BinCell`        | Célula individual de bin com cor por ocupação e tooltip de conteúdo     |
| `BinDetailModal` | Modal com detalhes do bin: itens alocados, histórico de movimentos      |
| `MapLegend`      | Legenda de cores do mapa                                                |

#### Gerador de Etiquetas de Bins

| Componente              | Responsabilidade                                                 |
| ----------------------- | ---------------------------------------------------------------- |
| `LabelGenerator`        | Container principal: seleção de range + preview + geração de PDF |
| `LabelBinRangeSelector` | Seleção de intervalo de bins para geração em lote                |
| `LabelFormatOptions`    | Opções de formato (tamanho, QR vs barcode, campos visíveis)      |
| `LabelPreview`          | Preview em tela da etiqueta antes de gerar PDF                   |
| `LabelPdfDocument`      | Documento PDF gerado via react-pdf/renderer                      |

#### Editor de Layout

| Componente         | Responsabilidade                                        |
| ------------------ | ------------------------------------------------------- |
| `LayoutEditor`     | Editor visual drag-and-drop do layout da zona           |
| `LayoutCanvas`     | Canvas principal com grid e elementos arrastáveis       |
| `DraggableAisle`   | Corredor arrastável no editor                           |
| `GridOverlay`      | Grade de alinhamento                                    |
| `AnnotationsPanel` | Painel de anotações (prateleiras especiais, obstáculos) |
| `EditorToolbar`    | Barra de ferramentas: adicionar, remover, desfazer      |
| `PropertiesPanel`  | Painel de propriedades do elemento selecionado          |

#### Seletor de Bin

| Componente    | Responsabilidade                                          |
| ------------- | --------------------------------------------------------- |
| `BinSelector` | Seletor com busca e sugestões para endereços de bins      |
| `SearchInput` | Campo de busca com debounce                               |
| `Suggestions` | Lista de sugestões de bins com endereço e disponibilidade |

---

## Label Studio

O Label Studio é um editor visual de etiquetas para impressão. Está localizado em `/print/studio` (route group `(actions)`) e integrado ao módulo de stock para geração de etiquetas de itens, variantes e bins.

### Arquitetura

```
src/core/print-queue/
  ├── editor/
  │   ├── LabelStudioEditor       # Componente principal do editor (modo view e edit)
  │   ├── useEditorStore          # Zustand store: elementos, seleção, preview data
  │   ├── buildSamplePreviewData  # Gera dados de preview para visualização
  │   └── types.ts                # LabelStudioTemplate, LabelStudioElement
  └── components/
      └── TestPrintModal          # Modal de impressão de teste com preview mockado
```

### Formato do Template

Os templates são salvos como JSON no campo `grapesJsData` (por compatibilidade histórica). Detecta-se um template do Label Studio pela presença de `editorType === 'label-studio'` ou `version === 2`.

```json
{
  "version": 2,
  "editorType": "label-studio",
  "width": 100,
  "height": 50,
  "canvas": { "background": "#ffffff" },
  "elements": [...],
  "category": "ITEM",
  "entityType": "ITEM"
}
```

### Elementos Suportados

- **Campos de dados** (`field`): código do item, nome do produto, SKU, localização, quantidade, fabricante, etc. — substituídos por dados reais na impressão
- **QR Code / Barcode**: gerados a partir do `uniqueCode` ou `fullCode` do item
- **Ícones de cuidado têxtil** (`care-icon`): 43 ícones ISO 3758 como elementos arrastáveis. A cor é mutável via `CareIconInline` (SVG inline + `currentColor`)
- **Textos estáticos, imagens, retângulos**

### Fluxo de Impressão

1. Usuário acessa `/print/studio/label/[id]`
2. Sistema carrega template via `useLabelTemplate(id)`
3. `LabelStudioEditor` renderiza os elementos com `buildSamplePreviewData()` em modo preview
4. Ao clicar em "Imprimir Teste", `TestPrintModal` abre com preview mockado e impressão via iframe do navegador
5. Na impressão real, o backend substitui os campos de dados com os valores reais do item

---

## Import/Export

### Importação por Planilha

O módulo oferece duas abordagens de importação, ambas em `/import`:

#### Importação Simples (EntityImportPage)

Fluxo em 3 etapas para uma entidade por vez:

1. **Upload** — CSV ou XLSX via `CsvUpload`
2. **Configuração de campos** — mapeamento de colunas via `FieldConfigList`
3. **Execução** — barra de progresso via `ImportProgressDialog`

Entidades disponíveis: Produtos (`/import/stock/products`), Variantes (`/import/stock/variants`), Itens (`/import/stock/items`), Fabricantes (`/import/stock/manufacturers`), Categorias (`/import/stock/product-categories`)

#### Importação via Wizard de Catálogo (CatalogImportPage)

Fluxo em 6 etapas para importar Produtos + Variantes em uma única planilha:

| Etapa          | Componente     | Descrição                                                                              |
| -------------- | -------------- | -------------------------------------------------------------------------------------- |
| 1 — Upload     | `StepUpload`   | Seleção do arquivo XLSX/CSV                                                            |
| 2 — Template   | `StepTemplate` | Escolha do template de produto para os atributos                                       |
| 3 — Mapeamento | `StepMapping`  | Mapeamento de colunas da planilha para campos do sistema; define coluna de agrupamento |
| 4 — Preview    | `StepPreview`  | Visualização dos produtos agrupados antes da importação                                |
| 5 — Validação  | `StepValidate` | Validação linha a linha com erros e warnings                                           |
| 6 — Importação | `StepImport`   | Execução com progresso em tempo real                                                   |

O hook `useCatalogImport` gerencia o estado do wizard com um reducer.

### Exportação

A página de Estoque Geral (`/stock/overview/list`) oferece exportação para impressão via janela nativa do navegador:

- Itens são agrupados por unidade de medida (`templateUnitOfMeasure`)
- Cada grupo gera uma tabela HTML separada com subtotal
- A função `printItems()` abre uma nova janela com o HTML formatado e chama `window.print()` automaticamente
- Permite imprimir todos os itens filtrados ou apenas os selecionados

---

## User Flows

### Flow 1: Criar um Produto e Registrar Entrada de Estoque

1. Usuário acessa `/stock/products`
2. Clica em "Novo Produto" — `page.modals.open('create')`
3. `CreateProductForm` abre em modal: seleciona Template, preenche Nome e Fabricante
4. Submit chama `productsService.createProduct()` via `useEntityCrud`
5. Toast de sucesso; lista invalidada via `queryClient.invalidateQueries(['products'])`
6. Usuário clica no botão de variantes do card → `ProductVariantsItemsModal` abre
7. Na aba de variantes, clica em "Nova Variante" → `VariantFormModal`
8. Preenche nome, preço, cor e SKU; submit cria variante via `useCreateVariant()`
9. Na aba de itens da variante, clica em "Entrada" → `ItemEntryFormModal`
10. Preenche quantidade, bin de destino e custo unitário; submit via `useRegisterItemEntry()`
11. Item criado com status `AVAILABLE`; estoque atualizado

### Flow 2: Consultar Estoque e Imprimir Relatório

1. Usuário acessa `/stock/overview/list`
2. `useItems()` carrega todos os itens
3. Usuário filtra por fabricante via `FilterDropdown`
4. Ativa colunas dinâmicas de atributos via filtro "Colunas"
5. Seleciona itens clicando nas linhas (barra flutuante aparece com totais por unidade)
6. Clica em "Imprimir seleção" → `printItems(selectedItems)` abre janela nativa
7. Relatório HTML é gerado agrupado por unidade de medida com totais

### Flow 3: Receber Ordem de Compra

1. Usuário acessa `/stock/requests/purchase-orders`
2. Clica em ordem com status `CONFIRMED`
3. Na página de detalhe, clica em "Receber"
4. `useReceivePurchaseOrder()` registra o recebimento com as quantidades
5. Itens são criados automaticamente via entrada de estoque
6. Status da ordem muda para `RECEIVED`; cache de items é invalidado

### Flow 4: Ciclo de Inventário

1. Usuário cria ciclo via `useCreateInventoryCycle()` com warehouseId e zoneIds
2. Inicia o ciclo via `useStartInventoryCycle()` — status muda para `IN_PROGRESS`
3. Para cada bin, contador submete contagem via `useSubmitInventoryCount()`
4. Supervisor revisa variâncias e ajusta via `useAdjustInventoryCount()`
5. Ciclo completado via `useCompleteInventoryCycle()` — items ajustados automaticamente se `autoAdjust=true`

### Flow 5: Digitalizar Item via Quick Scan

1. Usuário acessa `/stock/actions/quick-scan`
2. Seleciona o contexto: Entrada, Saída, Transferência ou Inventário
3. Escaneia o código (câmera ou teclado) — `useScanMode()` chama `POST /v1/scan`
4. Sistema identifica a entidade (Item, Variante, Volume, Bin) pelo `ScanResult.entityType`
5. Interface apresenta sugestões de ação baseadas no contexto selecionado
6. Usuário confirma a ação; mutation correspondente é executada

---

## State Management

- **Contextos:** Nenhum contexto específico do módulo de stock. Utiliza `TenantContext` para o tenant atual e `AuthContext` para permissões.
- **URL State:** Página de produtos usa query params para filtros (`?template=`, `?manufacturer=`, `?category=`) — múltiplos valores separados por vírgula
- **React Query Keys:** Definidos como constantes `QUERY_KEYS` dentro de cada arquivo de hook para evitar strings soltas
- **Zustand:** `useEditorStore` do Label Studio armazena elementos, seleção e preview data do editor
- **useState local:** Página de Estoque Geral gerencia filtros, colunas visíveis e seleção de itens localmente

---

## API Integration

O módulo se comunica com o backend exclusivamente via services em `src/services/stock/`. Cada entidade possui seu próprio service file:

| Service                 | Arquivo                      | Base Path              |
| ----------------------- | ---------------------------- | ---------------------- |
| `productsService`       | `products.service.ts`        | `/v1/products`         |
| `variantsService`       | `variants.service.ts`        | `/v1/variants`         |
| `itemsService`          | `items.service.ts`           | `/v1/items`            |
| `itemMovementsService`  | `item-movements.service.ts`  | `/v1/item-movements`   |
| `movementsService`      | `movements.service.ts`       | `/v1/movements`        |
| `templatesService`      | `templates.service.ts`       | `/v1/templates`        |
| `manufacturersService`  | `manufacturers.service.ts`   | `/v1/manufacturers`    |
| `suppliersService`      | `suppliers.service.ts`       | `/v1/suppliers`        |
| `categoriesService`     | `categories.service.ts`      | `/v1/categories`       |
| `tagsService`           | `tags.service.ts`            | `/v1/tags`             |
| `purchaseOrdersService` | `purchase-orders.service.ts` | `/v1/purchase-orders`  |
| `volumesService`        | `volumes.service.ts`         | `/v1/volumes`          |
| `analyticsService`      | `analytics.service.ts`       | `/v1/analytics`        |
| `inventoryService`      | `inventory.service.ts`       | `/v1/inventory-cycles` |
| `labelTemplatesService` | `label-templates.service.ts` | `/v1/label-templates`  |

Todos os services utilizam `apiClient` de `src/lib/api-client.ts`, que injeta automaticamente o JWT de tenant em cada requisição.

---

## Loading Skeletons (mar 2026)

Adicionados `loading.tsx` em 5 páginas para exibir esqueletos durante carregamento via Suspense do Next.js:

| Página                      | Componente                 | Padrão                                                |
| --------------------------- | -------------------------- | ----------------------------------------------------- |
| `/stock/product-categories` | `ProductCategoriesLoading` | Header + search bar + grid 4 colunas (8 cards `h-48`) |
| `/stock/tags`               | `TagsLoading`              | Header + search bar + grid 4 colunas (8 cards)        |
| `/stock/actions/quick-scan` | `QuickScanLoading`         | Header + área central grande                          |
| `/stock/overview/list`      | `StockListLoading`         | Header + search bar + tabela grande (`h-96`)          |
| `/stock/overview/movements` | `MovementsLoading`         | Header + search bar + tabela grande                   |

Todos utilizam `<Skeleton>` do shadcn/ui com classes `rounded-xl` / `rounded-lg`.

---

## Atualizações de Hooks (mar 2026)

### `use-variants.ts`

- `VariantsQuery` agora aceita `productId` opcional como filtro
- `useDeleteVariant` aceita `productId` opcional para invalidação granular
- `useUpdateVariant` invalida queries usando `productId` da resposta do servidor

### `use-items.ts`

- `useItemMovements` usa chave de query condicional (só ativa quando `itemId` presente)
- Suporte a filtros de paginação (`page`, `limit`) nos hooks de listagem

### `use-products.ts`

- Hooks de listagem atualizados para usar parâmetros de paginação padronizados

---

## Atualizações de Componentes (mar 2026)

| Componente                           | Mudanças                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| `ManufacturerDetailPage`             | Redesenhado com abas (Informações, Produtos, Arquivos) + integração FileManager |
| `DeleteConfirmModal` (manufacturers) | Modal de confirmação com input de nome                                          |
| `EditProductPage`                    | Reestruturado com abas + renderização dinâmica de atributos do template         |
| `ProductViewer`                      | Seleção múltipla de itens habilitada                                            |
| `ItemsActionBar`                     | Barra de ações em lote para itens selecionados                                  |
| `RenameProductModal`                 | Modal separado para renomear produto (não usa EntityForm)                       |
| `LocationsPage`                      | Layout atualizado com `WarehouseCard` redesenhado                               |
| `WarehouseCard`                      | Card com contadores de zonas/bins e ações rápidas                               |
| `PropertiesPanel` (layout editor)    | Painel de propriedades de bins no editor de layout                              |
| `BinCell` (zone map)                 | Célula do mapa de zona com tooltip e status visual                              |
| `ProductCategoriesPage`              | Lista com drag-and-drop para reordenação                                        |
| `StockAlerts`                        | Componente de alertas de estoque (baixo estoque, itens vencidos)                |
| `AttachmentList`                     | Lista de anexos com preview e download                                          |

---

## Atualizações de Tipos (mar 2026)

| Arquivo                 | Mudanças                                               |
| ----------------------- | ------------------------------------------------------ |
| `variant.types.ts`      | Adicionado enum `Pattern`                              |
| `item.types.ts`         | 10+ novos tipos para movimentações, reservas e filtros |
| `product.types.ts`      | Anotações de tipos atualizadas para novos campos       |
| `manufacturer.types.ts` | Alinhamento com backend (campos de endereço)           |

---

## Audit History

| Data       | Dimensão                             | Score | Relatório                                                                         |
| ---------- | ------------------------------------ | ----- | --------------------------------------------------------------------------------- |
| 2026-03-10 | Documentação inicial                 | —     | Criação da documentação completa do módulo stock (frontend)                       |
| 2026-03-11 | Loading + Hooks + Components + Types | —     | Atualização com skeletons, hooks paginados, componentes redesenhados, tipos novos |
