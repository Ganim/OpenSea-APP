/**
 * OpenSea OS - Edit Survey Page
 * Página de edição de pesquisa (somente DRAFT)
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { surveysService } from '@/services/hr/surveys.service';
import type {
  UpdateSurveyData,
  SurveyQuestion,
  SurveyQuestionCategory,
} from '@/types/hr';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  ClipboardList,
  Hash,
  HelpCircle,
  MessageSquare,
  Plus,
  Save,
  Star,
  ToggleLeft,
  Trash2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  SURVEY_TYPE_OPTIONS,
  QUESTION_TYPE_LABELS,
  QUESTION_CATEGORY_LABELS,
} from '../../src';
import { AddQuestionModal } from '../../src/modals/add-question-modal';

export default function EditSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const surveyId = params.id as string;

  const canDelete = hasPermission(HR_PERMISSIONS.SURVEYS.REMOVE);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const {
    data: surveyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['surveys', surveyId],
    queryFn: async () => {
      const { survey } = await surveysService.get(surveyId);
      return survey;
    },
  });

  useEffect(() => {
    if (surveyData) {
      setTitle(surveyData.title);
      setDescription(surveyData.description ?? '');
      setType(surveyData.type);
      setIsAnonymous(surveyData.isAnonymous);
      setStartDate(
        surveyData.startDate
          ? new Date(surveyData.startDate).toISOString().split('T')[0]
          : ''
      );
      setEndDate(
        surveyData.endDate
          ? new Date(surveyData.endDate).toISOString().split('T')[0]
          : ''
      );
    }
  }, [surveyData]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSurveyData) =>
      surveysService.update(surveyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Pesquisa atualizada com sucesso');
      router.push(`/hr/surveys/${surveyId}`);
    },
    onError: () => {
      toast.error('Erro ao atualizar pesquisa');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => surveysService.delete(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Pesquisa excluída com sucesso');
      router.push('/hr/surveys');
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: surveysService.addQuestion.bind(surveysService, surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys', surveyId] });
      toast.success('Pergunta adicionada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao adicionar pergunta');
    },
  });

  const handleSave = () => {
    const data: UpdateSurveyData = {
      title: title.trim(),
      description: description.trim() || undefined,
      type: type as UpdateSurveyData['type'],
      isAnonymous,
    };

    if (startDate) data.startDate = new Date(startDate).toISOString();
    if (endDate) data.endDate = new Date(endDate).toISOString();

    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <PageLayout data-testid="surveys-edit-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Pesquisas', href: '/hr/surveys' },
              { label: 'Carregando...' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" />
        </PageBody>
      </PageLayout>
    );
  }

  if (error || !surveyData) {
    return (
      <PageLayout data-testid="surveys-edit-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Pesquisas', href: '/hr/surveys' },
              { label: 'Erro' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="server"
            title="Pesquisa não encontrada"
            message="A pesquisa solicitada não foi encontrada."
            action={{
              label: 'Voltar',
              onClick: () => router.push('/hr/surveys'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  // Redirect if not DRAFT
  if (surveyData.status !== 'DRAFT') {
    router.push(`/hr/surveys/${surveyId}`);
    return null;
  }

  const questions = surveyData.questions ?? [];

  return (
    <PageLayout data-testid="surveys-edit-page">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Pesquisas', href: '/hr/surveys' },
            { label: surveyData.title, href: `/hr/surveys/${surveyId}` },
            { label: 'Editar' },
          ]}
          buttons={[
            ...(canDelete
              ? [
                  {
                    id: 'delete',
                    title: 'Excluir',
                    icon: Trash2,
                    onClick: () => setIsDeleteOpen(true),
                    variant: 'destructive' as const,
                  },
                ]
              : []),
            {
              id: 'save',
              title: 'Salvar',
              icon: Save,
              onClick: handleSave,
              variant: 'default' as const,
              disabled: updateMutation.isPending || !title.trim() || !type,
            },
          ]}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-violet-600 text-white">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{surveyData.title}</h1>
              <p className="text-xs text-muted-foreground">
                Criado em{' '}
                {new Date(surveyData.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>

        {/* Form Card */}
        <Card className="bg-white/5 py-2 overflow-hidden mt-6">
          <div className="p-6 grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo *</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SURVEY_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="startDate">Data de Início</Label>
                <DatePicker
                  id="startDate"
                  value={startDate}
                  onChange={v => setStartDate(typeof v === 'string' ? v : '')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="endDate">Data de Término</Label>
                <DatePicker
                  id="endDate"
                  value={endDate}
                  onChange={v => setEndDate(typeof v === 'string' ? v : '')}
                  fromDate={startDate ? new Date(startDate) : undefined}
                />
              </div>

              <div className="flex items-end">
                <div className="flex items-center gap-3 rounded-lg border p-4 w-full">
                  <Switch
                    id="isAnonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                  <div>
                    <Label htmlFor="isAnonymous" className="cursor-pointer">
                      Pesquisa Anônima
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Respostas não vinculadas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Questions Management */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Perguntas ({questions.length})
            </h2>
            <Button
              size="sm"
              className="h-9 px-2.5"
              onClick={() => setIsAddQuestionOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Pergunta
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card className="bg-white dark:bg-slate-800/60 border border-border p-8 text-center">
              <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma pergunta adicionada. Adicione pelo menos uma pergunta
                antes de ativar a pesquisa.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {questions
                .sort((a, b) => a.order - b.order)
                .map((question, index) => (
                  <EditQuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Add Question Modal */}
        <AddQuestionModal
          isOpen={isAddQuestionOpen}
          onClose={() => setIsAddQuestionOpen(false)}
          isSubmitting={addQuestionMutation.isPending}
          onSubmit={async data => {
            await addQuestionMutation.mutateAsync(data);
          }}
          nextOrder={questions.length + 1}
        />

        {/* Delete Confirmation */}
        <VerifyActionPinModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onSuccess={() => deleteMutation.mutate()}
          title="Excluir Pesquisa"
          description={`Digite seu PIN de ação para excluir "${surveyData.title}". Esta ação não pode ser desfeita.`}
        />
      </PageBody>
    </PageLayout>
  );
}

// ============================================================================
// EDIT QUESTION CARD
// ============================================================================

function getQuestionIcon(type: string) {
  switch (type) {
    case 'RATING_1_5':
    case 'RATING_1_10':
      return <Star className="h-4 w-4" />;
    case 'YES_NO':
      return <ToggleLeft className="h-4 w-4" />;
    case 'TEXT':
      return <MessageSquare className="h-4 w-4" />;
    case 'MULTIPLE_CHOICE':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'NPS':
      return <Hash className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
}

function EditQuestionCard({
  question,
  index,
}: {
  question: SurveyQuestion;
  index: number;
}) {
  return (
    <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-500/8 text-violet-700 dark:text-violet-300">
          {getQuestionIcon(question.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">
              #{index + 1}
            </span>
            {question.isRequired && (
              <Badge
                variant="outline"
                className="text-xs bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300 border-0"
              >
                Obrigatória
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {QUESTION_TYPE_LABELS[question.type]}
            </Badge>
            {question.category && (
              <Badge variant="secondary" className="text-xs">
                {QUESTION_CATEGORY_LABELS[
                  question.category as SurveyQuestionCategory
                ] ?? question.category}
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium mt-1">{question.text}</p>
          {question.type === 'MULTIPLE_CHOICE' &&
            question.options &&
            question.options.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {question.options.map((opt, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {opt}
                  </Badge>
                ))}
              </div>
            )}
        </div>
      </div>
    </Card>
  );
}
