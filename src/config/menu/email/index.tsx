import { TOOLS_PERMISSIONS } from '@/config/rbac/permission-codes';
import type { MenuItem } from '@/types/menu';
import { Mail } from 'lucide-react';

export const emailMenu: MenuItem = {
  id: 'email',
  label: 'E-mail',
  icon: <Mail className="w-6 h-6" />,
  href: '/email',
  requiredPermission: TOOLS_PERMISSIONS.EMAIL_ACCOUNTS.ACCESS,
};
