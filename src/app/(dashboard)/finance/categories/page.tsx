'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFinanceCategories } from '@/hooks/finance';
import { FINANCE_CATEGORY_TYPE_LABELS } from '@/types/finance';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FinanceCategoriesPage() {
  const router = useRouter();
  const { data, isLoading, error } = useFinanceCategories();
  const categories = data?.categories;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EXPENSE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'REVENUE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'BOTH':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Categorias Financeiras</h1>
            <p className="text-muted-foreground">
              Gerencie as categorias de receitas e despesas
            </p>
          </div>
        </div>
        <Link href="/finance/categories/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </Link>
      </div>

      {/* Content */}
      <Card>
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-muted-foreground">
            Erro ao carregar categorias
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum registro encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Nome</th>
                  <th className="text-left p-4 font-semibold">Tipo</th>
                  <th className="text-center p-4 font-semibold">Ordem</th>
                  <th className="text-center p-4 font-semibold">Status</th>
                  <th className="text-center p-4 font-semibold">Sistema</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/finance/categories/${category.id}`)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {category.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        <span className="font-medium">{category.name}</span>
                      </div>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(category.type)}`}
                      >
                        {FINANCE_CATEGORY_TYPE_LABELS[category.type]}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {category.displayOrder}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {category.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {category.isSystem && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Sistema
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
