import { cn } from '@/lib/utils';
import type { CareOption } from '@/types/stock';
import { CareIcon } from './care-icon';

interface CareOptionCardProps {
  option: CareOption;
  selected: boolean;
  disabled?: boolean;
  onToggle: (code: string) => void;
}

/**
 * Card individual para cada opção de instrução de cuidado
 * Exibe ícone e label, com feedback visual de seleção
 */
export function CareOptionCard({
  option,
  selected,
  disabled,
  onToggle,
}: CareOptionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(option.code)}
      disabled={disabled}
      className={cn(
        'relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-950',
        'group',
        selected
          ? 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
          : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-500/30 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:border-blue-500/50',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
      )}
    >
      {/* Checkmark visual para selecionados */}
      {selected && (
        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
          <svg
            className="h-4 w-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Ícone SVG */}
      <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-50 group-hover:bg-gray-100 transition-colors dark:bg-slate-700 dark:group-hover:bg-slate-600">
        <CareIcon
          assetPath={option.assetPath}
          size={48}
          className={cn(
            'transition-all dark:brightness-0 dark:invert',
            !selected && 'grayscale opacity-70 group-hover:opacity-100',
            selected && 'opacity-100'
          )}
          alt={option.label}
        />
      </div>

      {/* Label */}
      <span
        className={cn(
          'text-xs text-center font-medium leading-tight h-10 flex items-center justify-center',
          selected
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-600 dark:text-gray-400'
        )}
      >
        {option.label}
      </span>
    </button>
  );
}
