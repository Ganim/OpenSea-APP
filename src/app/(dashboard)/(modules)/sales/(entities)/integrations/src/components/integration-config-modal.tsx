'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plug } from 'lucide-react';
import type { Integration, IntegrationConfigField } from '@/types/sales';

interface IntegrationConfigModalProps {
  integration: Integration;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (config: Record<string, unknown>) => void;
  isConnecting: boolean;
}

export function IntegrationConfigModal({
  integration,
  open,
  onOpenChange,
  onConnect,
  isConnecting,
}: IntegrationConfigModalProps) {
  const [config, setConfig] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const field of integration.configSchema) {
      initial[field.key] =
        integration.config?.[field.key] ??
        (field.type === 'toggle' ? false : '');
    }
    return initial;
  });

  const handleChange = useCallback((key: string, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const isValid = integration.configSchema
    .filter(f => f.required)
    .every(f => {
      const val = config[f.key];
      if (f.type === 'toggle') return true;
      return typeof val === 'string' && val.trim().length > 0;
    });

  function renderField(field: IntegrationConfigField) {
    const value = config[field.key];

    switch (field.type) {
      case 'text':
      case 'url':
        return (
          <Input
            type={field.type === 'url' ? 'url' : 'text'}
            placeholder={field.placeholder}
            value={(value as string) || ''}
            onChange={e => handleChange(field.key, e.target.value)}
          />
        );

      case 'password':
        return (
          <Input
            type="password"
            placeholder={field.placeholder}
            value={(value as string) || ''}
            onChange={e => handleChange(field.key, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={v => handleChange(field.key, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Selecione'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'toggle':
        return (
          <Switch
            checked={!!value}
            onCheckedChange={v => handleChange(field.key, v)}
          />
        );

      default:
        return null;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {integration.logoUrl ? (
              <img
                src={integration.logoUrl}
                alt={integration.name}
                className="h-6 w-6 rounded object-contain"
              />
            ) : (
              <Plug className="h-5 w-5 text-violet-500" />
            )}
            Configurar {integration.name}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos para conectar a integração.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {integration.configSchema.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Esta integração não possui campos de configuração.
            </p>
          ) : (
            integration.configSchema.map(field => (
              <div key={field.key} className="space-y-2">
                <Label className="flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="text-rose-500">*</span>}
                </Label>
                {renderField(field)}
                {field.description && (
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConnecting}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onConnect(config)}
            disabled={!isValid || isConnecting}
            className="gap-1.5"
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plug className="h-4 w-4" />
            )}
            Conectar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
