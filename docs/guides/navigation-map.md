# Sales Module — Navigation Map

**Date:** 2026-03-21
**Status:** Approved
**Rule:** NO submenus in navigation. Single button per module → module root. Internal navigation via dashboard page.

---

## 1. Main Navigation (Sidebar)

The sidebar has ONE entry for Sales:

```
Navigation Menu:
  📊 Dashboard (home)
  📦 Estoque          → /stock
  💰 Vendas           → /sales          ← NEW (single button)
  💵 Financeiro       → /finance
  👥 RH               → /hr
  ⚙️ Administração    → /admin
```

Clicking "Vendas" goes to `/sales` — the Sales module dashboard.

---

## 2. Sales Dashboard (/sales)

The dashboard is the internal hub. All navigation happens FROM here. Uses the PageDashboardSections pattern with cards/links to each area.

```
┌─────────────────────────────────────────────────────────────────┐
│  VENDAS — Painel Principal                                       │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Vendas   │ │ Pipeline │ │ Inbox    │ │ Meta     │          │
│  │ R$168k   │ │ 23 deals │ │ 5 novas  │ │ 84%      │          │
│  │ +18% ↑   │ │ R$340k   │ │ mensagens│ │ ████░░   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  NAVEGAÇÃO RÁPIDA                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  CRM                          OPERAÇÕES                     ││
│  │  ├── 👥 Clientes              ├── 📦 Pedidos                ││
│  │  ├── 📇 Contatos              ├── 📋 Orçamentos             ││
│  │  ├── 🎯 Pipeline              ├── 🔄 Devoluções             ││
│  │  ├── 📬 Inbox                 ├── 🏪 PDV                    ││
│  │  ├── ⚡ Automações            ├── 💳 Caixa                  ││
│  │  ├── 📝 Formulários           └── 💰 Comissões              ││
│  │  └── 📄 Propostas                                           ││
│  │                                                              ││
│  │  PRICING                       EXPANSÃO                     ││
│  │  ├── 💲 Tabelas de Preço      ├── 🏛️ Licitações            ││
│  │  ├── 🏷️ Campanhas            ├── 🛒 Marketplaces           ││
│  │  ├── 🎟️ Cupons               └── 📚 Catálogos              ││
│  │  └── 📦 Combos/Kits                                        ││
│  │                                                              ││
│  │  INTELIGÊNCIA                  CONFIGURAÇÕES                ││
│  │  ├── 📊 Analytics             ├── ⚙️ Configurações          ││
│  │  ├── 🎯 Metas                 ├── 🤖 IA (Config)           ││
│  │  └── 📈 Relatórios            └── 📡 Canais                 ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  AI INSIGHTS                                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🤖 "3 deals quentes sem contato há 5 dias"                  ││
│  │ 🤖 "Produto X vendeu 40% mais — criar destaque?"            ││
│  │ 🤖 "Novo edital compatível publicado hoje — R$50k"          ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Skill-gating:** Cards/links are hidden when the tenant doesn't have the skill enabled. Example: if `sales.bids` is not in the plan, "Licitações" card doesn't appear.

---

## 3. Complete Route Map

### 3.1 CRM Routes

```
/sales                              Dashboard (module home)
/sales/customers                    Customer listing
/sales/customers/[id]               Customer detail + timeline
/sales/customers/[id]/edit          Customer edit

/sales/contacts                     Contact listing
/sales/contacts/[id]                Contact detail + timeline
/sales/contacts/[id]/edit           Contact edit

/sales/pipelines                    Pipeline listing
/sales/pipelines/[id]               Kanban board (deals as cards, stages as columns)

/sales/deals                        Deal listing (table/grid view)
/sales/deals/[id]                   Deal detail
/sales/deals/[id]/edit              Deal edit

/sales/inbox                        Omnichannel inbox (3 views)
/sales/inbox/[conversationId]       Conversation thread

/sales/automations                  Workflow listing
/sales/automations/new              Create workflow (visual + NL)
/sales/automations/[id]             Workflow editor

/sales/forms                        Form listing
/sales/forms/new                    Form builder
/sales/forms/[id]                   Form editor + stats

/sales/proposals                    Proposal listing
/sales/proposals/[id]               Proposal detail + tracking
/sales/proposals/[id]/edit          Proposal editor
```

### 3.2 Pricing Routes

```
/sales/pricing                      Price table listing
/sales/pricing/[id]                 Table detail + items grid
/sales/pricing/[id]/edit            Edit table + bulk price import

/sales/campaigns                    Campaign listing
/sales/campaigns/new                Create campaign wizard
/sales/campaigns/[id]               Campaign detail + performance
/sales/campaigns/[id]/edit          Edit campaign

/sales/coupons                      Coupon listing
/sales/coupons/[id]                 Coupon detail + usage stats
/sales/coupons/[id]/edit            Edit coupon

/sales/combos                       Combo listing
/sales/combos/[id]                  Combo detail
/sales/combos/[id]/edit             Edit combo

/sales/tax                          Tax profiles listing
/sales/tax/[id]                     Tax profile detail + rules
/sales/tax/[id]/edit                Edit tax profile
```

### 3.3 Orders Routes

```
/sales/orders                       Order listing
/sales/orders/new                   Create order/quote
/sales/orders/[id]                  Order detail (items, payments, deliveries, history)
/sales/orders/[id]/edit             Edit order (only DRAFT stages)

/sales/quotes                       Quote listing (filtered view of orders type=QUOTE)
/sales/returns                      Returns listing
/sales/returns/[id]                 Return detail
/sales/returns/[id]/edit            Edit return

/sales/commissions                  Commission listing + summary
/sales/commissions/rules            Commission rules config

/sales/settings/payment-conditions  Payment conditions config
/sales/settings/approval-rules      Approval rules config
/sales/settings/credit-limits       Credit limits per customer
```

### 3.4 PDV Routes

```
/sales/pos                          Terminal selector / mode selector
/sales/pos/[terminalId]             Active POS interface (mode-adaptive)
/sales/pos/terminals                Terminal management (admin)
/sales/pos/terminals/[id]/edit      Edit terminal config
```

### 3.5 Licitações Routes

```
/sales/bids                         Bid listing (Kanban by status + list view)
/sales/bids/new                     Create bid manually
/sales/bids/[id]                    Bid detail (items, proposals, disputes, docs, timeline)
/sales/bids/[id]/edit               Edit bid

/sales/bids/disputes/[id]           Live dispute view (real-time lances, chat, bot)

/sales/bids/contracts               Contract listing
/sales/bids/contracts/[id]          Contract detail (empenhos, deliveries, measurements)
/sales/bids/contracts/[id]/edit     Edit contract

/sales/bids/documents               Document/certidão management
/sales/bids/settings                AI config, portal connections, guardrails
```

### 3.6 Marketplaces Routes

```
/sales/marketplaces                 Dashboard: all connections overview
/sales/marketplaces/connect         Add new marketplace connection

/sales/marketplaces/[connectionId]              Connection detail
/sales/marketplaces/[connectionId]/edit         Edit connection
/sales/marketplaces/[connectionId]/listings     Listings management
/sales/marketplaces/[connectionId]/orders       Marketplace orders
/sales/marketplaces/[connectionId]/finance      Reconciliation dashboard
/sales/marketplaces/[connectionId]/ads          Ad campaigns
/sales/marketplaces/[connectionId]/fulfillment  Fulfillment stock

/sales/marketplaces/publish         Bulk publish wizard
```

### 3.7 Catálogos & Content Routes

```
/sales/catalogs                     Catalog listing
/sales/catalogs/new                 Create catalog
/sales/catalogs/[id]                Catalog detail + products + preview
/sales/catalogs/[id]/edit           Edit catalog
/sales/catalogs/[id]/export         Export options (PDF, link, QR)

/sales/content                      Content library
/sales/content/generate             AI content generation wizard
/sales/content/[id]                 Content detail + preview
/sales/content/[id]/edit            Edit content
/sales/content/calendar             Content calendar view

/sales/mockups                      Mockup gallery
/sales/mockups/new                  Create mockup wizard

/sales/templates                    Template gallery
/sales/email-campaigns              Email campaign listing
/sales/email-campaigns/new          Create campaign wizard
/sales/email-campaigns/[id]         Campaign detail + metrics
/sales/email-campaigns/[id]/edit    Edit campaign

/sales/brand                        Brand identity editor
```

### 3.8 Analytics Routes

```
/sales/analytics                    Analytics home (AI terminal + overview)
/sales/analytics/terminal           Full AI terminal
/sales/analytics/dashboards         Dashboard list
/sales/analytics/dashboards/new     Create custom dashboard
/sales/analytics/dashboards/[id]    Dashboard view

/sales/analytics/reports            Report list + schedule management
/sales/analytics/reports/new        Create report wizard
/sales/analytics/reports/[id]       Report detail + history

/sales/analytics/goals              Goal listing + progress
/sales/analytics/goals/new          Create goal

/sales/analytics/rankings           Leaderboards
/sales/analytics/curva-abc          Curva ABC analysis

/sales/analytics/customer-portal    Portal access management
```

### 3.9 Settings Routes

```
/sales/settings                     General settings hub
/sales/settings/ai                  AI config (tiers, providers, personality)
/sales/settings/channels            Channel connections (WhatsApp, Instagram, etc.)
/sales/settings/webchat             Widget config
/sales/settings/payment-conditions  Payment conditions
/sales/settings/approval-rules      Approval rules
/sales/settings/credit-limits       Credit limits
```

### 3.10 Tools Routes (separate from Sales)

```
/ai                                 AI Assistant dedicated chat
/ai/conversations/[id]              Specific conversation
/ai/insights                        Proactive insights feed
/ai/actions                         AI action log
/ai/favorites                       Saved queries
/ai/settings                        AI config

/signature                          Signature dashboard
/signature/certificates             Certificate management
/signature/certificates/upload      Upload new certificate
/signature/envelopes                Envelope listing
/signature/envelopes/new            Create new envelope
/signature/envelopes/[id]           Envelope detail
/signature/templates                Signature templates
/signature/settings                 Default levels, cloud providers
```

### 3.11 Public Routes (no dashboard layout)

```
/forms/[slug]                       Public form submission
/sign/[token]                       External signing page
/verify/[hash]                      Document verification page
/portal/[token]                     Customer portal home
/portal/[token]/orders              Customer's orders
/portal/[token]/orders/[id]         Order detail + tracking
/portal/[token]/invoices            Customer's invoices
/portal/[token]/proposals           Customer's proposals
/portal/[token]/catalog             Products for this customer
/portal/[token]/support             Contact / open ticket
/catalog/[slug]                     Public catalog view
```

---

## 4. Dashboard Section Visibility by Skills

| Section                                         | Required skill                            | Fallback if disabled |
| ----------------------------------------------- | ----------------------------------------- | -------------------- |
| CRM (Clientes, Contatos, Pipeline, Inbox, etc.) | `sales.crm` (core — always on with SALES) | Always visible       |
| Automações                                      | `sales.automations`                       | Hidden               |
| Formulários                                     | `sales.forms`                             | Hidden               |
| Propostas                                       | `sales.proposals`                         | Hidden               |
| Tabelas de Preço                                | `sales.pricing`                           | Hidden               |
| Campanhas                                       | `sales.pricing.campaigns`                 | Hidden               |
| Cupons                                          | `sales.pricing.coupons`                   | Hidden               |
| Combos/Kits                                     | `sales.pricing.combos`                    | Hidden               |
| Tax                                             | `sales.pricing.tax`                       | Hidden               |
| Pedidos, Orçamentos, Devoluções                 | `sales.orders`                            | Hidden               |
| Comissões                                       | `sales.orders.commissions`                | Hidden               |
| PDV                                             | `sales.pos`                               | Hidden               |
| Caixa                                           | `sales.cashier`                           | Hidden               |
| Licitações                                      | `sales.bids`                              | Hidden               |
| Marketplaces                                    | `sales.marketplaces`                      | Hidden               |
| Catálogos                                       | `sales.catalogs`                          | Hidden               |
| Content AI, Mockups, Email Mkt                  | `sales.catalogs.content-ai` etc.          | Hidden               |
| Analytics (básico)                              | `sales.analytics`                         | Hidden               |
| Analytics (avançado)                            | `sales.analytics` + `sales.ai`            | Show basic only      |
| AI Config                                       | `sales.ai`                                | Hidden               |
| Canais (WhatsApp, etc.)                         | `sales.inbox`                             | Hidden               |

**Implementation pattern:**

```typescript
const { hasFeatureFlag } = useFeatureFlags();

// In dashboard:
{hasFeatureFlag('sales.bids') && (
  <DashboardCard
    title="Licitações"
    icon={Gavel}
    href="/sales/bids"
    stats={bidStats}
  />
)}
```

---

## 5. Breadcrumb Patterns

All pages use breadcrumbs for navigation context:

```
Vendas > Clientes                            (listing)
Vendas > Clientes > Tech Corp               (detail)
Vendas > Clientes > Tech Corp > Editar      (edit)

Vendas > Pipeline > Venda B2B               (kanban)
Vendas > Pedidos > #ORD-0042                (detail)
Vendas > Licitações > PE 001/2026           (detail)
Vendas > Marketplaces > Mercado Livre       (connection detail)
Vendas > Analytics > Terminal IA            (AI terminal)
```

---

## 6. Internal Navigation Between Entities

Cross-entity navigation happens via links within detail pages:

```
Customer detail → tabs/sections:
  ├── Informações (dados do cliente)
  ├── Contatos (lista de contacts vinculados) → link to /sales/contacts/[id]
  ├── Deals (deals deste cliente) → link to /sales/deals/[id]
  ├── Pedidos (orders deste cliente) → link to /sales/orders/[id]
  ├── Propostas → link to /sales/proposals/[id]
  ├── Timeline (atividades + eventos de todos os módulos)
  └── Conversas (inbox filtrado por este cliente) → link to /sales/inbox

Deal detail → links to:
  ├── Customer → /sales/customers/[id]
  ├── Contacts (envolvidos) → /sales/contacts/[id]
  ├── Pipeline → /sales/pipelines/[id]
  ├── Proposals → /sales/proposals/[id]
  └── Orders (se deal virou pedido) → /sales/orders/[id]

Order detail → links to:
  ├── Customer → /sales/customers/[id]
  ├── Deal (se veio de deal) → /sales/deals/[id]
  ├── Bid (se veio de licitação) → /sales/bids/[id]
  ├── Marketplace order (se veio de marketplace) → /sales/marketplaces/[connId]/orders
  └── Deliveries, Payments, Returns (inline sections)
```

---

# HR Module — Compliance (Portaria MTP 671/2021)

**Date:** 2026-04-23
**Status:** Approved (Plan 06-06)
**Phase:** 06 — compliance-portaria-671

### /hr/compliance dashboard

Dashboard hub do módulo Compliance com 5 tabs de artefatos legais:

- Permission gate: requer `hr.compliance.access` (admin-only por design, D-08).
- Infinite scroll com filtros (tipo, competência, janela de período, funcionário).
- 5 tabs: AFD / AFDT / Recibos / Folhas Espelho / eSocial S-1200.
- Botão "Baixar" por linha abre URL presigned 15min (window.open) — audit log
  `COMPLIANCE_ARTIFACT_DOWNLOADED` registrado no backend.

### Sub-rotas

```
/hr/compliance/afd              → Gerador AFD (oficial Portaria 671)
/hr/compliance/afdt             → Gerador AFDT (artefato proprietário — banner D-05 obrigatório)
/hr/compliance/folhas-espelho   → Individual + bulk por departamento (Socket.IO progress)
/hr/compliance/esocial-s1200    → Submissão eventos S-1200 com PIN obrigatório
/hr/compliance/esocial-rubricas → Configuração mapeamento CLT → codRubr (HE_50/HE_100/DSR obrigatórios)
/hr/compliance/esocial-config   → Config eSocial incluindo campo INPI (REP-P) — D-06
```

### Permission matrix

| Rota                              | Permissão                              |
| --------------------------------- | -------------------------------------- |
| `/hr/compliance` (dashboard)      | `hr.compliance.access`                 |
| `/hr/compliance/afd`              | `hr.compliance.afd.generate`           |
| `/hr/compliance/afdt`             | `hr.compliance.afdt.generate`          |
| `/hr/compliance/folhas-espelho`   | `hr.compliance.folha-espelho.generate` |
| `/hr/compliance/esocial-s1200`    | `hr.compliance.s1200.submit` (+ PIN)   |
| `/hr/compliance/esocial-rubricas` | `hr.compliance.config.modify`          |
| `/hr/compliance/esocial-config`   | `hr.compliance.config.modify`          |
| Download button em cada artefato  | `hr.compliance.artifact.download`      |

### Entry points

- Card "Compliance — Portaria 671" em `/hr` (seção "Obrigações e Configurações"),
  ao lado de "Relatórios" e "eSocial".

### Realtime

- Folhas espelho em lote: Socket.IO `compliance.folha_espelho.progress` e
  `compliance.folha_espelho.completed` em room `tenant:{id}:hr`.
- Hook: `useComplianceBulkProgress(bulkJobId)`.

### Sensitive operations

- Submissão S-1200 ao eSocial → `VerifyActionPinModal` obrigatório (operação
  regulatória + audit log `ESOCIAL_SUBMIT`).
- Edição `EsocialConfig.inpiNumber` → audit log `ESOCIAL_CONFIG_UPDATED` com
  `{ inpiChanged: boolean }` (valor do INPI nunca é logado).

---

## HR > Ponto (Gestor) — Phase 7 / Plan 07-06

Dashboard do gestor para acompanhar batidas em tempo real, resolver exceções
em lote, monitorar saúde dos dispositivos e auditar funcionários faltantes.
Consome endpoints Wave 2 (Plans 03/04/05) + Socket.IO scope do Plan 02.

### Routes

| Rota                  | Permissão                                                 | Descrição                                                         |
| --------------------- | --------------------------------------------------------- | ----------------------------------------------------------------- |
| `/hr/punch/dashboard` | `hr.punch-approvals.access` OR `hr.punch-approvals.admin` | Heatmap funcionário×dia + feed realtime + cards faltantes/devices |
| `/hr/punch/approvals` | `hr.punch-approvals.access` OR `hr.punch-approvals.admin` | Fila de exceções com multi-select + PIN gate quando lote > 5      |
| `/hr/punch/health`    | `hr.punch-approvals.admin` OR `hr.punch-devices.access`   | Status online/offline de PunchDevice em tempo real                |
| `/hr/punch/missing`   | `hr.punch-approvals.access` OR `hr.punch-approvals.admin` | Lista de funcionários sem batida na data selecionada (job 22h)    |

### Entry points

- Card "Ponto — Gestor" em `/hr` (seção "Gestão de Tempo"), gated por
  `hr.punch-approvals.access` — não renderiza se usuário não tem a permissão.

### Realtime

- Feed de batidas: Socket.IO `punch.time-entry.scoped` em room
  `tenant:{id}:hr` — incremental via `queryClient.setQueryData` (não invalidate).
- Status de dispositivos: Socket.IO `tenant.hr.devices.status-change` em room
  `tenant:{id}:hr:admin` — incremental.
- Hooks: `usePunchFeed()`, `usePunchDevicesHealth()`.

### Sensitive operations

- Resolver exceções em lote com > 5 selecionadas → `VerifyActionPinModal`
  obrigatório (header `x-action-pin-token`).
- Upload de PDF de evidência → header `x-action-pin-token` propagado por
  `PunchEvidenceUploader`.

### LGPD

- Backend não retorna CPF nas 4 rotas (DTO sanitiza).
- Filtros não usam CPF/PIS/CNPJ na query string.
- Playwright sentinel valida ausência de "cpf" no DOM.

---

## PWA Pessoal de Ponto (Funcionário) — Phase 8 (Plans 08-01..08-03)

PWA pessoal instalável para que o colaborador bata ponto pelo próprio
celular — com GPS, selfie opcional, push notifications, sync offline e
justificativa com anexo. Discovery dual-track: distribuição centralizada
pelo RH (`/devices/downloads/punch-pwa` com QR + cartaz A4) + descoberta
natural pelo funcionário (`/hr` card "Bater Ponto pelo Celular" + banner
sticky em `/punch` quando mobile fora de standalone).

### Routes

| Rota                           | Permissão                                  | Descrição                                                                                                          |
| ------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `/punch`                       | auth-only (sem permission gate específica) | Página principal da PWA — CTA grande, GPS, selfie, today history, install banner                                   |
| `/punch/justify/[id]`          | `hr.punch-approvals.access`                | Form de justificativa com câmera/galeria/PDF picker (Plan 8-03)                                                    |
| `/punch/history`               | auth-only                                  | Histórico 7 dias com infinite scroll + status badges + retry manual (Plan 8-03)                                    |
| `/devices/downloads/punch-pwa` | `admin.devices.access`                     | Distribuição admin: QR code + instruções por SO (Android Chrome / iOS Safari / Desktop) + cartaz A4 print-friendly |

### Entry points

- Card **"Punch PWA"** em `/devices` (seção "Gerenciamento") — gradient violet
  → roxo, aponta para `/devices/downloads/punch-pwa`. Para RH/admin distribuir.
- Card **"Bater Ponto pelo Celular"** em `/hr` (seção "Autoatendimento") —
  aponta para `/punch`. Sem permission gate (auth-only). Para descoberta
  natural pelo colaborador.
- **`PWAInstallBanner`** sticky dentro de `/punch` — renderiza só em mobile
  UA + sem standalone + sem dismiss flag. Em iOS abre `IOSAddToHomeScreenModal`;
  em Android Chrome chama deferred `beforeinstallprompt`.

### Realtime

- Push notifications de confirmação de batida via `sw-punch.js` push handler
  (Plan 8-01) — payload `{ notificationId, title, body, actionUrl, kind }`
  alinhado a Phase 4-05 web-push-adapter.
- Socket.IO sala `user:{userId}` para histórico em tempo real (Plan 8-03,
  reusa Phase 7-02 auto-join).

### Service Worker

- Scope: `/punch` (isolado do dashboard)
- File: `OpenSea-APP/public/sw-punch.js` (Plan 8-01)
- Manifest: `OpenSea-APP/public/manifest-punch.json` (Plan 8-01) — 3 shortcuts.
- Backoff offline queue: 30s / 1m / 5m / 30m + TTL 7 dias (Plan 8-01).

### Sensitive operations

- Sem operações destrutivas com PIN no flow PWA pessoal — funcionário cria
  PunchApproval (criação imutável) ou apenas envia batida.
- Upload de evidência (justificativa) — Plan 8-03 reusa S3 presigned (Phase 6).

### LGPD

- Tenant.id no QR code é UUID interno (não PII) — accept disposition (T-8-02-01).
- Cartaz impresso contém apenas URL pública + nome do tenant — accept (T-8-02-04).

---

## Phase 10 — Punch-Agent biométrico (Plan 10-06)

### /hr/punch-devices/downloads

- **Permission:** `hr.punch-devices.access`
- **Purpose:** Página de download do Punch-Agent (Phase 10) com botões NSIS (.exe) + MSI + guia de pareamento passo a passo.
- **Components:** `PunchAgentDownloadCard` (hero), hook `useLatestPunchAgentRelease` (GitHub Releases API).
- **Entry points:**
  - Card "Punch-Agent (downloads)" na landing `/hr` (seção "Ponto") — permission `hr.punch-devices.access`.
  - Link "Baixar Punch-Agent" na página `/hr/punch/health` (health dos dispositivos).
- **Download targets:** NSIS .exe (instalação interativa) + MSI (distribuição corporativa via GPO/SCCM/Intune).
- **Fallback:** Se GitHub API indisponível (rate-limit/403), links apontam para `/releases/latest/download/` estático — sem erro para o usuário.
- localStorage `punch-pwa-install-dismissed` é UX-only flag — accept (T-8-02-03).

---

## Phase 11 — Webhooks outbound (Plan 11-03)

Painel admin para configurar endpoints externos que recebem eventos `punch.*`
em tempo real com assinatura HMAC-SHA256 (envelope Stripe-style),
retry exponencial automático, anti-SSRF, anti-replay e reprocessamento
manual. RBAC 4-níveis `system.webhooks.endpoints.*` (ADR-031, admin-only D-10).

### Routes

| Rota                           | Permissão                                  | Descrição                                                                                                                                  |
| ------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `/devices/webhooks`            | `system.webhooks.endpoints.access`         | Listing infinite scroll com Status DropdownMenu (4 opções) + busca + counter `N/50` (slate→amber@45→rose@50, D-34); auto-disabled no topo. |
| `/devices/webhooks/new`        | `system.webhooks.endpoints.register`       | Wizard 3 passos (Identificação → Eventos → Secret revelado UMA vez). Step 3 mostra snippets Node/Python/Go anti-replay (D-06).             |
| `/devices/webhooks/[id]`       | `system.webhooks.endpoints.access`         | Detail + 3 tabs (Visão geral / Entregas / Configuração). Banner auto-disable + DeliveryDetailDrawer 480px + 4 ações inline. PIN gate em Excluir + Reativar. |
| `/devices/webhooks/[id]/edit`  | `system.webhooks.endpoints.modify`         | Form com URL read-only + descrição + status switch + eventos + versão + Regenerar secret. PIN gate (`system.webhooks.endpoints.admin`) em Regenerar (D-08). |

### Entry points

- Card **"Webhooks"** em `/devices` (seção "Gerenciamento") — gradient `from-amber-500 to-orange-600` (cor reservada exclusiva Phase 11).

### Realtime

- React Query polling `refetchInterval: 30_000` na lista de entregas quando filtro inclui PENDING ou FAILED (V1 A5 simplification).
- v2 deferred: Socket.IO room `tenant:{id}:system:webhooks` evento `webhook.endpoint.status_changed`.

### Sensitive operations

- **Excluir webhook** (`system.webhooks.endpoints.remove`): VerifyActionPinModal — entregas pendentes canceladas + soft-delete (cascade WebhookDelivery).
- **Regenerar secret** (`system.webhooks.endpoints.admin`): VerifyActionPinModal — secret antigo válido por 7 dias (D-07 rotação suave).
- **Reativar auto-desativado** (`system.webhooks.endpoints.admin`): VerifyActionPinModal — conta DEAD volta a contar para auto-disable.

Header: `x-action-pin-token` (JWT scope=action-pin) — verificado pelo middleware `verifyActionPin` no backend (Plan 11-02 Task 4).

### LGPD

- Secret cleartext exibido APENAS no body do POST /v1/system/webhooks (Step 3 do wizard) e no response do /regenerate-secret. UI nunca persiste em localStorage (T-11-03).
- DTO sempre traz `secretMasked = whsec_••••••••<last4>` (D-08).
- Signature no Drawer mascarada após primeiros 8 hex chars (`v1=a3b1c...`).
- Payload completo do request body NÃO é exibido no log — apenas response body do customer (truncado a 1KB pelo backend) (T-11-14).
