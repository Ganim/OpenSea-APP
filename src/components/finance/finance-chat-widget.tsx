'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFinanceQuery } from '@/hooks/finance/use-finance-query';
import { cn } from '@/lib/utils';
import { Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
}

// ─── Quick Suggestion Chips ───────────────────────────────────────────────────

const QUICK_SUGGESTIONS = [
  { label: 'Resumo do mês', query: 'resumo financeiro deste mês' },
  { label: 'Contas vencidas', query: 'contas vencidas' },
  { label: 'Saldo atual', query: 'qual meu saldo atual?' },
  { label: 'Previsão de caixa', query: 'previsão de caixa próximos dias' },
  { label: 'Despesas do mês', query: 'quanto gastei este mês?' },
  { label: 'Receitas do mês', query: 'quanto recebi este mês?' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function FinanceChatWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const financeQuery = useFinanceQuery();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, financeQuery.isPending]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isExpanded]);

  const handleSendMessage = useCallback(
    (queryText?: string) => {
      const messageText = queryText ?? inputValue.trim();
      if (!messageText || financeQuery.isPending) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');

      financeQuery.mutate(
        { query: messageText },
        {
          onSuccess: response => {
            const assistantMessage: ChatMessage = {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: response.answer,
              timestamp: new Date(),
              intent: response.intent,
              confidence: response.confidence,
            };
            setMessages(prev => [...prev, assistantMessage]);
          },
          onError: () => {
            const errorMessage: ChatMessage = {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content:
                'Desculpe, ocorreu um erro ao processar sua consulta. Tente novamente.',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
          },
        }
      );
    },
    [inputValue, financeQuery]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleQuickSuggestion = useCallback(
    (query: string) => {
      handleSendMessage(query);
    },
    [handleSendMessage]
  );

  // ─── Collapsed State (Floating Button) ──────────────────────────────────────

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-105"
          size="icon"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
        <span className="absolute -top-8 right-0 whitespace-nowrap rounded-lg bg-slate-900 dark:bg-slate-700 px-2.5 py-1 text-xs text-white shadow-md opacity-0 group-hover:opacity-100 pointer-events-none">
          Pergunte ao Atlas
        </span>
      </div>
    );
  }

  // ─── Expanded State (Chat Panel) ────────────────────────────────────────────

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[340px] h-[440px] rounded-xl border border-border bg-white dark:bg-slate-900 shadow-2xl shadow-black/10 dark:shadow-black/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-none">
              Atlas Financeiro
            </h3>
            <p className="text-[10px] text-violet-200 mt-0.5">
              Consultas em linguagem natural
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(false)}
          className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-3 py-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={handleQuickSuggestion} />
        ) : (
          <div className="space-y-3">
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Typing indicator */}
            {financeQuery.isPending && <TypingIndicator />}
          </div>
        )}
      </ScrollArea>

      {/* Quick Suggestions (when there are messages) */}
      {messages.length > 0 && !financeQuery.isPending && (
        <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
          {QUICK_SUGGESTIONS.slice(0, 3).map(suggestion => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => handleQuickSuggestion(suggestion.query)}
              className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/8 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-500/15 transition-colors"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="border-t border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={event => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre suas finanças..."
            disabled={financeQuery.isPending}
            className="flex-1 h-9 rounded-lg border border-border bg-slate-50 dark:bg-slate-800 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 disabled:opacity-50"
          />
          <Button
            size="icon"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || financeQuery.isPending}
            className="h-9 w-9 rounded-lg bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50"
          >
            {financeQuery.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({
  onSuggestionClick,
}: {
  onSuggestionClick: (query: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-6 px-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/10 mb-3">
        <MessageCircle className="h-6 w-6 text-violet-600 dark:text-violet-400" />
      </div>
      <h4 className="text-sm font-medium text-foreground mb-1">
        Ol\u00E1! Como posso ajudar?
      </h4>
      <p className="text-xs text-muted-foreground text-center mb-4 max-w-[240px]">
        Fa\u00E7a perguntas sobre suas finan\u00E7as em linguagem natural.
      </p>

      <div className="w-full space-y-1.5">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">
          Sugest\u00F5es r\u00E1pidas
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SUGGESTIONS.map(suggestion => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => onSuggestionClick(suggestion.query)}
              className="text-xs px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/8 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-500/15 transition-colors border border-violet-200/50 dark:border-violet-500/20"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-xl px-3 py-2 text-sm',
          isUser
            ? 'bg-slate-100 dark:bg-slate-800 text-foreground'
            : 'bg-violet-50 dark:bg-violet-500/10 text-foreground border border-violet-200/50 dark:border-violet-500/20'
        )}
      >
        <p className="whitespace-pre-line leading-relaxed text-[13px]">
          {message.content}
        </p>
        <span
          className={cn(
            'block text-[10px] mt-1',
            isUser
              ? 'text-muted-foreground text-right'
              : 'text-violet-500 dark:text-violet-400'
          )}
        >
          {message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-violet-50 dark:bg-violet-500/10 border border-violet-200/50 dark:border-violet-500/20 rounded-xl px-4 py-2.5 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
