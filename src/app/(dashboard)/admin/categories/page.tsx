'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { categoriesService } from '@/services/stock';
import type { Category } from '@/types/stock';
import { LayoutGrid, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesService.listCategories();
        setCategories(response.categories);
        setFilteredCategories(response.categories);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = categories.filter(
      cat =>
        cat.name?.toLowerCase().includes(q) ||
        cat.description?.toLowerCase().includes(q)
    );
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-orange-500 to-red-600">
            <LayoutGrid className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Categorias</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie categorias de produtos
            </p>
          </div>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar categorias..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredCategories.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map(cat => (
              <Card key={cat.id} className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-sm text-muted-foreground">
                      {cat.description}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 rounded-lg border border-dashed">
            <p className="text-muted-foreground">
              {isLoading ? 'Carregando...' : 'Nenhuma categoria encontrada'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
