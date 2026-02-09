/**
 * CopyButton - Botão para copiar conteúdo para a área de transferência
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { logger } from '@/lib/logger';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CopyButtonProps {
  content: string;
  tooltipText?: string;
  successMessage?: string;
  variant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'secondary'
    | 'destructive'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function CopyButton({
  content,
  tooltipText = 'Copiar para a área de transferência',
  successMessage = 'Copiado para a área de transferência',
  variant = 'ghost',
  size = 'sm',
  className = '',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success(successMessage);

      // Reset o ícone após 2 segundos
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      logger.error(
        'Erro ao copiar',
        error instanceof Error ? error : undefined
      );
      toast.error('Não foi possível copiar');
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleCopy}
            className={className}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copiado!' : tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
