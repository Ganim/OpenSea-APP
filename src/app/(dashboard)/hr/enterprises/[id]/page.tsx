/**
 * Enterprise Detail Page
 * Página de visualização de um empresa específica
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMutation, useQuery } from '@tanstack/react-query';
import { enterprisesService } from '@/services/hr';
import type { Enterprise } from '@/types/hr';
import { ArrowLeft, Edit2, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmModal, deleteEnterprise, EnterpriseViewer } from '../src';

export default function EnterprisePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch enterprise
  const { data: enterprise, isLoading } = useQuery<Enterprise>({
    queryKey: ['enterprise', params.id],
    queryFn: async () => {
      const response = await enterprisesService.getEnterprise(params.id);
      return response.enterprise;
    },
  });

  // Update mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await deleteEnterprise(params.id);
    },
    onSuccess: () => {
      toast.success('Empresa deletada com sucesso');
      router.push('/hr/enterprises');
    },
    onError: error => {
      console.error('Erro ao deletar empresa:', error);
      toast.error('Erro ao deletar empresa');
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
        <Link href="/hr/enterprises">
          <Button variant="outline" className="gap-2" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/hr/enterprises/${enterprise.id}/edit`}>
            <Button className="gap-2">
              <Edit2 className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Deletar
          </Button>
        </div>
      </div>

      {/* Content */}
      <EnterpriseViewer
        enterprise={enterprise}
        showHeader={true}
        showEditButton={false}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        itemCount={1}
        onConfirm={() => deleteMutation.mutateAsync()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
