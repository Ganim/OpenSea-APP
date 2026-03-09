'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  BOARD_GRADIENTS,
  getGradientForBoard,
  setGradientForBoard,
} from '@/components/tasks/shared/board-gradients';
import type { UpdateBoardRequest } from '@/types/tasks';

interface BoardSettingsGradientProps {
  boardId: string;
  currentGradientId: string | null | undefined;
  updateBoard: {
    mutate: (
      variables: { boardId: string; data: UpdateBoardRequest },
      options?: { onSuccess?: () => void }
    ) => void;
  };
}

export function BoardSettingsGradient({
  boardId,
  currentGradientId,
  updateBoard,
}: BoardSettingsGradientProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">Cor de fundo</label>
      <div className="grid grid-cols-6 gap-2">
        {BOARD_GRADIENTS.map(gradient => {
          const current = getGradientForBoard(boardId, currentGradientId);
          const isSelected = current.id === gradient.id;
          return (
            <button
              key={gradient.id}
              type="button"
              className={cn(
                'h-8 w-full rounded-md transition-all duration-150 hover:scale-110',
                isSelected &&
                  'ring-2 ring-white ring-offset-2 ring-offset-background scale-110'
              )}
              style={gradient.style}
              onClick={() => {
                setGradientForBoard(boardId, gradient.id);
                updateBoard.mutate(
                  { boardId, data: { gradientId: gradient.id } },
                  { onSuccess: () => toast.success('Cor atualizada!') }
                );
              }}
            >
              {isSelected && (
                <Check className="h-4 w-4 text-white mx-auto drop-shadow" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
