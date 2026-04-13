/**
 * Devices Module Menu Configuration
 * Configuração de menu do módulo de dispositivos
 */

import type { MenuItem } from '@/types/menu';
import { Monitor } from 'lucide-react';

export const devicesMenu: MenuItem = {
  id: 'devices',
  label: 'Dispositivos',
  icon: <Monitor className="w-6 h-6" />,
  href: '/devices',
};
