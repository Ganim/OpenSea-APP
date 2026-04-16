/**
 * OpenSea OS - Per-employee Medical Exam Timeline Page
 *
 * Mostra o histórico completo de exames médicos ocupacionais (PCMSO)
 * de um único funcionário em uma timeline vertical, com destaque
 * para o próximo exame previsto.
 *
 * Permission gating:
 *   - O usuário sempre vê os próprios exames (vínculo via Employee.userId).
 *   - Para ver exames de outros funcionários é necessário
 *     `hr.medical-exams.access` (HR_PERMISSIONS.MEDICAL_EXAMS.VIEW).
 */

'use client';

import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Briefcase, Calendar, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { MedicalExamTimeline } from '@/components/hr/medical-exam-timeline';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { calculateNextExam } from '@/lib/hr/calculate-next-exam';
import { employeesService } from '@/services/hr/employees.service';
import { medicalExamsService } from '@/services/hr/medical-exams.service';
import type { Employee, MedicalExam } from '@/types/hr';

import { HR_PERMISSIONS } from '../../../../_shared/constants/hr-permissions';
import {
  useCreateMedicalExam,
  useDeleteMedicalExam,
} from '../../src/api/mutations';

const CreateMedicalExamModal = dynamic(
  () =>
    import('../../src/modals/create-modal').then(module => ({
      default: module.CreateModal,
    })),
  { ssr: false }
);

/* ===========================================
   HELPERS
   =========================================== */

function formatDateLong(value: string | undefined | null): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getInitials(fullName: string | undefined | null): string {
  if (!fullName) return '??';
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ===========================================
   PAGE
   =========================================== */

export default function EmployeeMedicalExamsTimelinePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.employeeId as string;

  const { user } = useAuth();
  const { hasPermission, isLoading: isLoadingPermissions } = usePermissions();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingDeleteExam, setPendingDeleteExam] = useState<MedicalExam | null>(
    null
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // ============================================================================
  // EMPLOYEE
  // ============================================================================

  const {
    data: employee,
    isLoading: isLoadingEmployee,
    error: employeeError,
    refetch: refetchEmployee,
  } = useQuery<Employee>({
    queryKey: ['employees', employeeId],
    queryFn: async () => {
      const response = await employeesService.getEmployee(employeeId);
      return response.employee;
    },
  });

  // ============================================================================
  // PERMISSION GATING
  // ============================================================================

  const isOwnEmployee = useMemo(() => {
    if (!user?.id || !employee?.userId) return false;
    return user.id === employee.userId;
  }, [user?.id, employee?.userId]);

  const canViewOthers = hasPermission(HR_PERMISSIONS.MEDICAL_EXAMS.VIEW);
  const canCreateExam = hasPermission(HR_PERMISSIONS.MEDICAL_EXAMS.CREATE);
  const canDeleteExam = hasPermission(HR_PERMISSIONS.MEDICAL_EXAMS.DELETE);

  const isAccessAllowed = isOwnEmployee || canViewOthers;

  // ============================================================================
  // EXAMS
  // ============================================================================

  const {
    data: exams = [],
    isLoading: isLoadingExams,
    error: examsError,
    refetch: refetchExams,
  } = useQuery<MedicalExam[]>({
    queryKey: ['medical-exams', 'employee', employeeId, 'timeline'],
    queryFn: async () => {
      const response = await medicalExamsService.list({
        employeeId,
        perPage: 100,
      });
      return response.medicalExams;
    },
    enabled: isAccessAllowed && !!employeeId,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createMutation = useCreateMedicalExam({
    onSuccess: () => {
      refetchExams();
      setIsCreateOpen(false);
    },
  });

  const deleteMutation = useDeleteMedicalExam({
    onSuccess: () => {
      refetchExams();
      setPendingDeleteExam(null);
      setIsDeleteOpen(false);
    },
  });

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const nextExamPlan = useMemo(() => calculateNextExam({ exams }), [exams]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleScheduleExam = useCallback(() => {
    if (!canCreateExam) {
      toast.error('Você não tem permissão para registrar exames médicos.');
      return;
    }
    setIsCreateOpen(true);
  }, [canCreateExam]);

  const handleDeleteRequest = useCallback(
    (exam: MedicalExam) => {
      if (!canDeleteExam) return;
      setPendingDeleteExam(exam);
      setIsDeleteOpen(true);
    },
    [canDeleteExam]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDeleteExam) return;
    try {
      await deleteMutation.mutateAsync(pendingDeleteExam.id);
    } catch {
      // toast handled by mutation
    }
  }, [deleteMutation, pendingDeleteExam]);

  // ============================================================================
  // EARLY STATES
  // ============================================================================

  if (isLoadingPermissions || isLoadingEmployee) {
    return (
      <PageLayout>
        <GridLoading count={6} layout="list" size="md" />
      </PageLayout>
    );
  }

  if (employeeError || !employee) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Exames Médicos', href: '/hr/medical-exams' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="server"
            title="Funcionário não encontrado"
            message="Não foi possível carregar os dados deste funcionário."
            action={{
              label: 'Tentar Novamente',
              onClick: () => {
                refetchEmployee();
              },
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  if (!isAccessAllowed) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Exames Médicos', href: '/hr/medical-exams' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="flex flex-col items-center gap-3 border-dashed bg-white/40 dark:bg-white/5 p-10 text-center">
            <ShieldAlert className="h-10 w-10 text-rose-500" />
            <p className="text-base font-semibold">Acesso restrito</p>
            <p className="text-sm text-muted-foreground">
              Você só pode visualizar seus próprios exames médicos. Solicite
              ao RH a permissão{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                hr.medical-exams.access
              </code>{' '}
              para visualizar dados de outros funcionários.
            </p>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const departmentLabel =
    typeof employee.department === 'object' && employee.department
      ? employee.department.name
      : null;
  const positionLabel =
    typeof employee.position === 'object' && employee.position
      ? employee.position.name
      : null;

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Exames Médicos', href: '/hr/medical-exams' },
            {
              label: employee.fullName,
              href: `/hr/medical-exams/employee/${employeeId}`,
            },
          ]}
          buttons={[
            {
              id: 'back-to-list',
              title: 'Voltar',
              icon: ArrowLeft,
              onClick: () => router.push('/hr/medical-exams'),
              variant: 'outline',
            },
          ]}
        />
      </PageHeader>

      <PageBody>
        {/* Identity card */}
        <Card
          data-testid="employee-identity-card"
          className="flex flex-col gap-4 bg-white/5 p-5 sm:flex-row sm:items-center sm:gap-6"
        >
          <Avatar className="h-16 w-16 ring-2 ring-violet-500/20">
            <AvatarImage src={employee.photoUrl ?? undefined} alt={employee.fullName} />
            <AvatarFallback className="bg-violet-500/15 text-violet-700 dark:text-violet-300 text-lg font-semibold">
              {getInitials(employee.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">
                {employee.fullName}
              </h2>
              {isOwnEmployee && (
                <Badge variant="outline" className="border-violet-300 text-violet-700 dark:text-violet-300">
                  Meus exames
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {positionLabel && (
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  {positionLabel}
                  {departmentLabel ? ` · ${departmentLabel}` : ''}
                </span>
              )}
              {employee.hireDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Admitido em {formatDateLong(employee.hireDate)}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Timeline */}
        {examsError ? (
          <GridError
            type="server"
            title="Erro ao carregar exames"
            message="Não foi possível carregar o histórico de exames médicos."
            action={{
              label: 'Tentar Novamente',
              onClick: () => {
                refetchExams();
              },
            }}
          />
        ) : (
          <MedicalExamTimeline
            exams={exams}
            nextExamPlan={nextExamPlan}
            isLoading={isLoadingExams}
            onScheduleExam={canCreateExam ? handleScheduleExam : undefined}
            onDeleteExam={canDeleteExam ? handleDeleteRequest : undefined}
          />
        )}

        {/* Create modal */}
        {canCreateExam && (
          <CreateMedicalExamModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={async data => {
              await createMutation.mutateAsync(data);
            }}
            initialEmployeeId={employeeId}
          />
        )}

        {/* Delete confirmation */}
        <VerifyActionPinModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setPendingDeleteExam(null);
          }}
          onSuccess={handleDeleteConfirm}
          title="Excluir Exame Médico"
          description="Digite seu PIN de ação para excluir este exame médico. Esta ação não pode ser desfeita."
        />
      </PageBody>
    </PageLayout>
  );
}
