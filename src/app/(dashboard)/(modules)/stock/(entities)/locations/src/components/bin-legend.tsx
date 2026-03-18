'use client';

const LEGEND_ITEMS = [
  { label: 'Vazio', color: 'bg-gray-100' },
  { label: 'Baixo', color: 'bg-emerald-200' },
  { label: 'Médio', color: 'bg-amber-200' },
  { label: 'Alto', color: 'bg-orange-200' },
  { label: 'Cheio', color: 'bg-rose-200' },
  { label: 'Bloqueado', color: 'bg-gray-200' },
] as const;

export function BinLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded-sm border border-border ${item.color}`} />
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
