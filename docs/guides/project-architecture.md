# Arquitetura do Projeto OpenSea

**Status:** Fonte canônica. Originalmente ditado pelo usuário em `Relatório de Correcoes.md` (2026-03-12), promovido para este documento em 2026-04-17.

O OpenSea é um **ERP multi-modular multi-tenant**. Este documento define a estrutura de alto nível: interfaces, modules, tools.

---

## Interfaces (route groups do Next.js)

Nossas interfaces estão divididas em grupos de rotas no frontend:

| Route group   | Propósito                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------ |
| `(auth)`      | Páginas de autenticação (login, register, recuperação de senha)                            |
| `(central)`   | Dashboard administrativo dos tenants (super admin)                                         |
| `(dashboard)` | **O produto em si** — o ERP que um tenant acessa                                           |
| `plan`        | Administrador de tenant configura e altera planos contratados — **ainda não implementado** |
| `public`      | Páginas públicas — **ainda não implementado**                                              |
| `support`     | Central aberta de suporte — **ainda não implementado**                                     |

---

## Modules vs Tools

O sistema é dividido em duas categorias:

- **Modules** — domínios de negócio (cadastrados e habilitados no plano do tenant via Central)
- **Tools** — features de produtividade (também habilitados por plano)

---

## Modules previstos

| #   | Module           | Slug                        | Status                            |
| --- | ---------------- | --------------------------- | --------------------------------- |
| 1   | Administrativo   | `admin`                     | Implementado                      |
| 2   | Estoque          | `stock`                     | Implementado                      |
| 3   | Financeiro       | `finance`                   | Implementado                      |
| 4   | Produção         | `factory` (ou `production`) | Implementado parcial              |
| 5   | Recursos Humanos | `hr`                        | Implementado                      |
| 6   | Vendas           | `sales`                     | Implementado                      |
| 7   | Caixa            | `cashier`                   | Planejado (parte via `sales/pos`) |
| 8   | Design           | (futuro)                    | Não implementado                  |

### Por sub-seção canônica

Cada module pode ter 5 tipos de conteúdo:

- **Entidades** — CRUDs (produtos, clientes, etc.)
- **Actions** — ações operacionais (escanear item, criar volume, balanço)
- **Overviews** — consultas/listas agregadas
- **Analytics** — indicadores e relatórios
- **Requests** — pedidos/solicitações cross-módulo

#### Administrativo (admin)

- **Entidades:** Usuários, Times, Empresas, Grupos de Permissões
- **Overviews:** Logs de auditoria
- **Analytics:** Frequência de acesso
- **Requests:** Solicitar Feature

#### Estoque (stock)

- **Entidades:** Templates, Produtos / Variantes / Itens, Fabricantes, Localização, Categoria de Produtos
- **Actions:** Quick Scan (escanear item), Volumes (criar e rastrear volume com vários itens), Balanço
- **Overviews:** Consultar Estoque, Consultar Movimentações
- **Analytics:** Curva ABC, Volume de Venda, Tempo em Estoque, Giro
- **Requests:** Ordens de compra

#### Financeiro, Produção, RH, Vendas, Caixa

As sub-seções seguem o mesmo modelo (5 tipos). O detalhe de entidades/actions/etc. para cada um está documentado nos respectivos `OpenSea-APP/docs/modules/*.md` e `OpenSea-API/docs/modules/*.md`.

---

## Tools previstas

| #   | Tool         | Nome                    | Status           |
| --- | ------------ | ----------------------- | ---------------- |
| 1   | File Manager | Gerenciador de Arquivos | Implementado     |
| 2   | Calendar     | Calendário              | Implementado     |
| 3   | Email        | Email                   | Implementado     |
| 4   | Tasks        | Tarefas                 | Implementado     |
| 5   | Contacts     | Contatos                | Não implementado |
| 6   | Calculator   | Calculadora             | Não implementado |
| 7   | Messenger    | Messenger               | Não implementado |

---

## Central de Tenant

A Central é o ponto único onde:

- Modules são cadastrados e habilitados por plano
- Tools são cadastrados e habilitados por plano
- Tenants são gerenciados (CRUD, usuários, feature flags)
- Planos são criados e atribuídos

Apenas usuários com `isSuperAdmin: true` acessam `/central`. Tenants normais operam apenas dentro de `(dashboard)`.

---

## Referências adicionais

- `OpenSea-APP/docs/guides/developer-golden-rules.md` — regras universais de código (backend + frontend)
- `OpenSea-APP/docs/guides/navigation-map.md` — navegação entre modules (no submenus rule)
- `OpenSea-API/docs/adr/` — decisões arquiteturais numeradas
- `OpenSea-API/docs/modules/` — detalhe backend por module
- `OpenSea-APP/docs/modules/` — detalhe frontend por module
