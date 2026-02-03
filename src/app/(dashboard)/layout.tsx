'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Navbar } from '@/components/layout/navbar';
import { NavigationMenu } from '@/components/layout/navigation-menu';
import { menuItems } from '@/config/menu-items';
import { useTenant } from '@/contexts/tenant-context';
import { useAuth } from '@/contexts/auth-context';
import { PrintQueueProvider } from '@/core/print-queue';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentTenant, isLoading: isTenantLoading } = useTenant();
  const { isAuthenticated, isSuperAdmin } = useAuth();
  const router = useRouter();

  // Redirecionar para select-tenant se autenticado mas sem tenant selecionado
  useEffect(() => {
    if (!isAuthenticated || isTenantLoading) return;

    // Super admins podem acessar sem tenant selecionado
    // (ex: ao navegar entre /central e /dashboard)
    if (!currentTenant && !isSuperAdmin) {
      router.push('/select-tenant');
    }
  }, [currentTenant, isAuthenticated, isTenantLoading, isSuperAdmin, router]);

  return (
    <ProtectedRoute>
      <PrintQueueProvider>
        {/* Dark Mode Background */}
        <div className="min-h-screen bg-linear-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          {/* Background Effects - Dark Mode */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none dark:block hidden">
            <div className="absolute -top-96 -right-96 w-[768px] h-[768px] bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-96 -left-96 w-[768px] h-[768px] bg-purple-500/10 rounded-full blur-3xl" />
          </div>

          {/* Background Effects - Light Mode */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none dark:hidden">
            <div className="absolute -top-96 -right-96 w-[768px] h-[768px] bg-blue-400/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-96 -left-96 w-[768px] h-[768px] bg-purple-400/15 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <Navbar onMenuOpen={() => setIsMenuOpen(true)} />

            <NavigationMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              menuItems={menuItems}
            />

            {/* Main Content */}
            <main className="pt-28 px-6 pb-12">
              <div className="max-w-[1600px] mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </PrintQueueProvider>
    </ProtectedRoute>
  );
}
