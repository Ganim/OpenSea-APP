/**
 * OpenSea OS - Painel PCMSO
 * Dashboard de Saúde Ocupacional com visão geral de compliance,
 * exames vencidos/vencendo e gerenciamento de requisitos de exames.
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { useEmployeeMap } from '@/hooks/use-employee-map';
import { usePermissions } from '@/hooks/use-permissions';
import { medicalExamsService } from '@/services/hr/medical-exams.service';
import { positionsService } from '@/services/hr/positions.service';
import type {
  MedicalExam,
  OccupationalExamRequirement,
  CreateExamRequirementData,
  MedicalExamType,
} from '@/types/hr';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ClipboardList,
  Loader2,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { translateError } from '@/lib/errors';
import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import {
  medicalExamKeys,
  formatDate,
  getExamTypeLabel,
  getExamResultLabel,
  getExamResultVariant,
  getExpirationStatus,
  getExpirationStatusLabel,
  getExpirationBadgeClasses,
} from '../src';

// =============================================================================
// EXAM TYPE OPTIONS
// =============================================================================

const EXAM_CATEGORY_OPTIONS: { value: MedicalExamType; label: string }[] = [
  { value: 'ADMISSIONAL', label: 'Admissional' },
  { value: 'PERIODICO', label: 'Periódico' },
  { value: 'MUDANCA_FUNCAO', label: 'Mudança de Função' },
  { value: 'RETORNO', label: 'Retorno ao Trabalho' },
  { value: 'DEMISSIONAL', label: 'Demissional' },
];

// =============================================================================
// STAT CARD
// =============================================================================

function StatCard({
  icon: Icon,
  title,
  value,
  color,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  value: number;
  color: 'emerald' | 'amber' | 'rose' | 'teal' | 'violet';
  onClick?: () => void;
}) {
  const colorMap = {
    emerald:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20',
    amber:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/8 dark:text-amber-300 border-amber-200 dark:border-amber-500/20',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300 border-rose-200 dark:border-rose-500/20',
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-500/8 dark:text-teal-300 border-teal-200 dark:border-teal-500/20',
    violet:
      'bg-violet-50 text-violet-700 dark:bg-violet-500/8 dark:text-violet-300 border-violet-200 dark:border-violet-500/20',
  };

  const iconColorMap = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
    teal: 'text-teal-600 dark:text-teal-400',
    violet: 'text-violet-600 dark:text-violet-400',
  };

  return (
    <Card
      className={`p-4 border ${colorMap[color]} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-8 w-8 ${iconColorMap[color]}`} />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm opacity-80">{title}</p>
        </div>
      </div>
    </Card>
  );
}

// =============================================================================
// PCMSO DASHBOARD PAGE
// =============================================================================

export default function PCMSODashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission(HR_PERMISSIONS.MEDICAL_EXAMS.CREATE);
  const canDelete = hasPermission(HR_PERMISSIONS.MEDICAL_EXAMS.DELETE);

  // ============================================================================
  // STATE
  // ============================================================================

  const [isCreateReqOpen, setIsCreateReqOpen] = useState(false);
  const [deleteReqTarget, setDeleteReqTarget] = useState<string | null>(null);
  const [isDeleteReqOpen, setIsDeleteReqOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'overdue' | 'expiring' | 'requirements'
  >('overview');

  // Create requirement form state
  const [reqExamType, setReqExamType] = useState('');
  const [reqExamCategory, setReqExamCategory] = useState<MedicalExamType | ''>(
    ''
  );
  const [reqFrequencyMonths, setReqFrequencyMonths] = useState('12');
  const [reqIsMandatory, setReqIsMandatory] = useState(true);
  const [reqDescription, setReqDescription] = useState('');
  const [reqPositionId, setReqPositionId] = useState('');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: expiringData, isLoading: isLoadingExpiring } = useQuery({
    queryKey: medicalExamKeys.expiring(30),
    queryFn: () => medicalExamsService.listExpiring(30),
    staleTime: 5 * 60 * 1000,
  });

  const { data: overdueData, isLoading: isLoadingOverdue } = useQuery({
    queryKey: medicalExamKeys.overdue(),
    queryFn: () => medicalExamsService.listOverdue(),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: requirementsData,
    isLoading: isLoadingRequirements,
    error: requirementsError,
    refetch: refetchRequirements,
  } = useQuery({
    queryKey: medicalExamKeys.requirements(),
    queryFn: () => medicalExamsService.listRequirements(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: allExamsData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['medical-exams', 'all-summary'],
    queryFn: () => medicalExamsService.list({ perPage: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: positionsData } = useQuery({
    queryKey: ['positions', 'filter-list'],
    queryFn: () => positionsService.listPositions({ perPage: 100 }),
    staleTime: 10 * 60 * 1000,
  });

  const expiringExams = expiringData?.expiringExams ?? [];
  const overdueExams = overdueData?.overdueExams ?? [];
  const requirements = requirementsData?.examRequirements ?? [];
  const allExams = allExamsData?.medicalExams ?? [];

  const positionOptions = useMemo(
    () =>
      (positionsData?.positions ?? []).map(
        (p: { id: string; name: string }) => ({
          value: p.id,
          label: p.name,
        })
      ),
    [positionsData]
  );

  // Employee maps for exam lists
  const expiringEmployeeIds = useMemo(
    () => expiringExams.map(e => e.employeeId),
    [expiringExams]
  );
  const overdueEmployeeIds = useMemo(
    () => overdueExams.map(e => e.employeeId),
    [overdueExams]
  );
  const { getName: getExpiringName } = useEmployeeMap(expiringEmployeeIds);
  const { getName: getOverdueName } = useEmployeeMap(overdueEmployeeIds);

  // Statistics
  const totalExams = allExams.length;
  const validExams = allExams.filter(
    e => getExpirationStatus(e.expirationDate) === 'VALID'
  ).length;
  const expiringCount = expiringExams.length;
  const overdueCount = overdueExams.length;
  const totalRequirements = requirements.length;

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createRequirementMutation = useMutation({
    mutationFn: async (data: CreateExamRequirementData) => {
      return medicalExamsService.createRequirement(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: medicalExamKeys.requirements(),
      });
      toast.success('Requisito de exame criado com sucesso!');
      setIsCreateReqOpen(false);
      resetReqForm();
    },
    onError: (error: Error) => {
      toast.error(translateError(error));
    },
  });

  const deleteRequirementMutation = useMutation({
    mutationFn: async (id: string) => {
      return medicalExamsService.deleteRequirement(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: medicalExamKeys.requirements(),
      });
      toast.success('Requisito de exame excluído com sucesso!');
      setIsDeleteReqOpen(false);
      setDeleteReqTarget(null);
    },
    onError: (error: Error) => {
      toast.error(translateError(error));
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const resetReqForm = useCallback(() => {
    setReqExamType('');
    setReqExamCategory('');
    setReqFrequencyMonths('12');
    setReqIsMandatory(true);
    setReqDescription('');
    setReqPositionId('');
  }, []);

  const handleCreateRequirement = useCallback(async () => {
    if (!reqExamType.trim() || !reqExamCategory) return;

    createRequirementMutation.mutate({
      examType: reqExamType.trim(),
      examCategory: reqExamCategory as MedicalExamType,
      frequencyMonths: parseInt(reqFrequencyMonths, 10) || 12,
      isMandatory: reqIsMandatory,
      description: reqDescription.trim() || undefined,
      positionId: reqPositionId || undefined,
    });
  }, [
    reqExamType,
    reqExamCategory,
    reqFrequencyMonths,
    reqIsMandatory,
    reqDescription,
    reqPositionId,
    createRequirementMutation,
  ]);

  const handleDeleteRequirement = useCallback(async () => {
    if (!deleteReqTarget) return;
    deleteRequirementMutation.mutate(deleteReqTarget);
  }, [deleteReqTarget, deleteRequirementMutation]);

  const isLoading =
    isLoadingExpiring ||
    isLoadingOverdue ||
    isLoadingRequirements ||
    isLoadingAll;

  // ============================================================================
  // TABS
  // ============================================================================

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Visão Geral',
      icon: Stethoscope,
    },
    {
      id: 'overdue' as const,
      label: `Vencidos (${overdueCount})`,
      icon: ShieldAlert,
    },
    {
      id: 'expiring' as const,
      label: `Vencendo (${expiringCount})`,
      icon: Clock,
    },
    {
      id: 'requirements' as const,
      label: `Requisitos (${totalRequirements})`,
      icon: ClipboardList,
    },
  ];

  // ============================================================================
  // CREATE REQUIREMENT WIZARD
  // ============================================================================

  const canSubmitReq = reqExamType.trim() && reqExamCategory;

  const wizardSteps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Novo Requisito de Exame',
        description:
          'Defina um requisito de exame ocupacional para o PCMSO. Os requisitos determinam quais exames são obrigatórios por cargo.',
        icon: <ClipboardList className="h-16 w-16 text-teal-400 opacity-50" />,
        isValid: !!canSubmitReq,
        content: (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">
                Tipo de Exame <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={reqExamType}
                onChange={e => setReqExamType(e.target.value)}
                placeholder="Ex: Audiometria, Espirometria, Hemograma..."
                className="h-9"
              />
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">
                  Categoria <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={reqExamCategory}
                  onValueChange={v => setReqExamCategory(v as MedicalExamType)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecionar categoria..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40 space-y-1.5">
                <Label className="text-xs">Frequência (meses)</Label>
                <Input
                  type="number"
                  min="1"
                  value={reqFrequencyMonths}
                  onChange={e => setReqFrequencyMonths(e.target.value)}
                  placeholder="12"
                  className="h-9"
                />
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Cargo (opcional)</Label>
                <Select
                  value={reqPositionId || '__none__'}
                  onValueChange={v =>
                    setReqPositionId(v === '__none__' ? '' : v)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos os cargos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">Todos os cargos</SelectItem>
                    {positionOptions.map(
                      (opt: { value: string; label: string }) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40 space-y-1.5">
                <Label className="text-xs">Obrigatório</Label>
                <Select
                  value={reqIsMandatory ? 'true' : 'false'}
                  onValueChange={v => setReqIsMandatory(v === 'true')}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Descrição</Label>
              <Textarea
                value={reqDescription}
                onChange={e => setReqDescription(e.target.value)}
                placeholder="Descreva o requisito e quando deve ser aplicado..."
                rows={2}
              />
            </div>
          </div>
        ),
        footer: (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateReqOpen(false);
                resetReqForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateRequirement}
              disabled={createRequirementMutation.isPending || !canSubmitReq}
            >
              {createRequirementMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                'Criar Requisito'
              )}
            </Button>
          </div>
        ),
      },
    ],
    [
      reqExamType,
      reqExamCategory,
      reqFrequencyMonths,
      reqIsMandatory,
      reqDescription,
      reqPositionId,
      positionOptions,
      canSubmitReq,
      createRequirementMutation.isPending,
      handleCreateRequirement,
      resetReqForm,
    ]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  function renderExamRow(exam: MedicalExam, getNameFn: (id: string) => string) {
    const expirationStatus = getExpirationStatus(exam.expirationDate);

    return (
      <div
        key={exam.id}
        className="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-slate-800/60 border border-border cursor-pointer hover:shadow-sm transition-shadow"
        onClick={() => router.push(`/hr/medical-exams/${exam.id}`)}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0 bg-linear-to-br from-teal-500 to-teal-600">
          <Stethoscope className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">
              {getExamTypeLabel(exam.type)}
            </span>
            <Badge
              variant={getExamResultVariant(exam.result)}
              className="text-[10px]"
            >
              {getExamResultLabel(exam.result)}
            </Badge>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getExpirationBadgeClasses(expirationStatus)}`}
            >
              {getExpirationStatusLabel(expirationStatus)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {getNameFn(exam.employeeId)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(exam.examDate)}
            </span>
            {exam.expirationDate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Vence: {formatDate(exam.expirationDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderRequirementRow(req: OccupationalExamRequirement) {
    const positionName = positionOptions.find(
      (p: { value: string; label: string }) => p.value === req.positionId
    )?.label;

    return (
      <div
        key={req.id}
        className="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-slate-800/60 border border-border"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0 bg-linear-to-br from-violet-500 to-violet-600">
          <ClipboardList className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{req.examType}</span>
            <Badge variant="outline" className="text-[10px]">
              {getExamTypeLabel(req.examCategory)}
            </Badge>
            {req.isMandatory && (
              <Badge
                variant="default"
                className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
              >
                Obrigatório
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span>A cada {req.frequencyMonths} meses</span>
            {positionName && <span>Cargo: {positionName}</span>}
            {req.description && (
              <span className="truncate max-w-[200px]">{req.description}</span>
            )}
          </div>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0"
            onClick={e => {
              e.stopPropagation();
              setDeleteReqTarget(req.id);
              setIsDeleteReqOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Exames Médicos', href: '/hr/medical-exams' },
            { label: 'Painel PCMSO' },
          ]}
          buttons={
            canCreate
              ? [
                  {
                    id: 'new-exam',
                    title: 'Novo Exame',
                    icon: Plus,
                    onClick: () => router.push('/hr/medical-exams'),
                    variant: 'outline',
                  },
                  {
                    id: 'new-requirement',
                    title: 'Novo Requisito',
                    icon: Plus,
                    onClick: () => setIsCreateReqOpen(true),
                    variant: 'default',
                  },
                ]
              : []
          }
        />

        <Header
          title="Painel PCMSO"
          description="Programa de Controle Médico de Saúde Ocupacional - Visão geral de compliance, exames e requisitos"
        />
      </PageHeader>

      <PageBody>
        {isLoading ? (
          <GridLoading count={4} layout="grid" size="md" gap="gap-4" />
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                icon={Stethoscope}
                title="Total de Exames"
                value={totalExams}
                color="teal"
                onClick={() => router.push('/hr/medical-exams')}
              />
              <StatCard
                icon={CheckCircle2}
                title="Exames Válidos"
                value={validExams}
                color="emerald"
              />
              <StatCard
                icon={Clock}
                title="Vencendo (30d)"
                value={expiringCount}
                color="amber"
                onClick={() => setActiveTab('expiring')}
              />
              <StatCard
                icon={XCircle}
                title="Vencidos"
                value={overdueCount}
                color="rose"
                onClick={() => setActiveTab('overdue')}
              />
              <StatCard
                icon={ClipboardList}
                title="Requisitos"
                value={totalRequirements}
                color="violet"
                onClick={() => setActiveTab('requirements')}
              />
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 border-b border-border">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-teal-500 text-teal-700 dark:text-teal-300'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Alertas */}
                {(overdueCount > 0 || expiringCount > 0) && (
                  <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Alertas de Saúde Ocupacional
                    </h3>
                    <div className="space-y-2">
                      {overdueCount > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/8 border border-rose-200 dark:border-rose-500/20">
                          <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                              {overdueCount} exame
                              {overdueCount !== 1 ? 's' : ''} vencido
                              {overdueCount !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-rose-600/70 dark:text-rose-400/70">
                              Exames com prazo de validade expirado requerem
                              atenção imediata
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 h-9 px-2.5"
                            onClick={() => setActiveTab('overdue')}
                          >
                            Ver detalhes
                          </Button>
                        </div>
                      )}
                      {expiringCount > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/20">
                          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                              {expiringCount} exame
                              {expiringCount !== 1 ? 's' : ''} vencendo em 30
                              dias
                            </p>
                            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                              Agende a renovação destes exames antes do
                              vencimento
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 h-9 px-2.5"
                            onClick={() => setActiveTab('expiring')}
                          >
                            Ver detalhes
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Compliance Summary */}
                {overdueCount === 0 && expiringCount === 0 && (
                  <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/15">
                        <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                          Tudo em dia!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Nenhum exame médico ocupacional vencido ou prestes a
                          vencer. O programa PCMSO está em conformidade.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Requirements Summary */}
                {totalRequirements > 0 && (
                  <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <ClipboardList className="h-5 w-5" />
                      Requisitos de Exames Cadastrados
                    </h3>
                    <div className="space-y-2">
                      {requirements.slice(0, 5).map(renderRequirementRow)}
                      {requirements.length > 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-muted-foreground"
                          onClick={() => setActiveTab('requirements')}
                        >
                          Ver todos os {requirements.length} requisitos
                        </Button>
                      )}
                    </div>
                  </Card>
                )}

                {totalRequirements === 0 && (
                  <Card className="p-8 text-center bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
                    <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-1">
                      Nenhum requisito cadastrado
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Cadastre requisitos de exames por cargo para acompanhar a
                      conformidade do PCMSO.
                    </p>
                    {canCreate && (
                      <Button onClick={() => setIsCreateReqOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Requisito
                      </Button>
                    )}
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'overdue' && (
              <div className="space-y-3">
                {overdueExams.length === 0 ? (
                  <Card className="p-8 text-center bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
                    <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                    <h3 className="text-lg font-semibold mb-1">
                      Nenhum exame vencido
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Todos os exames médicos estão dentro do prazo de validade.
                    </p>
                  </Card>
                ) : (
                  overdueExams.map(exam => renderExamRow(exam, getOverdueName))
                )}
              </div>
            )}

            {activeTab === 'expiring' && (
              <div className="space-y-3">
                {expiringExams.length === 0 ? (
                  <Card className="p-8 text-center bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
                    <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                    <h3 className="text-lg font-semibold mb-1">
                      Nenhum exame vencendo
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Não há exames com vencimento nos próximos 30 dias.
                    </p>
                  </Card>
                ) : (
                  expiringExams.map(exam =>
                    renderExamRow(exam, getExpiringName)
                  )
                )}
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-3">
                {requirementsError ? (
                  <GridError
                    type="server"
                    title="Erro ao carregar requisitos"
                    message="Não foi possível carregar os requisitos de exame."
                    action={{
                      label: 'Tentar Novamente',
                      onClick: () => void refetchRequirements(),
                    }}
                  />
                ) : requirements.length === 0 ? (
                  <Card className="p-8 text-center bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
                    <ClipboardList className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-1">
                      Nenhum requisito cadastrado
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Cadastre requisitos de exames ocupacionais para acompanhar
                      a conformidade PCMSO por cargo.
                    </p>
                    {canCreate && (
                      <Button onClick={() => setIsCreateReqOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Requisito
                      </Button>
                    )}
                  </Card>
                ) : (
                  <>
                    {canCreate && (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          className="h-9 px-2.5"
                          onClick={() => setIsCreateReqOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Novo Requisito
                        </Button>
                      </div>
                    )}
                    {requirements.map(renderRequirementRow)}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Create Requirement Wizard */}
        <StepWizardDialog
          open={isCreateReqOpen}
          onOpenChange={open => {
            if (!open) {
              setIsCreateReqOpen(false);
              resetReqForm();
            }
          }}
          steps={wizardSteps}
          currentStep={1}
          onStepChange={() => {}}
          onClose={() => {
            setIsCreateReqOpen(false);
            resetReqForm();
          }}
        />

        {/* Delete Requirement Confirmation */}
        <VerifyActionPinModal
          isOpen={isDeleteReqOpen}
          onClose={() => {
            setIsDeleteReqOpen(false);
            setDeleteReqTarget(null);
          }}
          onSuccess={handleDeleteRequirement}
          title="Excluir Requisito de Exame"
          description="Digite seu PIN de ação para excluir este requisito de exame. Esta ação não pode ser desfeita."
        />
      </PageBody>
    </PageLayout>
  );
}
