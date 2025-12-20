/**
 * Menu Items Configuration
 * Estrutura de navegação do dashboard organizada por seções
 */

import type { MenuItem } from '@/types/menu';
import {
  BarChart3,
  Box,
  Building2,
  CircleDollarSign,
  Factory,
  FileText,
  Folder,
  Home,
  MapPin,
  Package,
  Palette,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  Tag,
  Truck,
  UserCircle,
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
        id: 'templates',
        label: 'Templates',
        icon: <FileText className="w-6 h-6" />,
        href: '/stock/assets/templates',
      },
      {
        id: 'products',
        label: 'Produtos',
        icon: <Package className="w-6 h-6" />,
        href: '/stock/assets/products',
        requiredRole: 'MANAGER',
      },
      {
        id: 'variants',
        label: 'Variantes',
        icon: <Palette className="w-6 h-6" />,
        href: '/stock/assets/variants',
        requiredRole: 'MANAGER',
      },
      {
        id: 'items',
        label: 'Itens',
        icon: <Box className="w-6 h-6" />,
        href: '/stock/assets/items',
        requiredRole: 'MANAGER',
      },
      {
        id: 'locations',
        label: 'Localizações',
        icon: <MapPin className="w-6 h-6" />,
        href: '/stock/locations',
        requiredRole: 'MANAGER',
      },
    ],
  },
  {
    id: 'admin',
    label: 'Administração',
    icon: <Settings className="w-6 h-6" />,
    submenu: [
      {
        id: 'suppliers',
        label: 'Fornecedores',
        icon: <Truck className="w-6 h-6" />,
        href: '/admin/suppliers',
        requiredRole: 'MANAGER',
      },
      {
        id: 'manufacturers',
        label: 'Fabricantes',
        icon: <Factory className="w-6 h-6" />,
        href: '/admin/manufacturers',
        requiredRole: 'MANAGER',
      },
      {
        id: 'tags',
        label: 'Tags',
        icon: <Tag className="w-6 h-6" />,
        href: '/admin/tags',
        requiredRole: 'MANAGER',
      },
      {
        id: 'categories',
        label: 'Categorias',
        icon: <Folder className="w-6 h-6" />,
        href: '/admin/categories',
        requiredRole: 'MANAGER',
      },
      {
        id: 'users',
        label: 'Usuários',
        icon: <UserCircle className="w-6 h-6" />,
        href: '/admin/users',
        requiredRole: 'ADMIN',
      },
      {
        id: 'permission-groups',
        label: 'Grupos de Permissões',
        icon: <Users className="w-6 h-6" />,
        href: '/admin/permission-groups',
        requiredRole: 'ADMIN',
      },
      {
        id: 'permissions',
        label: 'Permissões',
        icon: <Shield className="w-6 h-6" />,
        href: '/admin/permissions',
        requiredRole: 'ADMIN',
      },
    ],
  },
  {
    id: 'supply',
    label: 'Fornecimento',
    icon: <Truck className="w-6 h-6" />,
    submenu: [
      {
        id: 'purchase-orders',
        label: 'Pedidos de Compra',
        icon: <FileText className="w-6 h-6" />,
        href: '/stock/supply/purchase-orders',
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
    id: 'storage',
    label: 'Armazenamento',
    icon: <Warehouse className="w-6 h-6" />,
    href: '/stock/storage',
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
];
