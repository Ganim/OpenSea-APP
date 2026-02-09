'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Navbar } from '@/components/layout/navbar';
import { NavigationMenu } from '@/components/layout/navigation-menu';
import { menuItems } from '@/config/menu-items';
import { useAuth } from '@/contexts/auth-context';
import { useTenant } from '@/contexts/tenant-context';
import { PrintQueueProvider } from '@/core/print-queue';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    currentTenant,
    isLoading: isTenantLoading,
    isInitialized: isTenantInitialized,
  } = useTenant();
  const { isAuthenticated, isSuperAdmin } = useAuth();
  const router = useRouter();

  // Redirecionar para select-tenant se autenticado mas sem tenant selecionado
  // Aguarda a inicialização do TenantProvider para evitar redirecionamentos prematuros
  useEffect(() => {
    if (!isAuthenticated || isTenantLoading || !isTenantInitialized) return;

    // Super admins podem acessar sem tenant selecionado
    // (ex: ao navegar entre /central e /dashboard)
    if (!currentTenant && !isSuperAdmin) {
      router.push('/select-tenant');
    }
  }, [
    currentTenant,
    isAuthenticated,
    isTenantLoading,
    isTenantInitialized,
    isSuperAdmin,
    router,
  ]);

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
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:rounded"
            >
              Pular para o conteudo principal
            </a>
            <Navbar onMenuOpen={() => setIsMenuOpen(true)} />

            <NavigationMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              menuItems={menuItems}
            />

            {/* Main Content */}
            <main id="main-content" tabIndex={-1} className="pt-28 px-6 pb-12">
              <div className="max-w-[1600px] mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </PrintQueueProvider>
    </ProtectedRoute>
  );
}
