/**
 * Company Edit Page
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EntityForm } from '@/core';
import type { Company } from '@/types/hr';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookUser,
  Building2,
  FileCheck,
  FileText,
  MapPinHouse,
  Save,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  AddressesEditTab,
  CnaesEditTab,
  companiesApi,
  companiesConfig,
  FiscalEditTab,
  normalizeCompanyData,
  StakeholdersEditTab,
} from '../../src';

export default function CompanyEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = params.id as string;
  const [activeTab, setActiveTab] = useState('general');
  const formRef = useRef<HTMLFormElement>(null);

  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ['companies', companyId],
    queryFn: async () => {
      return companiesApi.get(companyId);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Company>) => {
      // Normaliza dados: converte strings vazias para null, remove formatação CNPJ
      const updateData = normalizeCompanyData(data);
      return companiesApi.update(companyId, updateData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa atualizada com sucesso');
      router.push(`/hr/companies/${companyId}`);
    },
    onError: error => {
      console.error(error);
      toast.error('Não foi possível atualizar a empresa');
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">
            Empresa não encontrada
          </h2>
          <Button onClick={() => router.push('/hr/companies')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Empresas
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-8xl flex items-center gap-4 mb-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              if (formRef.current) {
                formRef.current.dispatchEvent(
                  new Event('submit', { cancelable: true, bubbles: true })
                );
              }
            }}
            className="gap-2"
            disabled={updateMutation.isPending}
          >
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Company Info Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex gap-4 sm:flex-row items-center sm:gap-6">
          <div className="flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shrink-0">
            <Building2 className="md:h-8 md:w-8 text-white" />
          </div>
          <div className="flex justify-between flex-1 gap-4 flex-row items-center">
            <div>
              <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                {company.legalName}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Editar Empresa
              </p>
            </div>
            <div>
              <Badge variant="secondary" className="mt-1">
                Editando
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4 p-2 h-12">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="h-4 w-4 hidden sm:inline" />
            <span>Dados</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-2">
            <MapPinHouse className="h-4 w-4 hidden sm:inline" />
            <span>Endereços</span>
          </TabsTrigger>
          <TabsTrigger value="stakeholders" className="gap-2">
            <BookUser className="h-4 w-4 hidden sm:inline" />
            <span>Sócios</span>
          </TabsTrigger>
          <TabsTrigger value="cnaes" className="gap-2">
            <FileCheck className="h-4 w-4 hidden sm:inline" />
            <span>CNAEs</span>
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="gap-2">
            <FileText className="h-4 w-4 hidden sm:inline" />
            <span>Fiscal</span>
          </TabsTrigger>
        </TabsList>

        {/* General Tab - Company Data */}
        <TabsContent value="general" className="w-full">
          <Card className=" w-full p-4 sm:p-6">
            <EntityForm
              config={companiesConfig.form!}
              mode="edit"
              initialData={company}
              isSubmitting={updateMutation.isPending}
              onSubmit={async data => {
                await updateMutation.mutateAsync(data as Company);
              }}
              hideActions
              ref={formRef}
            />
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <AddressesEditTab companyId={companyId} />

        {/* Stakeholders Tab */}
        <StakeholdersEditTab companyId={companyId} />

        {/* CNAEs Tab */}
        <CnaesEditTab companyId={companyId} />

        {/* Fiscal Tab */}
        <FiscalEditTab companyId={companyId} />
      </Tabs>
    </div>
  );
}
