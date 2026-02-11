'use client';

import { cn } from '@/lib/utils';
import { Building2, CreditCard, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  { href: '/central', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/central/tenants', label: 'Empresas', icon: Building2 },
  { href: '/central/plans', label: 'Planos', icon: CreditCard },
];

export function CentralSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 min-h-[calc(100vh-5rem)] p-6 relative">
      {/* Glass background */}
      <div className="absolute inset-0 border-r central-glass" />

      <div className="relative z-10 space-y-2">
        {sidebarItems.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/central' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium central-transition group relative overflow-hidden',
                isActive
                  ? 'central-text shadow-lg'
                  : 'central-text-muted hover:central-text'
              )}
            >
              {/* Background glass effect */}
              <div
                className={cn(
                  'absolute inset-0 central-transition',
                  isActive
                    ? 'central-glass'
                    : 'bg-transparent group-hover:bg-[rgb(var(--glass-bg)/var(--glass-bg-opacity))]'
                )}
              />

              {/* Active indicator gradient */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--os-blue-500)/0.2)] via-[rgb(var(--os-purple-500)/0.2)] to-[rgb(236_72_153/0.2)]" />
              )}

              {/* Border */}
              <div
                className={cn(
                  'absolute inset-0 rounded-xl border central-transition',
                  isActive
                    ? 'border-[rgb(var(--glass-border)/calc(var(--glass-border-opacity)*1.5))]'
                    : 'border-transparent group-hover:border-[rgb(var(--glass-border)/var(--glass-border-opacity))]'
                )}
              />

              <div className="relative z-10 flex items-center gap-3 w-full">
                <div
                  className={cn(
                    'p-2 rounded-lg central-transition',
                    isActive
                      ? 'central-glass'
                      : 'central-glass-subtle group-hover:central-glass'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <span>{item.label}</span>

                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))]" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none bg-gradient-to-t from-[rgb(var(--os-purple-500)/0.1)] to-transparent" />
    </aside>
  );
}
