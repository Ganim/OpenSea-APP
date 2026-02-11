/**
 * Menu Configuration Index
 * Combina todos os menus dos módulos
 */

import type { MenuItem } from '@/types/menu';
import { adminMenu } from './admin';
import { financeMenu } from './finance';
import { hrMenu } from './hr';
import { stockMenu } from './stock';

export const menuItems: MenuItem[] = [
  stockMenu,
  hrMenu,
  financeMenu,
  adminMenu,
];
