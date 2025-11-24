/**
 * Item Movements Page
 * Página para visualizar o histórico de movimentos de um item
 */

'use client';

import { ArrowLeft, Download, Search } from 'lucide-react';
import { use, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useItemMovements } from '@/hooks/stock/use-items';
import Link from 'next/link';

const MOVEMENT_TYPES = {
  IN: {
    label: 'Entrada',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  OUT: {
    label: 'Saída',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  TRANSFER: {
    label: 'Transferência',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  ADJUSTMENT: {
    label: 'Ajuste',
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
};

export default function ItemMovementsPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string; itemId: string }>;
}) {
  const { id: productId, variantId, itemId } = use(params);
  const [searchTerm, setSearchTerm] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  const { data: movements, isLoading } = useItemMovements({ itemId });

  const filteredMovements =
    movements?.movements?.filter(movement => {
      const matchesSearch =
        movement.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.destinationRef
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesType =
        movementTypeFilter === 'all' ||
        movement.movementType === movementTypeFilter;

      // Date filtering logic would go here
      const matchesDate = true; // Simplified for now

      return matchesSearch && matchesType && matchesDate;
    }) || [];

  const exportMovements = () => {
    // Implement CSV export
    const csvContent = [
      ['Data', 'Tipo', 'Quantidade', 'Localização', 'Referência', 'Notas'],
      ...filteredMovements.map(movement => [
        new Date(movement.createdAt).toLocaleDateString('pt-BR'),
        MOVEMENT_TYPES[movement.movementType as keyof typeof MOVEMENT_TYPES]
          ?.label || movement.movementType,
        movement.quantity,
        movement.destinationRef || 'N/A',
        movement.destinationRef || '',
        movement.notes || '',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movements-item-${itemId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando movimentos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/stock/assets/products/${productId}/variants/${variantId}/items/${itemId}`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Movimentos do Item</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Histórico de movimentações do item {itemId}
            </p>
          </div>
        </div>

        <Button onClick={exportMovements} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por referência ou notas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={movementTypeFilter}
              onValueChange={setMovementTypeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de movimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="IN">Entrada</SelectItem>
                <SelectItem value="OUT">Saída</SelectItem>
                <SelectItem value="TRANSFER">Transferência</SelectItem>
                <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Movements List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Movimentos ({filteredMovements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMovements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum movimento encontrado
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMovements.map(movement => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Badge
                      className={
                        MOVEMENT_TYPES[
                          movement.movementType as keyof typeof MOVEMENT_TYPES
                        ]?.color || 'bg-gray-100 text-gray-800'
                      }
                    >
                      {MOVEMENT_TYPES[
                        movement.movementType as keyof typeof MOVEMENT_TYPES
                      ]?.label || movement.movementType}
                    </Badge>

                    <div>
                      <p className="font-medium">
                        {movement.quantity > 0 ? '+' : ''}
                        {movement.quantity} unidades
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {movement.destinationRef ||
                          'Localização não especificada'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {movement.destinationRef &&
                        `Ref: ${movement.destinationRef}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(movement.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
