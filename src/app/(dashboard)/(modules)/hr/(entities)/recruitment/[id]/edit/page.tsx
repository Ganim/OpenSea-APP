/**
 * OpenSea OS - Edit Job Posting Page
 * Página de edição de vaga
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
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { usePermissions } from '@/hooks/use-permissions';
import { recruitmentService } from '@/services/hr/recruitment.service';
import { departmentsService } from '@/services/hr/departments.service';
import type { UpdateJobPostingData } from '@/types/hr';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Save, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { JOB_POSTING_TYPE_OPTIONS } from '../../src';

export default function EditJobPostingPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const jobPostingId = params.id as string;

  const canDelete = hasPermission(HR_PERMISSIONS.RECRUITMENT.REMOVE);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [benefits, setBenefits] = useState('');
  const [maxApplicants, setMaxApplicants] = useState('');

  const {
    data: jobPosting,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['job-postings', jobPostingId],
    queryFn: async () => {
      const { jobPosting } =
        await recruitmentService.getJobPosting(jobPostingId);
      return jobPosting;
    },
  });

  // Departments & positions for selects
  const { data: deptsData } = useQuery({
    queryKey: ['departments', 'select'],
    queryFn: () => departmentsService.listDepartments({ perPage: 100 }),
  });

  const { data: positionsData } = useQuery({
    queryKey: ['positions', 'select'],
    queryFn: async () => {
      const { positionsService } = await import(
        '@/services/hr/positions.service'
      );
      return positionsService.listPositions({ perPage: 100 });
    },
  });

  const departments = useMemo(
    () => (deptsData?.departments ?? []).map(d => ({ id: d.id, name: d.name })),
    [deptsData]
  );

  const positions = useMemo(
    () =>
      (positionsData?.positions ?? []).map(
        (p: { id: string; name: string }) => ({
          id: p.id,
          name: p.name,
        })
      ),
    [positionsData]
  );

  useEffect(() => {
    if (jobPosting) {
      setTitle(jobPosting.title);
      setDescription(jobPosting.description ?? '');
      setType(jobPosting.type);
      setDepartmentId(jobPosting.departmentId ?? '');
      setPositionId(jobPosting.positionId ?? '');
      setLocation(jobPosting.location ?? '');
      setSalaryMin(jobPosting.salaryMin?.toString() ?? '');
      setSalaryMax(jobPosting.salaryMax?.toString() ?? '');
      setBenefits(jobPosting.benefits ?? '');
      setMaxApplicants(jobPosting.maxApplicants?.toString() ?? '');
    }
  }, [jobPosting]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateJobPostingData) =>
      recruitmentService.updateJobPosting(jobPostingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      toast.success('Vaga atualizada com sucesso');
      router.push(`/hr/recruitment/${jobPostingId}`);
    },
    onError: () => toast.error('Erro ao atualizar vaga'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => recruitmentService.deleteJobPosting(jobPostingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      toast.success('Vaga excluída com sucesso');
      router.push('/hr/recruitment');
    },
  });

  const handleSave = () => {
    const data: UpdateJobPostingData = {
      title: title.trim(),
      type: type as UpdateJobPostingData['type'],
      description: description.trim() || undefined,
      departmentId: departmentId || null,
      positionId: positionId || null,
      location: location.trim() || undefined,
      salaryMin: salaryMin ? Number(salaryMin) : null,
      salaryMax: salaryMax ? Number(salaryMax) : null,
      benefits: benefits.trim() || undefined,
      maxApplicants: maxApplicants ? Number(maxApplicants) : null,
    };
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <PageLayout data-testid="recruitment-edit-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Recrutamento', href: '/hr/recruitment' },
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

  if (error || !jobPosting) {
    return (
      <PageLayout data-testid="recruitment-edit-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Recrutamento', href: '/hr/recruitment' },
              { label: 'Erro' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="server"
            title="Vaga não encontrada"
            message="A vaga solicitada não foi encontrada."
            action={{
              label: 'Voltar',
              onClick: () => router.push('/hr/recruitment'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  return (
    <PageLayout data-testid="recruitment-edit-page">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Recrutamento', href: '/hr/recruitment' },
            {
              label: jobPosting.title,
              href: `/hr/recruitment/${jobPostingId}`,
            },
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
              disabled: updateMutation.isPending || !title.trim(),
            },
          ]}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-violet-600 text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{jobPosting.title}</h1>
              <p className="text-xs text-muted-foreground">
                Criado em{' '}
                {new Date(jobPosting.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>

        {/* Form Card */}
        <Card className="bg-white/5 py-2 overflow-hidden mt-6">
          <div className="p-6 grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Título da vaga *</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
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
                    {JOB_POSTING_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Departamento</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Cargo</Label>
                <Select value={positionId} onValueChange={setPositionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((p: { id: string; name: string }) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="salaryMin">Salário mínimo</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  min={0}
                  value={salaryMin}
                  onChange={e => setSalaryMin(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="salaryMax">Salário máximo</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  min={0}
                  value={salaryMax}
                  onChange={e => setSalaryMax(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="benefits">Benefícios</Label>
              <Textarea
                id="benefits"
                value={benefits}
                onChange={e => setBenefits(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxApplicants">Máximo de candidatos</Label>
              <Input
                id="maxApplicants"
                type="number"
                min={1}
                placeholder="Sem limite"
                value={maxApplicants}
                onChange={e => setMaxApplicants(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Delete Confirmation */}
        <VerifyActionPinModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onSuccess={() => deleteMutation.mutate()}
          title="Excluir Vaga"
          description={`Digite seu PIN de ação para excluir "${jobPosting.title}". Esta ação não pode ser desfeita.`}
        />
      </PageBody>
    </PageLayout>
  );
}
