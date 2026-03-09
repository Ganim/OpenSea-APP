'use client';

import { cn } from '@/lib/utils';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const COLLAPSED_KEY = 'central-sidebar-collapsed';

const sidebarItems = [
  { href: '/central', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/central/tenants', label: 'Empresas', icon: Building2 },
  { href: '/central/plans', label: 'Planos', icon: CreditCard },
];

/**
 * Sidebar colapsável para o Central.
 * - Desktop: colapsa para modo ícones (w-20), expande para w-72
 * - Mobile: oculta completamente (menu acessível via navbar)
 * - Estado persistido em localStorage
 */
export function CentralSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSED_KEY);
    if (stored === 'true') setIsCollapsed(true);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <aside
      className={cn(
        'hidden md:block min-h-[calc(100vh-5rem)] p-4 relative central-transition',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Glass background */}
      <div className="absolute inset-0 border-r central-glass" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-1 space-y-2">
          {sidebarItems.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/central' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl text-sm font-medium central-transition group relative overflow-hidden',
                  isCollapsed ? 'px-3 py-3.5 justify-center' : 'px-4 py-3.5',
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
                  <div className="absolute inset-0 bg-linear-to-r from-[rgb(var(--os-blue-500)/0.2)] via-[rgb(var(--os-purple-500)/0.2)] to-[rgb(236_72_153/0.2)]" />
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

                <div
                  className={cn(
                    'relative z-10 flex items-center w-full',
                    isCollapsed ? 'justify-center' : 'gap-3'
                  )}
                >
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
                  {!isCollapsed && (
                    <>
                      <span>{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))]" />
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Toggle collapse button */}
        <button
          onClick={toggleCollapse}
          className={cn(
            'flex items-center justify-center rounded-xl p-2.5 mt-4',
            'central-glass-subtle central-text-muted central-transition',
            'hover:central-glass hover:central-text',
            isCollapsed ? 'mx-auto' : 'ml-auto mr-2'
          )}
          title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none bg-linear-to-t from-[rgb(var(--os-purple-500)/0.1)] to-transparent" />
    </aside>
  );
}

/**
 * Items exportados para uso no drawer mobile da navbar.
 */
export { sidebarItems };
