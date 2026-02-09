# CRITICO: Implementar Testes

**Status**: <1% de cobertura (1 arquivo de teste em 1.027 source files)
**Meta**: 60%+ cobertura em paths criticos
**Esforco**: ~24h (3-4 semanas com trabalho parcial)

---

## Problema

O projeto tem praticamente zero testes. Apenas `error-boundary.test.tsx` existe.
Isso torna refactoring perigoso, bugs silenciosos e regressoes nao detectadas.

## Infraestrutura Existente

- Vitest configurado (`vitest.config.ts`)
- Playwright configurado para E2E
- Setup com mocks de localStorage e fetch (`setup.ts`)
- Coverage report HTML habilitado

## Plano de Acao

### Fase 1: Testes Unitarios dos Modulos Criticos (~12h)

#### 1.1 API Client (`src/lib/api-client.ts`) - 4h

Arquivo mais critico - gerencia tokens, refresh, erros.

```
Testes necessarios:
- [ ] GET/POST/PUT/PATCH/DELETE fazem fetch corretamente
- [ ] Authorization header e adicionado quando token existe
- [ ] Token refresh automatico no 401
- [ ] Deduplicacao de refresh (multiplos 401 simultaneos)
- [ ] Timeout de 30s funciona
- [ ] Erros de rede retornam mensagem util
- [ ] 429 (rate limit) e tratado
- [ ] Tokens sao atualizados no localStorage apos refresh
- [ ] Evento `auth-token-change` e disparado
- [ ] Fallback para refresh que falha (limpa tokens, redireciona)
```

Arquivo: `src/lib/__tests__/api-client.spec.ts`

#### 1.2 Auth Context (`src/contexts/auth-context.tsx`) - 3h

Controla todo o fluxo de autenticacao.

```
Testes necessarios:
- [ ] Login armazena tokens no localStorage
- [ ] Logout limpa tokens
- [ ] isAuthenticated reflete estado do token
- [ ] isSuperAdmin vem do user data
- [ ] Cross-tab sync via StorageEvent
- [ ] Redirect automatico quando nao autenticado
- [ ] Rotas publicas nao redirecionam
- [ ] Token expirado dispara refresh
- [ ] E2E bypass mode funciona
```

Arquivo: `src/contexts/__tests__/auth-context.spec.tsx`

#### 1.3 Tenant Context (`src/contexts/tenant-context.tsx`) - 2h

```
Testes necessarios:
- [ ] Seleção de tenant atualiza JWT
- [ ] Query cache e limpo ao trocar tenant
- [ ] Tenant e persistido no localStorage
- [ ] Validação de tenantId no JWT
- [ ] Lista de tenants e carregada corretamente
```

Arquivo: `src/contexts/__tests__/tenant-context.spec.tsx`

#### 1.4 ApiError Class (`src/lib/errors/api-error.ts`) - 1h

```
Testes necessarios:
- [ ] Factory methods criam erros corretos (fromResponse, network, timeout)
- [ ] isType() funciona para cada tipo
- [ ] isRetryable() retorna true para NETWORK/TIMEOUT/SERVER
- [ ] Field-level validation errors sao extraidos
- [ ] Timestamp e preservado
```

Arquivo: `src/lib/errors/__tests__/api-error.spec.ts`

#### 1.5 Hooks Criticos - 2h

```
Hooks prioritarios:
- [ ] useProducts (query + mutations + invalidation)
- [ ] useMe (stale time, refetch interval)
- [ ] useBatchOperation (progress, pause/resume, cancel)
```

Usar `@testing-library/react-hooks` ou `renderHook` do `@testing-library/react`.

### Fase 2: Testes de Componentes (~6h)

#### 2.1 EntityForm - 2h

```
- [ ] Renderiza campos baseado em config
- [ ] Validacao required funciona
- [ ] Custom validation funciona
- [ ] Submit envia dados corretos
- [ ] Reset limpa o form
- [ ] Tabs/sections renderizam corretamente
```

#### 2.2 EntityGrid - 2h

```
- [ ] Renderiza items em modo grid e list
- [ ] Selecao por clique funciona
- [ ] Multi-select com Shift funciona
- [ ] Context menu aparece no right-click
- [ ] Sorting funciona
```

#### 2.3 ProtectedRoute & PermissionGate - 1h

```
- [ ] Redireciona quando nao autenticado
- [ ] Renderiza children quando tem permissao
- [ ] Bloqueia quando nao tem permissao
- [ ] E2E bypass permite tudo
```

#### 2.4 Error Components - 1h

```
- [ ] GridError renderiza por tipo (server, network, auth)
- [ ] Botao de retry chama callback
- [ ] Toast utils mostram mensagem correta
```

### Fase 3: Testes E2E com Playwright (~6h)

#### 3.1 Fluxo de Login - 2h

```
- [ ] Login com credenciais validas
- [ ] Login com credenciais invalidas
- [ ] Selecao de tenant
- [ ] Redirect para dashboard apos login
- [ ] Logout limpa sessao
```

#### 3.2 Fluxo CRUD Basico (Products) - 2h

```
- [ ] Listar produtos
- [ ] Criar produto
- [ ] Editar produto
- [ ] Deletar produto
- [ ] Busca funciona
```

#### 3.3 Fluxo de Navegacao - 2h

```
- [ ] Navbar renderiza menu correto
- [ ] Troca de tenant limpa dados
- [ ] Central so acessivel por super admin
- [ ] Paginas protegidas redirecionam
```

## Comandos

```bash
# Rodar testes unitarios
npm run test

# Rodar testes em watch mode
npm run test:watch

# Rodar com coverage
npx vitest --coverage

# Rodar E2E
npm run test:e2e

# Rodar teste especifico
npx vitest run src/lib/__tests__/api-client.spec.ts
```

## Metricas de Sucesso

- [ ] 60%+ cobertura em `src/lib/`
- [ ] 50%+ cobertura em `src/contexts/`
- [ ] 5+ cenarios E2E passando
- [ ] CI rodando testes automaticamente
