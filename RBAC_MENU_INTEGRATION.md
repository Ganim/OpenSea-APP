# RBAC Menu Integration Guide

## 📋 Overview

Este guia mostra como adicionar as páginas RBAC ao menu de navegação do sistema.

---

## 🎯 Páginas RBAC Criadas

### 1. Permissions (Permissões)
- **Rota**: `/admin/permissions`
- **Ícone**: Shield
- **Cor**: Blue (from-blue-500 to-indigo-600)
- **Permissão Necessária**: `core.rbac.view`

### 2. Permission Groups (Grupos de Permissões)
- **Rota**: `/admin/permission-groups`
- **Ícone**: Users
- **Cor**: Purple (from-purple-500 to-pink-600)
- **Permissão Necessária**: `core.rbac.view`

### 3. Users (Usuários)
- **Rota**: `/admin/users`
- **Ícone**: UserCircle
- **Cor**: Green (from-green-500 to-teal-600)
- **Permissão Necessária**: `core.users.view`

---

## 🔧 Como Adicionar ao Menu

### Opção 1: Adicionar ao Menu Existente

Se você já tem um arquivo de configuração de menu (ex: `src/config/menu-items.tsx`), adicione:

```typescript
import { Shield, Users, UserCircle } from 'lucide-react';

// Adicionar à seção de Administração
{
  title: 'Administração',
  items: [
    {
      title: 'Usuários',
      href: '/admin/users',
      icon: UserCircle,
      permission: 'core.users.view',
    },
    {
      title: 'Grupos de Permissões',
      href: '/admin/permission-groups',
      icon: Users,
      permission: 'core.rbac.view',
    },
    {
      title: 'Permissões',
      href: '/admin/permissions',
      icon: Shield,
      permission: 'core.rbac.view',
    },
  ],
}
```

### Opção 2: Criar Novo Grupo "Segurança"

```typescript
{
  title: 'Segurança',
  items: [
    {
      title: 'Usuários',
      href: '/admin/users',
      icon: UserCircle,
      permission: 'core.users.view',
      description: 'Gerenciar usuários do sistema',
    },
    {
      title: 'Grupos',
      href: '/admin/permission-groups',
      icon: Users,
      permission: 'core.rbac.view',
      description: 'Gerenciar grupos de permissões',
    },
    {
      title: 'Permissões',
      href: '/admin/permissions',
      icon: Shield,
      permission: 'core.rbac.view',
      description: 'Gerenciar permissões do sistema',
    },
  ],
}
```

---

## 🎨 Exemplo Completo de Menu

```typescript
// src/config/menu-items.tsx
import {
  LayoutDashboard,
  Package,
  Users,
  Shield,
  UserCircle,
  Settings,
  BarChart3,
  ShoppingCart,
} from 'lucide-react';

export interface MenuItem {
  title: string;
  href: string;
  icon: any;
  permission?: string;
  description?: string;
  badge?: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const menuItems: MenuSection[] = [
  {
    title: 'Dashboard',
    items: [
      {
        title: 'Visão Geral',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Relatórios',
        href: '/dashboard/reports',
        icon: BarChart3,
        permission: 'core.reports.view',
      },
    ],
  },
  {
    title: 'Estoque',
    items: [
      {
        title: 'Produtos',
        href: '/stock/assets/products',
        icon: Package,
        permission: 'stock.products.view',
      },
      {
        title: 'Templates',
        href: '/stock/assets/templates',
        icon: Package,
        permission: 'stock.templates.view',
      },
      {
        title: 'Variantes',
        href: '/stock/assets/variants',
        icon: Package,
        permission: 'stock.variants.view',
      },
    ],
  },
  {
    title: 'Vendas',
    items: [
      {
        title: 'Pedidos',
        href: '/sales/orders',
        icon: ShoppingCart,
        permission: 'sales.orders.view',
      },
    ],
  },
  {
    title: 'Administração',
    items: [
      {
        title: 'Usuários',
        href: '/admin/users',
        icon: UserCircle,
        permission: 'core.users.view',
        description: 'Gerenciar usuários do sistema',
      },
      {
        title: 'Grupos de Permissões',
        href: '/admin/permission-groups',
        icon: Users,
        permission: 'core.rbac.view',
        description: 'Gerenciar grupos de permissões',
      },
      {
        title: 'Permissões',
        href: '/admin/permissions',
        icon: Shield,
        permission: 'core.rbac.view',
        description: 'Gerenciar permissões do sistema',
      },
      {
        title: 'Configurações',
        href: '/admin/settings',
        icon: Settings,
        permission: 'core.settings.view',
      },
    ],
  },
];
```

---

## 🔐 Proteção de Rotas

Para proteger as rotas com permissões, você precisará criar um middleware ou wrapper:

### Exemplo de Middleware (Next.js App Router)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RBAC_ROUTES = {
  '/admin/users': 'core.users.view',
  '/admin/permission-groups': 'core.rbac.view',
  '/admin/permissions': 'core.rbac.view',
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requiredPermission = RBAC_ROUTES[pathname];

  if (requiredPermission) {
    // Verificar se usuário tem a permissão
    // const hasPermission = await checkUserPermission(userId, requiredPermission);

    // if (!hasPermission) {
    //   return NextResponse.redirect(new URL('/403', request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

### Exemplo de Hook de Permissão

```typescript
// hooks/usePermission.ts
import { useQuery } from '@tanstack/react-query';
import { listUserPermissions, createPermissionMap } from '@/services/rbac/rbac.service';
import { useAuth } from './useAuth';

export function usePermission(permissionCode: string) {
  const { user } = useAuth();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: () => user ? listUserPermissions(user.id) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutos
  });

  const permMap = createPermissionMap(permissions);
  const hasPermission = permMap.get(permissionCode) === 'allow';

  return { hasPermission, isLoading };
}

// Uso:
// const { hasPermission, isLoading } = usePermission('core.rbac.view');
```

### Exemplo de Componente de Guarda

```typescript
// components/PermissionGuard.tsx
import { usePermission } from '@/hooks/usePermission';

interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  fallback = null,
  children
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermission(permission);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Uso:
// <PermissionGuard permission="core.rbac.view">
//   <AdminPanel />
// </PermissionGuard>
```

---

## 🎯 Ordem Recomendada no Menu

### Prioridade de Exibição

1. **Usuários** - Mais usado, gerenciamento de pessoas
2. **Grupos de Permissões** - Configuração de acessos
3. **Permissões** - Menos usado, apenas para admins

### Organização Visual

```
📊 Dashboard
   └─ Visão Geral
   └─ Relatórios

📦 Estoque
   └─ Produtos
   └─ Templates
   └─ Variantes
   └─ Itens
   └─ Locais

🛒 Vendas
   └─ Pedidos
   └─ Clientes

⚙️ Administração
   └─ 👤 Usuários          [core.users.view]
   └─ 👥 Grupos            [core.rbac.view]
   └─ 🛡️  Permissões       [core.rbac.view]
   └─ ⚙️  Configurações    [core.settings.view]
```

---

## 🎨 Badges e Indicadores

Você pode adicionar badges para indicar itens importantes:

```typescript
{
  title: 'Grupos de Permissões',
  href: '/admin/permission-groups',
  icon: Users,
  permission: 'core.rbac.view',
  badge: 'Admin', // Badge estático
}

// Ou com contador dinâmico:
{
  title: 'Usuários',
  href: '/admin/users',
  icon: UserCircle,
  permission: 'core.users.view',
  badge: `${activeUsers}`, // Badge dinâmico
}
```

---

## 📱 Responsividade

As páginas RBAC são totalmente responsivas. No menu mobile:

```typescript
// Exemplo de menu mobile
<MobileMenu>
  <MobileMenuSection title="Administração">
    <MobileMenuItem href="/admin/users" icon={UserCircle}>
      Usuários
    </MobileMenuItem>
    <MobileMenuItem href="/admin/permission-groups" icon={Users}>
      Grupos
    </MobileMenuItem>
    <MobileMenuItem href="/admin/permissions" icon={Shield}>
      Permissões
    </MobileMenuItem>
  </MobileMenuSection>
</MobileMenu>
```

---

## ✅ Checklist de Integração

- [ ] Adicionar itens ao arquivo de configuração do menu
- [ ] Importar ícones (Shield, Users, UserCircle) do lucide-react
- [ ] Definir permissões necessárias para cada rota
- [ ] Criar/atualizar middleware de proteção de rotas
- [ ] Criar hook usePermission se não existir
- [ ] Testar navegação entre as páginas
- [ ] Verificar que usuários sem permissão não veem os itens
- [ ] Testar em mobile (responsividade)
- [ ] Adicionar breadcrumbs se necessário
- [ ] Atualizar documentação do sistema

---

## 🚀 Próximos Passos

Após adicionar ao menu:

1. **Testar Navegação** - Clicar em cada item e verificar se a página carrega
2. **Testar Permissões** - Verificar que usuários sem permissão não acessam
3. **Criar Permissões no Backend** - Criar as permissões `core.rbac.view`, etc.
4. **Atribuir a Grupos** - Criar grupo "Administrador" com todas as permissões
5. **Testar com Usuários Reais** - Criar usuários de teste e verificar acessos

---

**Última Atualização**: 3 de Dezembro de 2025
**Versão**: 1.0.0
