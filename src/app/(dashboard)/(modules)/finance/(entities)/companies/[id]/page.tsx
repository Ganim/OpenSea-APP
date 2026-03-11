/**
 * Finance Company Detail Page
 */

'use client';

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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  Company,
  CompanyAddress,
  CompanyCnae,
  CompanyFiscalSettings,
  CompanyStakeholder,
} from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Calendar,
  Clock,
  Edit,
  FileText,
  Trash,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  companiesApi,
  companyAddressesApi,
  companyCnaesApi,
  companyFiscalSettingsApi,
  companyStakeholdersApi,
} from '../src';
import { CnaesTab } from '../src/components/cnaes-tab';
import { FiscalTab } from '../src/components/fiscal-tab';
import { GeneralTab } from '../src/components/general-tab';

export default function FinanceCompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [activeTab, setActiveTab] = useState('general');

  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ['companies', companyId],
    queryFn: async () => {
      const result = await companiesApi.get(companyId);
      if (result && typeof result === 'object' && 'id' in result) {
        return result as Company;
      }
      throw new Error('Estrutura de resposta inválida');
    },
  });

  const { data: addresses, isLoading: isLoadingAddresses } = useQuery<
    CompanyAddress[]
  >({
    queryKey: ['companies', companyId, 'addresses'],
    queryFn: async () => {
      const response = await companyAddressesApi.list(companyId);
      return response.addresses;
    },
    enabled: !!companyId,
  });

  const { data: cnaes, isLoading: isLoadingCnaes } = useQuery<CompanyCnae[]>({
    queryKey: ['companies', companyId, 'cnaes'],
    queryFn: async () => {
      const response = await companyCnaesApi.list(companyId, { perPage: 50 });
      const items =
        (response as unknown as { cnaes?: CompanyCnae[] })?.cnaes ??
        (Array.isArray(response) ? response : []);
      return items as CompanyCnae[];
    },
    enabled: !!companyId,
  });

  const { data: stakeholders, isLoading: isLoadingStakeholders } = useQuery<
    CompanyStakeholder[]
  >({
    queryKey: ['companies', companyId, 'stakeholders'],
    queryFn: async () => {
      try {
        const response = await companyStakeholdersApi.list(companyId, {
          includeInactive: true,
        });
        const items =
          (response as unknown as { stakeholders?: CompanyStakeholder[] })
            ?.stakeholders ?? (Array.isArray(response) ? response : []);
        return items as CompanyStakeholder[];
      } catch {
        return [];
      }
    },
    enabled: !!companyId,
    throwOnError: false,
    retry: false,
  });

  const { data: fiscalSettings, isLoading: isLoadingFiscal } =
    useQuery<CompanyFiscalSettings | null>({
      queryKey: ['companies', companyId, 'fiscal-settings'],
      queryFn: async () => {
        try {
          const response = await companyFiscalSettingsApi.get(companyId);
          if (response && 'id' in response)
            return response as CompanyFiscalSettings;

          const typedResponse = response as unknown as {
            fiscalSettings?: CompanyFiscalSettings;
          };

          if (typedResponse?.fiscalSettings) {
            return typedResponse.fiscalSettings;
          }

          return null;
        } catch {
          return null;
        }
      },
      enabled: !!companyId,
      throwOnError: false,
      retry: false,
    });

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Financeiro', href: '/finance' },
              { label: 'Empresas', href: '/finance/companies' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!company) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Financeiro', href: '/finance' },
              { label: 'Empresas', href: '/finance/companies' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Empresa não encontrada
            </h2>
            <p className="text-muted-foreground mb-6">
              A empresa que você está procurando não existe ou foi removida.
            </p>
            <Button onClick={() => router.push('/finance/companies')}>
              Voltar para Empresas
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  const handleDelete = (id: string) => {
    router.push(`/finance/companies/${id}`);
  };
  const handleEdit = (id: string) => {
    router.push(`/finance/companies/${id}/edit`);
  };

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Financeiro', href: '/finance' },
            { label: 'Empresas', href: '/finance/companies' },
            { label: company.legalName },
          ]}
          buttons={[
            {
              id: 'delete',
              title: 'Excluir',
              icon: Trash,
              onClick: () => handleDelete(company.id),
              variant: 'outline',
            },
            {
              id: 'edit',
              title: 'Editar',
              icon: Edit,
              onClick: () => handleEdit(company.id),
            },
          ]}
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br from-indigo-500 to-blue-600">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {company.legalName}
                </h1>
                <Badge variant="success">{company.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {company.tradeName || 'Sem nome fantasia'}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 text-sm">
              {company.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>
                    {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {company.updatedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>
                    {new Date(company.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 p-2 h-12">
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="h-4 w-4 hidden sm:inline" />
              <span>Geral</span>
            </TabsTrigger>
            <TabsTrigger value="cnaes" className="gap-2">
              <FileText className="h-4 w-4 hidden sm:inline" />
              <span>CNAEs</span>
            </TabsTrigger>
            <TabsTrigger value="fiscal" className="gap-2">
              <FileText className="h-4 w-4 hidden sm:inline" />
              <span>Fiscal</span>
            </TabsTrigger>
          </TabsList>

          <GeneralTab
            company={company}
            addresses={addresses}
            isLoadingAddresses={isLoadingAddresses}
            stakeholders={stakeholders}
            isLoadingStakeholders={isLoadingStakeholders}
          />

          <CnaesTab cnaes={cnaes} isLoadingCnaes={isLoadingCnaes} />

          <FiscalTab
            fiscalSettings={fiscalSettings}
            isLoadingFiscal={isLoadingFiscal}
          />
        </Tabs>
      </PageBody>
    </PageLayout>
  );
}
