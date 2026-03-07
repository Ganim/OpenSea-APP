'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PermissionGroup } from '@/types/rbac';
import { Check, Loader2, Palette, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#78716c', // stone
];

interface ColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: PermissionGroup | null;
  isSubmitting: boolean;
  onSubmit: (id: string, data: Partial<PermissionGroup>) => Promise<void>;
}

export function ColorModal({
  isOpen,
  onClose,
  group,
  isSubmitting,
  onSubmit,
}: ColorModalProps) {
  const [color, setColor] = useState('');

  useEffect(() => {
    if (group) {
      setColor(group.color || '');
    }
  }, [group]);

  if (!group) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = color.trim() || null;
    await onSubmit(group.id, { color: trimmed });
    onClose();
  };

  const handleColorInput = (value: string) => {
    // Allow typing hex colors, auto-prepend # if needed
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }
    setColor(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-sm [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-3 items-center">
              <div
                className={cn(
                  'flex items-center justify-center text-white shrink-0 p-2 rounded-lg',
                  !color && 'bg-linear-to-br from-purple-500 to-pink-600'
                )}
                style={
                  color
                    ? {
                        background: `linear-gradient(to bottom right, ${color}, ${color}CC)`,
                      }
                    : undefined
                }
              >
                <Palette className="h-5 w-5" />
              </div>
              Mudar Cor
            </div>
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Preset colors grid */}
          <div className="space-y-2">
            <Label>Cores predefinidas</Label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center',
                    color === preset
                      ? 'border-foreground ring-2 ring-foreground/20'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: preset }}
                  onClick={() => setColor(preset)}
                >
                  {color === preset && (
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom hex input */}
          <div className="space-y-2">
            <Label htmlFor="color-hex">Cor customizada (hex)</Label>
            <div className="flex gap-2 items-center">
              <div
                className="w-10 h-10 rounded-lg border shrink-0"
                style={{ backgroundColor: color || '#e5e7eb' }}
              />
              <Input
                id="color-hex"
                value={color}
                onChange={e => handleColorInput(e.target.value)}
                placeholder="#3b82f6"
                maxLength={7}
              />
            </div>
          </div>

          {/* Remove color option */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setColor('')}
          >
            Remover cor (usar padrao)
          </Button>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
