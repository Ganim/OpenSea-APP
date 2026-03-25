'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type {
  CreateDependantData,
  EmployeeDependant,
  UpdateDependantData,
} from '@/types/hr';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Check, Loader2, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DependantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDependantData | UpdateDependantData) => void;
  isSubmitting: boolean;
  dependant?: EmployeeDependant | null;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'SPOUSE', label: 'Cônjuge' },
  { value: 'CHILD', label: 'Filho(a)' },
  { value: 'STEPCHILD', label: 'Enteado(a)' },
  { value: 'PARENT', label: 'Pai/Mãe' },
  { value: 'OTHER', label: 'Outro' },
];

export function DependantModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  dependant,
}: DependantModalProps) {
  const isEditing = !!dependant;

  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isIrrfDependant, setIsIrrfDependant] = useState(false);
  const [isSalarioFamilia, setIsSalarioFamilia] = useState(false);
  const [hasDisability, setHasDisability] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (dependant) {
        setName(dependant.name);
        setCpf(dependant.cpf || '');
        setBirthDate(dependant.birthDate?.split('T')[0] || '');
        setRelationship(dependant.relationship);
        setIsIrrfDependant(dependant.isIrrfDependant);
        setIsSalarioFamilia(dependant.isSalarioFamilia);
        setHasDisability(dependant.hasDisability);
      } else {
        setName('');
        setCpf('');
        setBirthDate('');
        setRelationship('');
        setIsIrrfDependant(false);
        setIsSalarioFamilia(false);
        setHasDisability(false);
      }
    }
  }, [isOpen, dependant]);

  const canSubmit = name.trim() && birthDate && relationship;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const data: CreateDependantData = {
      name: name.trim(),
      cpf: cpf.trim() || undefined,
      birthDate,
      relationship,
      isIrrfDependant,
      isSalarioFamilia,
      hasDisability,
    };

    onSubmit(data);
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[800px] max-w-[800px] h-[520px] p-0 gap-0 overflow-hidden flex flex-row"
      >
        <VisuallyHidden>
          <DialogTitle>
            {isEditing ? 'Editar Dependente' : 'Novo Dependente'}
          </DialogTitle>
        </VisuallyHidden>

        {/* Left icon column */}
        <div className="w-[200px] shrink-0 bg-slate-50 dark:bg-white/5 flex items-center justify-center border-r border-border/50">
          <Users className="h-16 w-16 text-violet-400" strokeWidth={1.2} />
        </div>

        {/* Right content column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div>
              <h2 className="text-lg font-semibold leading-none">
                {isEditing ? 'Editar Dependente' : 'Novo Dependente'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isEditing
                  ? 'Atualize os dados do dependente.'
                  : 'Registre um novo dependente do funcionário.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0"
          >
            <div
              className="flex-1 overflow-y-auto px-6 py-2 space-y-4"
              onWheel={e => e.stopPropagation()}
            >
              {/* Nome + CPF */}
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="dep-name" className="text-xs">
                    Nome Completo <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="dep-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nome completo do dependente"
                    className="h-9"
                  />
                </div>
                <div className="w-40 space-y-1.5">
                  <Label htmlFor="dep-cpf" className="text-xs">
                    CPF
                  </Label>
                  <Input
                    id="dep-cpf"
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="h-9"
                  />
                </div>
              </div>

              {/* Data de Nascimento + Parentesco */}
              <div className="flex items-end gap-3">
                <div className="w-44 space-y-1.5">
                  <Label htmlFor="dep-birthdate" className="text-xs">
                    Data de Nascimento <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="dep-birthdate"
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">
                    Parentesco <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={relationship} onValueChange={setRelationship}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">
                      Dependente IRRF
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Incluir como dependente para dedução do Imposto de Renda
                    </p>
                  </div>
                  <Switch
                    checked={isIrrfDependant}
                    onCheckedChange={setIsIrrfDependant}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">
                      Salário-Família
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Habilita o recebimento do benefício de Salário-Família
                    </p>
                  </div>
                  <Switch
                    checked={isSalarioFamilia}
                    onCheckedChange={setIsSalarioFamilia}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">
                      Pessoa com Deficiência
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Indica se o dependente possui alguma deficiência
                    </p>
                  </div>
                  <Switch
                    checked={hasDisability}
                    onCheckedChange={setHasDisability}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-border/50">
              <Button type="submit" disabled={isSubmitting || !canSubmit}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {isEditing ? 'Salvar Alterações' : 'Adicionar Dependente'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
