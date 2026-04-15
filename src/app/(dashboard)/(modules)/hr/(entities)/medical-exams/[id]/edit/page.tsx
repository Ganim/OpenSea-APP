/**
 * OpenSea OS - Medical Exam Edit Page
 * Edição completa de exame médico com campos PCMSO
 */

'use client';

import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import type { HeaderButton } from '@/components/layout/types/header.types';
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
import { Textarea } from '@/components/ui/textarea';
import { useEmployeeMap } from '@/hooks/use-employee-map';
import { usePermissions } from '@/hooks/use-permissions';
import { HR_PERMISSIONS } from '../../../../_shared/constants/hr-permissions';
import type {
  MedicalExam,
  MedicalExamType,
  MedicalExamResult,
  MedicalExamAptitude,
} from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  FileText,
  NotebookText,
  Save,
  ShieldAlert,
  Stethoscope,
  Trash,
  User,
  X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  medicalExamsApi,
  medicalExamKeys,
  getExamTypeLabel,
  getExamResultLabel,
  getExamResultVariant,
  formatDate,
  useUpdateMedicalExam,
  useDeleteMedicalExam,
  EXAM_TYPE_LABELS,
  EXAM_RESULT_LABELS,
  APTITUDE_LABELS,
} from '../../src';

// =============================================================================
// SECTION HEADER
// =============================================================================

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-foreground" />
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="border-b border-border" />
    </div>
  );
}

// =============================================================================
// PAGE
// =============================================================================

export default function MedicalExamEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const examId = params.id as string;
  const { hasPermission } = usePermissions();
  const canDelete = hasPermission(HR_PERMISSIONS.MEDICAL_EXAMS.DELETE);

  // ============================================================================
  // STATE
  // ============================================================================

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Basic fields
  const [type, setType] = useState<MedicalExamType>('ADMISSIONAL');
  const [examDate, setExamDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [result, setResult] = useState<MedicalExamResult>('APTO');
  const [observations, setObservations] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  // Doctor fields
  const [doctorName, setDoctorName] = useState('');
  const [doctorCrm, setDoctorCrm] = useState('');

  // PCMSO fields
  const [aptitude, setAptitude] = useState<MedicalExamAptitude | ''>('');
  const [validityMonths, setValidityMonths] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [physicianName, setPhysicianName] = useState('');
  const [physicianCRM, setPhysicianCRM] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [nextExamDate, setNextExamDate] = useState('');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: exam, isLoading } = useQuery<MedicalExam>({
    queryKey: medicalExamKeys.detail(examId),
    queryFn: () => medicalExamsApi.get(examId),
  });

  const { getName } = useEmployeeMap(exam ? [exam.employeeId] : []);

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const updateMutation = useUpdateMedicalExam({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalExamKeys.lists() });
      router.push(`/hr/medical-exams/${examId}`);
    },
  });

  const deleteMutation = useDeleteMedicalExam({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalExamKeys.lists() });
      router.push('/hr/medical-exams');
    },
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (exam) {
      setType(exam.type);
      setExamDate(exam.examDate ? exam.examDate.split('T')[0] : '');
      setExpirationDate(
        exam.expirationDate ? exam.expirationDate.split('T')[0] : ''
      );
      setResult(exam.result);
      setObservations(exam.observations || '');
      setDocumentUrl(exam.documentUrl || '');
      setDoctorName(exam.doctorName || '');
      setDoctorCrm(exam.doctorCrm || '');
      // PCMSO fields
      setAptitude(exam.aptitude || '');
      setValidityMonths(exam.validityMonths ? String(exam.validityMonths) : '');
      setClinicName(exam.clinicName || '');
      setClinicAddress(exam.clinicAddress || '');
      setPhysicianName(exam.physicianName || '');
      setPhysicianCRM(exam.physicianCRM || '');
      setRestrictions(exam.restrictions || '');
      setNextExamDate(exam.nextExamDate ? exam.nextExamDate.split('T')[0] : '');
    }
  }, [exam]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSave = async () => {
    if (!exam) return;

    updateMutation.mutate({
      id: examId,
      data: {
        type,
        examDate: examDate || undefined,
        expirationDate: expirationDate || undefined,
        result,
        observations: observations.trim() || undefined,
        documentUrl: documentUrl.trim() || undefined,
        doctorName: doctorName.trim() || undefined,
        doctorCrm: doctorCrm.trim() || undefined,
        // PCMSO fields
        examCategory: type,
        aptitude: aptitude || undefined,
        validityMonths: validityMonths
          ? parseInt(validityMonths, 10)
          : undefined,
        clinicName: clinicName.trim() || undefined,
        clinicAddress: clinicAddress.trim() || undefined,
        physicianName: physicianName.trim() || undefined,
        physicianCRM: physicianCRM.trim() || undefined,
        restrictions: restrictions.trim() || undefined,
        nextExamDate: nextExamDate || undefined,
      },
    });
  };

  const handleDelete = async () => {
    if (!exam) return;
    await deleteMutation.mutateAsync(exam.id);
    setIsDeleteModalOpen(false);
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout data-testid="medical-exams-edit-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Exames Médicos', href: '/hr/medical-exams' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!exam) {
    return (
      <PageLayout data-testid="medical-exams-edit-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Exames Médicos', href: '/hr/medical-exams' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <Stethoscope className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Exame médico não encontrado
            </h2>
            <Button onClick={() => router.push('/hr/medical-exams')}>
              Voltar para Exames Médicos
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  const isSaving = updateMutation.isPending;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout data-testid="medical-exams-edit-page">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Exames Médicos', href: '/hr/medical-exams' },
            {
              label: getExamTypeLabel(exam.type),
              href: `/hr/medical-exams/${examId}`,
            },
            { label: 'Editar' },
          ]}
          buttons={
            [
              canDelete && {
                id: 'delete',
                title: 'Excluir',
                icon: Trash,
                onClick: () => setIsDeleteModalOpen(true),
                variant: 'outline',
                disabled: isSaving || deleteMutation.isPending,
              },
              {
                id: 'cancel',
                title: 'Cancelar',
                icon: X,
                onClick: () => router.push(`/hr/medical-exams/${examId}`),
                variant: 'outline',
                disabled: isSaving,
              },
              {
                id: 'save',
                title: 'Salvar',
                icon: Save,
                onClick: handleSave,
                disabled: isSaving,
              },
            ].filter(Boolean) as HeaderButton[]
          }
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br from-teal-500 to-teal-600">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  Editar Exame Médico
                </h1>
                <Badge variant={getExamResultVariant(exam.result)}>
                  {getExamResultLabel(exam.result)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {getName(exam.employeeId)} · {formatDate(exam.examDate)}
              </p>
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* Dados do Exame */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <SectionHeader
            icon={NotebookText}
            title="Dados do Exame"
            subtitle="Tipo, datas e resultado do exame médico ocupacional"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="type">
                Tipo de Exame <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={type}
                onValueChange={v => setType(v as MedicalExamType)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result">
                Resultado <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={result}
                onValueChange={v => setResult(v as MedicalExamResult)}
              >
                <SelectTrigger id="result">
                  <SelectValue placeholder="Selecione o resultado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXAM_RESULT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aptitude">Aptidão (ASO)</Label>
              <Select
                value={aptitude || '__none__'}
                onValueChange={v =>
                  setAptitude(
                    v === '__none__' ? '' : (v as MedicalExamAptitude)
                  )
                }
              >
                <SelectTrigger id="aptitude">
                  <SelectValue placeholder="Selecionar aptidão..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Não informada</SelectItem>
                  {Object.entries(APTITUDE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validityMonths">Validade (meses)</Label>
              <Input
                id="validityMonths"
                type="number"
                min="1"
                value={validityMonths}
                onChange={e => setValidityMonths(e.target.value)}
                placeholder="Ex: 12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="examDate">
                Data do Exame <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">Data de Validade</Label>
              <Input
                id="expirationDate"
                type="date"
                value={expirationDate}
                onChange={e => setExpirationDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextExamDate">Próximo Exame Previsto</Label>
              <Input
                id="nextExamDate"
                type="date"
                value={nextExamDate}
                onChange={e => setNextExamDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentUrl">URL do Documento (ASO)</Label>
              <Input
                id="documentUrl"
                value={documentUrl}
                onChange={e => setDocumentUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </Card>

        {/* Médico Examinador */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <SectionHeader
            icon={User}
            title="Médico Examinador"
            subtitle="Profissional responsável pela realização do exame"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="doctorName">
                Nome do Médico <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="doctorName"
                placeholder="Dr. Nome Completo"
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorCrm">
                CRM <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="doctorCrm"
                placeholder="CRM/UF 123456"
                value={doctorCrm}
                onChange={e => setDoctorCrm(e.target.value)}
                required
              />
            </div>
          </div>
        </Card>

        {/* PCMSO - Coordenador e Clínica */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <SectionHeader
            icon={Building2}
            title="Dados PCMSO"
            subtitle="Médico coordenador e clínica responsável pelo programa"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="physicianName">Médico Coordenador (PCMSO)</Label>
              <Input
                id="physicianName"
                placeholder="Dr. Nome Completo"
                value={physicianName}
                onChange={e => setPhysicianName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="physicianCRM">CRM Coordenador</Label>
              <Input
                id="physicianCRM"
                placeholder="CRM/UF 123456"
                value={physicianCRM}
                onChange={e => setPhysicianCRM(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicName">Clínica / Laboratório</Label>
              <Input
                id="clinicName"
                placeholder="Nome da clínica"
                value={clinicName}
                onChange={e => setClinicName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicAddress">Endereço da Clínica</Label>
              <Input
                id="clinicAddress"
                placeholder="Endereço completo"
                value={clinicAddress}
                onChange={e => setClinicAddress(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Restrições e Observações */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <SectionHeader
            icon={FileText}
            title="Restrições e Observações"
            subtitle="Restrições identificadas e observações adicionais"
          />
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="restrictions">Restrições</Label>
              <Textarea
                id="restrictions"
                placeholder="Descreva restrições identificadas no ASO..."
                value={restrictions}
                onChange={e => setRestrictions(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                placeholder="Observações adicionais sobre o exame médico..."
                value={observations}
                onChange={e => setObservations(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </Card>
      </PageBody>

      {/* Delete Confirm Modal */}
      <VerifyActionPinModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDelete}
        title="Excluir Exame Médico"
        description="Digite seu PIN de ação para excluir este exame médico. Esta ação não pode ser desfeita."
      />
    </PageLayout>
  );
}
