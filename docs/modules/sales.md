# Module: Sales (Frontend)

## Overview

O módulo de Vendas é responsável pela gestão de clientes, pedidos de venda, promoções por variante, reservas de itens e preferências de notificação dos usuários. Ele cobre o ciclo completo de comercialização dos produtos cadastrados no módulo de Estoque.

O módulo está em estágio **parcialmente implementado**: a camada de infraestrutura (types, services, hooks) está completa, porém nenhuma página de UI foi criada no App Router e o módulo não aparece no menu de navegação principal.

**Dependências com outros módulos:**
- `stock/` — Pedidos de venda referenciam `variantId` e `itemId`; reservas de itens vinculam ao `itemId`; promoções vinculam ao `variantId`; a conclusão de um pedido gera movimentação de saída (`MovementType.SALE`) no estoque
- `hr/` — O campo `createdBy` em `SalesOrder` pode referenciar um `userId` vinculado a um funcionário
- `finance/` — Pedidos confirmados podem gerar lançamentos financeiros no módulo de Contas a Receber
- `admin/` — Permissões RBAC controlam acesso a clientes, pedidos, promoções, reservas e comentários

---

## Route Structure

### Route Tree

```
(Nenhuma rota implementada no App Router)
```

O módulo Sales não possui páginas no route group `(dashboard)` ainda. Toda a lógica de UI está pendente de implementação. As rotas planejadas pelo sistema de permissões (`ui.menu.sales`, `ui.menu.sales.orders`, `ui.menu.sales.customers`, `ui.menu.sales.promotions`, `ui.menu.sales.reservations`) indicam o escopo previsto.

### Layout Hierarchy

Nenhum layout específico criado. Quando implementado, o módulo seguirá o padrão:

```
(dashboard)/layout.tsx          # Navbar principal + NavigationMenu
  └── (modules)/sales/page.tsx  # Landing page de Vendas (a criar)
  └── Páginas de entidades       # PageLayout > PageHeader > PageBody
```

### Component Tree

Nenhum componente de página implementado ainda.

---

## Page Structure

Nenhum registro de páginas implementadas.

---

## Types

Todos os tipos de sales estão em `src/types/sales/` com barrel re-export via `src/types/sales/index.ts`.

### customer.types.ts

| Interface/Type | Descrição |
|----------------|-----------|
| `CustomerType` | `'INDIVIDUAL'` — Pessoa Física; `'BUSINESS'` — Pessoa Jurídica |
| `Customer` | Cliente completo: name, type, document (CPF/CNPJ), email, phone, endereço (address, city, state, zipCode, country), notes, isActive, datas de auditoria |
| `CreateCustomerRequest` | Criação: name (obrigatório), type (obrigatório), demais campos opcionais |
| `UpdateCustomerRequest` | Atualização parcial: todos os campos opcionais exceto type (não atualizável) |
| `CustomersResponse` | `{ customers: Customer[] }` |
| `CustomerResponse` | `{ customer: Customer }` |

Observação: o campo `createdAt` usa `Date` (inconsistente com o padrão `string` adotado pelos tipos mais recentes do projeto). Ao sincronizar com o backend, considerar migração para `string`.

### order.types.ts

| Interface/Type | Descrição |
|----------------|-----------|
| `SalesOrderStatus` | `DRAFT`, `PENDING`, `CONFIRMED`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`, `RETURNED` |
| `SalesOrderItem` | Item de pedido: salesOrderId, variantId, itemId (opcional), quantity, unitPrice, discount, totalPrice, notes |
| `SalesOrder` | Pedido completo: orderNumber, customerId, createdBy, status, totalPrice, discount, finalPrice, notes, items[], datas de auditoria |
| `CreateSalesOrderRequest` | Criação: customerId, orderNumber (obrigatórios); status (padrão: DRAFT), discount, notes, items[] |
| `UpdateSalesOrderStatusRequest` | `{ status: SalesOrderStatus }` — atualização restrita ao campo de status |
| `SalesOrdersQuery` | Filtros: search, status, startDate, endDate, sortBy, sortOrder + paginação (page, limit) |
| `SalesOrdersResponse` | `{ salesOrders: SalesOrder[] }` |
| `SalesOrderResponse` | `{ salesOrder: SalesOrder }` |

Observação: `SalesOrder` contém objetos `items[]` diretamente embutidos, sem necessidade de consulta separada. O campo `finalPrice` representa o valor total após desconto do pedido.

### comment.types.ts

| Interface/Type | Descrição |
|----------------|-----------|
| `Comment` | Comentário genérico vinculado a qualquer entidade por `entityType` + `entityId`; suporta respostas via `parentCommentId` |
| `CreateCommentRequest` | entityType, entityId, content (obrigatórios); parentCommentId (opcional, para respostas) |
| `UpdateCommentRequest` | `{ content: string }` — apenas o conteúdo pode ser atualizado |
| `CommentsResponse` | `{ comments: Comment[] }` |
| `CommentResponse` | `{ comment: Comment }` |

Observação: `entityType` é uma string livre no tipo frontend, sem enum definido. No backend, o valor esperado para comentários de pedidos é `'sales-order'`.

### promotion.types.ts

| Interface/Type | Descrição |
|----------------|-----------|
| `VariantPromotion` | Promoção vinculada a uma variante: discountType, discountValue, período (startDate/endDate), isActive, notes |
| `CreateVariantPromotionRequest` | variantId, discountType, discountValue, startDate, endDate (obrigatórios); isActive (padrão: true), notes (opcionais) |
| `UpdateVariantPromotionRequest` | Atualização parcial: todos os campos opcionais |
| `VariantPromotionsResponse` | `{ promotions: VariantPromotion[] }` |
| `VariantPromotionResponse` | `{ promotion: VariantPromotion }` |

Observação: `discountType` é uma string livre sem enum definido no frontend. O backend provavelmente aceita `'PERCENTAGE'` e `'FIXED'`. Este campo deve ser sincronizado com o backend ao implementar a UI.

### reservation.types.ts

| Interface/Type | Descrição |
|----------------|-----------|
| `ItemReservation` | Reserva de item físico: itemId, salesOrderId (opcional), quantity, expiresAt, status, createdAt |
| `CreateItemReservationRequest` | itemId, quantity, expiresAt (obrigatórios); salesOrderId (opcional) |
| `ReleaseItemReservationRequest` | `{ releaseQuantity: number }` — liberação parcial ou total da reserva |
| `ItemReservationsResponse` | `{ reservations: ItemReservation[] }` |
| `ItemReservationResponse` | `{ reservation: ItemReservation }` |

Observação: o campo `status` de `ItemReservation` é uma string livre sem enum. O backend provavelmente utiliza `'ACTIVE'` e `'RELEASED'`. Deve ser corrigido ao implementar a UI.

### notification.types.ts

| Interface/Type | Descrição |
|----------------|-----------|
| `NotificationPreference` | Preferência de notificação: userId, notificationType, channel, isEnabled, datas de auditoria |
| `CreateNotificationPreferenceRequest` | userId, notificationType, channel (obrigatórios); isEnabled (padrão: true) |
| `UpdateNotificationPreferenceRequest` | Atualização parcial: todos os campos opcionais |
| `NotificationPreferencesResponse` | `{ preferences: NotificationPreference[] }` |
| `NotificationPreferenceResponse` | `{ preference: NotificationPreference }` |

Observação: `notificationType` e `channel` são strings livres sem enums definidos no frontend, o que representa uma inconsistência com o backend. Ao implementar a UI, criar enums correspondentes.

### Sincronização com Backend

| Arquivo | Backend Schema | Sincronizado? |
|---------|---------------|---------------|
| `customer.types.ts` | `customer.schema.ts` | Parcial (datas como `Date`, backend retorna `string`) |
| `order.types.ts` | `sales-order.schema.ts` | Parcial (datas como `Date`, campos `status` cobertos) |
| `comment.types.ts` | `comment.schema.ts` | Parcial (`entityType` não tem enum) |
| `promotion.types.ts` | `variant-promotion.schema.ts` | Parcial (`discountType` não tem enum) |
| `reservation.types.ts` | `item-reservation.schema.ts` | Parcial (`status` não tem enum) |
| `notification.types.ts` | `notification-preference.schema.ts` | Parcial (campos sem enums) |

---

## Hooks

Todos os hooks de sales estão em `src/hooks/sales/` com barrel re-export via `src/hooks/sales/index.ts`.

### Hooks de Clientes (`use-customers.ts`)

| Hook | Query Key | Endpoint | Notas |
|------|-----------|----------|-------|
| `useCustomers()` | `['customers']` | `GET /v1/customers` | Lista completa sem paginação |
| `useCustomer(customerId)` | `['customers', customerId]` | `GET /v1/customers/:id` | Ativado apenas quando `customerId` é truthy |
| `useCreateCustomer()` | — | `POST /v1/customers` | Invalida `['customers']` no `onSuccess` |
| `useUpdateCustomer()` | — | `PATCH /v1/customers/:id` | Recebe `{ customerId, data }`; invalida lista e item individual |
| `useDeleteCustomer()` | — | `DELETE /v1/customers/:id` | Invalida `['customers']` |

Observação: o service `customersService.updateCustomer()` chama `apiClient.put()` (não `patch()`). Isso significa que o cliente HTTP envia `PUT`, enquanto o endpoint do backend pode esperar `PATCH`. Verificar consistência antes de implementar a UI.

### Hooks de Pedidos e Comentários (`use-sales-orders.ts`)

| Hook | Query Key | Endpoint | Notas |
|------|-----------|----------|-------|
| `useSalesOrders()` | `['sales-orders']` | `GET /v1/sales-orders` | Lista completa sem paginação nem filtros |
| `useSalesOrder(id)` | `['sales-orders', id]` | `GET /v1/sales-orders/:id` | Ativado apenas quando `id` é truthy |
| `useCreateSalesOrder()` | — | `POST /v1/sales-orders` | Invalida `['sales-orders']` |
| `useUpdateSalesOrderStatus()` | — | `PATCH /v1/sales-orders/:id/status` | Recebe `{ id, data }`; invalida lista e item individual |
| `useDeleteSalesOrder()` | — | `DELETE /v1/sales-orders/:id` | Invalida `['sales-orders']` |
| `useComments(salesOrderId)` | `['comments', salesOrderId]` | `GET /v1/comments/:salesOrderId` | Ativado apenas quando `salesOrderId` é truthy |
| `useComment(commentId)` | `['comments', 'single', commentId]` | `GET /v1/comments/comment/:commentId` | — |
| `useCreateComment()` | — | `POST /v1/comments` | Invalida comentários do `entityId` extraído da resposta |
| `useUpdateComment()` | — | `PATCH /v1/comments/:id` | Invalida lista de comentários e comentário individual |
| `useDeleteComment()` | — | `DELETE /v1/comments/:id` | Invalida todos os `['comments']` (prefixo) |

Observação: `useUpdateComment()` chama `apiClient.put()` em vez de `patch()`. Verificar consistência com o backend ao implementar a UI.

### Hooks Complementares (`use-sales-other.ts`)

#### Promoções de Variante

| Hook | Query Key | Endpoint | Notas |
|------|-----------|----------|-------|
| `useVariantPromotions()` | `['variant-promotions']` | `GET /v1/variant-promotions` | Lista completa |
| `useVariantPromotion(id)` | `['variant-promotions', id]` | `GET /v1/variant-promotions/:id` | Ativado quando `id` é truthy |
| `useCreateVariantPromotion()` | — | `POST /v1/variant-promotions` | Invalida lista |
| `useUpdateVariantPromotion()` | — | `PUT /v1/variant-promotions/:id` | Recebe `{ id, data }`; invalida lista e item |
| `useDeleteVariantPromotion()` | — | `DELETE /v1/variant-promotions/:id` | Invalida lista |

#### Reservas de Item

| Hook | Query Key | Endpoint | Notas |
|------|-----------|----------|-------|
| `useItemReservations()` | `['item-reservations']` | `GET /v1/item-reservations` | Lista completa |
| `useItemReservation(id)` | `['item-reservations', id]` | `GET /v1/item-reservations/:id` | Ativado quando `id` é truthy |
| `useCreateItemReservation()` | — | `POST /v1/item-reservations` | Invalida lista |
| `useReleaseItemReservation()` | — | `PUT /v1/item-reservations/:id/release` | Recebe `{ id, data }`; invalida lista e item |

#### Preferências de Notificação

| Hook | Query Key | Endpoint | Notas |
|------|-----------|----------|-------|
| `useNotificationPreferences()` | `['notification-preferences']` | `GET /v1/notification-preferences` | Lista completa |
| `useNotificationPreference(id)` | `['notification-preferences', id]` | `GET /v1/notification-preferences/:id` | — |
| `useCreateNotificationPreference()` | — | `POST /v1/notification-preferences` | Invalida lista |
| `useUpdateNotificationPreference()` | — | `PUT /v1/notification-preferences/:id` | Recebe `{ id, data }`; invalida lista e item |
| `useDeleteNotificationPreference()` | — | `DELETE /v1/notification-preferences/:id` | Invalida lista |

---

## Components

Nenhum componente específico do módulo Sales foi implementado.

---

## State Management

- **Contextos:** Nenhum contexto específico do módulo de sales. O módulo utilizará `TenantContext` e `AuthContext` quando as páginas forem implementadas.
- **URL State:** Não definido. O hook `useSalesOrders()` aceita `SalesOrdersQuery` com filtros, mas a integração com query params da URL ainda não foi implementada.
- **React Query Keys:** Definidos como constantes `QUERY_KEYS` dentro de cada arquivo de hook — `['customers']`, `['sales-orders']`, `['comments', salesOrderId]`, `['variant-promotions']`, `['item-reservations']`, `['notification-preferences']`.

---

## API Integration

O módulo se comunica com o backend via services em `src/services/sales/`. Os endpoints estão registrados em `src/config/api.ts`.

| Service | Arquivo | Base Path |
|---------|---------|-----------|
| `customersService` | `customers.service.ts` | `/v1/customers` |
| `salesOrdersService` | `sales-orders.service.ts` | `/v1/sales-orders` |
| `commentsService` | `sales-orders.service.ts` | `/v1/comments` |
| `variantPromotionsService` | `other.service.ts` | `/v1/variant-promotions` |
| `itemReservationsService` | `other.service.ts` | `/v1/item-reservations` |
| `notificationPreferencesService` | `other.service.ts` | `/v1/notification-preferences` |

Todos os services utilizam `apiClient` de `src/lib/api-client.ts`, que injeta automaticamente o JWT de tenant em cada requisição.

---

## Permissions

| Código | Descrição | Escopo |
|--------|-----------|--------|
| `sales.customers.create` | Criar clientes | Sales |
| `sales.customers.read` | Visualizar um cliente | Sales |
| `sales.customers.update` | Atualizar clientes | Sales |
| `sales.customers.delete` | Remover clientes | Sales |
| `sales.customers.list` | Listar clientes | Sales |
| `sales.customers.manage` | Gerenciar clientes (superconjunto) | Sales |
| `sales.orders.create` | Criar pedidos de venda | Sales |
| `sales.orders.read` | Visualizar um pedido | Sales |
| `sales.orders.update` | Atualizar pedidos | Sales |
| `sales.orders.delete` | Remover pedidos | Sales |
| `sales.orders.list` | Listar pedidos | Sales |
| `sales.orders.request` | Solicitar aprovação de pedido | Sales |
| `sales.orders.approve` | Aprovar pedidos | Sales |
| `sales.orders.cancel` | Cancelar pedidos | Sales |
| `sales.orders.manage` | Gerenciar pedidos (superconjunto) | Sales |
| `sales.promotions.create` | Criar promoções de variante | Sales |
| `sales.promotions.read` | Visualizar promoção | Sales |
| `sales.promotions.update` | Atualizar promoções | Sales |
| `sales.promotions.delete` | Remover promoções | Sales |
| `sales.promotions.list` | Listar promoções | Sales |
| `sales.promotions.manage` | Gerenciar promoções (superconjunto) | Sales |
| `sales.reservations.create` | Criar reservas de item | Sales |
| `sales.reservations.read` | Visualizar reserva | Sales |
| `sales.reservations.update` | Atualizar reservas | Sales |
| `sales.reservations.delete` | Remover reservas | Sales |
| `sales.reservations.list` | Listar reservas | Sales |
| `sales.reservations.release` | Liberar reservas | Sales |
| `sales.reservations.manage` | Gerenciar reservas (superconjunto) | Sales |
| `sales.comments.create` | Criar comentários em pedidos | Sales |
| `sales.comments.read` | Visualizar comentários | Sales |
| `sales.comments.update` | Atualizar comentários | Sales |
| `sales.comments.delete` | Remover comentários | Sales |
| `sales.comments.list` | Listar comentários de um pedido | Sales |
| `sales.comments.manage` | Gerenciar comentários (superconjunto) | Sales |
| `sales.notifications.create` | Criar preferências de notificação | Sales |
| `sales.notifications.read` | Visualizar preferência de notificação | Sales |
| `sales.notifications.update` | Atualizar preferências | Sales |
| `sales.notifications.delete` | Remover preferências | Sales |
| `sales.notifications.list` | Listar preferências | Sales |
| `ui.menu.sales` | Exibir menu de Vendas na navegação | UI |
| `ui.menu.sales.orders` | Exibir item "Pedidos" no menu de Vendas | UI |
| `ui.menu.sales.customers` | Exibir item "Clientes" no menu de Vendas | UI |
| `ui.menu.sales.promotions` | Exibir item "Promoções" no menu de Vendas | UI |
| `ui.menu.sales.reservations` | Exibir item "Reservas" no menu de Vendas | UI |

---

## User Flows

### Flow 1: Criar Pedido de Venda (Fluxo Planejado)

1. Usuário acessa `/sales/orders` (página a implementar)
2. Sistema carrega lista via `useSalesOrders()`
3. Usuário clica em "Novo Pedido"
4. Formulário de criação é exibido: selecionar cliente, adicionar itens (variantId + quantidade + preço)
5. Submit chama `useCreateSalesOrder()` com status `DRAFT`
6. Toast de sucesso; lista invalidada via `queryClient.invalidateQueries(['sales-orders'])`
7. Para confirmar o pedido, usuário clica em "Confirmar" → `useUpdateSalesOrderStatus()` muda status para `CONFIRMED`
8. Backend cria movimentação de saída (`SALE`) e atualiza estoque

### Flow 2: Reservar Item para um Pedido (Fluxo Planejado)

1. Com um pedido `CONFIRMED`, usuário acessa detalhe do pedido
2. Para cada item do pedido, chama `useCreateItemReservation()` com `itemId`, `quantity` e `salesOrderId`
3. Item muda para status `RESERVED` no estoque
4. Ao entregar o pedido (`DELIVERED`), as reservas são liberadas automaticamente pelo backend

### Flow 3: Aplicar Promoção a uma Variante (Fluxo Planejado)

1. Usuário acessa a variante no módulo de Estoque
2. Cria promoção via `useCreateVariantPromotion()` com período, tipo de desconto e valor
3. Durante o período ativo (`isActive: true`), o backend aplica o desconto ao calcular `totalPrice` nos novos itens do pedido

---

## Known Inconsistencies

As seguintes inconsistências foram identificadas durante a documentação deste módulo e devem ser corrigidas antes da implementação da UI:

1. **`apiClient.put()` em vez de `patch()`:** Os services de `customersService.updateCustomer()` e `commentsService.updateComment()` chamam `apiClient.put()`, enquanto os endpoints do backend são `PATCH`. Verificar o método HTTP real aceito e corrigir o service ou o endpoint.

2. **Datas como `Date` em vez de `string`:** Todos os tipos de sales (`Customer`, `SalesOrder`, `Comment`, etc.) usam `Date` para campos de data. O padrão atual do projeto é `string` (serialização JSON retorna ISO strings). Deve ser migrado para `string` ao atualizar os tipos.

3. **Campos sem enum:** `discountType` em `VariantPromotion`, `status` em `ItemReservation`, `notificationType` e `channel` em `NotificationPreference`, e `entityType` em `Comment` são strings livres. Enums correspondentes devem ser criados com base nos valores aceitos pelo backend.

4. **`useSalesOrders()` sem paginação:** O hook retorna todos os pedidos sem suporte a paginação, o que é impraticável em produção. Implementar variante `useSalesOrdersPaginated(query?)` seguindo o padrão `keepPreviousData` + `staleTime` já adotado pelos hooks de stock.

5. **Módulo ausente no menu:** O módulo Sales não possui entrada em `src/config/menu/index.tsx`. Criar `src/config/menu/sales/index.tsx` seguindo o padrão de `src/config/menu/stock/index.tsx`.

---

## Audit History

| Data | Dimensão | Score | Relatório |
|------|----------|-------|-----------|
| 2026-03-10 | Documentação inicial | — | Documentação completa do módulo Sales (frontend) — infraestrutura implementada, UI pendente |
