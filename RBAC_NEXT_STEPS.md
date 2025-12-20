# RBAC - Próximos Passos e Guia de Uso

## 📋 Status Atual

✅ **IMPLEMENTAÇÃO COMPLETA**

Tudo que foi solicitado está implementado e pronto para uso:

- ✅ Tipos TypeScript completos
- ✅ Serviço de API com todos os endpoints
- ✅ Configurações de entidades (Permissions, Groups, Users)
- ✅ Páginas de gerenciamento (3 páginas completas)
- ✅ Hook usePermissions com múltiplas variações
- ✅ Componentes de proteção (PermissionGuard, ProtectedPage)
- ✅ Menu integrado
- ✅ Permissões base definidas (65+ permissões)
- ✅ Grupos base definidos (7 grupos)
- ✅ Script de setup

---

## 🎯 Próximos Passos Imediatos

### 1. Testar as Páginas

Acesse as novas páginas através do menu "Administração":

```
http://localhost:3000/admin/users
http://localhost:3000/admin/permission-groups
http://localhost:3000/admin/permissions
```

### 2. Executar o Setup (Quando Backend Estiver Pronto)

Quando a API RBAC estiver funcionando, execute o setup para criar permissões e grupos base:

```typescript
// Em um componente ou página administrativa
import { setupRBAC } from '@/scripts/rbac-setup';

const handleSetup = async () => {
  const result = await setupRBAC();
  console.log(result);
};
```

Ou crie uma página dedicada:

```tsx
// src/app/admin/rbac-setup/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { setupRBAC } from '@/scripts/rbac-setup';

export default function RBACSetupPage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    const setupResult = await setupRBAC();
    setResult(setupResult);
    setIsLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Setup RBAC</h1>
      <Button onClick={handleSetup} disabled={isLoading}>
        {isLoading ? 'Configurando...' : 'Configurar RBAC'}
      </Button>
      {result && (
        <pre className="mt-4 p-4 bg-muted rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
```

### 3. Atribuir Grupos aos Usuários

Depois do setup, atribua o grupo "Super Administrador" ao seu usuário:

1. Acesse: `http://localhost:3000/admin/users`
2. Clique em um usuário
3. Clique em "Gerenciar Grupos"
4. Atribua o grupo "Super Administrador"

---

## 🔧 Como Usar os Componentes

### PermissionGuard - Proteger Elementos da UI

```tsx
import { PermissionGuard } from '@/components/rbac';

// Permissão única
<PermissionGuard permission="stock.products.create">
  <Button>Criar Produto</Button>
</PermissionGuard>

// Pelo menos uma permissão (OR)
<PermissionGuard anyPermission={['stock.products.create', 'stock.products.update']}>
  <ProductForm />
</PermissionGuard>

// Todas as permissões (AND)
<PermissionGuard allPermissions={['stock.products.view', 'stock.products.delete']}>
  <DeleteButton />
</PermissionGuard>

// Com mensagem de acesso negado
<PermissionGuard
  permission="admin.settings.view"
  showDeniedMessage
  deniedMessage="Apenas administradores podem acessar as configurações"
>
  <SettingsPanel />
</PermissionGuard>

// Com fallback customizado
<PermissionGuard
  permission="stock.products.create"
  fallback={<p className="text-muted-foreground">Você não pode criar produtos</p>}
>
  <CreateButton />
</PermissionGuard>
```

### Guards Especializados

```tsx
import { CanCreate, CanView, CanEdit, CanDelete } from '@/components/rbac';

// Atalhos para operações CRUD
<CanCreate resource="stock.products">
  <CreateProductButton />
</CanCreate>

<CanEdit resource="stock.products">
  <EditProductButton />
</CanEdit>

<CanDelete resource="stock.products">
  <DeleteProductButton />
</CanDelete>
```

### ProtectedPage - Proteger Páginas Inteiras

```tsx
import { ProtectedPage } from '@/components/rbac';

export default function ProductsPage() {
  return (
    <ProtectedPage permission="stock.products.view">
      <div>
        <h1>Produtos</h1>
        {/* Conteúdo da página */}
      </div>
    </ProtectedPage>
  );
}

// Com redirecionamento
<ProtectedPage
  permission="admin.settings.view"
  redirectTo="/dashboard"
>
  <SettingsPage />
</ProtectedPage>

// Com página de acesso negado customizada
<ProtectedPage
  permission="admin.users.manage"
  showDeniedPage
  deniedTitle="Área Restrita"
  deniedMessage="Apenas administradores podem gerenciar usuários"
>
  <UserManagementPage />
</ProtectedPage>
```

### usePermissions - Hook para Lógica

```tsx
import { usePermissions, usePermission, useMultiplePermissions } from '@/hooks/use-permissions';

// Hook completo
function MyComponent() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) return <Skeleton />;

  const canCreate = hasPermission('stock.products.create');
  const canEdit = hasPermission('stock.products.update');
  const canDelete = hasPermission('stock.products.delete');

  return (
    <div>
      {canCreate && <CreateButton />}
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </div>
  );
}

// Hook simplificado (uma permissão)
function CreateButton() {
  const canCreate = usePermission('stock.products.create');

  if (!canCreate) return null;

  return <Button>Criar Produto</Button>;
}

// Hook para múltiplas permissões
function ProductActions() {
  const { canCreate, canEdit, canDelete } = useMultiplePermissions({
    canCreate: 'stock.products.create',
    canEdit: 'stock.products.update',
    canDelete: 'stock.products.delete',
  });

  return (
    <div className="flex gap-2">
      {canCreate && <Button>Criar</Button>}
      {canEdit && <Button>Editar</Button>}
      {canDelete && <Button variant="destructive">Excluir</Button>}
    </div>
  );
}
```

---

## 📚 Permissões Disponíveis

### Core (Sistema)

```typescript
// RBAC
'core.rbac.view'
'core.rbac.create'
'core.rbac.update'
'core.rbac.delete'
'core.rbac.manage'

// Users
'core.users.view'
'core.users.create'
'core.users.update'
'core.users.delete'
'core.users.manage'

// Settings
'core.settings.view'
'core.settings.update'
```

### Stock (Estoque)

```typescript
// Templates
'stock.templates.view'
'stock.templates.create'
'stock.templates.update'
'stock.templates.delete'

// Products
'stock.products.view'
'stock.products.create'
'stock.products.update'
'stock.products.delete'

// Variants
'stock.variants.view'
'stock.variants.create'
'stock.variants.update'
'stock.variants.delete'

// Items
'stock.items.view'
'stock.items.create'
'stock.items.update'
'stock.items.delete'

// Locations
'stock.locations.view'
'stock.locations.create'
'stock.locations.update'
'stock.locations.delete'

// Categories
'stock.categories.view'
'stock.categories.create'
'stock.categories.update'
'stock.categories.delete'

// Suppliers
'stock.suppliers.view'
'stock.suppliers.create'
'stock.suppliers.update'
'stock.suppliers.delete'

// Manufacturers
'stock.manufacturers.view'
'stock.manufacturers.create'
'stock.manufacturers.update'
'stock.manufacturers.delete'

// Tags
'stock.tags.view'
'stock.tags.create'
'stock.tags.update'
'stock.tags.delete'

// Wildcards
'stock.*.view'      // Ver tudo no estoque
'stock.*.manage'    // Gerenciar tudo no estoque
```

### Sales (Vendas)

```typescript
// Orders
'sales.orders.view'
'sales.orders.create'
'sales.orders.update'
'sales.orders.delete'

// Customers
'sales.customers.view'
'sales.customers.create'
'sales.customers.update'
'sales.customers.delete'
```

### Wildcard (Admin Total)

```typescript
'*.*.*'  // Acesso total ao sistema (Super Admin)
```

---

## 👥 Grupos Disponíveis

### 1. Super Administrador
- **Prioridade**: 1000
- **Cor**: Vermelho (#EF4444)
- **Permissões**: `*.*.*` (acesso total)

### 2. Administrador
- **Prioridade**: 900
- **Cor**: Laranja (#F97316)
- **Permissões**: Acesso a RBAC, usuários, configurações, estoque completo e vendas

### 3. Gerente de Estoque
- **Prioridade**: 500
- **Cor**: Azul (#3B82F6)
- **Permissões**: Gerenciamento completo do estoque

### 4. Operador de Estoque
- **Prioridade**: 300
- **Cor**: Verde (#10B981)
- **Permissões**: Visualizar estoque, criar/atualizar itens e localizações

### 5. Vendedor
- **Prioridade**: 200
- **Cor**: Roxo (#8B5CF6)
- **Permissões**: Visualizar produtos, criar pedidos, gerenciar clientes

### 6. Visualizador
- **Prioridade**: 100
- **Cor**: Cinza (#6B7280)
- **Permissões**: Somente leitura em todos os módulos

### 7. Usuário Básico
- **Prioridade**: 50
- **Cor**: Cinza Escuro (#64748B)
- **Permissões**: Visualizar templates, produtos e variantes

---

## 🎨 Exemplos Práticos

### Exemplo 1: Proteger Botão de Criar

```tsx
import { PermissionGuard } from '@/components/rbac';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function ProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1>Produtos</h1>
        <PermissionGuard permission="stock.products.create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </PermissionGuard>
      </div>
      {/* Lista de produtos */}
    </div>
  );
}
```

### Exemplo 2: Proteger Página Administrativa

```tsx
// src/app/admin/settings/page.tsx
import { ProtectedPage } from '@/components/rbac';

export default function SettingsPage() {
  return (
    <ProtectedPage
      permission="core.settings.view"
      deniedTitle="Configurações Restritas"
      deniedMessage="Apenas administradores podem acessar as configurações do sistema"
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Configurações</h1>
        {/* Conteúdo das configurações */}
      </div>
    </ProtectedPage>
  );
}
```

### Exemplo 3: Lógica Condicional com Permissões

```tsx
import { usePermissions } from '@/hooks/use-permissions';

function ProductCard({ product }) {
  const { hasPermission } = usePermissions();

  const canEdit = hasPermission('stock.products.update');
  const canDelete = hasPermission('stock.products.delete');

  const handleEdit = () => {
    if (!canEdit) {
      toast.error('Você não tem permissão para editar produtos');
      return;
    }
    // Lógica de edição
  };

  const handleDelete = () => {
    if (!canDelete) {
      toast.error('Você não tem permissão para excluir produtos');
      return;
    }
    // Lógica de exclusão
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardFooter className="flex gap-2">
        {canEdit && (
          <Button onClick={handleEdit}>Editar</Button>
        )}
        {canDelete && (
          <Button variant="destructive" onClick={handleDelete}>
            Excluir
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

### Exemplo 4: Menu Condicional

```tsx
import { usePermission } from '@/hooks/use-permissions';

function Sidebar() {
  const canViewUsers = usePermission('core.users.view');
  const canViewRBAC = usePermission('core.rbac.view');
  const canViewSettings = usePermission('core.settings.view');

  return (
    <nav>
      <MenuItem href="/dashboard">Dashboard</MenuItem>
      <MenuItem href="/stock/products">Produtos</MenuItem>

      {(canViewUsers || canViewRBAC || canViewSettings) && (
        <MenuSection title="Administração">
          {canViewUsers && (
            <MenuItem href="/admin/users">Usuários</MenuItem>
          )}
          {canViewRBAC && (
            <MenuItem href="/admin/permission-groups">Grupos</MenuItem>
          )}
          {canViewRBAC && (
            <MenuItem href="/admin/permissions">Permissões</MenuItem>
          )}
          {canViewSettings && (
            <MenuItem href="/admin/settings">Configurações</MenuItem>
          )}
        </MenuSection>
      )}
    </nav>
  );
}
```

---

## ⚠️ Pontos de Atenção

### 1. Segurança

- **NUNCA confie apenas no frontend**: As permissões no frontend são para UX, não segurança
- O backend DEVE validar todas as permissões
- Use HTTPS em produção
- Tokens devem ter expiração

### 2. Performance

- Permissões são cacheadas por 15 minutos
- Use `usePermission` para verificações simples
- Use `useMultiplePermissions` para verificar várias de uma vez
- Evite verificar permissões em loops

### 3. Wildcards

- Use com cuidado: `*.*.*` dá acesso total
- Deny sempre tem precedência sobre allow
- Wildcards parciais funcionam: `stock.*.view`

### 4. Hierarquia de Grupos

- Grupos filhos herdam permissões dos pais
- Prioridade maior = maior precedência
- Máximo 2-3 níveis de hierarquia recomendado

---

## 🐛 Troubleshooting

### Permissões não carregam

```typescript
// Verificar se o usuário está autenticado
const { user } = useAuth();
console.log('User:', user);

// Verificar se as permissões estão sendo buscadas
const { effectivePermissions, isLoading, error } = usePermissions();
console.log('Permissions:', effectivePermissions);
console.log('Loading:', isLoading);
console.log('Error:', error);
```

### Componente não renderiza

```typescript
// Adicionar logs para debug
<PermissionGuard permission="stock.products.create">
  {console.log('Dentro do PermissionGuard')}
  <Button>Criar</Button>
</PermissionGuard>

// Verificar se a permissão está correta
const { hasPermission } = usePermissions();
console.log('Has permission:', hasPermission('stock.products.create'));
```

### Script de setup falha

```typescript
// Verificar conexão com backend
try {
  const result = await setupRBAC();
  console.log('Setup result:', result);
} catch (error) {
  console.error('Setup error:', error);
}

// Verificar se a API está respondendo
const test = await fetch('/api/v1/rbac/permissions');
console.log('API status:', test.status);
```

---

## ✅ Checklist de Integração

- [ ] Backend RBAC funcionando
- [ ] Executar script de setup (`setupRBAC()`)
- [ ] Verificar permissões criadas (65+)
- [ ] Verificar grupos criados (7)
- [ ] Atribuir grupo ao usuário admin
- [ ] Testar login com permissões
- [ ] Testar páginas de gerenciamento
- [ ] Proteger rotas existentes com `ProtectedPage`
- [ ] Proteger botões/ações com `PermissionGuard`
- [ ] Testar com usuários de diferentes grupos
- [ ] Verificar que deny > allow funciona
- [ ] Testar herança de grupos
- [ ] Testar expiration de grupos
- [ ] Documentar permissões customizadas (se houver)

---

## 📞 Suporte

Se precisar de ajuda:

1. Verificar logs do navegador (F12)
2. Verificar logs do servidor
3. Conferir documentação em `RBAC_IMPLEMENTATION_SUMMARY.md`
4. Revisar guia de integração em `RBAC_MENU_INTEGRATION.md`

---

**Última Atualização**: 3 de Dezembro de 2025
**Versão**: 1.0.0
**Status**: ✅ Pronto para Produção (após setup)
