'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateLandingPage } from '@/hooks/sales/use-landing-pages';
import { useForms } from '@/hooks/sales/use-forms';
import { ApiError } from '@/lib/errors/api-error';
import { translateError } from '@/lib/error-messages';
import {
  Check,
  Globe,
  Layout,
  FileText,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { LandingPageTemplate, LandingPageSection } from '@/types/sales';
import { LANDING_PAGE_TEMPLATE_LABELS } from '@/types/sales';

interface CreateLandingPageWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

let sectionCounter = 0;
function nextSectionId(): string {
  sectionCounter += 1;
  return `temp-section-${sectionCounter}`;
}

type SectionEntry = Omit<LandingPageSection, 'id'> & { tempId: string };

function StepBasicInfo({
  title,
  onTitleChange,
  slug,
  onSlugChange,
  template,
  onTemplateChange,
  fieldErrors,
}: {
  title: string;
  onTitleChange: (v: string) => void;
  slug: string;
  onSlugChange: (v: string) => void;
  template: LandingPageTemplate;
  onTemplateChange: (v: LandingPageTemplate) => void;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Título da Página *</Label>
        <div className="relative">
          <Input
            placeholder="Ex: Lançamento Produto X"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            autoFocus
            aria-invalid={!!fieldErrors.title}
          />
          <FormErrorIcon message={fieldErrors.title} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Slug (URL) *</Label>
        <div className="relative">
          <Input
            placeholder="ex: lancamento-produto-x"
            value={slug}
            onChange={e =>
              onSlugChange(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '-')
                  .replace(/-+/g, '-')
              )
            }
            aria-invalid={!!fieldErrors.slug}
          />
          <FormErrorIcon message={fieldErrors.slug} />
        </div>
        <p className="text-xs text-muted-foreground">
          A URL será: /p/{slug || 'slug-da-pagina'}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Template</Label>
        <Select
          value={template}
          onValueChange={v => onTemplateChange(v as LandingPageTemplate)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LANDING_PAGE_TEMPLATE_LABELS).map(
              ([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function StepContentSections({
  sections,
  onAdd,
  onRemove,
  onChange,
}: {
  sections: SectionEntry[];
  onAdd: () => void;
  onRemove: (tempId: string) => void;
  onChange: (tempId: string, field: keyof SectionEntry, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Configure as seções da sua página de captura.
      </p>

      {sections.map((section, idx) => (
        <div
          key={section.tempId}
          className="border border-border rounded-lg p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Seção {idx + 1}</h4>
            {sections.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400"
                onClick={() => onRemove(section.tempId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Título</Label>
            <Input
              placeholder="Título da seção"
              value={section.title || ''}
              onChange={e =>
                onChange(section.tempId, 'title', e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Descrição</Label>
            <Textarea
              placeholder="Texto da seção..."
              value={section.content || ''}
              onChange={e =>
                onChange(section.tempId, 'content', e.target.value)
              }
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Texto do CTA</Label>
              <Input
                placeholder="Ex: Saiba Mais"
                value={section.ctaText || ''}
                onChange={e =>
                  onChange(section.tempId, 'ctaText', e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Link do CTA</Label>
              <Input
                placeholder="https://..."
                value={section.ctaLink || ''}
                onChange={e =>
                  onChange(section.tempId, 'ctaLink', e.target.value)
                }
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={onAdd}
      >
        <Plus className="h-4 w-4" />
        Adicionar Seção
      </Button>
    </div>
  );
}

function StepReview({
  title,
  slug,
  template,
  formId,
  onFormIdChange,
  forms,
  sections,
}: {
  title: string;
  slug: string;
  template: LandingPageTemplate;
  formId: string;
  onFormIdChange: (v: string) => void;
  forms: Array<{ id: string; name: string }>;
  sections: SectionEntry[];
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Vincular Formulário</Label>
        <Select value={formId} onValueChange={onFormIdChange}>
          <SelectTrigger>
            <SelectValue placeholder="Nenhum formulário (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            {forms.map(f => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-semibold">Resumo</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Título:</strong> {title}
          </p>
          <p>
            <strong>URL:</strong> /p/{slug}
          </p>
          <p>
            <strong>Template:</strong>{' '}
            {LANDING_PAGE_TEMPLATE_LABELS[template]}
          </p>
          <p>
            <strong>Seções:</strong> {sections.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CreateLandingPageWizard({
  open,
  onOpenChange,
}: CreateLandingPageWizardProps) {
  const router = useRouter();
  const createLandingPage = useCreateLandingPage();
  const { data: formsData } = useForms();

  const forms = (formsData as { forms?: Array<{ id: string; name: string }> })?.forms ?? [];

  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [template, setTemplate] = useState<LandingPageTemplate>('LEAD_CAPTURE');
  const [formId, setFormId] = useState('');
  const [sections, setSections] = useState<SectionEntry[]>([
    {
      tempId: nextSectionId(),
      type: 'HERO',
      title: '',
      content: '',
      ctaText: '',
      ctaLink: '',
      position: 0,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setTitle('');
    setSlug('');
    setTemplate('LEAD_CAPTURE');
    setFormId('');
    setSections([
      {
        tempId: nextSectionId(),
        type: 'HERO',
        title: '',
        content: '',
        ctaText: '',
        ctaLink: '',
        position: 0,
      },
    ]);
    setIsSubmitting(false);
    setFieldErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  const handleAddSection = useCallback(() => {
    setSections(prev => [
      ...prev,
      {
        tempId: nextSectionId(),
        type: 'CUSTOM',
        title: '',
        content: '',
        ctaText: '',
        ctaLink: '',
        position: prev.length,
      },
    ]);
  }, []);

  const handleRemoveSection = useCallback((tempId: string) => {
    setSections(prev => prev.filter(s => s.tempId !== tempId));
  }, []);

  const handleChangeSection = useCallback(
    (tempId: string, field: keyof SectionEntry, value: string) => {
      setSections(prev =>
        prev.map(s => (s.tempId === tempId ? { ...s, [field]: value } : s))
      );
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await createLandingPage.mutateAsync({
        title: title.trim(),
        slug: slug.trim(),
        template,
        formId: formId && formId !== 'none' ? formId : undefined,
        sections: sections.map((s, idx) => ({
          type: s.type,
          title: s.title || undefined,
          content: s.content || undefined,
          ctaText: s.ctaText || undefined,
          ctaLink: s.ctaLink || undefined,
          position: idx,
        })),
      });

      toast.success('Página de captura criada com sucesso!');
      handleClose();
      router.push(`/sales/landing-pages/${response.landingPage.id}`);
    } catch (err) {
      const apiError = ApiError.from(err);
      if (apiError.fieldErrors?.length) {
        const errors: Record<string, string> = {};
        for (const fe of apiError.fieldErrors) {
          errors[fe.field] = translateError(fe.message);
        }
        setFieldErrors(errors);
        setCurrentStep(1);
      } else {
        toast.error(translateError(apiError.message));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    title,
    slug,
    template,
    formId,
    sections,
    createLandingPage,
    handleClose,
    router,
  ]);

  const steps: WizardStep[] = [
    {
      title: 'Nova Página de Captura',
      description: 'Defina título, slug e template.',
      icon: <Globe className="h-16 w-16 text-sky-400" strokeWidth={1.2} />,
      content: (
        <StepBasicInfo
          title={title}
          onTitleChange={v => {
            setTitle(v);
            if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')) {
              setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'));
            }
            setFieldErrors(prev => {
              const { title: _, ...rest } = prev;
              return rest;
            });
          }}
          slug={slug}
          onSlugChange={v => {
            setSlug(v);
            setFieldErrors(prev => {
              const { slug: _, ...rest } = prev;
              return rest;
            });
          }}
          template={template}
          onTemplateChange={setTemplate}
          fieldErrors={fieldErrors}
        />
      ),
      isValid: title.trim().length > 0 && slug.trim().length > 0,
    },
    {
      title: 'Conteúdo das Seções',
      description: 'Configure o conteúdo de cada seção.',
      icon: (
        <Layout className="h-16 w-16 text-violet-400" strokeWidth={1.2} />
      ),
      onBack: () => setCurrentStep(1),
      content: (
        <StepContentSections
          sections={sections}
          onAdd={handleAddSection}
          onRemove={handleRemoveSection}
          onChange={handleChangeSection}
        />
      ),
      isValid: true,
    },
    {
      title: 'Formulário e Revisão',
      description: 'Vincule um formulário e revise.',
      icon: (
        <FileText className="h-16 w-16 text-emerald-400" strokeWidth={1.2} />
      ),
      onBack: () => setCurrentStep(2),
      content: (
        <StepReview
          title={title}
          slug={slug}
          template={template}
          formId={formId}
          onFormIdChange={setFormId}
          forms={forms}
          sections={sections}
        />
      ),
      isValid: true,
      footer: (
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Criar Página
        </Button>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={open}
      onOpenChange={onOpenChange}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
    />
  );
}
