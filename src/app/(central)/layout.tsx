'use client';

import { SuperAdminGuard } from '@/components/auth/super-admin-guard';
import { AnimatedBackground } from '@/components/central/animated-background';
import { CentralNavbar } from '@/components/central/central-navbar';
import { CentralSidebar } from '@/components/central/central-sidebar';
import { CentralThemeProvider } from '@/contexts/central-theme-context';

export default function CentralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminGuard>
      <CentralThemeProvider>
        <div className="min-h-screen relative overflow-hidden">
          {/* Background animado com gradientes */}
          <AnimatedBackground />

          {/* Conteúdo principal com glassmorphism */}
          <div className="relative z-10">
            <CentralNavbar />
            <div className="flex">
              <CentralSidebar />
              <main className="flex-1 p-8">
                <div className="max-w-[1600px] mx-auto">{children}</div>
              </main>
            </div>
          </div>
        </div>
      </CentralThemeProvider>
    </SuperAdminGuard>
  );
}
