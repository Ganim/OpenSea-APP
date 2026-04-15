/**
 * OpenSea OS - Edit Candidate Page
 * Página de edição de candidato
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
import type { UpdateCandidateData, CandidateSource } from '@/types/hr';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Trash2, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CANDIDATE_SOURCE_OPTIONS } from '../../../src';

export default function EditCandidatePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const candidateId = params.id as string;

  const canDelete = hasPermission(HR_PERMISSIONS.RECRUITMENT.REMOVE);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [source, setSource] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const {
    data: candidate,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['candidates', candidateId],
    queryFn: async () => {
      const { candidate } = await recruitmentService.getCandidate(candidateId);
      return candidate;
    },
  });

  useEffect(() => {
    if (candidate) {
      setFullName(candidate.fullName);
      setEmail(candidate.email);
      setPhone(candidate.phone ?? '');
      setCpf(candidate.cpf ?? '');
      setSource(candidate.source);
      setResumeUrl(candidate.resumeUrl ?? '');
      setLinkedinUrl(candidate.linkedinUrl ?? '');
      setNotes(candidate.notes ?? '');
      setTagsInput(candidate.tags?.join(', ') ?? '');
    }
  }, [candidate]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCandidateData) =>
      recruitmentService.updateCandidate(candidateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidato atualizado com sucesso');
      router.push(`/hr/recruitment/candidates/${candidateId}`);
    },
    onError: () => toast.error('Erro ao atualizar candidato'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => recruitmentService.deleteCandidate(candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidato excluído com sucesso');
      router.push('/hr/recruitment/candidates');
    },
  });

  const handleSave = () => {
    const data: UpdateCandidateData = {
      fullName: fullName.trim(),
      email: email.trim(),
      source: source as CandidateSource,
      phone: phone.trim() || null,
      cpf: cpf.trim() || null,
      resumeUrl: resumeUrl.trim() || null,
      linkedinUrl: linkedinUrl.trim() || null,
      notes: notes.trim() || null,
      tags: tagsInput
        ? tagsInput
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
        : [],
    };
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <PageLayout data-testid="recruitment-candidate-edit-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Recrutamento', href: '/hr/recruitment' },
              { label: 'Candidatos', href: '/hr/recruitment/candidates' },
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

  if (error || !candidate) {
    return (
      <PageLayout data-testid="recruitment-candidate-edit-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Recrutamento', href: '/hr/recruitment' },
              { label: 'Candidatos', href: '/hr/recruitment/candidates' },
              { label: 'Erro' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="server"
            title="Candidato não encontrado"
            message="O candidato solicitado não foi encontrado."
            action={{
              label: 'Voltar',
              onClick: () => router.push('/hr/recruitment/candidates'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  return (
    <PageLayout data-testid="recruitment-candidate-edit-page">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Recrutamento', href: '/hr/recruitment' },
            { label: 'Candidatos', href: '/hr/recruitment/candidates' },
            {
              label: candidate.fullName,
              href: `/hr/recruitment/candidates/${candidateId}`,
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
              disabled:
                updateMutation.isPending || !fullName.trim() || !email.trim(),
            },
          ]}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-teal-500 to-teal-600 text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{candidate.fullName}</h1>
              <p className="text-xs text-muted-foreground">
                Criado em{' '}
                {new Date(candidate.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>

        {/* Form Card */}
        <Card className="bg-white/5 py-2 overflow-hidden mt-6">
          <div className="p-6 grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nome completo *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={e => setCpf(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Origem *</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CANDIDATE_SOURCE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="resumeUrl">URL do currículo</Label>
                <Input
                  id="resumeUrl"
                  value={resumeUrl}
                  onChange={e => setResumeUrl(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tagsInput">Tags (separadas por vírgula)</Label>
              <Input
                id="tagsInput"
                placeholder="Ex: react, senior, remoto"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </Card>

        {/* Delete Confirmation */}
        <VerifyActionPinModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onSuccess={() => deleteMutation.mutate()}
          title="Excluir Candidato"
          description={`Digite seu PIN de ação para excluir "${candidate.fullName}". Esta ação não pode ser desfeita.`}
        />
      </PageBody>
    </PageLayout>
  );
}
