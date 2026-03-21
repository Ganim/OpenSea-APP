'use client';

import './central.css';
import { SuperAdminGuard } from '@/components/auth/super-admin-guard';
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
        <div
          className="min-h-screen flex"
          style={{ background: 'var(--central-bg)' }}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:rounded"
          >
            Pular para o conteudo principal
          </a>
          <CentralSidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <CentralNavbar />
            <main id="main-content" tabIndex={-1} className="flex-1 p-6">
              <div className="max-w-[1600px] mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </CentralThemeProvider>
    </SuperAdminGuard>
  );
}
