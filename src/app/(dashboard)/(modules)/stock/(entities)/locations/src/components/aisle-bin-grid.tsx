'use client';

import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BinOccupancy } from '@/types/stock';
import { getOccupancyLevel } from '@/types/stock';
import { BinCellNew } from './bin-cell';
import { BinLegend } from './bin-legend';

interface AisleBinGridProps {
  bins: BinOccupancy[];
  zoneId: string;
  highlightBinId?: string;
  onBinClick: (binId: string) => void;
  searchQuery?: string;
  filter?: 'all' | 'empty' | 'occupied' | 'full' | 'blocked';
}

function getStorageKey(zoneId: string) {
  return `opensea:location:zone:${zoneId}:shelfOrder`;
}

export function AisleBinGrid({
  bins,
  zoneId,
  highlightBinId,
  onBinClick,
  searchQuery,
  filter = 'all',
}: AisleBinGridProps) {
  const highlightRef = useRef<HTMLDivElement>(null);

  const [shelfOrder, setShelfOrder] = useState<'asc' | 'desc'>(() => {
    if (typeof window === 'undefined') return 'asc';
    return (localStorage.getItem(getStorageKey(zoneId)) as 'asc' | 'desc') ?? 'asc';
  });

  const toggleShelfOrder = useCallback(() => {
    setShelfOrder((prev) => {
      const next = prev === 'asc' ? 'desc' : 'asc';
      localStorage.setItem(getStorageKey(zoneId), next);
      return next;
    });
  }, [zoneId]);

  // Filter bins
  const filteredBins = useMemo(() => {
    return bins.filter((bin) => {
      if (filter === 'all') return true;
      const level = getOccupancyLevel(bin);
      switch (filter) {
        case 'empty':
          return bin.currentOccupancy === 0 && !bin.isBlocked;
        case 'occupied':
          return bin.currentOccupancy > 0 && !bin.isBlocked;
        case 'full':
          return level === 'full';
        case 'blocked':
          return bin.isBlocked;
        default:
          return true;
      }
    });
  }, [bins, filter]);

  // Group by aisle
  const aisles = useMemo(() => {
    const grouped = new Map<number, BinOccupancy[]>();
    for (const bin of filteredBins) {
      const existing = grouped.get(bin.aisle);
      if (existing) {
        existing.push(bin);
      } else {
        grouped.set(bin.aisle, [bin]);
      }
    }

    // Sort aisle numbers
    const sortedAisles = Array.from(grouped.entries()).sort(([a], [b]) => a - b);

    return sortedAisles.map(([aisleNumber, aisleBins]) => {
      // Find unique shelves and positions
      const shelves = [...new Set(aisleBins.map((b) => b.shelf))].sort(
        (a, b) => (shelfOrder === 'asc' ? a - b : b - a)
      );
      const positions = [...new Set(aisleBins.map((b) => b.position))].sort(
        (a, b) => {
          // Sort positions in reverse order (last = top row, first = bottom row)
          if (a < b) return 1;
          if (a > b) return -1;
          return 0;
        }
      );

      // Create lookup map
      const binMap = new Map<string, BinOccupancy>();
      for (const bin of aisleBins) {
        binMap.set(`${bin.shelf}-${bin.position}`, bin);
      }

      const occupiedCount = aisleBins.filter((b) => b.currentOccupancy > 0).length;

      return {
        aisleNumber,
        shelves,
        positions,
        binMap,
        totalBins: aisleBins.length,
        occupiedCount,
      };
    });
  }, [filteredBins, shelfOrder]);

  // Determine highlighted bins from search
  const highlightedBySearch = useMemo(() => {
    if (!searchQuery) return new Set<string>();
    const q = searchQuery.toLowerCase();
    return new Set(
      bins
        .filter((b) => b.address.toLowerCase().includes(q))
        .map((b) => b.id)
    );
  }, [bins, searchQuery]);

  // Scroll to highlighted bin on mount
  useEffect(() => {
    if (highlightBinId && highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [highlightBinId]);

  if (filteredBins.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Nenhum bin encontrado com os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sort toggle */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleShelfOrder}
          className="text-xs text-muted-foreground"
        >
          <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
          Prateleiras: {shelfOrder === 'asc' ? 'Crescente' : 'Decrescente'}
        </Button>
      </div>

      {/* Aisles */}
      {aisles.map(({ aisleNumber, shelves, positions, binMap, totalBins, occupiedCount }) => (
        <div key={aisleNumber} className="space-y-2">
          {/* Aisle header */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              Corredor {String(aisleNumber).padStart(2, '0')}
            </h4>
            <span className="text-xs text-muted-foreground">
              {occupiedCount}/{totalBins} bins ocupados
            </span>
          </div>

          {/* Grid table */}
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="text-xs font-medium text-muted-foreground px-2 py-1 text-left sticky left-0 bg-background z-10">
                    {/* Empty corner */}
                  </th>
                  {shelves.map((shelf) => (
                    <th
                      key={shelf}
                      className="text-xs font-medium text-muted-foreground px-1 py-1 text-center"
                    >
                      Pr {String(shelf).padStart(2, '0')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr key={position}>
                    <td className="text-xs font-medium text-muted-foreground px-2 py-1 whitespace-nowrap sticky left-0 bg-background z-10">
                      Nicho {position}
                    </td>
                    {shelves.map((shelf) => {
                      const bin = binMap.get(`${shelf}-${position}`);
                      if (!bin) {
                        return (
                          <td key={shelf} className="p-0.5">
                            <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-sm" />
                          </td>
                        );
                      }

                      const isHighlighted =
                        bin.id === highlightBinId || highlightedBySearch.has(bin.id);

                      return (
                        <td key={shelf} className="p-0.5">
                          <BinCellNew
                            bin={bin}
                            isHighlighted={isHighlighted}
                            onClick={() => onBinClick(bin.id)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Legend */}
      <BinLegend />
    </div>
  );
}
