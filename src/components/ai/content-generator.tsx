'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { aiContentService } from '@/services/ai';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Instagram,
  MessageCircle,
  Facebook,
  Mail,
  FileText,
  ShoppingBag,
  Megaphone,
  Image,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  ContentType,
  ContentPlatform,
  ContentTone,
  GeneratedContent,
  ContentVariant,
} from '@/types/ai';

const CONTENT_TYPES: {
  value: ContentType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: 'SOCIAL_POST', label: 'Post Social', icon: Megaphone },
  {
    value: 'PRODUCT_DESCRIPTION',
    label: 'Descricao de Produto',
    icon: ShoppingBag,
  },
  { value: 'EMAIL_CAMPAIGN', label: 'Campanha Email', icon: Mail },
  { value: 'PROMOTION_BANNER', label: 'Banner Promocional', icon: Image },
];

const PLATFORMS: {
  value: ContentPlatform;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: 'INSTAGRAM', label: 'Instagram', icon: Instagram },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle },
  { value: 'FACEBOOK', label: 'Facebook', icon: Facebook },
  { value: 'EMAIL', label: 'Email', icon: Mail },
];

const TONES: { value: ContentTone; label: string; description: string }[] = [
  { value: 'FORMAL', label: 'Formal', description: 'Profissional e serio' },
  { value: 'CASUAL', label: 'Casual', description: 'Descontraido e amigavel' },
  { value: 'URGENTE', label: 'Urgente', description: 'Senso de urgencia' },
  { value: 'LUXO', label: 'Luxo', description: 'Exclusivo e sofisticado' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar texto.');
    }
  }, [text]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-7 px-2 text-xs"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 mr-1 text-emerald-500" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 mr-1" />
          Copiar
        </>
      )}
    </Button>
  );
}

export function AiContentGenerator() {
  const [contentType, setContentType] = useState<ContentType>('SOCIAL_POST');
  const [platform, setPlatform] = useState<ContentPlatform>('INSTAGRAM');
  const [tone, setTone] = useState<ContentTone>('CASUAL');
  const [theme, setTheme] = useState('');
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [activeVariant, setActiveVariant] = useState(0);

  const generateMutation = useMutation({
    mutationFn: aiContentService.generateContent,
    onSuccess: data => {
      setResult(data);
      setActiveVariant(0);
    },
    onError: () => {
      toast.error('Erro ao gerar conteudo. Tente novamente.');
    },
  });

  const handleGenerate = useCallback(() => {
    generateMutation.mutate({
      contentType,
      platform,
      tone,
      theme: theme.trim() || undefined,
    });
  }, [contentType, platform, tone, theme, generateMutation]);

  const handleReset = useCallback(() => {
    setResult(null);
    setTheme('');
    setActiveVariant(0);
  }, []);

  const currentVariant: ContentVariant | null =
    result?.variants?.[activeVariant] ?? null;

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">Gerador de Conteudo</h3>
          <p className="text-sm text-muted-foreground">
            Crie conteudo de marketing e comunicacao com inteligencia artificial
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
          {/* Configuration panel */}
          <Card className="p-5 space-y-5">
            {/* Content type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Conteudo
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map(ct => {
                  const Icon = ct.icon;
                  return (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => setContentType(ct.value)}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all border',
                        contentType === ct.value
                          ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                          : 'border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:border-border'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-xs">{ct.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Plataforma
              </label>
              <div className="flex gap-2 flex-wrap">
                {PLATFORMS.map(p => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPlatform(p.value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                        platform === p.value
                          ? 'bg-violet-500 text-white'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium mb-2">Tom</label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className={cn(
                      'p-2.5 rounded-lg text-left transition-all border',
                      tone === t.value
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-border bg-muted/50 hover:border-border'
                    )}
                  >
                    <span className="text-xs font-medium">{t.label}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {t.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme / topic */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tema / Assunto
              </label>
              <input
                type="text"
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder="Ex: Promocao de inverno, lancamento de colecao..."
                className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Conteudo
                </>
              )}
            </Button>
          </Card>

          {/* Preview panel */}
          <div className="space-y-4">
            {!result ? (
              <Card className="p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h4 className="text-sm font-medium text-muted-foreground">
                  O conteudo gerado aparecera aqui
                </h4>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Configure as opcoes ao lado e clique em &quot;Gerar
                  Conteudo&quot;
                </p>
              </Card>
            ) : (
              <>
                {/* Variant tabs */}
                {result.variants.length > 1 && (
                  <div className="flex gap-1">
                    {result.variants.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveVariant(i)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                          activeVariant === i
                            ? 'bg-violet-500 text-white'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        )}
                      >
                        Variante {i + 1}
                      </button>
                    ))}
                  </div>
                )}

                {/* Content preview card */}
                {currentVariant && (
                  <Card className="overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {
                            CONTENT_TYPES.find(c => c.value === contentType)
                              ?.label
                          }
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {PLATFORMS.find(p => p.value === platform)?.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {currentVariant.characterCount} caracteres
                        </span>
                      </div>
                      <CopyButton text={currentVariant.content} />
                    </div>

                    <div className="p-4">
                      {currentVariant.title && (
                        <h5 className="font-semibold text-sm mb-2">
                          {currentVariant.title}
                        </h5>
                      )}
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {currentVariant.content}
                      </div>

                      {currentVariant.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {currentVariant.hashtags.map((tag, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <Card className="p-4">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Sugestoes
                    </h5>
                    <ul className="space-y-1">
                      {result.suggestions.map((s, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                        >
                          <Sparkles className="h-3 w-3 text-violet-500 shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Reset */}
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-muted-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Gerar novamente
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
