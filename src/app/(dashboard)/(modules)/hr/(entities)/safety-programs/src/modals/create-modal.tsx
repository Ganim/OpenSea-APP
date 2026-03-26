'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  CreateSafetyProgramData,
  SafetyProgramType,
  SafetyProgramStatus,
} from '@/types/hr';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Check, Loader2, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSafetyProgramData) => void;
  isSubmitting: boolean;
}

const TYPE_OPTIONS: { value: SafetyProgramType; label: string }[] = [
  { value: 'PCMSO', label: 'PCMSO — Prog. Controle Médico de Saúde Ocupacional' },
  { value: 'PGR', label: 'PGR — Programa de Gerenciamento de Riscos' },
  { value: 'LTCAT', label: 'LTCAT — Laudo Técnico das Condições Ambientais' },
  { value: 'PPRA', label: 'PPRA — Prog. Prevenção de Riscos Ambientais' },
];

const STATUS_OPTIONS: { value: SafetyProgramStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'EXPIRED', label: 'Expirado' },
];

export function CreateModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateModalProps) {
  const [type, setType] = useState<SafetyProgramType | ''>('');
  const [name, setName] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [responsibleRegistration, setResponsibleRegistration] = useState('');
  const [status, setStatus] = useState<SafetyProgramStatus>('DRAFT');
  const [documentUrl, setDocumentUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType('');
      setName('');
      setValidFrom(new Date().toISOString().split('T')[0]);
      setValidUntil('');
      setResponsibleName('');
      setResponsibleRegistration('');
      setStatus('DRAFT');
      setDocumentUrl('');
      setNotes('');
    }
  }, [isOpen]);

  const canSubmit =
    type &&
    name.trim() &&
    validFrom &&
    validUntil &&
    responsibleName.trim() &&
    responsibleRegistration.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const data: CreateSafetyProgramData = {
      type: type as SafetyProgramType,
      name: name.trim(),
      validFrom,
      validUntil,
      responsibleName: responsibleName.trim(),
      responsibleRegistration: responsibleRegistration.trim(),
      status,
      documentUrl: documentUrl.trim() || undefined,
      notes: notes.trim() || undefined,
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
        className="sm:max-w-[800px] max-w-[800px] h-[560px] p-0 gap-0 overflow-hidden flex flex-row"
      >
        <VisuallyHidden>
          <DialogTitle>Novo Programa de Segurança</DialogTitle>
        </VisuallyHidden>

        {/* Left icon column */}
        <div className="w-[200px] shrink-0 bg-slate-50 dark:bg-white/5 flex items-center justify-center border-r border-border/50">
          <ShieldCheck
            className="h-16 w-16 text-emerald-400"
            strokeWidth={1.2}
          />
        </div>

        {/* Right content column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div>
              <h2 className="text-lg font-semibold leading-none">
                Novo Programa de Segurança
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Cadastre um novo programa de segurança do trabalho.
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
              {/* Tipo + Status */}
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">
                    Tipo <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={type}
                    onValueChange={v => setType(v as SafetyProgramType)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecionar tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40 space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={status}
                    onValueChange={v => setStatus(v as SafetyProgramStatus)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Nome */}
              <div className="space-y-1.5">
                <Label htmlFor="program-name" className="text-xs">
                  Nome do Programa <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="program-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: PCMSO 2026"
                  className="h-9"
                />
              </div>

              {/* Vigência */}
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="valid-from" className="text-xs">
                    Vigência Início <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="valid-from"
                    type="date"
                    value={validFrom}
                    onChange={e => setValidFrom(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="valid-until" className="text-xs">
                    Vigência Fim <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="valid-until"
                    type="date"
                    value={validUntil}
                    onChange={e => setValidUntil(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Responsável */}
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="responsible-name" className="text-xs">
                    Responsável Técnico <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="responsible-name"
                    value={responsibleName}
                    onChange={e => setResponsibleName(e.target.value)}
                    placeholder="Nome completo"
                    className="h-9"
                  />
                </div>
                <div className="w-48 space-y-1.5">
                  <Label htmlFor="responsible-reg" className="text-xs">
                    Registro <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="responsible-reg"
                    value={responsibleRegistration}
                    onChange={e => setResponsibleRegistration(e.target.value)}
                    placeholder="CRM/CREA/etc."
                    className="h-9"
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-1.5">
                <Label htmlFor="program-notes" className="text-xs">
                  Observações
                </Label>
                <Textarea
                  id="program-notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Informações adicionais sobre o programa..."
                  rows={2}
                />
              </div>

              {/* URL do Documento */}
              <div className="space-y-1.5">
                <Label htmlFor="program-doc-url" className="text-xs">
                  URL do Documento
                </Label>
                <Input
                  id="program-doc-url"
                  value={documentUrl}
                  onChange={e => setDocumentUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-9"
                />
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
                Criar Programa
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
