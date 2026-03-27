import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal do Cliente — OpenSea',
  description: 'Acesse suas faturas e realize pagamentos de forma segura.',
};

export default function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="flex-1">{children}</div>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-muted-foreground">
          Powered by{' '}
          <span className="font-semibold text-teal-600 dark:text-teal-400">
            OpenSea
          </span>{' '}
          — Sistema de Gestao Empresarial
        </div>
      </footer>
    </div>
  );
}
