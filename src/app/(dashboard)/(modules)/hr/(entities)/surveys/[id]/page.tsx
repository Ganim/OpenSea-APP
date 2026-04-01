/**
 * OpenSea OS - Survey Detail Page
 * Página de detalhes da pesquisa
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { surveysService } from '@/services/hr/surveys.service';
import type { SurveyQuestion, SurveyType, SurveyStatus } from '@/types/hr';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Edit,
  Hash,
  HelpCircle,
  Lock,
  MessageSquare,
  Play,
  Plus,
  Square,
  Star,
  ToggleLeft,
  Trash2,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  SURVEY_TYPE_LABELS,
  SURVEY_TYPE_COLORS,
  SURVEY_STATUS_LABELS,
  SURVEY_STATUS_COLORS,
  QUESTION_TYPE_LABELS,
  QUESTION_CATEGORY_LABELS,
} from '../src';
import { AddQuestionModal } from '../src/modals/add-question-modal';
import { SubmitResponseModal } from '../src/modals/submit-response-modal';
import type { SurveyQuestionCategory } from '@/types/hr';

export default function SurveyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const surveyId = params.id as string;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isResponseOpen, setIsResponseOpen] = useState(false);

  const canModify = hasPermission(HR_PERMISSIONS.SURVEYS.MODIFY);
  const canDelete = hasPermission(HR_PERMISSIONS.SURVEYS.REMOVE);

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

  const deleteMutation = useMutation({
    mutationFn: () => surveysService.delete(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Pesquisa excluída com sucesso');
      router.push('/hr/surveys');
    },
    onError: () => {
      toast.error('Erro ao excluir pesquisa');
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => surveysService.activate(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys', surveyId] });
      toast.success('Pesquisa ativada com sucesso');
    },
    onError: () => {
      toast.error(
        'Erro ao ativar pesquisa. Verifique se há pelo menos uma pergunta.'
      );
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => surveysService.close(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys', surveyId] });
      toast.success('Pesquisa encerrada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao encerrar pesquisa');
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

  const submitResponseMutation = useMutation({
    mutationFn: surveysService.submitResponse.bind(surveysService, surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys', surveyId] });
      toast.success('Resposta enviada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao enviar resposta');
    },
  });

  if (isLoading) {
    return (
      <PageLayout>
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
      <PageLayout>
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

  const survey = surveyData;
  const questions = survey.questions ?? [];
  const typeColors =
    SURVEY_TYPE_COLORS[survey.type as SurveyType] ?? SURVEY_TYPE_COLORS.CUSTOM;
  const statusColors =
    SURVEY_STATUS_COLORS[survey.status as SurveyStatus] ??
    SURVEY_STATUS_COLORS.DRAFT;

  const isDraft = survey.status === 'DRAFT';
  const isActive = survey.status === 'ACTIVE';
  const isClosed = survey.status === 'CLOSED';

  // Build action bar buttons
  const actionButtons: Array<{
    id: string;
    title: string;
    icon: typeof Edit;
    onClick: () => void;
    variant: 'default' | 'destructive' | 'outline';
  }> = [];

  if (canDelete && (isDraft || isClosed)) {
    actionButtons.push({
      id: 'delete',
      title: 'Excluir',
      icon: Trash2,
      onClick: () => setIsDeleteOpen(true),
      variant: 'destructive',
    });
  }

  if (canModify && isActive) {
    actionButtons.push({
      id: 'close',
      title: 'Encerrar',
      icon: Square,
      onClick: () => closeMutation.mutate(),
      variant: 'outline',
    });
  }

  if (canModify && isDraft) {
    actionButtons.push({
      id: 'activate',
      title: 'Ativar',
      icon: Play,
      onClick: () => activateMutation.mutate(),
      variant: 'outline',
    });
  }

  if (canModify && isDraft) {
    actionButtons.push({
      id: 'edit',
      title: 'Editar',
      icon: Edit,
      onClick: () => router.push(`/hr/surveys/${surveyId}/edit`),
      variant: 'default',
    });
  }

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Pesquisas', href: '/hr/surveys' },
            { label: survey.title },
          ]}
          buttons={actionButtons}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${typeColors.gradient} text-white`}
            >
              <ClipboardList className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{survey.title}</h1>
              {survey.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {survey.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge
                  variant="outline"
                  className={`${typeColors.bg} ${typeColors.text} border-0`}
                >
                  {SURVEY_TYPE_LABELS[survey.type]}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${statusColors.bg} ${statusColors.text} border-0`}
                >
                  {SURVEY_STATUS_LABELS[survey.status]}
                </Badge>
                {survey.isAnonymous && (
                  <Badge
                    variant="outline"
                    className="bg-sky-50 text-sky-700 dark:bg-sky-500/8 dark:text-sky-300 border-0"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Anônima
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <HelpCircle className="h-4 w-4" />
              <span className="text-xs">Perguntas</span>
            </div>
            <p className="text-lg font-semibold">{questions.length}</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Respostas</span>
            </div>
            <p className="text-lg font-semibold">
              {survey._count?.responses ?? 0}
            </p>
          </Card>

          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Início</span>
            </div>
            <p className="text-sm font-medium">
              {survey.startDate
                ? new Date(survey.startDate).toLocaleDateString('pt-BR')
                : 'Não definido'}
            </p>
          </Card>

          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Término</span>
            </div>
            <p className="text-sm font-medium">
              {survey.endDate
                ? new Date(survey.endDate).toLocaleDateString('pt-BR')
                : 'Não definido'}
            </p>
          </Card>
        </div>

        {/* Active survey: Respond button */}
        {isActive && (
          <div className="mt-6">
            <Button
              onClick={() => setIsResponseOpen(true)}
              disabled={questions.length === 0}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Responder Pesquisa
            </Button>
          </div>
        )}

        {/* Questions Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Perguntas ({questions.length})
            </h2>
            {isDraft && canModify && (
              <Button
                size="sm"
                className="h-9 px-2.5"
                onClick={() => setIsAddQuestionOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Pergunta
              </Button>
            )}
          </div>

          {questions.length === 0 ? (
            <Card className="bg-white dark:bg-slate-800/60 border border-border p-8 text-center">
              <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma pergunta adicionada a esta pesquisa
              </p>
              {isDraft && canModify && (
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione pelo menos uma pergunta antes de ativar a pesquisa.
                </p>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {questions
                .sort((a, b) => a.order - b.order)
                .map((question, index) => (
                  <QuestionCard
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

        {/* Submit Response Modal */}
        {questions.length > 0 && (
          <SubmitResponseModal
            isOpen={isResponseOpen}
            onClose={() => setIsResponseOpen(false)}
            isSubmitting={submitResponseMutation.isPending}
            onSubmit={async data => {
              await submitResponseMutation.mutateAsync(data);
            }}
            questions={questions}
            surveyTitle={survey.title}
          />
        )}

        {/* Delete Confirmation */}
        <VerifyActionPinModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onSuccess={() => deleteMutation.mutate()}
          title="Excluir Pesquisa"
          description={`Digite seu PIN de ação para excluir "${survey.title}". Esta ação não pode ser desfeita.`}
        />
      </PageBody>
    </PageLayout>
  );
}

// ============================================================================
// QUESTION CARD
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

function QuestionCard({
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
