'use client';

/**
 * InlineVariantCreator Component
 * Inline expandable form for creating variants directly in product context
 * Target: 2 clicks to create a variant
 */

import { logger } from '@/lib/logger';
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Plus, X, Loader2, ChevronDown, Sparkles } from 'lucide-react';

import { variantsService } from '@/services/stock';
import type { InlineVariantCreatorProps, InlineVariantData } from './types';
import type { Variant } from '@/types/stock';

// ============================================
// VALIDATION SCHEMA
// ============================================

const inlineVariantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.coerce.number().min(0.01, 'Preço deve ser maior que zero'),
  sku: z.string().optional(),
  costPrice: z.coerce.number().optional(),
});

type InlineVariantFormValues = z.infer<typeof inlineVariantSchema>;

// ============================================
// COMPACT FORM (Single Row)
// ============================================

interface CompactFormProps {
  productId: string;
  onCreated: (variant: Variant) => void;
  onExpand: () => void;
  onCancel: () => void;
}

function CompactForm({
  productId,
  onCreated,
  onExpand,
  onCancel,
}: CompactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InlineVariantFormValues>({
    resolver: zodResolver(inlineVariantSchema) as any,
    defaultValues: {
      name: '',
      price: '' as unknown as number, // Controlled input needs a value
      sku: '',
    },
  });

  const onSubmit = useCallback(
    async (values: InlineVariantFormValues) => {
      setIsSubmitting(true);

      try {
        const response = await variantsService.createVariant({
          productId,
          name: values.name,
          price: values.price,
          sku: values.sku || undefined,
        });

        toast.success('Variante criada!', {
          description: values.name,
        });

        form.reset();
        onCreated(response.variant);
      } catch (error) {
        logger.error(
          'Error creating variant',
          error instanceof Error ? error : undefined
        );
        toast.error('Erro ao criar variante');
      } finally {
        setIsSubmitting(false);
      }
    },
    [productId, form, onCreated]
  );

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardContent className="p-3">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-end gap-2"
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center gap-1 text-primary">
              <Sparkles className="w-4 h-4" />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-0">
                  <FormControl>
                    <Input
                      placeholder="Nome da variante"
                      className="h-8 text-sm"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="w-28 space-y-0">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="R$ 0,00"
                      className="h-8 text-sm"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="sm"
              className="h-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Criar'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={onExpand}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={onCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ============================================
// EXPANDED FORM (Full Details)
// ============================================

interface ExpandedFormProps {
  productId: string;
  productName?: string;
  onCreated: (variant: Variant) => void;
  onCompact: () => void;
  onCancel: () => void;
}

function ExpandedForm({
  productId,
  productName,
  onCreated,
  onCompact,
  onCancel,
}: ExpandedFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InlineVariantFormValues>({
    resolver: zodResolver(inlineVariantSchema) as any,
    defaultValues: {
      name: '',
      price: '' as unknown as number,
      sku: '',
      costPrice: '' as unknown as number,
    },
  });

  const onSubmit = useCallback(
    async (values: InlineVariantFormValues) => {
      setIsSubmitting(true);

      try {
        const response = await variantsService.createVariant({
          productId,
          name: values.name,
          price: values.price,
          sku: values.sku || undefined,
          costPrice: values.costPrice,
        });

        toast.success('Variante criada!', {
          description: values.name,
        });

        form.reset();
        onCreated(response.variant);
      } catch (error) {
        logger.error(
          'Error creating variant',
          error instanceof Error ? error : undefined
        );
        toast.error('Erro ao criar variante');
      } finally {
        setIsSubmitting(false);
      }
    },
    [productId, form, onCreated]
  );

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Nova Variante</span>
            {productName && (
              <span className="text-xs text-muted-foreground">
                para {productName}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onCompact}
          >
            Compacto
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Vermelho 42"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Auto-gerado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Venda *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Custo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Variante'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function InlineVariantCreator({
  productId,
  productName,
  template,
  onCreated,
  onCancel,
  isExpanded: controlledExpanded,
  onExpandedChange,
}: InlineVariantCreatorProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);

  // Support both controlled and uncontrolled modes
  const isExpanded = controlledExpanded ?? internalExpanded;
  const setExpanded = onExpandedChange ?? setInternalExpanded;

  const handleCreated = useCallback(
    (variant: Variant) => {
      onCreated(variant);
    },
    [onCreated]
  );

  if (isExpanded) {
    return (
      <ExpandedForm
        productId={productId}
        productName={productName}
        onCreated={handleCreated}
        onCompact={() => setExpanded(false)}
        onCancel={onCancel}
      />
    );
  }

  return (
    <CompactForm
      productId={productId}
      onCreated={handleCreated}
      onExpand={() => setExpanded(true)}
      onCancel={onCancel}
    />
  );
}

// ============================================
// ADD VARIANT BUTTON (Trigger)
// ============================================

interface AddVariantButtonProps {
  onClick: () => void;
  className?: string;
}

export function AddVariantButton({
  onClick,
  className,
}: AddVariantButtonProps) {
  return (
    <Card
      className={cn(
        'border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer',
        'flex items-center justify-center min-h-[100px]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
        <Plus className="w-6 h-6" />
        <span className="text-sm">Adicionar</span>
      </div>
    </Card>
  );
}
