'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import type { CreatePPEItemData, PPECategory } from '@/types/hr';
import { HardHat, Package, Settings } from 'lucide-react';
import { useState } from 'react';
import { useCreatePPEItem } from '../api';
import { PPE_CATEGORIES, getCategoryLabel } from '../utils';

interface CreatePPEItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  HEAD: 'border-sky-500 bg-sky-50 dark:bg-sky-500/8',
  EYES: 'border-violet-500 bg-violet-50 dark:bg-violet-500/8',
  EARS: 'border-teal-500 bg-teal-50 dark:bg-teal-500/8',
  RESPIRATORY: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/8',
  HANDS: 'border-amber-500 bg-amber-50 dark:bg-amber-500/8',
  FEET: 'border-rose-500 bg-rose-50 dark:bg-rose-500/8',
  BODY: 'border-slate-500 bg-slate-50 dark:bg-slate-500/8',
  FALL_PROTECTION: 'border-red-500 bg-red-50 dark:bg-red-500/8',
};

export function CreatePPEItemModal({ isOpen, onClose }: CreatePPEItemModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PPECategory | ''>('');
  const [caNumber, setCaNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [expirationMonths, setExpirationMonths] = useState('');
  const [minStock, setMinStock] = useState('0');
  const [currentStock, setCurrentStock] = useState('0');
  const [notes, setNotes] = useState('');

  const createMutation = useCreatePPEItem({
    onSuccess: () => {
      resetForm();
      onClose();
    },
  });

  function resetForm() {
    setCurrentStep(1);
    setName('');
    setCategory('');
    setCaNumber('');
    setManufacturer('');
    setModel('');
    setExpirationMonths('');
    setMinStock('0');
    setCurrentStock('0');
    setNotes('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const steps: WizardStep[] = [
    {
      title: 'Categoria',
      description: 'Selecione a categoria do EPI',
      icon: <HardHat className="h-10 w-10 text-sky-500" />,
      isValid: category !== '',
      content: (
        <div className="space-y-4">
          <Label>Categoria do EPI</Label>
          <div className="grid grid-cols-2 gap-3">
            {PPE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-lg border-2 p-3 text-left transition-all ${
                  category === cat
                    ? CATEGORY_COLORS[cat]
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <p className="text-sm font-medium">{getCategoryLabel(cat)}</p>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Detalhes',
      description: 'Informações do equipamento',
      icon: <Package className="h-10 w-10 text-sky-500" />,
      isValid: name.trim().length > 0,
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="ppe-name">Nome *</Label>
            <Input
              id="ppe-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Capacete de Segurança Classe B"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ppe-ca">Número do CA</Label>
              <Input
                id="ppe-ca"
                value={caNumber}
                onChange={(e) => setCaNumber(e.target.value)}
                placeholder="Ex: CA-12345"
              />
            </div>
            <div>
              <Label htmlFor="ppe-manufacturer">Fabricante</Label>
              <Input
                id="ppe-manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="Ex: 3M"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ppe-model">Modelo</Label>
              <Input
                id="ppe-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ex: H-700"
              />
            </div>
            <div>
              <Label htmlFor="ppe-expiration">Validade (meses)</Label>
              <Input
                id="ppe-expiration"
                type="number"
                min="1"
                value={expirationMonths}
                onChange={(e) => setExpirationMonths(e.target.value)}
                placeholder="Ex: 12"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Estoque',
      description: 'Configurar estoque',
      icon: <Settings className="h-10 w-10 text-sky-500" />,
      isValid: true,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ppe-current-stock">Estoque Atual</Label>
              <Input
                id="ppe-current-stock"
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ppe-min-stock">Estoque Mínimo</Label>
              <Input
                id="ppe-min-stock"
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="ppe-notes">Observações</Label>
            <Textarea
              id="ppe-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais sobre o EPI..."
              rows={3}
            />
          </div>
        </div>
      ),
      footer: (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={async () => {
              const payload: CreatePPEItemData = {
                name: name.trim(),
                category: category as PPECategory,
                ...(caNumber.trim() && { caNumber: caNumber.trim() }),
                ...(manufacturer.trim() && { manufacturer: manufacturer.trim() }),
                ...(model.trim() && { model: model.trim() }),
                ...(expirationMonths && { expirationMonths: Number(expirationMonths) }),
                minStock: Number(minStock) || 0,
                currentStock: Number(currentStock) || 0,
                ...(notes.trim() && { notes: notes.trim() }),
              };
              await createMutation.mutateAsync(payload);
            }}
            disabled={createMutation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Cadastrando...' : 'Cadastrar EPI'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
    />
  );
}
