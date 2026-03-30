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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CreateCostCenterData } from '@/types/finance';
import { translateError } from '@/lib/error-messages';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { toast } from 'sonner';
import { Landmark, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreateCostCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCostCenterData) => void;
  isSubmitting: boolean;
  nextCode: string;
}

export function CreateCostCenterModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  nextCode,
}: CreateCostCenterModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [annualBudget, setAnnualBudget] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setIsActive(true);
      setMonthlyBudget('');
      setAnnualBudget('');
      setFieldErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: CreateCostCenterData = {
      code: nextCode,
      name: name.trim(),
      isActive,
    };

    if (description.trim()) {
      data.description = description.trim();
    }

    const monthly = parseFloat(monthlyBudget);
    if (!isNaN(monthly) && monthly > 0) {
      data.monthlyBudget = monthly;
    }

    const annual = parseFloat(annualBudget);
    if (!isNaN(annual) && annual > 0) {
      data.annualBudget = annual;
    }

    try {
      await onSubmit(data);
      setFieldErrors({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('already exists') ||
        msg.includes('name already') ||
        msg.includes('code already')
      ) {
        const field = msg.includes('code') ? 'code' : 'name';
        setFieldErrors({ [field]: translateError(msg) });
      } else {
        toast.error(translateError(msg));
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-teal-500 to-emerald-600 p-2 rounded-lg">
              <Landmark className="h-5 w-5" />
            </div>
            Novo Centro de Custo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Code (auto-gerado, somente leitura) */}
          <div className="space-y-2">
            <Label htmlFor="cc-code">{'C\u00F3digo'}</Label>
            <Input
              id="cc-code"
              value={nextCode}
              readOnly
              disabled
              className="font-mono bg-muted"
            />
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="cc-name">Nome *</Label>
            <div className="relative">
              <Input
                id="cc-name"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (fieldErrors.name)
                    setFieldErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="Ex.: Departamento Comercial"
                required
                autoFocus
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && <FormErrorIcon message={fieldErrors.name} />}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="cc-description">{'Descri\u00E7\u00E3o'}</Label>
            <Textarea
              id="cc-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={'Descri\u00E7\u00E3o opcional do centro de custo'}
              rows={3}
            />
          </div>

          {/* Switch Ativo */}
          <div className="flex items-center justify-between">
            <Label htmlFor="cc-active" className="cursor-pointer">
              Ativo
            </Label>
            <Switch
              id="cc-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Budget - 2 colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cc-monthly">{'Or\u00E7amento Mensal (R$)'}</Label>
              <Input
                id="cc-monthly"
                type="number"
                step="0.01"
                min="0"
                value={monthlyBudget}
                onChange={e => setMonthlyBudget(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc-annual">{'Or\u00E7amento Anual (R$)'}</Label>
              <Input
                id="cc-annual"
                type="number"
                step="0.01"
                min="0"
                value={annualBudget}
                onChange={e => setAnnualBudget(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
