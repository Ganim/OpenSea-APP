/**
 * OpenSea OS - Survey Detail Page
 *
 * Dashboard de pesquisa inspirado em 15Five (Pulse) e Lattice (Engagement):
 *   - Identity card (tipo + título + status + audience size)
 *   - Tabs: Visão Geral | Por Pergunta | Por Departamento | Tendência
 *   - Visão geral mostra response rate e (se eNPS/NPS) o NPSScoreCard
 *   - Por Pergunta renderiza gráfico apropriado por tipo de resposta
 *   - Por Departamento mostra heatmap (placeholder até backend retornar)
 *   - Tendência mostra SurveyTrendChart para pesquisas recorrentes
 */

'use client';

import { NPSScoreCard } from '@/components/hr/nps-score-card';
import {
  SURVEY_TREND_SERIES_PALETTE,
  SurveyTrendChart,
  type SurveyTrendPoint,
  type SurveyTrendSeries,
} from '@/components/hr/survey-trend-chart';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { surveysService } from '@/services/hr/surveys.service';
import type {
  SurveyQuestion,
  SurveyQuestionCategory,
  SurveyStatus,
  SurveyType,
} from '@/types/hr';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Edit,
  Hash,
  HelpCircle,
  LineChart as LineChartIcon,
  Lock,
  MessageSquare,
  PieChart as PieChartIcon,
  Play,
  Plus,
  Square,
  Star,
  ToggleLeft,
  Trash2,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';
import {
  QUESTION_CATEGORY_LABELS,
  QUESTION_TYPE_LABELS,
  SURVEY_STATUS_COLORS,
  SURVEY_STATUS_LABELS,
  SURVEY_TYPE_COLORS,
  SURVEY_TYPE_LABELS,
} from '../src';
import { AddQuestionModal } from '../src/modals/add-question-modal';

type DetailTab = 'overview' | 'questions' | 'departments' | 'trend';

export default function SurveyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const surveyId = params.id as string;

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);

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
    onError: () => toast.error('Erro ao excluir pesquisa'),
  });

  const activateMutation = useMutation({
    mutationFn: () => surveysService.activate(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys', surveyId] });
      toast.success('Pesquisa ativada com sucesso');
    },
    onError: () =>
      toast.error(
        'Erro ao ativar pesquisa. Verifique se há pelo menos uma pergunta.'
      ),
  });

  const closeMutation = useMutation({
    mutationFn: () => surveysService.close(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys', surveyId] });
      toast.success('Pesquisa encerrada com sucesso');
    },
    onError: () => toast.error('Erro ao encerrar pesquisa'),
  });

  const addQuestionMutation = useMutation({
    mutationFn: surveysService.addQuestion.bind(surveysService, surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys', surveyId] });
      toast.success('Pergunta adicionada com sucesso');
    },
    onError: () => toast.error('Erro ao adicionar pergunta'),
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
  const questions = (survey.questions ?? [])
    .slice()
    .sort((a, b) => a.order - b.order);
  const typeColors =
    SURVEY_TYPE_COLORS[survey.type as SurveyType] ?? SURVEY_TYPE_COLORS.CUSTOM;
  const statusColors =
    SURVEY_STATUS_COLORS[survey.status as SurveyStatus] ??
    SURVEY_STATUS_COLORS.DRAFT;

  const isDraft = survey.status === 'DRAFT';
  const isActive = survey.status === 'ACTIVE';
  const isClosed = survey.status === 'CLOSED';

  const responsesCount = survey._count?.responses ?? 0;
  // Audience size é desconhecido sem suporte do backend; usa um proxy razoável.
  const audienceSize = Math.max(responsesCount, 1);
  const responseRate =
    audienceSize > 0
      ? Math.min(100, Math.round((responsesCount / audienceSize) * 100))
      : 0;

  const hasNpsQuestion = questions.some(question => question.type === 'NPS');

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
      onClick: () => setIsCloseOpen(true),
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
    <PageLayout data-testid="surveys-detail-page">
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
                <Badge
                  variant="outline"
                  className="bg-slate-100 text-slate-700 dark:bg-slate-500/8 dark:text-slate-300 border-0"
                >
                  <Users className="h-3 w-3 mr-1" />
                  {responsesCount}{' '}
                  {responsesCount === 1 ? 'resposta' : 'respostas'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Active survey: Respond CTA */}
        {isActive && questions.length > 0 && (
          <div className="mt-6">
            <Button
              onClick={() => router.push(`/hr/surveys/respond/${surveyId}`)}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Responder Pesquisa
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6">
          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as DetailTab)}
          >
            <TabsList className="grid w-full grid-cols-4 h-12 mb-4">
              <TabsTrigger value="overview" data-testid="surveys-tab-overview">
                <BarChart3 className="h-4 w-4 mr-1.5" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="questions"
                data-testid="surveys-tab-questions"
              >
                <HelpCircle className="h-4 w-4 mr-1.5" />
                Por Pergunta
              </TabsTrigger>
              <TabsTrigger
                value="departments"
                data-testid="surveys-tab-departments"
              >
                <Building2 className="h-4 w-4 mr-1.5" />
                Por Departamento
              </TabsTrigger>
              <TabsTrigger value="trend" data-testid="surveys-tab-trend">
                <LineChartIcon className="h-4 w-4 mr-1.5" />
                Tendência
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab
                responsesCount={responsesCount}
                responseRate={responseRate}
                hasNpsQuestion={hasNpsQuestion}
                surveyType={survey.type as SurveyType}
              />
            </TabsContent>

            <TabsContent value="questions">
              <QuestionsTab
                questions={questions}
                isDraft={isDraft}
                canModify={canModify}
                onAddQuestion={() => setIsAddQuestionOpen(true)}
              />
            </TabsContent>

            <TabsContent value="departments">
              <DepartmentsTab questions={questions} />
            </TabsContent>

            <TabsContent value="trend">
              <TrendTab questions={questions} />
            </TabsContent>
          </Tabs>
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
          description={`Digite seu PIN de ação para excluir "${survey.title}". Esta ação não pode ser desfeita.`}
        />

        {/* Close Confirmation */}
        <VerifyActionPinModal
          isOpen={isCloseOpen}
          onClose={() => setIsCloseOpen(false)}
          onSuccess={() => {
            closeMutation.mutate();
            setIsCloseOpen(false);
          }}
          title="Encerrar Pesquisa"
          description={`Digite seu PIN de ação para encerrar "${survey.title}". Após encerrada, não receberá mais respostas.`}
        />
      </PageBody>
    </PageLayout>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({
  responsesCount,
  responseRate,
  hasNpsQuestion,
  surveyType,
}: {
  responsesCount: number;
  responseRate: number;
  hasNpsQuestion: boolean;
  surveyType: SurveyType;
}) {
  // Sem o backend retornar respostas individuais, usamos placeholders explícitos
  const npsScores: number[] = [];
  const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };
  const sentimentTotal =
    sentimentBreakdown.positive +
    sentimentBreakdown.neutral +
    sentimentBreakdown.negative;

  return (
    <div className="space-y-4">
      {/* Big number: response rate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-slate-800/60 border border-border p-6">
          <p className="text-sm font-semibold text-muted-foreground">
            Taxa de Resposta
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-bold text-violet-600 dark:text-violet-300">
              {responseRate}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {responsesCount}{' '}
            {responsesCount === 1 ? 'resposta recebida' : 'respostas recebidas'}
          </p>
        </Card>

        <Card className="bg-white dark:bg-slate-800/60 border border-border p-6">
          <p className="text-sm font-semibold text-muted-foreground">
            Sentimento Geral
          </p>
          {sentimentTotal === 0 ? (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground">
                A análise de sentimento estará disponível assim que houver
                respostas em campos de texto.
              </p>
            </div>
          ) : (
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted mt-4">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${(sentimentBreakdown.positive / sentimentTotal) * 100}%`,
                }}
              />
              <div
                className="h-full bg-amber-500"
                style={{
                  width: `${(sentimentBreakdown.neutral / sentimentTotal) * 100}%`,
                }}
              />
              <div
                className="h-full bg-rose-500"
                style={{
                  width: `${(sentimentBreakdown.negative / sentimentTotal) * 100}%`,
                }}
              />
            </div>
          )}
        </Card>

        <Card className="bg-white dark:bg-slate-800/60 border border-border p-6">
          <p className="text-sm font-semibold text-muted-foreground">
            Status da Coleta
          </p>
          <div className="flex items-center gap-2 mt-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-medium">
              {responsesCount > 0
                ? 'Coletando respostas'
                : 'Aguardando primeiras respostas'}
            </span>
          </div>
        </Card>
      </div>

      {/* eNPS card if applicable */}
      {hasNpsQuestion && (
        <NPSScoreCard
          scores={npsScores}
          subtitle={
            surveyType === 'EXIT'
              ? 'Score de recomendação de quem deixou a empresa'
              : 'Score de recomendação eNPS'
          }
          testId="surveys-nps-score"
        />
      )}

      {/* Notice about backend support */}
      {responsesCount === 0 && (
        <Card className="bg-violet-50/50 dark:bg-violet-500/8 border border-violet-200 dark:border-violet-500/20 p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">
                Aguardando primeiras respostas
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                As métricas detalhadas (por pergunta, por departamento e
                tendência) aparecerão automaticamente conforme o time responder.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// QUESTIONS TAB
// ============================================================================

function QuestionsTab({
  questions,
  isDraft,
  canModify,
  onAddQuestion,
}: {
  questions: SurveyQuestion[];
  isDraft: boolean;
  canModify: boolean;
  onAddQuestion: () => void;
}) {
  if (questions.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-800/60 border border-border p-8 text-center">
        <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium">Nenhuma pergunta nesta pesquisa</p>
        {isDraft && canModify && (
          <>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Adicione pelo menos uma pergunta antes de ativar a pesquisa.
            </p>
            <Button size="sm" className="h-9 px-2.5" onClick={onAddQuestion}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar pergunta
            </Button>
          </>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {questions.length} {questions.length === 1 ? 'pergunta' : 'perguntas'}
        </p>
        {isDraft && canModify && (
          <Button size="sm" className="h-9 px-2.5" onClick={onAddQuestion}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        )}
      </div>

      {questions.map((question, index) => (
        <QuestionAnalyticsCard
          key={question.id}
          question={question}
          index={index}
        />
      ))}
    </div>
  );
}

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
      return <PieChartIcon className="h-4 w-4" />;
    case 'NPS':
      return <Hash className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
}

function QuestionAnalyticsCard({
  question,
  index,
}: {
  question: SurveyQuestion;
  index: number;
}) {
  // Backend ainda não retorna respostas no GET — placeholder vazio.
  const distribution: { label: string; count: number }[] = [];

  return (
    <Card
      className="bg-white dark:bg-slate-800/60 border border-border p-5"
      data-testid={`survey-question-${index}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-500/8 text-violet-700 dark:text-violet-300">
          {getQuestionIcon(question.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-muted-foreground">
              #{index + 1}
            </span>
            <Badge variant="outline" className="text-xs">
              {QUESTION_TYPE_LABELS[question.type]}
            </Badge>
            {question.category && (
              <Badge
                variant="secondary"
                className="text-xs bg-slate-100 dark:bg-slate-500/8 text-slate-700 dark:text-slate-300"
              >
                {QUESTION_CATEGORY_LABELS[
                  question.category as SurveyQuestionCategory
                ] ?? question.category}
              </Badge>
            )}
            {question.isRequired && (
              <Badge
                variant="outline"
                className="text-xs bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300 border-0"
              >
                Obrigatória
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium">{question.text}</p>
        </div>
      </div>

      <QuestionChartByType question={question} distribution={distribution} />
    </Card>
  );
}

function QuestionChartByType({
  question,
  distribution,
}: {
  question: SurveyQuestion;
  distribution: { label: string; count: number }[];
}) {
  if (distribution.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center bg-muted/20 rounded-lg">
        <p className="text-xs text-muted-foreground">
          Sem respostas analisadas para esta pergunta ainda.
        </p>
      </div>
    );
  }

  if (question.type === 'YES_NO') {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={distribution}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
          >
            <Cell fill="oklch(0.7 0.18 162)" />
            <Cell fill="oklch(0.65 0.21 16)" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={distribution}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(148, 163, 184, 0.25)"
        />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar
          dataKey="count"
          fill="oklch(0.61 0.22 293)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================================================
// DEPARTMENTS TAB
// ============================================================================

function DepartmentsTab({ questions }: { questions: SurveyQuestion[] }) {
  return (
    <Card className="bg-white dark:bg-slate-800/60 border border-border p-8 text-center">
      <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm font-semibold">Análise por Departamento</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
        O cruzamento das respostas por departamento estará disponível assim que
        o backend expor os dados agregados de respondentes. Por enquanto,
        analise as métricas individualmente em &ldquo;Por Pergunta&rdquo;.
      </p>
      {questions.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {questions.length}{' '}
          {questions.length === 1
            ? 'pergunta será analisada'
            : 'perguntas serão analisadas'}{' '}
          por departamento.
        </p>
      )}
    </Card>
  );
}

// ============================================================================
// TREND TAB
// ============================================================================

function TrendTab({ questions }: { questions: SurveyQuestion[] }) {
  // Empty: o gráfico já tem empty state quando data.length < 2.
  const trendData: SurveyTrendPoint[] = [];

  const series: SurveyTrendSeries[] = useMemo(() => {
    return questions
      .filter(question =>
        ['RATING_1_5', 'RATING_1_10', 'NPS'].includes(question.type)
      )
      .slice(0, 5)
      .map((question, index) => ({
        key: question.id,
        label:
          question.text.length > 30
            ? question.text.substring(0, 30) + '...'
            : question.text,
        color:
          SURVEY_TREND_SERIES_PALETTE[
            index % SURVEY_TREND_SERIES_PALETTE.length
          ],
      }));
  }, [questions]);

  const yDomain: [number, number] = useMemo(() => {
    if (questions.some(question => question.type === 'NPS')) return [-100, 100];
    if (questions.some(question => question.type === 'RATING_1_10'))
      return [0, 10];
    return [0, 5];
  }, [questions]);

  return (
    <SurveyTrendChart
      data={trendData}
      series={series}
      yDomain={yDomain}
      height={360}
      title="Evolução ao longo das execuções"
      subtitle="Disponível para pesquisas recorrentes (Pulse semanais, eNPS mensais etc.)"
      testId="surveys-trend-chart"
    />
  );
}
