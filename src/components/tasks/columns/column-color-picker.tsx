'use client';

import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLUMN_COLORS } from '../shared/column-colors';

interface ColumnColorPickerProps {
  currentColor: string | null | undefined;
  onChangeColor: (color: string | null) => void;
}

export function ColumnColorPicker({
  currentColor,
  onChangeColor,
}: ColumnColorPickerProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Palette className="h-4 w-4 mr-2" />
        Alterar cor
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="p-2">
        <div className="grid grid-cols-3 gap-1.5">
          {COLUMN_COLORS.map(c => {
            const isSelected = currentColor === c.value;
            return (
              <button
                key={c.value}
                type="button"
                title={c.name}
                className={cn(
                  'h-7 w-full rounded-md transition-all hover:scale-110',
                  isSelected &&
                    'ring-2 ring-white ring-offset-2 ring-offset-popover scale-110'
                )}
                style={{ backgroundColor: c.value }}
                onClick={() => onChangeColor(c.value)}
              >
                {isSelected && (
                  <Check className="h-3 w-3 text-white mx-auto drop-shadow" />
                )}
              </button>
            );
          })}
        </div>
        {currentColor && (
          <button
            type="button"
            className="w-full text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors text-center"
            onClick={() => onChangeColor(null)}
          >
            Remover cor
          </button>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
