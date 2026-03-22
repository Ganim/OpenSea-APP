'use client';

import { AiMarkdownRenderer } from './markdown-renderer';
import { cn } from '@/lib/utils';
import { Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AiMessage } from '@/types/ai';

interface AiMessageBubbleProps {
  message: AiMessage;
  userInitial?: string;
  onRetry?: () => void;
  hasError?: boolean;
}

export function AiMessageBubble({
  message,
  userInitial = 'U',
  onRetry,
  hasError,
}: AiMessageBubbleProps) {
  const isUser = message.role === 'USER';
  const isLoading = message.contentType === 'LOADING';
  const isToolCall =
    message.role === 'TOOL_CALL' || message.role === 'TOOL_RESULT';

  if (message.role === 'SYSTEM' || isToolCall) return null;

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex-shrink-0 flex items-center justify-center">
          <span className="text-white text-xs font-extrabold">A</span>
        </div>
      )}

      <div className={cn('max-w-[640px]', isUser ? 'text-right' : '')}>
        <div
          className={cn(
            'flex items-center gap-2 mb-1',
            isUser ? 'justify-end' : 'justify-start'
          )}
        >
          {isUser ? (
            <>
              <span className="text-muted-foreground text-[10px]">
                {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="text-muted-foreground text-xs font-semibold">
                Você
              </span>
            </>
          ) : (
            <>
              <span className="text-violet-600 dark:text-violet-400 text-xs font-bold">
                Atlas
              </span>
              <span className="text-muted-foreground text-[10px]">
                {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {message.toolCalls && (
                <span className="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded font-semibold">
                  DADOS REAIS
                </span>
              )}
            </>
          )}
        </div>

        {isUser ? (
          <div
            className={cn(
              'bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 inline-block text-left text-sm',
              hasError && 'ring-2 ring-rose-500'
            )}
          >
            {message.content}
            {hasError && (
              <div className="mt-2 flex items-center gap-2 text-xs text-rose-200">
                <span>Erro ao enviar.</span>
                {onRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRetry}
                    className="h-auto p-0 text-rose-200 hover:text-white"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Tentar novamente
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Pensando...</span>
          </div>
        ) : (
          <div className="text-sm text-foreground">
            <AiMarkdownRenderer content={message.content ?? ''} />
            {/* Action chips — deferred until function calling engine is implemented */}
            {message.aiModel && message.aiModel !== 'placeholder' && (
              <div className="mt-2 text-muted-foreground text-[9px] flex items-center gap-2">
                <span>{message.aiModel}</span>
                {message.aiLatencyMs && <span>· {message.aiLatencyMs}ms</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center">
          <span className="text-slate-600 dark:text-slate-300 text-xs font-semibold">
            {userInitial}
          </span>
        </div>
      )}
    </div>
  );
}
