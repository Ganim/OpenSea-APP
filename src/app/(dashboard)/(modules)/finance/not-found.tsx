import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FinanceNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="text-6xl font-bold text-slate-200 dark:text-slate-800">
            404
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Página não encontrada
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A página do módulo financeiro que você procura não existe ou foi
            movida.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/finance">Voltar ao financeiro</Link>
          </Button>
          <Button asChild>
            <Link href="/">Página inicial</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
