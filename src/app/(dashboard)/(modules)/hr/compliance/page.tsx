/**
 * OpenSea OS - /hr/compliance dashboard (Phase 06 / Plan 06-06)
 *
 * Dashboard principal de compliance Portaria MTP 671/2021 com 5 tabs:
 *   - AFD           → listagem de arquivos fiscais oficiais
 *   - AFDT          → listagem de arquivos de conferência proprietários (D-05)
 *   - Recibos       → listagem de recibos de ponto (gerados por worker)
 *   - Folhas Espelho → listagem de folhas espelho PDF
 *   - eSocial S-1200 → listagem de XMLs gerados
 *
 * Permission gate no nível da página (`hr.compliance.access`) + botões de
 * ação no header também permission-gated (generate/submit/config).
 *
 * CLAUDE.md APP §6 — PermissionGate com render-nothing.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  FilePlus,
  Hammer,
  ShieldAlert,
  ClipboardCheck,
  Cog,
  Settings,
} from 'lucide-react';

import { PageActionBar } from '@/components/layout/page-action-bar';
import { PageHeroBanner } from '@/components/layout/page-hero-banner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/auth/permission-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { ArtifactsGrid } from '@/components/hr/compliance/ArtifactsGrid';
import { AfdtDisclaimerBanner } from '@/components/hr/compliance/AfdtDisclaimerBanner';
import type { ComplianceArtifactType } from '@/types/hr';

type TabKey = ComplianceArtifactType;

function NoPermissionState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-24 text-center"
      data-testid="compliance-no-permission"
    >
      <ShieldAlert className="h-12 w-12 text-muted-foreground/40" />
      <h2 className="text-lg font-semibold">Sem permissão</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Você não tem permissão{' '}
        <code className="font-mono text-xs">hr.compliance.access</code>. Peça ao
        administrador do tenant para conceder acesso ao módulo Compliance
        Portaria 671.
      </p>
    </div>
  );
}

export default function CompliancePage() {
  const { hasPermission, isLoading: isLoadingPermissions } = usePermissions();
  const [tab, setTab] = useState<TabKey>('AFD');

  if (isLoadingPermissions) {
    return null;
  }
  if (!hasPermission(HR_PERMISSIONS.COMPLIANCE.ACCESS)) {
    return <NoPermissionState />;
  }

  return (
    <div className="space-y-6" data-testid="compliance-dashboard">
      <PageActionBar
        breadcrumbItems={[
          { label: 'RH', href: '/hr' },
          { label: 'Compliance', href: '/hr/compliance' },
        ]}
        hasPermission={hasPermission}
      />

      <PageHeroBanner
        title="Compliance — Portaria MTP 671/2021"
        description="Artefatos legais do sistema de ponto: AFD (oficial), AFDT (conferência), folhas espelho, recibos e eventos eSocial S-1200."
        icon={FileCheck}
        iconGradient="from-indigo-500 to-blue-600"
        buttons={[]}
        hasPermission={hasPermission}
      />

      <div
        className="flex flex-wrap items-center gap-2"
        data-testid="compliance-actions"
      >
        <PermissionGate permission={HR_PERMISSIONS.COMPLIANCE.AFD_GENERATE}>
          <Link href="/hr/compliance/afd">
            <Button size="sm" className="gap-2">
              <FilePlus className="h-4 w-4" />
              Gerar AFD
            </Button>
          </Link>
        </PermissionGate>
        <PermissionGate permission={HR_PERMISSIONS.COMPLIANCE.AFDT_GENERATE}>
          <Link href="/hr/compliance/afdt">
            <Button size="sm" variant="outline" className="gap-2">
              <Hammer className="h-4 w-4" />
              Gerar AFDT
            </Button>
          </Link>
        </PermissionGate>
        <PermissionGate
          permission={HR_PERMISSIONS.COMPLIANCE.FOLHA_ESPELHO_GENERATE}
        >
          <Link href="/hr/compliance/folhas-espelho">
            <Button size="sm" variant="outline" className="gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Folhas Espelho
            </Button>
          </Link>
        </PermissionGate>
        <PermissionGate permission={HR_PERMISSIONS.COMPLIANCE.S1200_SUBMIT}>
          <Link href="/hr/compliance/esocial-s1200">
            <Button size="sm" variant="outline" className="gap-2">
              <FileCheck className="h-4 w-4" />
              eSocial S-1200
            </Button>
          </Link>
        </PermissionGate>
        <PermissionGate permission={HR_PERMISSIONS.COMPLIANCE.CONFIG_MODIFY}>
          <Link href="/hr/compliance/esocial-rubricas">
            <Button size="sm" variant="ghost" className="gap-2">
              <Cog className="h-4 w-4" />
              Rubricas eSocial
            </Button>
          </Link>
          <Link href="/hr/compliance/esocial-config">
            <Button size="sm" variant="ghost" className="gap-2">
              <Settings className="h-4 w-4" />
              Configuração eSocial
            </Button>
          </Link>
        </PermissionGate>
      </div>

      <Tabs
        value={tab}
        onValueChange={v => setTab(v as TabKey)}
        className="w-full"
      >
        <TabsList className="grid h-11 w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="AFD" data-testid="tab-AFD">
            AFD
          </TabsTrigger>
          <TabsTrigger value="AFDT" data-testid="tab-AFDT">
            AFDT
          </TabsTrigger>
          <TabsTrigger value="RECIBO" data-testid="tab-RECIBO">
            Recibos
          </TabsTrigger>
          <TabsTrigger value="FOLHA_ESPELHO" data-testid="tab-FOLHA_ESPELHO">
            Folhas Espelho
          </TabsTrigger>
          <TabsTrigger value="S1200_XML" data-testid="tab-S1200_XML">
            eSocial S-1200
          </TabsTrigger>
        </TabsList>

        <TabsContent value="AFD" className="pt-4">
          <ArtifactsGrid type="AFD" />
        </TabsContent>
        <TabsContent value="AFDT" className="pt-4">
          <AfdtDisclaimerBanner />
          <ArtifactsGrid type="AFDT" />
        </TabsContent>
        <TabsContent value="RECIBO" className="pt-4">
          <ArtifactsGrid type="RECIBO" />
        </TabsContent>
        <TabsContent value="FOLHA_ESPELHO" className="pt-4">
          <ArtifactsGrid type="FOLHA_ESPELHO" />
        </TabsContent>
        <TabsContent value="S1200_XML" className="pt-4">
          <ArtifactsGrid type="S1200_XML" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
