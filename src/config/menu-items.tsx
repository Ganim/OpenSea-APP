/**
 * Menu Items Configuration
 * Estrutura de navegação do dashboard
 */

import type { MenuItem } from '@/types/menu';
import {
  BarChart3,
  Box,
  Building2,
  CircleDollarSign,
  FileText,
  Folder,
  Home,
  Package,
  ShoppingCart,
  Store,
  Tag,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react';

export const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Início',
    icon: <Home className="w-6 h-6" />,
    href: '/',
  },
  {
    id: 'stock',
    label: 'Estoque',
    icon: <Package className="w-6 h-6" />,
    submenu: [
      {
        id: 'assets',
        label: 'Ativos',
        icon: <Box className="w-6 h-6" />,
        submenu: [
          {
            id: 'templates',
            label: 'Templates',
            icon: <FileText className="w-6 h-6" />,
            href: '/stock/assets/templates',
            // Usuários comuns são redirecionados para página de requisição
          },
          {
            id: 'products',
            label: 'Produtos',
            icon: <Package className="w-6 h-6" />,
            href: '/stock/assets/products',
            requiredRole: 'MANAGER',
          },
          {
            id: 'template-categories',
            label: 'Categorias de Templates',
            icon: <Folder className="w-6 h-6" />,
            href: '/stock/assets/template-categories',
            requiredRole: 'MANAGER',
          },
          {
            id: 'product-categories',
            label: 'Categorias de Produtos',
            icon: <Folder className="w-6 h-6" />,
            href: '/stock/assets/product-categories',
            requiredRole: 'MANAGER',
          },
        ],
      },
      {
        id: 'supply',
        label: 'Fornecimento',
        icon: <Truck className="w-6 h-6" />,
        submenu: [
          {
            id: 'manufacturers',
            label: 'Fabricantes',
            icon: <Building2 className="w-6 h-6" />,
            href: '/stock/supply/manufacturers',
            requiredRole: 'MANAGER',
          },
          {
            id: 'suppliers',
            label: 'Fornecedores',
            icon: <Building2 className="w-6 h-6" />,
            href: '/stock/supply/suppliers',
            requiredRole: 'MANAGER',
          },
          {
            id: 'purchase-orders',
            label: 'Pedidos de Compra',
            icon: <FileText className="w-6 h-6" />,
            href: '/stock/supply/purchase-orders',
            requiredRole: 'MANAGER',
          },
          {
            id: 'tags',
            label: 'Etiquetas',
            icon: <Tag className="w-6 h-6" />,
            href: '/stock/supply/tags',
            requiredRole: 'MANAGER',
          },
          {
            id: 'brands',
            label: 'Marcas',
            icon: <Tag className="w-6 h-6" />,
            href: '/stock/supply/brands',
            requiredRole: 'MANAGER',
          },
          {
            id: 'requests',
            label: 'Solicitações',
            icon: <FileText className="w-6 h-6" />,
            href: '/stock/supply/requests',
          },
        ],
      },
      {
        id: 'locations',
        label: 'Localizações',
        icon: <Warehouse className="w-6 h-6" />,
        href: '/stock/locations',
        requiredRole: 'MANAGER',
      },
      {
        id: 'storage',
        label: 'Armazenamento',
        icon: <Warehouse className="w-6 h-6" />,
        href: '/stock/storage',
      },
    ],
  },
  {
    id: 'finance',
    label: 'Financeiro',
    icon: <CircleDollarSign className="w-6 h-6" />,
    badge: 'Em breve',
    variant: 'inactive',
  },
  {
    id: 'sales',
    label: 'Vendas',
    icon: <ShoppingCart className="w-6 h-6" />,
    badge: 'Em breve',
    variant: 'inactive',
  },
  {
    id: 'cashier',
    label: 'Caixa',
    icon: <Store className="w-6 h-6" />,
    badge: 'Em breve',
    variant: 'inactive',
  },
  {
    id: 'production',
    label: 'Produção',
    icon: <BarChart3 className="w-6 h-6" />,
    badge: 'Em breve',
    variant: 'inactive',
  },
  {
    id: 'users',
    label: 'Usuários',
    icon: <Users className="w-6 h-6" />,
    badge: 'Em breve',
    variant: 'inactive',
  },
];
