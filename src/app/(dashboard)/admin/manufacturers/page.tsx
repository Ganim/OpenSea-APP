'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { manufacturersService } from '@/services/stock';
import type { Manufacturer } from '@/types/stock';
import { Building2, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [filteredManufacturers, setFilteredManufacturers] = useState<
    Manufacturer[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadManufacturers = async () => {
      try {
        const response = await manufacturersService.listManufacturers();
        setManufacturers(response.manufacturers);
        setFilteredManufacturers(response.manufacturers);
      } catch (error) {
        console.error('Erro ao carregar fabricantes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadManufacturers();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = manufacturers.filter(
      man =>
        man.name?.toLowerCase().includes(q) ||
        man.email?.toLowerCase().includes(q) ||
        man.country?.toLowerCase().includes(q)
    );
    setFilteredManufacturers(filtered);
  }, [searchQuery, manufacturers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-yellow-500 to-amber-600">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Fabricantes</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie fabricantes
            </p>
          </div>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Fabricante
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar fabricantes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredManufacturers.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredManufacturers.map(man => (
              <Card key={man.id} className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">{man.name}</h3>
                  {man.email && (
                    <p className="text-sm text-muted-foreground">{man.email}</p>
                  )}
                  {man.country && (
                    <p className="text-sm text-muted-foreground">
                      {man.country}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 rounded-lg border border-dashed">
            <p className="text-muted-foreground">
              {isLoading ? 'Carregando...' : 'Nenhum fabricante encontrado'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
