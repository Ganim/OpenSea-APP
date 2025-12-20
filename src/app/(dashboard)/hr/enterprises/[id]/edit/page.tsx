/**
 * Enterprise Edit Page
 * Página para edição completa de uma empresa
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMutation, useQuery } from '@tanstack/react-query';
import { enterprisesService } from '@/services/hr';
import type { Enterprise } from '@/types/hr';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { toast } from 'sonner';
import { EnterpriseForm, updateEnterprise } from '../../src';
import type { EnterpriseFormData } from '../../src';

export default function EnterpriseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch enterprise
  const { data: enterprise, isLoading } = useQuery<Enterprise>({
    queryKey: ['enterprise', id],
    queryFn: async () => {
      const response = await enterprisesService.getEnterprise(id);
      return response.enterprise;
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: EnterpriseFormData) => {
      setIsSubmitting(true);
      try {
        return await updateEnterprise(
          id,
          data as unknown as Partial<Enterprise>
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast.success('Empresa atualizada com sucesso');
      router.push(`/hr/enterprises/${id}`);
    },
    onError: error => {
      console.error('Erro ao atualizar empresa:', error);
      toast.error('Erro ao atualizar empresa');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!enterprise) {
    return (
      <div className="space-y-4">
        <Link href="/hr/enterprises">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <Card className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-semibold">Empresa não encontrada</h3>
          <p className="text-sm text-muted-foreground">
            A empresa solicitada não existe ou foi deletada
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/hr/enterprises/${enterprise.id}`}>
            <Button variant="outline" className="gap-2" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Editar Empresa</h1>
          <p className="text-muted-foreground">{enterprise.legalName}</p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <EnterpriseForm
          enterprise={enterprise}
          onSave={async data => {
            await updateMutation.mutateAsync(data);
          }}
          onCancel={() => router.back()}
          isSubmitting={isSubmitting || updateMutation.isPending}
        />
      </Card>
    </div>
  );
}
