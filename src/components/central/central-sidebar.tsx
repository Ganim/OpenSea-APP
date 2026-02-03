'use client';

import { cn } from '@/lib/utils';
import {
  BarChart3,
  Building2,
  CreditCard,
  LayoutDashboard,
} from 'lucide-react';
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
      <div className="absolute inset-0 bg-white/5 backdrop-blur-md border-r border-white/10" />

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
                'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                isActive
                  ? 'text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              )}
            >
              {/* Background glass effect */}
              <div
                className={cn(
                  'absolute inset-0 transition-all duration-200',
                  isActive
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'bg-transparent group-hover:bg-white/10'
                )}
              />

              {/* Active indicator gradient */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20" />
              )}

              {/* Border */}
              <div
                className={cn(
                  'absolute inset-0 rounded-xl border transition-all duration-200',
                  isActive
                    ? 'border-white/30'
                    : 'border-white/0 group-hover:border-white/20'
                )}
              />

              <div className="relative z-10 flex items-center gap-3 w-full">
                <div
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-white/20'
                      : 'bg-white/5 group-hover:bg-white/10'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <span>{item.label}</span>

                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />
    </aside>
  );
}
