'use client';

import { Button } from '@/components/ui/button';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { translateError } from '@/lib/error-messages';
import type { AnnouncementPriority, CreateAnnouncementData } from '@/types/hr';
import { Loader2, Megaphone } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: CreateAnnouncementData) => Promise<void>;
}

export function CreateAnnouncementModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
}: CreateAnnouncementModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('NORMAL');
  const [expiresAt, setExpiresAt] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [wasOpen, setWasOpen] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Reset when modal opens
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setCurrentStep(1);
    setTitle('');
    setContent('');
    setPriority('NORMAL');
    setExpiresAt('');
    setFieldErrors({});
  }
  if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        priority,
        expiresAt: expiresAt || undefined,
      });
      handleClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('title') || msg.includes('titulo')) {
        setFieldErrors(prev => ({ ...prev, title: translateError(msg) }));
      } else {
        toast.error(translateError(msg));
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Focus title input on step 1
  useEffect(() => {
    if (currentStep === 1 && isOpen) {
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen]);

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Informações do Comunicado',
        description: 'Preencha o título e o conteúdo do comunicado',
        icon: <Megaphone className="h-16 w-16 text-violet-500/60" />,
        isValid: !!title.trim() && !!content.trim(),
        content: (
          <div className="flex flex-col h-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">
                Título <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  ref={titleInputRef}
                  id="announcement-title"
                  placeholder="Título do comunicado"
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value);
                    if (fieldErrors.title)
                      setFieldErrors(prev => ({ ...prev, title: '' }));
                  }}
                  aria-invalid={!!fieldErrors.title}
                />
                <FormErrorIcon message={fieldErrors.title || ''} />
              </div>
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <Label htmlFor="announcement-content">
                Conteúdo <span className="text-rose-500">*</span>
              </Label>
              <textarea
                id="announcement-content"
                placeholder="Escreva o conteúdo do comunicado..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="flex-1 min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
        ),
      },
      {
        title: 'Configurações',
        description: 'Defina a prioridade e a data de expiração',
        icon: <Megaphone className="h-16 w-16 text-violet-500/60" />,
        isValid: !isSubmitting,
        onBack: () => setCurrentStep(1),
        content: (
          <div className="flex flex-col h-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-priority">Prioridade</Label>
              <Select
                value={priority}
                onValueChange={v => setPriority(v as AnnouncementPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="IMPORTANT">Importante</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcement-expires">
                Data de Expiração (opcional)
              </Label>
              <Input
                id="announcement-expires"
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                O comunicado será ocultado automaticamente após esta data
              </p>
            </div>
          </div>
        ),
        footer: (
          <Button
            type="button"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              'Publicar Comunicado'
            )}
          </Button>
        ),
      },
    ],
    [title, content, priority, expiresAt, isSubmitting, fieldErrors]
  );

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={open => !open && handleClose()}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
    />
  );
}
